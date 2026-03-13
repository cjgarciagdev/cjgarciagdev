# ==============================================================================
# RUTAS API: REGISTRO DE PRODUCCIÓN (Leche, Carne, Lana)
# ==============================================================================
from flask import Blueprint, request, jsonify, session
from models import db, RegistroProduccion, Ganado
from datetime import datetime, date, timedelta
from sqlalchemy import func, and_

produccion_bp = Blueprint('produccion', __name__)

@produccion_bp.route('/api/produccion', methods=['GET'])
def get_produccion():
    """Lista registros de producción con filtros opcionales."""
    try:
        tipo = request.args.get('tipo')
        animal_id = request.args.get('animal_id')
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))

        query = RegistroProduccion.query

        if tipo:
            query = query.filter_by(tipo_produccion=tipo)
        if animal_id:
            query = query.filter_by(animal_id=int(animal_id))
        if fecha_desde:
            query = query.filter(RegistroProduccion.fecha >= datetime.strptime(fecha_desde, '%Y-%m-%d'))
        if fecha_hasta:
            query = query.filter(RegistroProduccion.fecha <= datetime.strptime(fecha_hasta + ' 23:59:59', '%Y-%m-%d %H:%M:%S'))

        registros = query.order_by(RegistroProduccion.fecha.desc()).limit(per_page).offset((page - 1) * per_page).all()
        total = query.count()

        return jsonify({
            'registros': [r.to_dict() for r in registros],
            'total': total,
            'page': page,
            'per_page': per_page
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@produccion_bp.route('/api/produccion', methods=['POST'])
def add_produccion():
    """Registra una nueva producción."""
    try:
        data = request.json
        
        if not data.get('animal_id') or not data.get('tipo_produccion') or not data.get('cantidad'):
            return jsonify({'error': 'animal_id, tipo_produccion y cantidad son requeridos'}), 400

        # Verificar que el animal existe
        animal = Ganado.query.get(data['animal_id'])
        if not animal:
            return jsonify({'error': 'Animal no encontrado'}), 404

        registro = RegistroProduccion(
            animal_id=data['animal_id'],
            tipo_produccion=data['tipo_produccion'],
            cantidad=float(data['cantidad']),
            unidad=data.get('unidad', 'litros'),
            calidad=data.get('calidad'),
            grasa_porcentaje=float(data['grasa_porcentaje']) if data.get('grasa_porcentaje') else None,
            proteina_porcentaje=float(data['proteina_porcentaje']) if data.get('proteina_porcentaje') else None,
            celulas_somaticas=int(data['celulas_somaticas']) if data.get('celulas_somaticas') else None,
            turno=data.get('turno', 'Mañana'),
            observaciones=data.get('observaciones'),
            usuario=session.get('username', 'admin')
        )

        if data.get('fecha'):
            try:
                registro.fecha = datetime.strptime(data['fecha'], '%Y-%m-%dT%H:%M')
            except:
                registro.fecha = datetime.strptime(data['fecha'], '%Y-%m-%d')

        db.session.add(registro)
        db.session.commit()
        return jsonify({'status': 'success', 'id': registro.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@produccion_bp.route('/api/produccion/<int:id>', methods=['PUT'])
def update_produccion(id):
    """Actualiza un registro de producción."""
    try:
        registro = RegistroProduccion.query.get(id)
        if not registro:
            return jsonify({'error': 'Registro no encontrado'}), 404

        data = request.json
        for campo in ['tipo_produccion', 'cantidad', 'unidad', 'calidad', 'turno', 'observaciones']:
            if campo in data:
                setattr(registro, campo, data[campo])
        
        for campo in ['grasa_porcentaje', 'proteina_porcentaje']:
            if campo in data:
                setattr(registro, campo, float(data[campo]) if data[campo] else None)
        
        if 'celulas_somaticas' in data:
            registro.celulas_somaticas = int(data['celulas_somaticas']) if data['celulas_somaticas'] else None

        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@produccion_bp.route('/api/produccion/<int:id>', methods=['DELETE'])
def delete_produccion(id):
    """Elimina un registro de producción."""
    try:
        registro = RegistroProduccion.query.get(id)
        if not registro:
            return jsonify({'error': 'Registro no encontrado'}), 404
        db.session.delete(registro)
        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@produccion_bp.route('/api/produccion/resumen')
def resumen_produccion():
    """Estadísticas de producción: diario, semanal, mensual, top productores."""
    try:
        hoy = date.today()
        inicio_semana = hoy - timedelta(days=hoy.weekday())
        inicio_mes = hoy.replace(day=1)
        tipo = request.args.get('tipo', 'Leche')
        especie = request.args.get('especie', 'Todas')

        # Helper para aplicar filtros comunes
        def apply_filters(query):
            q = query.join(Ganado).filter(RegistroProduccion.tipo_produccion == tipo)
            if especie != 'Todas':
                from models import Especie
                q = q.join(Especie).filter(Especie.nombre == especie)
            return q

        # Producción de hoy
        prod_hoy = apply_filters(db.session.query(func.sum(RegistroProduccion.cantidad))).filter(
            func.date(RegistroProduccion.fecha) == hoy
        ).scalar() or 0

        # Producción semanal
        prod_semana = apply_filters(db.session.query(func.sum(RegistroProduccion.cantidad))).filter(
            func.date(RegistroProduccion.fecha) >= inicio_semana
        ).scalar() or 0

        # Producción mensual
        prod_mes = apply_filters(db.session.query(func.sum(RegistroProduccion.cantidad))).filter(
            func.date(RegistroProduccion.fecha) >= inicio_mes
        ).scalar() or 0

        # Top 5 productores del mes
        top_productores = apply_filters(db.session.query(
            RegistroProduccion.animal_id,
            func.sum(RegistroProduccion.cantidad).label('total')
        )).filter(
            func.date(RegistroProduccion.fecha) >= inicio_mes
        ).group_by(RegistroProduccion.animal_id).order_by(func.sum(RegistroProduccion.cantidad).desc()).limit(5).all()

        top_list = []
        for animal_id, total in top_productores:
            animal = Ganado.query.get(animal_id)
            top_list.append({
                'animal_id': animal_id,
                'raza': animal.cat_raza.nombre if animal and animal.cat_raza else 'N/A',
                'especie': animal.cat_especie.nombre if animal and animal.cat_especie else 'N/A',
                'total': round(total, 2)
            })

        # Producción por día (últimos 30 días para gráfica)
        hist_query = apply_filters(db.session.query(
            func.date(RegistroProduccion.fecha).label('dia'),
            func.sum(RegistroProduccion.cantidad).label('total')
        )).filter(
            func.date(RegistroProduccion.fecha) >= hoy - timedelta(days=30)
        ).group_by(func.date(RegistroProduccion.fecha)).order_by(func.date(RegistroProduccion.fecha)).all()

        historial = [{'fecha': str(dia), 'cantidad': round(total, 2)} for dia, total in hist_query]

        # Promedio de calidad (grasa y proteína) del mes
        avg_grasa = apply_filters(db.session.query(func.avg(RegistroProduccion.grasa_porcentaje))).filter(
            and_(
                func.date(RegistroProduccion.fecha) >= inicio_mes,
                RegistroProduccion.grasa_porcentaje.isnot(None)
            )
        ).scalar()

        avg_proteina = apply_filters(db.session.query(func.avg(RegistroProduccion.proteina_porcentaje))).filter(
            and_(
                func.date(RegistroProduccion.fecha) >= inicio_mes,
                RegistroProduccion.proteina_porcentaje.isnot(None)
            )
        ).scalar()

        return jsonify({
            'produccion_hoy': round(prod_hoy, 2),
            'produccion_semana': round(prod_semana, 2),
            'produccion_mes': round(prod_mes, 2),
            'top_productores': top_list,
            'historial_diario': historial,
            'calidad_promedio': {
                'grasa': round(avg_grasa, 2) if avg_grasa else None,
                'proteina': round(avg_proteina, 2) if avg_proteina else None
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@produccion_bp.route('/api/produccion/calidad')
def historial_calidad():
    """Historial detallado de calidad para gráficas."""
    try:
        tipo = request.args.get('tipo', 'Leche')
        animal_id = request.args.get('animal_id')
        hoy = date.today()
        
        query = db.session.query(
            func.date(RegistroProduccion.fecha).label('dia'),
            func.avg(RegistroProduccion.grasa_porcentaje).label('grasa'),
            func.avg(RegistroProduccion.proteina_porcentaje).label('proteina')
        ).filter(
            and_(
                RegistroProduccion.tipo_produccion == tipo,
                RegistroProduccion.fecha >= hoy - timedelta(days=30),
                RegistroProduccion.grasa_porcentaje.isnot(None)
            )
        )
        
        if animal_id:
            query = query.filter(RegistroProduccion.animal_id == int(animal_id))
            
        hist = query.group_by(func.date(RegistroProduccion.fecha)).order_by(func.date(RegistroProduccion.fecha)).all()
        
        return jsonify([
            {
                'fecha': str(h.dia),
                'grasa': round(h.grasa, 2) if h.grasa else 0,
                'proteina': round(h.proteina, 2) if h.proteina else 0
            } for h in hist
        ])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
