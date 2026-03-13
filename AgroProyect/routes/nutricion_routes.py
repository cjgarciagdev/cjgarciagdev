from flask import Blueprint, jsonify, request, session
from models import db, PlanNutricional, Ganado, obtener_animal, obtener_plan_nutricional, guardar_plan_nutricional
from services.animal_service import calcular_nutricion
from utils.decorators import require_permission, require_login

nutricion_bp = Blueprint('nutricion', __name__)

@nutricion_bp.route('/api/nutricion/<int:id>')
@require_login
def get_nutricion(id):
    animal = obtener_animal(id)
    if not animal:
        return jsonify({'error': 'Animal not found'}), 404
    nutricion = calcular_nutricion(animal['peso'], animal['edad'], animal['especie'], animal['raza'])
    return jsonify(nutricion)

@nutricion_bp.route('/api/plan-nutricional/<int:animal_id>')
@require_login
def get_plan_nutricional(animal_id):
    plan = obtener_plan_nutricional(animal_id)
    if plan:
        return jsonify(plan)
    return jsonify({'error': 'No hay plan nutricional activo'}), 404

@nutricion_bp.route('/api/plan-nutricional', methods=['POST'])
@require_permission('gestionar_nutricion')
def guardar_plan_nutricional_route():
    datos = request.json
    try:
        plan_id = datos.get('id')
        animal_id = datos.get('animal_id')
        
        if not animal_id:
            return jsonify({'error': 'ID de animal requerido'}), 400
        
        # Determinar si es creación o edición
        es_edicion = plan_id is not None
        accion = 'EDIT' if es_edicion else 'ADD'
        
        # Obtener o crear el tipo de alimentación
        from models import TipoAlimentacion
        tipo_nombre = datos.get('tipo_alimentacion', 'Pastoreo')
        ta_obj = TipoAlimentacion.query.filter_by(nombre=tipo_nombre).first()
        if not ta_obj:
            ta_obj = TipoAlimentacion(nombre=tipo_nombre)
            db.session.add(ta_obj)
            db.session.flush()
        
        # Guardar el plan usando la función del modelo (sin commit automático)
        plan = guardar_plan_nutricional(datos, usuario_creador=session.get('username', 'admin'), auto_commit=False)
        
        if plan:
            # LOG DE AUDITORÍA
            from models import HistorialCambios
            log_cambio = HistorialCambios(
                animal_id=animal_id,
                campo='Plan Nutricional',
                valor_anterior='Plan Editado' if es_edicion else 'Sin Plan',
                valor_nuevo=f'{tipo_nombre}: {datos.get("cantidad_forraje", 0)}kg Forraje / {datos.get("cantidad_concentrado", 0)}kg Conc.',
                usuario=session.get('username', 'admin'),
                accion=accion
            )
            db.session.add(log_cambio)
            db.session.commit()
            
            return jsonify(plan)
        return jsonify({'error': 'Error al guardar plan'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@nutricion_bp.route('/api/nutricion/plan/<int:animal_id>')
def get_plan_nutricional_api(animal_id):
    """
    API: Obtiene el plan nutricional activo y calcula recomendaciones.
    Retorna la comparación entre el plan actual y lo recomendado teóricamente.
    """
    animal = Ganado.query.get(animal_id)
    if not animal:
        return jsonify({'error': 'Animal not found'}), 404
    
    planes = PlanNutricional.query.filter_by(animal_id=animal_id, activo=True).all()
    plan_actual = planes[0].to_dict() if planes else None
    
    # Calcular nutrición recomendada usando servicio especializado
    nutricion_rec = calcular_nutricion(animal.peso, animal.edad, animal.cat_especie.nombre if animal.cat_especie else 'Bovino', animal.cat_raza.nombre if animal.cat_raza else 'Otro')
    
    return jsonify({
        'animal': animal.to_dict(),
        'planes': [plan_actual] if plan_actual else [],
        'plan_actual': plan_actual,
        'nutricion_recomendada': nutricion_rec
    })

@nutricion_bp.route('/api/nutricion/crear_plan', methods=['POST'])
@require_permission('gestionar_nutricion')
def crear_plan_nutricional():
    data = request.json
    try:
        if not data or 'animal_id' not in data:
            return jsonify({'error': 'ID de animal requerido'}), 400

        # Usar la función centralizada para mayor robustez
        plan_dict = guardar_plan_nutricional(data, usuario_creador=session.get('username', 'admin'), auto_commit=False)
        
        if not plan_dict:
            return jsonify({'error': 'No se pudo crear el plan nutricional'}), 400

        # LOG DE AUDITORÍA
        from models import HistorialCambios
        log_cambio = HistorialCambios(
            animal_id=data['animal_id'],
            campo='Plan Nutricional',
            valor_anterior='Plan Anterior Desactivado',
            valor_nuevo=f'Nuevo Plan: {data.get("tipo", "N/A")} ({data.get("forraje", 0)}/{data.get("concentrado", 0)} kg)',
            usuario=session.get('username', 'Sistema'),
            accion='ADD'
        )
        db.session.add(log_cambio)
        
        db.session.commit()
        return jsonify({'status': 'success', 'id': plan_dict['id']})
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"ERROR en crear_plan_nutricional: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@nutricion_bp.route('/api/planes-nutricionales-activos')
def get_planes_nutricionales_activos():
    planes = PlanNutricional.query.filter_by(activo=True).all()
    result = []
    
    for plan in planes:
        animal = Ganado.query.get(plan.animal_id)
        if animal:
            result.append({
                'id': plan.id,
                'animal_id': plan.animal_id,
                'tipo_alimentacion': plan.cat_tipo.nombre if plan.cat_tipo else 'N/A',
                'cantidad_forraje': plan.cantidad_forraje,
                'cantidad_concentrado': plan.cantidad_concentrado,
                'fecha_inicio': plan.fecha_inicio.isoformat() if plan.fecha_inicio else None,
                'animal_info': {
                    'especie': animal.cat_especie.nombre if animal.cat_especie else 'N/A',
                    'raza': animal.cat_raza.nombre if animal.cat_raza else 'N/A',
                    'peso': animal.peso,
                    'edad': animal.edad
                }
            })
    
    return jsonify(result)
