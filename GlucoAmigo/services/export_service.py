"""
GlucoAmigo - Servicios de Exportación Mejorados
=================================================
Reportes PDF y Excel con estilo profesional similar a AgroMaster
"""
"""
DESARROLLADOR: Cristian J Garcia
CI: 32.170.910
Email: cjgarciag.dev@gmail.com
"""
import io
from datetime import datetime
from functools import wraps

def export_group_excel(Heroe, RegistroGlucosa, EvaluacionPsicometrica, RegistroComida=None, CrecimientoRegistro=None):
    """Genera reporte Excel estilizado con formato profesional"""
    try:
        import xlsxwriter
    except ImportError:
        raise

    output = io.BytesIO()
    wb = xlsxwriter.Workbook(output, {'in_memory': True})
    
    # Colores del tema GlucoAmigo (turquesa/salud)
    COLOR_PRIMARY = '#0d9488'      # Turquesa oscuro
    COLOR_SECONDARY = '#14b8a6'    # Turquesa
    COLOR_ACCENT = '#f97316'       # Naranja para alertas
    COLOR_SUCCESS = '#22c55e'      # Verde
    COLOR_WARNING = '#eab308'      # Amarillo
    COLOR_DANGER = '#ef4444'       # Rojo
    COLOR_DARK = '#1e293b'         # Gris oscuro
    COLOR_LIGHT = '#f8fafc'        # Gris muy claro
    
    # Formatos
    fmt_header = wb.add_format({
        'bold': True, 
        'bg_color': COLOR_PRIMARY, 
        'font_color': 'white',
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'font_size': 11
    })
    
    fmt_title = wb.add_format({
        'bold': True, 
        'font_color': COLOR_DARK,
        'font_size': 18,
        'align': 'left',
        'valign': 'vcenter'
    })
    
    fmt_subtitle = wb.add_format({
        'bold': True, 
        'font_color': COLOR_PRIMARY,
        'font_size': 12,
        'align': 'left'
    })
    
    fmt_cell = wb.add_format({
        'border': 1,
        'align': 'left',
        'valign': 'vcenter',
        'font_size': 10
    })
    
    fmt_cell_center = wb.add_format({
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'font_size': 10
    })
    
    fmt_cell_number = wb.add_format({
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'font_size': 10,
        'num_format': '#,##0.00'
    })
    
    fmt_alert = wb.add_format({
        'border': 1,
        'bg_color': '#fef2f2',
        'font_color': COLOR_DANGER,
        'align': 'center',
        'bold': True
    })
    
    fmt_stable = wb.add_format({
        'border': 1,
        'bg_color': '#f0fdf4',
        'font_color': COLOR_SUCCESS,
        'align': 'center',
        'bold': True
    })
    
    # ============ HOJA 1: Resumen de Pacientes ============
    ws_resumen = wb.add_worksheet('Resumen de Pacientes')
    
    # Título
    ws_resumen.merge_range(0, 0, 0, 7, '📊 GlucoAmigo - Resumen de Pacientes', fmt_title)
    ws_resumen.merge_range(1, 0, 1, 7, f'Reporte generado: {datetime.now().strftime("%d/%m/%Y %H:%M")}', fmt_subtitle)
    
    # Headers
    headers = ['Código', 'Nombre', 'Edad', 'Peso (kg)', 'Última Glucemia', 'TIR (%)', 'CDI Estado', 'Estado General']
    for col, h in enumerate(headers):
        ws_resumen.write(3, col, h, fmt_header)
    
    # Ancho de columnas
    ws_resumen.set_column(0, 0, 10)  # Código
    ws_resumen.set_column(1, 1, 20)  # Nombre
    ws_resumen.set_column(2, 2, 8)   # Edad
    ws_resumen.set_column(3, 3, 12)  # Peso
    ws_resumen.set_column(4, 4, 15)  # Glucemia
    ws_resumen.set_column(5, 5, 10)  # TIR
    ws_resumen.set_column(6, 6, 12)  # CDI
    ws_resumen.set_column(7, 7, 15)  # Estado
    
    # Datos
    heroes = Heroe.query.filter_by(activo=True).all()
    for row, h in enumerate(heroes, start=4):
        u_g = RegistroGlucosa.query.filter_by(heroe_id=h.id).order_by(RegistroGlucosa.fecha.desc()).first()
        u_cdi = EvaluacionPsicometrica.query.filter_by(heroe_id=h.id, tipo='CDI').order_by(EvaluacionPsicometrica.fecha.desc()).first()
        
        # Calcular TIR de últimos 30 días
        regs_30 = RegistroGlucosa.query.filter_by(heroe_id=h.id).order_by(RegistroGlucosa.fecha.desc()).limit(30).all()
        en_rango = [r for r in regs_30 if 70 <= r.glucemia_actual <= 180] if regs_30 else []
        tir = round((len(en_rango) / len(regs_30)) * 100) if regs_30 else 0
        
        # Determinar estado
        if u_cdi and u_cdi.estado == 'Riesgo':
            cdi_estado = u_cdi.estado
            estado_fmt = fmt_alert
        else:
            cdi_estado = u_cdi.estado if u_cdi else '—'
            estado_fmt = fmt_stable
        
        ws_resumen.write(row, 0, h.codigo or f'P-{h.id:03d}', fmt_cell_center)
        ws_resumen.write(row, 1, h.nombre, fmt_cell)
        ws_resumen.write(row, 2, h.edad, fmt_cell_center)
        ws_resumen.write(row, 3, h.peso, fmt_cell_number)
        
        glucemia_val = u_g.glucemia_actual if u_g else None
        if glucemia_val:
            if glucemia_val < 70 or glucemia_val > 250:
                ws_resumen.write(row, 4, glucemia_val, fmt_alert)
            else:
                ws_resumen.write(row, 4, glucemia_val, fmt_cell_center)
        else:
            ws_resumen.write(row, 4, 'N/A', fmt_cell_center)
        
        # TIR con color
        if tir >= 70:
            ws_resumen.write(row, 5, f'{tir}%', fmt_stable)
        elif tir >= 50:
            ws_resumen.write(row, 5, f'{tir}%', wb.add_format({'border': 1, 'bg_color': '#fefce8', 'font_color': COLOR_WARNING, 'align': 'center'}))
        else:
            ws_resumen.write(row, 5, f'{tir}%', fmt_alert)
        
        ws_resumen.write(row, 6, cdi_estado or '—', estado_fmt)
        
        # Estado general
        riesgo = (u_g and (u_g.glucemia_actual < 70 or u_g.glucemia_actual > 250)) or (u_cdi and u_cdi.estado == 'Riesgo')
        estado_general = 'Riesgo' if riesgo else 'Estable'
        ws_resumen.write(row, 7, estado_general, fmt_cell_center)
    
    # ============ HOJA 2: Historial de Glucosa ============
    if RegistroGlucosa:
        ws_glucosa = wb.add_worksheet('Historial de Glucosa')
        ws_glucosa.merge_range(0, 0, 0, 6, '📈 Historial de Glucosa', fmt_title)
        
        headers_glucosa = ['Fecha', 'Paciente', 'Glucemia (mg/dL)', 'Carbohidratos', 'Dosis Sugerida', 'Dosis Aplicada', 'Alerta']
        for col, h in enumerate(headers_glucosa):
            ws_glucosa.write(2, col, h, fmt_header)
        
        ws_glucosa.set_column(0, 0, 18)
        ws_glucosa.set_column(1, 1, 20)
        ws_glucosa.set_column(2, 2, 15)
        ws_glucosa.set_column(3, 3, 14)
        ws_glucosa.set_column(4, 4, 14)
        ws_glucosa.set_column(5, 5, 14)
        ws_glucosa.set_column(6, 6, 10)
        
        # Últimos 100 registros
        registros = RegistroGlucosa.query.order_by(RegistroGlucosa.fecha.desc()).limit(100).all()
        for row, r in enumerate(registros, start=3):
            heroe = Heroe.query.get(r.heroe_id)
            ws_glucosa.write(row, 0, r.fecha.strftime('%d/%m/%Y %H:%M'), fmt_cell_center)
            ws_glucosa.write(row, 1, heroe.nombre if heroe else 'N/A', fmt_cell)
            
            # Glucemia con color según nivel
            if r.glucemia_actual < 70:
                ws_glucosa.write(row, 2, r.glucemia_actual, fmt_alert)
            elif r.glucemia_actual > 250:
                ws_glucosa.write(row, 2, r.glucemia_actual, fmt_alert)
            elif 70 <= r.glucemia_actual <= 180:
                ws_glucosa.write(row, 2, r.glucemia_actual, fmt_cell_center)
            else:
                ws_glucosa.write(row, 2, r.glucemia_actual, wb.add_format({'border': 1, 'bg_color': '#fefce8', 'font_color': COLOR_WARNING, 'align': 'center'}))
            
            ws_glucosa.write(row, 3, r.carbohidratos or 0, fmt_cell_center)
            ws_glucosa.write(row, 4, r.dosis_sugerida or 0, fmt_cell_number)
            ws_glucosa.write(row, 5, r.dosis_aplicada or 0, fmt_cell_number)
            
            if r.alerta_disparada:
                ws_glucosa.write(row, 6, '⚠️ Sí', fmt_alert)
            else:
                ws_glucosa.write(row, 6, '—', fmt_cell_center)
    
    # ============ HOJA 3: Evaluaciones Psicométricas ============
    if EvaluacionPsicometrica:
        ws_eval = wb.add_worksheet('Evaluaciones')
        ws_eval.merge_range(0, 0, 0, 5, '🧠 Evaluaciones Psicométricas', fmt_title)
        
        headers_eval = ['Fecha', 'Paciente', 'Tipo', 'Puntaje', 'Estado', 'Alerta Enviada']
        for col, h in enumerate(headers_eval):
            ws_eval.write(2, col, h, fmt_header)
        
        ws_eval.set_column(0, 0, 18)
        ws_eval.set_column(1, 1, 20)
        ws_eval.set_column(2, 2, 10)
        ws_eval.set_column(3, 3, 10)
        ws_eval.set_column(4, 4, 12)
        ws_eval.set_column(5, 5, 15)
        
        evals = EvaluacionPsicometrica.query.order_by(EvaluacionPsicometrica.fecha.desc()).limit(50).all()
        for row, e in enumerate(evals, start=3):
            heroe = Heroe.query.get(e.heroe_id)
            ws_eval.write(row, 0, e.fecha.strftime('%d/%m/%Y'), fmt_cell_center)
            ws_eval.write(row, 1, heroe.nombre if heroe else 'N/A', fmt_cell)
            ws_eval.write(row, 2, e.tipo, fmt_cell_center)
            ws_eval.write(row, 3, e.puntaje_total, fmt_cell_center)
            
            if e.estado == 'Riesgo':
                ws_eval.write(row, 4, e.estado, fmt_alert)
            else:
                ws_eval.write(row, 4, e.estado or 'Estable', fmt_stable)
            
            if e.alerta_enviada:
                ws_eval.write(row, 5, '📧 Sí', fmt_alert)
            else:
                ws_eval.write(row, 5, '—', fmt_cell_center)
    
    wb.close()
    output.seek(0)
    filename = f"glucoamigo_reporte_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    return output, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


def export_group_pdf(Heroe, RegistroGlucosa, EvaluacionPsicometrica):
    """Genera reporte PDF estilizado con formato profesional"""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas as rl_canvas
        from reportlab.lib.units import mm
        from reportlab.lib import colors
    except ImportError:
        raise

    output = io.BytesIO()
    c = rl_canvas.Canvas(output, pagesize=A4)
    width, height = A4
    
    # Colores
    COLOR_PRIMARY = colors.HexColor('#0d9488')
    COLOR_DARK = colors.HexColor('#1e293b')
    COLOR_LIGHT = colors.HexColor('#f8fafc')
    COLOR_SUCCESS = colors.HexColor('#22c55e')
    COLOR_WARNING = colors.HexColor('#eab308')
    COLOR_DANGER = colors.HexColor('#ef4444')
    
    y = height - 30*mm
    
    # ============ ENCABEZADO ============
    c.setFillColor(COLOR_PRIMARY)
    c.rect(0, height - 40*mm, width, 25*mm, fill=1, stroke=0)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(20*mm, height - 25*mm, "📊 GlucoAmigo - Reporte de Pacientes")
    
    c.setFont("Helvetica", 10)
    c.drawString(20*mm, height - 32*mm, f"Fecha de generación: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    
    y = height - 45*mm
    
    # ============ TABLA DE PACIENTES ============
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(COLOR_DARK)
    c.drawString(20*mm, y, "Resumen de Pacientes")
    y -= 10*mm
    
    # Headers de tabla
    c.setFillColor(COLOR_PRIMARY)
    c.rect(20*mm, y - 3*mm, width - 40*mm, 8*mm, fill=1, stroke=0)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 9)
    headers = [('Código', 25*mm), ('Nombre', 40*mm), ('Edad', 15*mm), ('Peso', 20*mm), ('Glucemia', 25*mm), ('TIR', 20*mm), ('Estado', 25*mm)]
    x_pos = 22*mm
    for label, w in headers:
        c.drawString(x_pos, y, label)
        x_pos += w
    
    y -= 10*mm
    c.setFillColor(COLOR_DARK)
    c.setFont("Helvetica", 8)
    
    heroes = Heroe.query.filter_by(activo=True).all()
    for i, h in enumerate(heroes):
        if y < 40*mm:
            c.showPage()
            y = height - 30*mm
        
        # Alternar colores de fila
        if i % 2 == 0:
            c.setFillColor(COLOR_LIGHT)
            c.rect(20*mm, y - 3*mm, width - 40*mm, 7*mm, fill=1, stroke=0)
        
        c.setFillColor(COLOR_DARK)
        
        u_g = RegistroGlucosa.query.filter_by(heroe_id=h.id).order_by(RegistroGlucosa.fecha.desc()).first()
        u_cdi = EvaluacionPsicometrica.query.filter_by(heroe_id=h.id, tipo='CDI').order_by(EvaluacionPsicometrica.fecha.desc()).first()
        
        # Calcular TIR
        regs_30 = RegistroGlucosa.query.filter_by(heroe_id=h.id).order_by(RegistroGlucosa.fecha.desc()).limit(30).all()
        en_rango = [r for r in regs_30 if 70 <= r.glucemia_actual <= 180] if regs_30 else []
        tir = round((len(en_rango) / len(regs_30)) * 100) if regs_30 else 0
        
        # Color según estado
        riesgo = (u_g and (u_g.glucemia_actual < 70 or u_g.glucemia_actual > 250)) or (u_cdi and u_cdi.estado == 'Riesgo')
        
        x_pos = 22*mm
        c.drawString(x_pos, y, h.codigo or f'P-{h.id:03d}')
        x_pos += 25*mm
        c.drawString(x_pos, y, h.nombre[:18])
        x_pos += 40*mm
        c.drawString(x_pos, y, str(h.edad or '—'))
        x_pos += 15*mm
        c.drawString(x_pos, y, f"{h.peso}kg" if h.peso else '—')
        x_pos += 20*mm
        
        # Glucemia con color
        if u_g:
            if u_g.glucemia_actual < 70:
                c.setFillColor(COLOR_DANGER)
            elif u_g.glucemia_actual > 250:
                c.setFillColor(COLOR_DANGER)
            elif 70 <= u_g.glucemia_actual <= 180:
                c.setFillColor(COLOR_SUCCESS)
            c.drawString(x_pos, y, f"{u_g.glucemia_actual} mg/dL")
            c.setFillColor(COLOR_DARK)
        else:
            c.drawString(x_pos, y, "Sin datos")
        x_pos += 25*mm
        
        # TIR
        if tir >= 70:
            c.setFillColor(COLOR_SUCCESS)
        elif tir >= 50:
            c.setFillColor(COLOR_WARNING)
        else:
            c.setFillColor(COLOR_DANGER)
        c.drawString(x_pos, y, f"{tir}%")
        c.setFillColor(COLOR_DARK)
        x_pos += 20*mm
        
        # Estado
        if riesgo:
            c.setFillColor(COLOR_DANGER)
            c.drawString(x_pos, y, "🔴 Riesgo")
        else:
            c.setFillColor(COLOR_SUCCESS)
            c.drawString(x_pos, y, "🟢 Estable")
        c.setFillColor(COLOR_DARK)
        
        y -= 7*mm
    
    # ============ PIE DE PÁGINA ============
    c.setFillColor(COLOR_LIGHT)
    c.rect(0, 10*mm, width, 20*mm, fill=1, stroke=0)
    c.setFillColor(COLOR_DARK)
    c.setFont("Helvetica", 8)
    c.drawString(20*mm, 15*mm, f"GlucoAmigo - Sistema de Monitoreo Glucémico Pediátrico | Reporte generado automáticamente")
    
    c.save()
    output.seek(0)
    filename = f"glucoamigo_reporte_{datetime.now().strftime('%Y%m%d')}.pdf"
    return output, filename, 'application/pdf'


def export_audit_excel(AuditLog, Usuario):
    """Genera reporte de auditoría en Excel estilizado"""
    try:
        import xlsxwriter
    except ImportError:
        raise

    output = io.BytesIO()
    wb = xlsxwriter.Workbook(output, {'in_memory': True})
    
    # Colores
    COLOR_DARK = '#1e293b'
    COLOR_PRIMARY = '#0d9488'
    
    fmt_header = wb.add_format({
        'bold': True, 
        'bg_color': COLOR_PRIMARY, 
        'font_color': 'white',
        'border': 1,
        'align': 'center',
        'valign': 'vcenter'
    })
    
    fmt_title = wb.add_format({
        'bold': True, 
        'font_color': COLOR_DARK,
        'font_size': 16
    })
    
    fmt_cell = wb.add_format({
        'border': 1,
        'align': 'left',
        'valign': 'vcenter',
        'font_size': 9
    })
    
    fmt_create = wb.add_format({
        'border': 1,
        'bg_color': '#dcfce7',
        'font_color': '#166534',
        'align': 'center'
    })
    
    fmt_update = wb.add_format({
        'border': 1,
        'bg_color': '#dbeafe',
        'font_color': '#1e40af',
        'align': 'center'
    })
    
    fmt_delete = wb.add_format({
        'border': 1,
        'bg_color': '#fee2e2',
        'font_color': '#991b1b',
        'align': 'center'
    })
    
    ws = wb.add_worksheet('Auditoría de Cambios')
    ws.merge_range(0, 0, 0, 7, '📋 Registro de Auditoría - GlucoAmigo', fmt_title)
    ws.merge_range(1, 0, 1, 7, f'Generado: {datetime.now().strftime("%d/%m/%Y %H:%M")}', wb.add_format({'font_color': '#64748b'}))
    
    headers = ['Fecha', 'Usuario', 'Rol', 'Acción', 'Entidad', 'Campo', 'Valor Anterior', 'Valor Nuevo']
    for col, h in enumerate(headers):
        ws.write(3, col, h, fmt_header)
    
    ws.set_column(0, 0, 18)
    ws.set_column(1, 1, 20)
    ws.set_column(2, 2, 12)
    ws.set_column(3, 3, 10)
    ws.set_column(4, 4, 15)
    ws.set_column(5, 5, 15)
    ws.set_column(6, 6, 25)
    ws.set_column(7, 7, 25)
    
    logs = AuditLog.query.order_by(AuditLog.fecha.desc()).limit(200).all()
    for row, log in enumerate(logs, start=4):
        u = Usuario.query.get(log.usuario_id) if log.usuario_id else None
        
        ws.write(row, 0, log.fecha.strftime('%d/%m/%Y %H:%M:%S') if log.fecha else '', fmt_cell)
        ws.write(row, 1, u.nombre_completo or u.username if u else 'Sistema', fmt_cell)
        ws.write(row, 2, u.rol if u else '—', fmt_cell)
        
        # Formato según acción
        accion = log.accion or ''
        if accion == 'CREATE':
            fmt_accion = fmt_create
        elif accion == 'UPDATE':
            fmt_accion = fmt_update
        elif accion == 'DELETE':
            fmt_accion = fmt_delete
        else:
            fmt_accion = fmt_cell
        ws.write(row, 3, accion, fmt_accion)
        
        ws.write(row, 4, log.entidad_tipo or '', fmt_cell)
        ws.write(row, 5, log.campo or '', fmt_cell)
        ws.write(row, 6, log.valor_ant or '', fmt_cell)
        ws.write(row, 7, log.valor_nue or '', fmt_cell)
    
    wb.close()
    output.seek(0)
    filename = f"glucoamigo_auditoria_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    return output, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


def export_audit_pdf(AuditLog, Usuario):
    """Genera reporte de auditoría en PDF estilizado"""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas as rl_canvas
        from reportlab.lib.units import mm
        from reportlab.lib import colors
    except ImportError:
        raise

    output = io.BytesIO()
    c = rl_canvas.Canvas(output, pagesize=A4)
    width, height = A4
    
    # Encabezado
    c.setFillColor(colors.HexColor('#0d9488'))
    c.rect(0, height - 25*mm, width, 15*mm, fill=1, stroke=0)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(20*mm, height - 18*mm, "📋 GlucoAmigo - Registro de Auditoría")
    
    c.setFont("Helvetica", 9)
    c.drawString(20*mm, height - 22*mm, f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    
    y = height - 35*mm
    
    # Headers
    c.setFillColor(colors.HexColor('#1e293b'))
    c.rect(20*mm, y - 3*mm, width - 40*mm, 6*mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 8)
    
    cols = [(20, 'Fecha'), (55, 'Usuario'), (90, 'Acción'), (120, 'Entidad'), (150, 'Campo')]
    for x, label in cols:
        c.drawString(x*mm, y, label)
    
    y -= 8*mm
    c.setFillColor(colors.HexColor('#1e293b'))
    c.setFont("Helvetica", 7)
    
    logs = AuditLog.query.order_by(AuditLog.fecha.desc()).limit(100).all()
    for log in logs:
        if y < 30*mm:
            c.showPage()
            y = height - 25*mm
        
        u = Usuario.query.get(log.usuario_id) if log.usuario_id else None
        nombre = (u.nombre_completo or u.username)[:12] if u else 'Sistema'
        
        c.drawString(20*mm, y, log.fecha.strftime('%d/%m/%y %H:%M') if log.fecha else '')
        c.drawString(55*mm, y, nombre)
        c.drawString(90*mm, y, (log.accion or '')[:8])
        c.drawString(120*mm, y, (log.entidad_tipo or '')[:12])
        c.drawString(150*mm, y, (log.campo or '')[:15])
        
        y -= 5*mm
    
    # Pie
    c.setFillColor(colors.HexColor('#f1f5f9'))
    c.rect(0, 10*mm, width, 15*mm, fill=1, stroke=0)
    c.setFillColor(colors.HexColor('#64748b'))
    c.setFont("Helvetica", 7)
    c.drawString(20*mm, 15*mm, "GlucoAmigo - Sistema de Auditoría Automática")
    
    c.save()
    output.seek(0)
    filename = f"glucoamigo_auditoria_{datetime.now().strftime('%Y%m%d')}.pdf"
    return output, filename, 'application/pdf'
