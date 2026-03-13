# ==============================================================================
# RUTAS API: GESTIÓN DE LOTES (Agrupación de Animales)
# ==============================================================================
from flask import Blueprint, request, jsonify, session
from models import db, Lote, Ganado
from utils.decorators import require_login, require_permission
from datetime import datetime

lotes_bp = Blueprint('lotes', __name__)

@lotes_bp.route('/api/lotes', methods=['GET'])
@require_login
def get_lotes():
    """Lista todos los lotes con sus estadísticas."""
    try:
        activos = request.args.get('activos', 'true') == 'true'
        query = Lote.query
        if activos:
            query = query.filter_by(activo=True)
        lotes = query.order_by(Lote.fecha_creacion.desc()).all()
        return jsonify([l.to_dict() for l in lotes])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lotes_bp.route('/api/lotes', methods=['POST'])
@require_permission('crear_animales') # Usamos permisos similares a ganado
def crear_lote():
    """Crea un nuevo lote."""
    try:
        data = request.json
        if not data.get('nombre'):
            return jsonify({'error': 'El nombre del lote es requerido'}), 400

        # Verificar nombre único
        existente = Lote.query.filter_by(nombre=data['nombre']).first()
        if existente:
            return jsonify({'error': 'Ya existe un lote con ese nombre'}), 400

        lote = Lote(
            nombre=data['nombre'],
            descripcion=data.get('descripcion'),
            proposito=data.get('proposito', 'General'),
            capacidad_maxima=int(data['capacidad_maxima']) if data.get('capacidad_maxima') else None,
            ubicacion=data.get('ubicacion'),
            color=data.get('color', '#22c55e'),
            responsable=data.get('responsable')
        )
        db.session.add(lote)
        db.session.commit()
        return jsonify({'status': 'success', 'id': lote.id, 'lote': lote.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@lotes_bp.route('/api/lotes/<int:id>', methods=['GET'])
@require_login
def get_lote(id):
    """Obtiene un lote con sus animales."""
    try:
        lote = Lote.query.get(id)
        if not lote:
            return jsonify({'error': 'Lote no encontrado'}), 404
        
        animales = Ganado.query.filter_by(lote_id=id).all()
        data = lote.to_dict()
        data['animales'] = [a.to_dict() for a in animales]
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lotes_bp.route('/api/lotes/<int:id>', methods=['PUT'])
@require_permission('editar_animales')
def update_lote(id):
    """Actualiza datos de un lote."""
    try:
        lote = Lote.query.get(id)
        if not lote:
            return jsonify({'error': 'Lote no encontrado'}), 404

        data = request.json
        for campo in ['nombre', 'descripcion', 'proposito', 'ubicacion', 'color', 'responsable']:
            if campo in data:
                setattr(lote, campo, data[campo])
        
        if 'capacidad_maxima' in data:
            lote.capacidad_maxima = int(data['capacidad_maxima']) if data['capacidad_maxima'] else None
        if 'activo' in data:
            lote.activo = data['activo']

        db.session.commit()
        return jsonify({'status': 'success', 'lote': lote.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@lotes_bp.route('/api/lotes/<int:id>', methods=['DELETE'])
@require_permission('eliminar_animales')
def delete_lote(id):
    """Desactiva un lote (soft delete) y desasigna sus animales."""
    try:
        lote = Lote.query.get(id)
        if not lote:
            return jsonify({'error': 'Lote no encontrado'}), 404
        
        # Desasignar animales del lote
        Ganado.query.filter_by(lote_id=id).update({'lote_id': None})
        lote.activo = False
        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# --- GESTIÓN DE MIEMBROS (INTEGRACIÓN NUEVA) ---

@lotes_bp.route('/api/lotes/<int:id>/miembros', methods=['GET'])
@require_login
def get_lote_miembros(id):
    """Obtiene miembros actuales y candidatos para un lote."""
    try:
        lote = Lote.query.get_or_404(id)
        # Obtener animales del lote
        animales = Ganado.query.filter_by(lote_id=id).all()
        
        # Obtener animales SIN lote (candidatos)
        # Opcional: Podríamos filtrar candidatos que sean compatibles con el propósito del lote?
        disponibles = Ganado.query.filter(Ganado.lote_id == None).all()
        
        return jsonify({
            'lote': lote.to_dict(),
            'miembros': [a.to_dict() for a in animales],
            'disponibles': [{'id': a.id, 'nombre': f"#{a.id} {a.especie} - {a.raza} ({a.sexo})"} for a in disponibles]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lotes_bp.route('/api/lotes/<int:id>/asignar', methods=['POST'])
@require_permission('editar_animales')
def gestionar_miembros_lote(id):
    """Asigna o remueve animales de un lote en bloque."""
    try:
        data = request.json
        lote = Lote.query.get_or_404(id)
        animal_ids = data.get('animal_ids', [])
        accion = data.get('accion') # 'agregar' o 'remover'
        
        if not animal_ids:
            return jsonify({'error': 'No se seleccionaron animales'}), 400

        # Verificar capacidad si agregamos
        if accion == 'agregar' and lote.capacidad_maxima:
            count_actual = Ganado.query.filter_by(lote_id=id).count()
            if (count_actual + len(animal_ids)) > lote.capacidad_maxima:
                # Opcional warning, por ahora permitimos overflow
                pass 

        animales = Ganado.query.filter(Ganado.id.in_(animal_ids)).all()
        count = 0
        
        for animal in animales:
            if accion == 'agregar':
                animal.lote_id = id
                count += 1
            elif accion == 'remover':
                if animal.lote_id == id:
                    animal.lote_id = None
                    count += 1
                    
        db.session.commit()
        return jsonify({'status': 'success', 'mensaje': f'{count} animales {accion}dos correctamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@lotes_bp.route('/api/lotes/resumen')
@require_login
def resumen_lotes():
    """Estadísticas generales de lotes."""
    try:
        total_lotes = Lote.query.filter_by(activo=True).count()
        total_animales_en_lotes = Ganado.query.filter(Ganado.lote_id.isnot(None)).count()
        total_animales_sin_lote = Ganado.query.filter(Ganado.lote_id.is_(None)).count()
        
        lotes = Lote.query.filter_by(activo=True).all()
        por_proposito = {}
        for lote in lotes:
            prop = lote.proposito or 'General'
            if prop not in por_proposito:
                por_proposito[prop] = {'cantidad_lotes': 0, 'cantidad_animales': 0}
            por_proposito[prop]['cantidad_lotes'] += 1
            por_proposito[prop]['cantidad_animales'] += Ganado.query.filter_by(lote_id=lote.id).count()

        return jsonify({
            'total_lotes': total_lotes,
            'animales_en_lotes': total_animales_en_lotes,
            'animales_sin_lote': total_animales_sin_lote,
            'por_proposito': por_proposito
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
