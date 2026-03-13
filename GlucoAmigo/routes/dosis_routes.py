from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models import db, Heroe, RegistroGlucosa, AlertaClinica

dosis_bp = Blueprint('dosis', __name__, url_prefix='/api')

def verificar_permiso_clinico():
    """Roles profesionales autorizados para gestión clínica."""
    return current_user.rol in ['maestro', 'especialista']

def _generar_alerta(heroe, glucemia, tipo):
    """Protocolo de Notificaciones GlucoAmigo (moo.md §Alertas de Emergencia)."""
    if tipo == 'hipo':
        msg  = (f"⚠️ ¡ALERTA ROJA! La glucosa de {heroe.nombre} está baja "
                f"({glucemia} mg/dL). Dale 15g de carbohidratos rápidos "
                f"(jugo/caramelo) y mide en 15 min. 🧃")
        sev  = 'roja'
    elif tipo == 'hiper':
        msg  = (f"⚠️ ¡ALERTA AMARILLA! Glucosa alta detectada ({glucemia} mg/dL) "
                f"en {heroe.nombre}. Verifica si necesita una dosis de corrección "
                f"o agua. Revisa cuerpos cetónicos si es necesario. 🩺")
        sev  = 'amarilla'
    else:
        return None
    alerta = AlertaClinica(heroe_id=heroe.id, tipo=tipo, severidad=sev, mensaje=msg)
    db.session.add(alerta)
    return alerta

@dosis_bp.route('/dosificacion/calcular', methods=['POST'])
@login_required
def calcular():
    """Módulo 2: Algoritmo de Cálculo del Motor de Inferencia Médica (moo.md)."""
    data    = request.json or {}
    heroe   = Heroe.query.get_or_404(int(data.get('heroe_id', 0)))
    glucemia= float(data.get('glucemia', 0))
    carbos  = float(data.get('carbohidratos', 0))
    momento = data.get('momento', 'libre')

    # ── Algoritmo moo.md ─────────────────────────────────────────────
    dosis_carbos   = carbos / heroe.ratio_carbohidratos
    correc_glucosa = (glucemia - heroe.glucemia_objetivo) / heroe.factor_sensibilidad
    dosis_final    = round(max(0.0, dosis_carbos + correc_glucosa), 2)

    # Validador de Seguridad Pediátrica (moo.md): dosis > peso * límite
    dosis_max        = round(heroe.peso * heroe.dosis_max_kg, 2)
    alerta_seguridad = dosis_final > dosis_max

    # Semáforo clínico (moo.md §Alertas de Emergencia)
    alerta_tipo = None
    if glucemia < 70:
        alerta_tipo = 'hipo'
    elif glucemia > 250:
        alerta_tipo = 'hiper'

    # Guardar registro en Historial de Dosificación
    reg = RegistroGlucosa(
        heroe_id=heroe.id, glucemia_actual=glucemia,
        carbohidratos=carbos, dosis_sugerida=dosis_final,
        alerta_disparada=alerta_seguridad or (alerta_tipo is not None),
        momento_dia=momento,
    )
    db.session.add(reg)
    if alerta_tipo:
        _generar_alerta(heroe, glucemia, alerta_tipo)
    db.session.commit()

    return jsonify({
        'dosis': dosis_final, 'dosis_max': dosis_max,
        'alerta_seguridad': alerta_seguridad,
        'alerta_glucemia': alerta_tipo,
        'registro_id': reg.id,
    })

@dosis_bp.route('/dosificacion/confirmar/<int:reg_id>', methods=['PUT'])
@login_required
def confirmar_dosis(reg_id):
    """Confirmación doble para dosis inusualmente alta (moo.md §Validador de Seguridad)."""
    data = request.json or {}
    reg  = RegistroGlucosa.query.get_or_404(reg_id)
    reg.dosis_aplicada = float(data.get('dosis_aplicada', reg.dosis_sugerida))
    reg.confirmado_por_id = current_user.id
    reg.notas          = data.get('notas', '')
    
    # Auditoría (Agro-Master pattern)
    from models import AuditLog
    db.session.add(AuditLog(
        usuario_id=current_user.id,
        entidad_tipo='RegistroGlucosa',
        entidad_id=reg.id,
        accion='CONFIRM',
        campo='dosis_aplicada',
        valor_nue=str(reg.dosis_aplicada)
    ))
    
    db.session.commit()
    return jsonify({'status': 'success'})

@dosis_bp.route('/dosificacion/historial/<int:hid>', methods=['GET'])
@login_required
def historial(hid):
    """Historial de Dosificación para que el médico vea la adherencia (moo.md)."""
    if not verificar_permiso_clinico() and current_user.rol != 'padre':
        return jsonify({'error': 'No autorizado'}), 403
        
    limit = int(request.args.get('limit', 30))
    regs  = (RegistroGlucosa.query.filter_by(heroe_id=hid)
             .order_by(RegistroGlucosa.fecha.desc()).limit(limit).all())
    return jsonify([r.to_dict() for r in regs])

@dosis_bp.route('/alertas/<int:hid>', methods=['GET'])
@login_required
def get_alertas(hid):
    if not verificar_permiso_clinico() and current_user.rol != 'padre':
         return jsonify({'error': 'No autorizado'}), 403
         
    alertas = (AlertaClinica.query.filter_by(heroe_id=hid)
               .order_by(AlertaClinica.fecha.desc()).limit(20).all())
    return jsonify([a.to_dict() for a in alertas])

@dosis_bp.route('/alertas/todas', methods=['GET'])
@login_required
def get_todas_alertas():
    if not verificar_permiso_clinico():
        return jsonify({'error': 'No autorizado'}), 403
        
    alertas = (AlertaClinica.query.filter_by(resuelta=False)
               .order_by(AlertaClinica.fecha.desc()).limit(50).all())
    return jsonify([a.to_dict() for a in alertas])

@dosis_bp.route('/alertas/<int:aid>/resolver', methods=['PUT'])
@login_required
def resolver_alerta(aid):
    if not verificar_permiso_clinico():
        return jsonify({'error': 'No autorizado'}), 403
        
    alerta = AlertaClinica.query.get_or_404(aid)
    alerta.resuelta  = True
    alerta.notas_med = (request.json or {}).get('notas', '')
    
    # Auditoría (Agro-Master pattern)
    from models import AuditLog
    db.session.add(AuditLog(
        usuario_id=current_user.id,
        entidad_tipo='AlertaClinica',
        entidad_id=alerta.id,
        accion='RESOLVE',
        campo='resuelta',
        valor_ant='False',
        valor_nue='True'
    ))
    
    db.session.commit()
    return jsonify({'status': 'success'})
