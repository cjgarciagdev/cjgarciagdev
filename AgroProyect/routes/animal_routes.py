from flask import Blueprint, jsonify, request
from models import db, Ganado, RegistroPeso, HistorialMedico, ProtocoloSalud, PlanNutricional, ExpedienteMedico, PrediccionProductividad, AnalisisAvanzado, HistorialCambios, PlanMaternidad, EstadoProtocolo, obtener_todos, obtener_animal, guardar_o_actualizar, obtener_pesos_animal, obtener_historial_animal
from datetime import datetime, date, timedelta
from utils.decorators import require_permission, require_login

animal_bp = Blueprint('animal', __name__)

@animal_bp.route('/api/ganado')
@require_login
def get_ganado():
    """
    Retorna la lista de ganado con soporte para búsqueda, filtrado por especie/salud/sexo y paginación.
    """
    page = request.args.get('page', type=int)
    per_page = request.args.get('per_page', type=int, default=10)
    q = request.args.get('q')
    especie = request.args.get('especie')
    health = request.args.get('health')
    sexo = request.args.get('sexo')
    
    try:
        resultado = obtener_todos(
            page=page, 
            per_page=per_page, 
            search_query=q, 
            specie_filter=especie, 
            health_filter=health,
            sex_filter=sexo
        )
        return jsonify(resultado)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@animal_bp.route('/api/guardar', methods=['POST'])
@require_permission('editar_animales')
def guardar():
    """
    API: Crea o actualiza un animal.
    Valida datos de entrada server-side.
    """
    datos = request.json
    required = ['especie', 'raza', 'sexo', 'fecha_nacimiento', 'peso']
    if not all(k in datos for k in required):
        return jsonify({'error': 'Faltan campos requeridos'}), 400
    try:
        peso = float(datos['peso'])
        if peso <= 0:
            raise ValueError
    except ValueError:
        return jsonify({'error': 'Peso debe ser un número positivo'}), 400
    
    fecha_str = datos.get('fecha_nacimiento')
    try:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        if fecha > date.today():
            return jsonify({'error': 'Fecha de nacimiento no puede ser en el futuro'}), 400
    except Exception:
        return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
    
    try:
        from flask import session
        guardar_o_actualizar(datos, usuario_cambio=session.get('username', 'admin'))
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@animal_bp.route('/api/animal/<int:id>', methods=['DELETE'])
@require_permission('eliminar_animales')
def delete_animal_route(id):
    """API: Elimina un animal y todos sus registros asociados."""
    try:
        animal = Ganado.query.get(id)
        if not animal:
            return jsonify({'error': 'Animal not found'}), 404

        # 1. Eliminar referencias en hijos (Genealogía)
        # Buscar hijos donde este animal es padre
        hijos_padre = Ganado.query.filter_by(padre_id=id).all()
        for hijo in hijos_padre:
            hijo.padre_id = None
        
        # Buscar hijos donde este animal es madre
        hijos_madre = Ganado.query.filter_by(madre_id=id).all()
        for hijo in hijos_madre:
            hijo.madre_id = None
        
        # 2. Eliminar registros relacionados
        RegistroPeso.query.filter_by(animal_id=id).delete()
        HistorialMedico.query.filter_by(animal_id=id).delete()
        ProtocoloSalud.query.filter_by(animal_id=id).delete()
        PlanNutricional.query.filter_by(animal_id=id).delete()
        ExpedienteMedico.query.filter_by(animal_id=id).delete()
        PrediccionProductividad.query.filter_by(animal_id=id).delete()
        AnalisisAvanzado.query.filter_by(animal_id=id).delete()
        AnalisisAvanzado.query.filter_by(animal_id=id).delete()
        
        # AUDITORÍA: Preservar logs de historial
        # Desvincularlogs existentes del ID físico (que va a desaparecer)
        # Nota: Idealmente se usaría soft-delete en Ganado, pero para cumplir requerimiento de borrar:
        # Actualizamos FK a NULL
        from flask import session
        
        # 1. Crear log de eliminación ANTES de alterar los otros o borrar el animal
        log_delete = HistorialCambios(
             animal_id=None, # Ya no apunta a nadie
             campo='Estado',
             valor_anterior=f'Animal #{id}',
             valor_nuevo='ELIMINADO',
             accion='DELETE',
             usuario=session.get('username', 'admin')
        )
        db.session.add(log_delete)
        
        # 2. Actualizar logs previos para que no se borren (si hubiera cascade) y mantengan referencia texto
        # Si HistorialCambios.animal_id ES nullable (lo hicimos en models.py step)
        # SQLAlchemy update en batch
        HistorialCambios.query.filter_by(animal_id=id).update({
            'animal_id': None, 
            'valor_anterior': HistorialCambios.valor_anterior + f" (Ex-Animal #{id})" # Preservation hack
        }, synchronize_session=False)

        PlanMaternidad.query.filter_by(animal_id=id).delete()
        
        # 3. Eliminar animal
        db.session.delete(animal)
        db.session.commit()
        
        return jsonify({'status': 'success', 'message': f'Animal #{id} eliminado correctamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@animal_bp.route('/api/animal/<int:id>')
@require_login
def get_animal_route(id):
    animal = obtener_animal(id)
    if animal:
        animal['historial_cambios'] = obtener_historial_animal(id)
        animal['historial_pesos'] = obtener_pesos_animal(id)
        # Obtener historial medico como dicts
        medico_logs = HistorialMedico.query.filter_by(animal_id=id).order_by(HistorialMedico.fecha.desc()).all()
        animal['historial_medico'] = [h.to_dict() for h in medico_logs]
        return jsonify(animal)
    return jsonify({'error': 'Animal not found'}), 404

@animal_bp.route('/api/animal/status', methods=['POST'])
@require_permission('editar_animales')
def update_animal_status():
    data = request.json
    id = data.get('id')
    status = data.get('status')
    
    animal = Ganado.query.get(id)
    if not animal:
        return jsonify({'error': 'Animal not found'}), 404
        
    from models import EstadoAnimal
    estado_obj = EstadoAnimal.query.filter_by(nombre=status).first()
    if estado_obj:
        animal.estado_id = estado_obj.id
        db.session.commit()
        return jsonify({'status': 'success', 'new_status': status})
    else:
        return jsonify({'error': 'Estado no válido'}), 400

# --- Pesos ---

@animal_bp.route('/api/registrar_peso', methods=['POST'])
@require_permission('editar_animales')
def registrar_peso_route():
    data = request.json
    try:
        fecha_str = data.get('fecha', date.today().isoformat())
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d')
        
        registro = RegistroPeso(
            animal_id=data['animal_id'],
            peso=data['peso'],
            fecha=fecha,
            notas=data.get('notas', '')
        )
        db.session.add(registro)
        
        # Actualizar peso actual del animal
        animal = Ganado.query.get(data['animal_id'])
        if animal:
            animal.peso = data['peso']
            
        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@animal_bp.route('/api/historial_pesos/<int:id>')
def get_historial_pesos(id):
    pesos = obtener_pesos_animal(id)
    return jsonify(pesos)

@animal_bp.route('/api/weights/<int:id>')
def get_weights(id):
    """Alias para compatibilidad frontend"""
    return jsonify(obtener_pesos_animal(id))

# --- Maternidad ---

@animal_bp.route('/api/maternidad/plan/<int:animal_id>')
def get_plan_maternidad(animal_id):
    plan = PlanMaternidad.query.filter_by(animal_id=animal_id, activo=True).first()
    if plan:
        return jsonify(plan.to_dict())
    return jsonify({'error': 'No hay plan de maternidad activo'}), 404

@animal_bp.route('/api/maternidad/plan', methods=['POST'])
@require_permission('editar_animales')
def save_plan_maternidad():
    """
    ORQUESTADOR DE REPRODUCCIÓN (MATERNIDAD):
    API de alto nivel que automatiza el seguimiento del ciclo reproductivo.
    
    Lógica de Integración:
    1. Crea un Plan de Maternidad activo (Gestación, Lactancia, etc).
    2. Genera una entrada en el Historial Médico para trazabilidad clínica.
    3. Motor de Protocolos Automáticos: Basándose en el tipo de plan y la fecha 
       probable de parto, programa automáticamente una serie de tareas (Ecografías, 
       Vacunas pre-parto, Suplementación) para garantizar el éxito del alumbramiento.
    """
    data = request.json
    animal_id = data.get('animal_id')
    
    try:
        # Desactivar planes anteriores
        PlanMaternidad.query.filter_by(animal_id=animal_id, activo=True).update({'activo': False})
        
        fecha_parto = None
        if data.get('fecha_probable_parto'):
            fecha_parto = datetime.strptime(data['fecha_probable_parto'], '%Y-%m-%d')

        from models import TipoPlanReproductivo, TipoEventoMedico, TipoProtocolo, EstadoProtocolo
        from services.auth_service import Usuario
        
        tp_obj = TipoPlanReproductivo.query.filter_by(nombre=data.get('tipo_plan')).first()
        if not tp_obj:
            tp_obj = TipoPlanReproductivo(nombre=data.get('tipo_plan', 'Gestación'))
            db.session.add(tp_obj)
            db.session.flush()

        plan = PlanMaternidad(
            animal_id=animal_id,
            tipo_plan_id=tp_obj.id,
            fecha_probable_parto=fecha_parto,
            recomendaciones_veterinarias=data.get('recomendaciones', ''),
            observaciones=data.get('observaciones', ''),
            activo=True
        )
        db.session.add(plan)
        db.session.flush() # Para obtener ID del plan si es necesario
        
        # INTEGRACIÓN: Registrar en historial médico
        tipo_med_obj = TipoEventoMedico.query.filter_by(nombre='Parto' if 'Parto' in str(data.get('tipo_plan')) else 'Chequeo General').first()
        if not tipo_med_obj:
            tipo_med_obj = TipoEventoMedico(nombre='Parto' if 'Parto' in str(data.get('tipo_plan')) else 'Chequeo General')
            db.session.add(tipo_med_obj)
            db.session.flush()

        vet_id = None
        if data.get('veterinario'):
            vet = Usuario.query.filter(Usuario.nombre_completo.contains(data['veterinario'])).first()
            if vet: vet_id = vet.id

        historial = HistorialMedico(
            animal_id=animal_id,
            tipo_id=tipo_med_obj.id if tipo_med_obj else 1,
            descripcion=f"Creación de plan de {data.get('tipo_plan')} " + 
                       (f"con fecha probable de parto: {data.get('fecha_probable_parto')}" if fecha_parto else ""),
            veterinario_id=vet_id
        )
        db.session.add(historial)
        
        # INTEGRACIÓN: Crear protocolos automáticos basados en el tipo de plan
        tipo_plan = data.get('tipo_plan', '')
        protocolos_automaticos = []
        
        # Resolver tipo de protocolo IDs
        tp_rev = TipoProtocolo.query.filter_by(nombre='Chequeo').first()
        tp_vac = TipoProtocolo.query.filter_by(nombre='Vacunación').first()
        tp_trat = TipoProtocolo.query.filter_by(nombre='Tratamiento').first()
        
        ep_pend = EstadoProtocolo.query.filter_by(nombre='Pendiente').first()
        if not ep_pend:
            ep_pend = EstadoProtocolo(nombre='Pendiente')
            db.session.add(ep_pend)
            db.session.flush()
        ep_id = ep_pend.id

        if tipo_plan == 'Gestación' and fecha_parto:
            # Protocolo 1: Ecografía diagnóstica (30 días antes del parto)
            fecha_eco = fecha_parto - timedelta(days=30)
            if not tp_rev:
                tp_rev = TipoProtocolo(nombre='Chequeo')
                db.session.add(tp_rev)
                db.session.flush()
                
            protocolos_automaticos.append(ProtocoloSalud(
                animal_id=animal_id,
                tipo_protocolo_id=tp_rev.id,
                descripcion='Ecografía diagnóstica pre-parto. Verificar posición fetal y condición uterina.',
                fecha_programada=fecha_eco,
                estado_id=ep_id,
                veterinario_id=vet_id,
                medicamento='N/A',
                dosis='Revisión clínica'
            ))
            
            # Protocolo 2: Vacunación pre-parto (60 días antes)
            fecha_vac = fecha_parto - timedelta(days=60)
            if not tp_vac:
                tp_vac = TipoProtocolo(nombre='Vacunación')
                db.session.add(tp_vac)
                db.session.flush()

            protocolos_automaticos.append(ProtocoloSalud(
                animal_id=animal_id,
                tipo_protocolo_id=tp_vac.id,
                descripcion='Vacunación pre-parto para fortalecer inmunidad maternal.',
                fecha_programada=fecha_vac,
                estado_id=ep_id,
                veterinario_id=vet_id,
                medicamento='Vacuna Gestación',
                dosis='Según peso'
            ))
            
            # Protocolo 3: Suplementación mineral (15 días antes)
            fecha_supl = fecha_parto - timedelta(days=15)
            if not tp_trat:
                tp_trat = TipoProtocolo(nombre='Tratamiento')
                db.session.add(tp_trat)
                db.session.flush()

            protocolos_automaticos.append(ProtocoloSalud(
                animal_id=animal_id,
                tipo_protocolo_id=tp_trat.id,
                descripcion='Suplementación mineral y vitamínica pre-parto.',
                fecha_programada=fecha_supl,
                estado_id=ep_id,
                veterinario_id=vet_id,
                medicamento='Complejo ADE + Minerales',
                dosis='10ml IM'
            ))
        
        elif tipo_plan == 'Lactancia':
            # Protocolo: Control de mastitis (cada 15 días)
            hoy = datetime.now()
            for i in range(3):  # 3 controles en 45 días
                fecha_control = hoy + timedelta(days=15 * (i + 1))
                if not tp_rev:
                    tp_rev = TipoProtocolo(nombre='Chequeo')
                    db.session.add(tp_rev)
                    db.session.flush()

                protocolos_automaticos.append(ProtocoloSalud(
                    animal_id=animal_id,
                    tipo_protocolo_id=tp_rev.id,
                    descripcion=f'Control de mastitis y calidad de leche - Revisión {i+1}/3',
                    fecha_programada=fecha_control,
                    estado_id=ep_id,
                    veterinario_id=vet_id,
                    medicamento='N/A',
                    dosis='Revisión clínica'
                ))
        
        elif tipo_plan == 'Parto Reciente':
            # Protocolo: Revisión post-parto (3 días después)
            hoy = datetime.now()
            fecha_revision = hoy + timedelta(days=3)
            if not tp_rev:
                tp_rev = TipoProtocolo(nombre='Chequeo')
                db.session.add(tp_rev)
                db.session.flush()

            protocolos_automaticos.append(ProtocoloSalud(
                animal_id=animal_id,
                tipo_protocolo_id=tp_rev.id,
                descripcion='Revisión post-parto: verificar involución uterina, descartar retención placentaria.',
                fecha_programada=fecha_revision,
                estado_id=ep_id,
                veterinario_id=vet_id,
                medicamento='Oxitocina (si necesario)',
                dosis='Según indicación'
            ))
        
        # Guardar protocolos
        for proto in protocolos_automaticos:
            db.session.add(proto)
        
        db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error en el servidor: {str(e)}'}), 500
    
    return jsonify({
        **plan.to_dict(),
        'protocolos_creados': len(protocolos_automaticos)
    })

@animal_bp.route('/api/maternidad/planes-activos')
def get_planes_maternidad_activos():
    planes = db.session.query(PlanMaternidad, Ganado).join(Ganado, PlanMaternidad.animal_id == Ganado.id).filter(PlanMaternidad.activo == True).all()
    resultado = []
    for plan, animal in planes:
        d = plan.to_dict()
        d['animal_info'] = animal.to_dict()
        resultado.append(d)
    return jsonify(resultado)
