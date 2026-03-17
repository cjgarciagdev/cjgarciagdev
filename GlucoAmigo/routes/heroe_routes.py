from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models import db, Heroe, AuditLog
from services.permissions import verificar_permiso
from services.heroe_service import _next_codigo, calcular_tir, resumen_para_padre, crear_heroe_por_padre

heroe_bp = Blueprint('heroe', __name__, url_prefix='/api')

# permission and hero helpers moved to services/permissions.py and services/heroe_service.py

@heroe_bp.route('/heroe', methods=['GET'])
@login_required
def get_heroe():
    if verificar_permiso(current_user, 'ver_pacientes'):
        heroes = Heroe.query.filter_by(activo=True).all()
        return jsonify([h.to_dict() for h in heroes])

    resultado = resumen_para_padre(current_user)
    return jsonify(resultado)

@heroe_bp.route('/heroe', methods=['POST'])
@login_required
def crear_heroe():
    data = request.json or {}
    heroe = crear_heroe_por_padre(current_user, data)
    return jsonify({'status': 'success', 'heroe': heroe.to_dict()})

@heroe_bp.route('/heroe/<int:hid>', methods=['PUT'])
@login_required
def actualizar_heroe(hid):
    heroe = Heroe.query.filter_by(id=hid, padre_id=current_user.id).first_or_404()
    data = request.json or {}
    heroe.nombre    = data.get('nombre', heroe.nombre)
    heroe.edad      = int(data.get('edad', heroe.edad))
    heroe.peso      = float(data.get('peso', heroe.peso))
    heroe.estatura  = float(data.get('estatura', heroe.estatura))
    heroe.foto_emoji = data.get('foto_emoji', heroe.foto_emoji)
    db.session.commit()
    return jsonify({'status': 'success', 'heroe': heroe.to_dict()})

@heroe_bp.route('/heroe/<int:hid>/config', methods=['PUT'])
@login_required
def update_config(hid):
    """Solo el especialista/nutricionista puede cambiar parámetros médicos con auditoría."""
    if not verificar_permiso(current_user, 'editar_pacientes'):
        return jsonify({'error': 'No autorizado'}), 403
    
    heroe = Heroe.query.get_or_404(hid)
    data  = request.json or {}
    
    campos = {
        'ratio': 'ratio_carbohidratos',
        'sensibilidad': 'factor_sensibilidad',
        'glucemia_obj': 'glucemia_objetivo',
        'dosis_max': 'dosis_max_kg'
    }
    
    for key, field in campos.items():
        if key in data:
            val_nue = float(data[key])
            val_ant = getattr(heroe, field)
            if val_nue != val_ant:
                # Registrar en Auditoría
                db.session.add(AuditLog(
                    usuario_id=current_user.id,
                    entidad_tipo='Heroe',
                    entidad_id=heroe.id,
                    accion='UPDATE',
                    campo=field,
                    valor_ant=str(val_ant),
                    valor_nue=str(val_nue)
                ))
                setattr(heroe, field, val_nue)
    
    db.session.commit()
    return jsonify({'status': 'success', 'heroe': heroe.to_dict()})

@heroe_bp.route('/heroe/<int:hid>/peso', methods=['PUT'])
@login_required
def actualizar_peso(hid):
    """Recordatorio mensual de actualización de peso (moo.md §Recordatorios)."""
    heroe = Heroe.query.get_or_404(hid)
    data  = request.json or {}
    heroe.peso = float(data.get('peso', heroe.peso))
    db.session.commit()
    return jsonify({'status': 'success', 'peso': heroe.peso})

@heroe_bp.route('/juego/<int:juego_id>', methods=['POST'])
@login_required
def actualizar_juego(juego_id):
    data = request.get_json() or {}
    puntos = int(data.get('puntos', 0))
    hid = data.get('heroe_id')
    
    from sqlalchemy import or_
    if hid:
        heroe = Heroe.query.filter(Heroe.id == hid, or_(Heroe.padre_id == current_user.id, Heroe.padre2_id == current_user.id)).first()
    else:
        heroe = Heroe.query.filter(or_(Heroe.padre_id == current_user.id, Heroe.padre2_id == current_user.id)).first()
        
    if not heroe:
        return jsonify({'error': 'No hero found'}), 404

    # Acumular puntos (máximo 70)
    if heroe.puntos_juego is None:
        heroe.puntos_juego = 0
    heroe.puntos_juego = min(70, heroe.puntos_juego + puntos)
    db.session.commit()
    return jsonify({'ok': True, 'total': heroe.puntos_juego})


@heroe_bp.route('/heroe/<int:hid>/vincular', methods=['POST'])
@login_required
def vincular_co_representante(hid):
    """Vincula un segundo representante (ej. Mamá y Papá)."""
    heroe = Heroe.query.filter_by(id=hid, padre_id=current_user.id).first_or_404()
    data = request.json or {}
    username = data.get('username')
    
    from models import Usuario
    user2 = Usuario.query.filter_by(username=username, rol='padre').first()
    if not user2:
        return jsonify({'error': 'Usuario no encontrado o no es representante'}), 404
        
    if user2.id == heroe.padre_id:
        return jsonify({'error': 'No puedes vincularte a ti mismo'}), 400
        
    heroe.padre2_id = user2.id
    db.session.commit()
    return jsonify({'status': 'success', 'vinculado': user2.nombre_completo or user2.username})

@heroe_bp.route('/juego/template/<int:juego_id>')
@login_required
def get_juego_template(juego_id):
    import os
    from flask import current_app
    # Buscamos el archivo en templates/modals/juegoX.html
    template_path = os.path.join(current_app.root_path, 'templates', 'modals', f'juego{juego_id}.html')
    
    if os.path.exists(template_path):
        with open(template_path, 'r', encoding='utf-8') as f:
            return f.read()
    return "Contenido del juego no disponible.", 404
