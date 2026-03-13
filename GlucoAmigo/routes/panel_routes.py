import io
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request, send_file
from flask_login import login_required, current_user
from models import db, Heroe, RegistroGlucosa, EvaluacionPsicometrica, AlertaClinica, Usuario, AuditLog, RegistroComida, CrecimientoRegistro, Recordatorio
from services.permissions import verificar_permiso
from services.export_service import (
    export_group_excel, export_group_pdf,
    export_audit_excel, export_audit_pdf
)
from services.user_service import list_users_for, create_user_by

panel_bp = Blueprint('panel', __name__, url_prefix='/api')

@panel_bp.route('/panel/resumen', methods=['GET'])
@login_required
def resumen_especialista():
    """Módulo 5: Vista General del Grupo de Estudio (moo.md)."""
    if not verificar_permiso(current_user, 'ver_pacientes'):
        return jsonify({'error': 'No autorizado para ver el panel clínico'}), 403

    heroes        = Heroe.query.filter_by(activo=True).all()
    total_alertas = AlertaClinica.query.filter_by(resuelta=False).count()
    en_riesgo     = 0
    resultado     = []

    # Reuse service helpers where appropriate (further extraction possible)
    from services.heroe_service import calcular_tir

    for h in heroes:
        registros_30 = (RegistroGlucosa.query.filter_by(heroe_id=h.id)
                        .order_by(RegistroGlucosa.fecha.desc()).limit(30).all())
        u_glucosa = registros_30[0] if registros_30 else None
        u_cdi     = (EvaluacionPsicometrica.query.filter_by(heroe_id=h.id, tipo='CDI')
                     .order_by(EvaluacionPsicometrica.fecha.desc()).first())
        u_scir    = (EvaluacionPsicometrica.query.filter_by(heroe_id=h.id, tipo='SCIR')
                     .order_by(EvaluacionPsicometrica.fecha.desc()).first())
        alertas_p = AlertaClinica.query.filter_by(heroe_id=h.id, resuelta=False).count()

        tir = calcular_tir(registros_30)

        riesgo_glucemia = u_glucosa and (u_glucosa.glucemia_actual < 70 or u_glucosa.glucemia_actual > 250)
        riesgo_psico    = u_cdi  and u_cdi.estado  == 'Riesgo'
        baja_adherencia = u_scir and u_scir.estado  == 'Baja'
        
        if riesgo_glucemia or riesgo_psico:
            prioridad = 'Crítico'
            en_riesgo += 1
        elif baja_adherencia or alertas_p > 0 or tir < 70:
            prioridad = 'Alerta'
        else:
            prioridad = 'Estable'

        resultado.append({
            'id'               : h.codigo or f'P-{h.id:03d}',
            'heroe_id'         : h.id,
            'nombre'           : h.nombre,
            'edad'             : h.edad,
            'peso'             : h.peso,
            'tir'              : tir,
            'ultima_glucemia'  : u_glucosa.glucemia_actual if u_glucosa else None,
            'fecha_glucemia'   : u_glucosa.fecha.strftime('%d/%m %H:%M') if u_glucosa else '—',
            'cdi_puntaje'      : u_cdi.puntaje_total if u_cdi else None,
            'cdi_estado'       : u_cdi.estado if u_cdi else '—',
            'adherencia_pct'   : u_scir.puntaje_total if u_scir else None,
            'adherencia_state': u_scir.estado if u_scir else '—',
            'estado'           : prioridad,
            'alertas_pendientes': alertas_p,
        })

    return jsonify({
        'pacientes'   : resultado,
        'total'       : len(heroes),
        'total_pacientes': len(heroes),
        'en_riesgo'   : en_riesgo,
        'total_alertas': total_alertas,
    })

@panel_bp.route('/panel/paciente/<int:hid>', methods=['GET'])
@login_required
def detalle_paciente(hid):
    """Módulo 5: Ficha clínica completa para el especialista."""
    if not verificar_permiso(current_user, 'ver_pacientes'):
        return jsonify({'error': 'No autorizado'}), 403
    
    h = Heroe.query.get_or_404(hid)
    ultimos_registros = (RegistroGlucosa.query.filter_by(heroe_id=hid)
                         .order_by(RegistroGlucosa.fecha.desc()).limit(10).all())
    
    u_cdi  = EvaluacionPsicometrica.query.filter_by(heroe_id=hid, tipo='CDI').order_by(EvaluacionPsicometrica.fecha.desc()).first()
    u_scir = EvaluacionPsicometrica.query.filter_by(heroe_id=hid, tipo='SCIR').order_by(EvaluacionPsicometrica.fecha.desc()).first()
    alertas = AlertaClinica.query.filter_by(heroe_id=hid, resuelta=False).all()

    return jsonify({
        'heroe': h.to_dict(),
        'historial_corto': [{'fecha': r.fecha.strftime('%d/%m %H:%M'), 'valor': r.glucemia_actual, 'dosis': r.dosis_sugerida} for r in ultimos_registros],
        'psicometria': {
            'cdi': {'puntaje': u_cdi.puntaje_total, 'estado': u_cdi.estado, 'fecha': u_cdi.fecha.strftime('%d/%m/%Y')} if u_cdi else None,
            'scir': {'puntaje': u_scir.puntaje_total, 'estado': u_scir.estado, 'fecha': u_scir.fecha.strftime('%d/%m/%Y')} if u_scir else None,
        },
        'alertas': [a.mensaje for a in alertas]
    })

@panel_bp.route('/panel/paciente/<int:hid>/completo', methods=['GET'])
@login_required
def historial_completo_paciente(hid):
    """Módulo 5: Ficha clínica COMPLETA para el especialista - incluye comidas, crecimiento, recordatorios."""
    if not verificar_permiso(current_user, 'ver_pacientes'):
        return jsonify({'error': 'No autorizado'}), 403
    
    h = Heroe.query.get_or_404(hid)
    
    # Datos del representante/padre
    representante = None
    if h.padre_id:
        representante = Usuario.query.get(h.padre_id)
    
    # Registros de glucosa (últimos 30 días)
    glucosa_registros = (RegistroGlucosa.query.filter_by(heroe_id=hid)
                        .order_by(RegistroGlucosa.fecha.desc()).limit(100).all())
    
    # Comidas (últimos 30 días)
    comidas = (RegistroComida.query.filter_by(heroe_id=hid)
              .order_by(RegistroComida.fecha.desc()).limit(50).all())
    
    # Crecimiento
    crecimiento = (CrecimientoRegistro.query.filter_by(heroe_id=hid)
                  .order_by(CrecimientoRegistro.fecha.desc()).limit(20).all())
    
    # Recordatorios
    recordatorios = (Recordatorio.query.filter_by(heroe_id=hid, activo=True)
                    .order_by(Recordatorio.hora).all())
    
    # Evaluaciones psicométricas
    evals_cdi = (EvaluacionPsicometrica.query.filter_by(heroe_id=hid, tipo='CDI')
                .order_by(EvaluacionPsicometrica.fecha.desc()).all())
    evals_scir = (EvaluacionPsicometrica.query.filter_by(heroe_id=hid, tipo='SCIR')
                 .order_by(EvaluacionPsicometrica.fecha.desc()).all())
    
    # Alertas
    alertas = AlertaClinica.query.filter_by(heroe_id=hid).order_by(AlertaClinica.fecha.desc()).limit(20).all()
    
    return jsonify({
        'heroe': h.to_dict(),
        'representante': {
            'nombre': representante.nombre_completo if representante else None,
            'telefono': representante.telefono if representante else None,
            'email': representante.email if representante else None,
        } if representante else None,
        'glucosa': {
            'total': len(glucosa_registros),
            'registros': [{
                'id': r.id,
                'fecha': r.fecha.strftime('%d/%m/%Y %H:%M'),
                'glucemia': r.glucemia_actual,
                'carbohidratos': r.carbohidratos,
                'dosis_sugerida': r.dosis_sugerida,
                'dosis_aplicada': r.dosis_aplicada,
                'momento_dia': r.momento_dia,
                'alerta': r.alerta_disparada,
                'notas': r.notas,
                'confirmado_por': r.confirmador.nombre_completo if r.confirmador else None
            } for r in glucosa_registros]
        },
        'comidas': {
            'total': len(comidas),
            'registros': [{
                'id': c.id,
                'fecha': c.fecha.strftime('%d/%m/%Y %H:%M'),
                'tipo': c.tipo_comida,
                'descripcion': c.descripcion,
                'carbohidratos': c.carbohidratos,
                'proteinas': c.proteinas,
                'grasas': c.grasas,
                'calorias': c.calorias
            } for c in comidas]
        },
        'crecimiento': {
            'total': len(crecimiento),
            'registros': [{
                'id': c.id,
                'fecha': c.fecha.strftime('%d/%m/%Y'),
                'peso': c.peso,
                'estatura': c.estatura,
                'imc': c.imc,
                'notas': c.notas
            } for c in crecimiento]
        },
        'recordatorios': [r.to_dict() for r in recordatorios],
        'evaluaciones': {
            'cdi': [{
                'id': e.id,
                'fecha': e.fecha.strftime('%d/%m/%Y'),
                'puntaje': e.puntaje_total,
                'estado': e.estado
            } for e in evals_cdi],
            'scir': [{
                'id': e.id,
                'fecha': e.fecha.strftime('%d/%m/%Y'),
                'puntaje': e.puntaje_total,
                'estado': e.estado
            } for e in evals_scir]
        },
        'alertas': [{
            'id': a.id,
            'fecha': a.fecha.strftime('%d/%m/%Y %H:%M'),
            'tipo': a.tipo,
            'severidad': a.severidad,
            'mensaje': a.mensaje,
            'resuelta': a.resuelta,
            'notas_medicas': a.notas_med
        } for a in alertas]
    })

@panel_bp.route('/panel/paciente/<int:hid>/comidas', methods=['GET'])
@login_required
def comidas_paciente(hid):
    """Obtiene el historial de comidas de un paciente."""
    if not verificar_permiso(current_user, 'ver_pacientes'):
        return jsonify({'error': 'No autorizado'}), 403
    
    dias = request.args.get('dias', 30, type=int)
    limite = request.args.get('limite', 50, type=int)
    
    desde_fecha = datetime.now() - timedelta(days=dias)
    comidas = (RegistroComida.query.filter_by(heroe_id=hid)
              .filter(RegistroComida.fecha >= desde_fecha)
              .order_by(RegistroComida.fecha.desc()).limit(limite).all())
    
    return jsonify({
        'total': len(comidas),
        'dias_consultados': dias,
        'comidas': [c.to_dict() for c in comidas]
    })

@panel_bp.route('/panel/paciente/<int:hid>/crecimiento', methods=['GET'])
@login_required
def crecimiento_paciente(hid):
    """Obtiene el historial de crecimiento de un paciente."""
    if not verificar_permiso(current_user, 'ver_pacientes'):
        return jsonify({'error': 'No autorizado'}), 403
    
    crecimiento = (CrecimientoRegistro.query.filter_by(heroe_id=hid)
                  .order_by(CrecimientoRegistro.fecha.desc()).all())
    
    return jsonify({
        'total': len(crecimiento),
        'historial': [c.to_dict() for c in crecimiento]
    })

@panel_bp.route('/panel/paciente/<int:hid>/recordatorios', methods=['GET'])
@login_required
def recordatorios_paciente(hid):
    """Obtiene los recordatorios activos de un paciente."""
    if not verificar_permiso(current_user, 'ver_pacientes'):
        return jsonify({'error': 'No autorizado'}), 403
    
    activos = request.args.get('activos', 'true').lower() == 'true'
    
    query = Recordatorio.query.filter_by(heroe_id=hid)
    if activos:
        query = query.filter_by(activo=True)
    
    recordatorios = query.order_by(Recordatorio.hora).all()
    
    return jsonify({
        'total': len(recordatorios),
        'recordatorios': [r.to_dict() for r in recordatorios]
    })

@panel_bp.route('/panel/graficos/<int:hid>', methods=['GET'])
@login_required
def graficos_heroe(hid):
    """Visualizador de Tendencias: CDI vs control glucémico (moo.md §Módulo 5)."""
    registros = (RegistroGlucosa.query.filter_by(heroe_id=hid)
                 .order_by(RegistroGlucosa.fecha.asc()).limit(30).all())
    evals_cdi = (EvaluacionPsicometrica.query.filter_by(heroe_id=hid, tipo='CDI')
                 .order_by(EvaluacionPsicometrica.fecha.asc()).limit(10).all())
    return jsonify({
        'glucemia': [{'fecha': r.fecha.strftime('%d/%m'), 'valor': r.glucemia_actual} for r in registros],
        'cdi'     : [{'fecha': e.fecha.strftime('%d/%m'), 'puntaje': e.puntaje_total} for e in evals_cdi],
    })

@panel_bp.route('/panel/estadisticas', methods=['GET'])
@login_required
def estadisticas_globales():
    if not verificar_permiso(current_user, 'ver_pacientes'):
        return jsonify({'error': 'No autorizado'}), 403
    
    registros = RegistroGlucosa.query.all()
    total_g = sum([r.glucemia_actual for r in registros]) / len(registros) if registros else 0
    
    heroes = Heroe.query.filter_by(activo=True).all()
    total_tir = 0
    dist_tir = {"bajo": 0, "medio": 0, "objetivo": 0}
    
    # Emotional distribution
    dist_cdi = {"estable": 0, "riesgo": 0}
    
    for h in heroes:
        # TIR Calculation
        regs = [r for r in registros if r.heroe_id == h.id][-30:]
        h_tir = 0
        if regs:
            en_r = [r for r in regs if 70 <= r.glucemia_actual <= 180]
            h_tir = (len(en_r) / len(regs)) * 100
            total_tir += h_tir
            
        if h_tir < 50: dist_tir["bajo"] += 1
        elif h_tir < 70: dist_tir["medio"] += 1
        else: dist_tir["objetivo"] += 1
        
        # CDI Calculation
        u_cdi = EvaluacionPsicometrica.query.filter_by(heroe_id=h.id, tipo='CDI').order_by(EvaluacionPsicometrica.fecha.desc()).first()
        if u_cdi:
            if u_cdi.estado == 'Riesgo': dist_cdi["riesgo"] += 1
            else: dist_cdi["estable"] += 1
    
    avg_tir = round(total_tir / len(heroes)) if heroes else 0

    return jsonify({
        'total_registros' : len(registros),
        'total_evals'     : EvaluacionPsicometrica.query.count(),
        'alertas_pendientes': AlertaClinica.query.filter_by(resuelta=False).count(),
        'heroes_activos'  : len(heroes),
        'promedio_glucemia': round(total_g),
        'promedio_tir': avg_tir,
        'distribucion_tir': dist_tir,
        'distribucion_cdi': dist_cdi
    })
@panel_bp.route('/panel/usuarios', methods=['GET', 'POST'])
@login_required
def gestionar_usuarios():
    """Módulo 5.2: Gestión de Usuarios (Agro-Master pattern)"""
    if request.method == 'GET':
        if not verificar_permiso(current_user, 'ver_pacientes'):
             return jsonify({'error': 'No autorizado'}), 403
        usuarios = list_users_for(current_user)
        return jsonify([u.to_dict() for u in usuarios])

    if request.method == 'POST':
        if not (current_user.rol in ['admin', 'especialista']):
             return jsonify({'error': 'No autorizado para crear usuarios'}), 403
        data = request.json or {}
        result = create_user_by(current_user, data)
        if isinstance(result, tuple):
            return jsonify(result[0]), result[1]
        return jsonify(result)

@panel_bp.route('/panel/usuarios/<int:uid>', methods=['PUT'])
@login_required
def actualizar_usuario(uid):
    """Permite editar todos los datos de un usuario representante (nombre, cédula, email, teléfono, estado)."""
    if current_user.rol not in ['admin', 'especialista', 'nutricionista', 'auditor', 'gerente']:
        return jsonify({'error': 'No autorizado'}), 403

    usuario = Usuario.query.get_or_404(uid)
    data = request.json or {}

    # Campos editables con auditoría individual
    campos = {
        'nombre_completo': data.get('nombre_completo', usuario.nombre_completo),
        'cedula':          data.get('cedula', usuario.cedula),
        'email':           data.get('email', usuario.email),
        'telefono':        data.get('telefono', usuario.telefono),
        'activo':          data.get('activo', usuario.activo),
    }

    for campo, nuevo_val in campos.items():
        valor_ant = getattr(usuario, campo)
        if str(nuevo_val) != str(valor_ant):
            db.session.add(AuditLog(
                usuario_id=current_user.id,
                entidad_tipo='Usuario',
                entidad_id=uid,
                accion='UPDATE',
                campo=campo,
                valor_ant=str(valor_ant),
                valor_nue=str(nuevo_val)
            ))
        setattr(usuario, campo, nuevo_val)

    # Cambio de contraseña opcional
    nueva_password = data.get('nueva_password', '').strip()
    if nueva_password:
        if len(nueva_password) < 6:
            return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
        usuario.set_password(nueva_password)
        usuario.cambio_password_requerido = False
        db.session.add(AuditLog(
            usuario_id=current_user.id,
            entidad_tipo='Usuario',
            entidad_id=uid,
            accion='UPDATE',
            campo='password',
            valor_ant='(hash)',
            valor_nue='(cambiado por especialista)'
        ))

    db.session.commit()
    return jsonify({'status': 'success', 'usuario': usuario.to_dict()})

@panel_bp.route('/panel/usuarios/<int:uid>/emergencia', methods=['PUT'])
@login_required
def actualizar_emergencia_usuario(uid):
    """Compatibilidad retroactiva – solo actualiza el teléfono."""
    if current_user.rol not in ['admin', 'especialista', 'nutricionista', 'auditor', 'gerente']:
        return jsonify({'error': 'No autorizado'}), 403

    usuario = Usuario.query.get_or_404(uid)
    data = request.json or {}
    telefono = data.get('telefono', '').strip()

    if not telefono:
        return jsonify({'error': 'El número de teléfono no puede estar vacío'}), 400

    usuario.telefono = telefono
    db.session.add(AuditLog(
        usuario_id=current_user.id, entidad_tipo='Usuario', entidad_id=uid,
        accion='UPDATE', campo='telefono', valor_ant='(anterior)', valor_nue=telefono
    ))
    db.session.commit()
    return jsonify({'status': 'success', 'telefono': telefono})

@panel_bp.route('/panel/audit-logs', methods=['GET'])
@login_required
def get_audit_logs():
    if not verificar_permiso(current_user, 'ver_logs'):
        return jsonify({'error': 'No autorizado'}), 403
    logs = AuditLog.query.order_by(AuditLog.fecha.desc()).limit(100).all()
    return jsonify([l.to_dict() for l in logs])

@panel_bp.route('/panel/export/excel', methods=['GET'])
@login_required
def export_excel():
    """Módulo de Exportación para análisis estadístico de tesis (moo.md §Módulo 5)."""
    if not verificar_permiso(current_user, 'ver_reportes'):
        return jsonify({'error': 'No autorizado'}), 403
    try:
        output, filename, mimetype = export_group_excel(Heroe, RegistroGlucosa, EvaluacionPsicometrica)
    except ImportError:
        return jsonify({'error': 'xlsxwriter no instalado'}), 500
    return send_file(output, as_attachment=True, download_name=filename, mimetype=mimetype)

@panel_bp.route('/panel/export/pdf', methods=['GET'])
@login_required
def export_pdf():
    if not verificar_permiso(current_user, 'ver_reportes'):
        return jsonify({'error': 'No autorizado'}), 403
    try:
        output, filename, mimetype = export_group_pdf(Heroe, RegistroGlucosa, EvaluacionPsicometrica)
    except ImportError:
        return jsonify({'error': 'reportlab no instalado'}), 500
    return send_file(output, as_attachment=True, download_name=filename, mimetype=mimetype)


# ── Exportar Auditoría ─────────────────────────────────────────────
@panel_bp.route('/panel/export/audit/excel', methods=['GET'])
@login_required
def export_audit_excel():
    """Exporta el registro de auditoría en Excel para ética investigativa."""
    if not verificar_permiso(current_user, 'ver_logs'):
        return jsonify({'error': 'No autorizado'}), 403
    try:
        output, filename, mimetype = export_audit_excel(AuditLog, Usuario)
    except ImportError:
        return jsonify({'error': 'xlsxwriter no instalado'}), 500
    return send_file(output, as_attachment=True, download_name=filename, mimetype=mimetype)


@panel_bp.route('/panel/export/audit/pdf', methods=['GET'])
@login_required
def export_audit_pdf():
    """Exporta el registro de auditoría en PDF."""
    if not verificar_permiso(current_user, 'ver_logs'):
        return jsonify({'error': 'No autorizado'}), 403
    try:
        output, filename, mimetype = export_audit_pdf(AuditLog, Usuario)
    except ImportError:
        return jsonify({'error': 'reportlab no instalado'}), 500
    return send_file(output, as_attachment=True, download_name=filename, mimetype=mimetype)
"""
DESARROLLADOR: Cristian J Garcia
CI: 32.170.910
Email: cjgarciag.dev@gmail.com
"""