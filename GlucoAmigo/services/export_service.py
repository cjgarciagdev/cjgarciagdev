import io
from datetime import datetime

def export_group_excel(Heroe, RegistroGlucosa, EvaluacionPsicometrica):
    try:
        import xlsxwriter
    except ImportError:
        raise

    output = io.BytesIO()
    wb     = xlsxwriter.Workbook(output)
    bold   = wb.add_format({'bold': True, 'bg_color': '#4f46e5', 'font_color': 'white'})
    ws     = wb.add_worksheet('Grupo de Estudio')

    headers = ['ID', 'Nombre', 'Edad', 'Peso (kg)', 'Última Glucemia', 'CDI Puntaje', 'CDI Estado', 'Adherencia %', 'Estado Global']
    for col, h in enumerate(headers):
        ws.write(0, col, h, bold)

    for row, h in enumerate(Heroe.query.all(), start=1):
        u_g  = RegistroGlucosa.query.filter_by(heroe_id=h.id).order_by(RegistroGlucosa.fecha.desc()).first()
        u_cdi= EvaluacionPsicometrica.query.filter_by(heroe_id=h.id, tipo='CDI').order_by(EvaluacionPsicometrica.fecha.desc()).first()
        u_scir=EvaluacionPsicometrica.query.filter_by(heroe_id=h.id, tipo='SCIR').order_by(EvaluacionPsicometrica.fecha.desc()).first()
        ws.write(row, 0, h.codigo or f'P-{h.id:03d}')
        ws.write(row, 1, h.nombre)
        ws.write(row, 2, h.edad)
        ws.write(row, 3, h.peso)
        ws.write(row, 4, u_g.glucemia_actual if u_g else 'N/A')
        ws.write(row, 5, u_cdi.puntaje_total if u_cdi else 'N/A')
        ws.write(row, 6, u_cdi.estado if u_cdi else '—')
        ws.write(row, 7, f"{u_scir.puntaje_total}%" if u_scir else 'N/A')
        ws.write(row, 8, 'Riesgo' if (u_cdi and u_cdi.estado == 'Riesgo') else 'Estable')
    wb.close()
    output.seek(0)
    filename = f"glucoamigo_{datetime.now().strftime('%Y%m%d')}.xlsx"
    return output, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

def export_group_pdf(Heroe, RegistroGlucosa, EvaluacionPsicometrica):
    try:
        from reportlab.pdfgen import canvas as rl_canvas
        from reportlab.lib.pagesizes import letter
    except ImportError:
        raise

    output = io.BytesIO()
    c      = rl_canvas.Canvas(output, pagesize=letter)
    w, h   = letter

    c.setFont('Helvetica-Bold', 16)
    c.drawString(50, h - 50, 'GlucoAmigo – Reporte Tesis')
    c.setFont('Helvetica', 10)
    c.drawString(50, h - 70, f"Hospital — {datetime.now().strftime('%d/%m/%Y %H:%M')}")

    y = h - 100
    c.setFont('Helvetica-Bold', 9)
    for col, label in zip([40,80,180,220,260,320,380,430,480], ['ID','Nombre','Edad','Peso','IMC','Glucemia','TIR(%)','CDI','Estado']):
        c.drawString(col, y, label)
    y -= 15
    c.setFont('Helvetica', 9)
    for hero in Heroe.query.all():
        if y < 60:
            c.showPage(); y = h - 60; c.setFont('Helvetica', 9)
        u_g  = RegistroGlucosa.query.filter_by(heroe_id=hero.id).order_by(RegistroGlucosa.fecha.desc()).first()
        u_cdi= EvaluacionPsicometrica.query.filter_by(heroe_id=hero.id, tipo='CDI').order_by(EvaluacionPsicometrica.fecha.desc()).first()
        
        # Calculate TIR
        regs_30 = RegistroGlucosa.query.filter_by(heroe_id=hero.id).order_by(RegistroGlucosa.fecha.desc()).limit(30).all()
        en_r = [r for r in regs_30 if 70 <= r.glucemia_actual <= 180]
        tir = str(round((len(en_r) / len(regs_30)) * 100)) if regs_30 else 'N/A'
        
        # Calculate IMC
        imc = round(hero.peso / ((hero.estatura/100)**2), 1) if hero.estatura and hero.peso else 'N/A'
        
        c.drawString(40,  y, hero.codigo or f'P-{hero.id:03d}')
        c.drawString(80, y, hero.nombre[:16])
        c.drawString(180, y, str(hero.edad))
        c.drawString(220, y, f'{hero.peso}kg')
        c.drawString(260, y, str(imc))
        c.drawString(320, y, str(u_g.glucemia_actual if u_g else 'N/A'))
        c.drawString(380, y, tir)
        c.drawString(430, y, str(u_cdi.puntaje_total if u_cdi else 'N/A'))
        c.drawString(480, y, 'Riesgo' if (u_cdi and u_cdi.estado == 'Riesgo') else 'Estable')
        y -= 14
    c.save()
    output.seek(0)
    filename = f"reporte_glucoamigo_{datetime.now().strftime('%Y%m%d')}.pdf"
    return output, filename, 'application/pdf'

def export_audit_excel(AuditLog, Usuario):
    try:
        import xlsxwriter
    except ImportError:
        raise

    output = io.BytesIO()
    wb = xlsxwriter.Workbook(output)
    bold = wb.add_format({'bold': True, 'bg_color': '#0f172a', 'font_color': 'white'})
    ws = wb.add_worksheet('Auditoría de Cambios')

    headers = ['Fecha', 'Especialista', 'Rol', 'Acción', 'Entidad', 'ID Entidad', 'Campo', 'Valor Anterior', 'Valor Nuevo']
    for col, h in enumerate(headers):
        ws.write(0, col, h, bold)
        ws.set_column(col, col, 18)

    logs = AuditLog.query.order_by(AuditLog.fecha.desc()).all()
    for row, log in enumerate(logs, start=1):
        u = Usuario.query.get(log.usuario_id) if log.usuario_id else None
        ws.write(row, 0, log.fecha.strftime('%d/%m/%Y %H:%M:%S') if log.fecha else '')
        ws.write(row, 1, u.nombre_completo or u.username if u else 'Sistema')
        ws.write(row, 2, u.rol if u else '—')
        ws.write(row, 3, log.accion or '')
        ws.write(row, 4, log.entidad_tipo or '')
        ws.write(row, 5, log.entidad_id or '')
        ws.write(row, 6, log.campo or '')
        ws.write(row, 7, log.valor_ant or '')
        ws.write(row, 8, log.valor_nue or '')

    wb.close()
    output.seek(0)
    filename = f"auditoria_glucoamigo_{datetime.now().strftime('%Y%m%d')}.xlsx"
    return output, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

def export_audit_pdf(AuditLog, Usuario):
    try:
        from reportlab.pdfgen import canvas as rl_canvas
        from reportlab.lib.pagesizes import letter
    except ImportError:
        raise

    output = io.BytesIO()
    c = rl_canvas.Canvas(output, pagesize=letter)
    w, h = letter

    c.setFont('Helvetica-Bold', 14)
    c.drawString(40, h - 45, 'GlucoAmigo — Registro de Auditoría de Cambios')
    c.setFont('Helvetica', 9)
    c.drawString(40, h - 62, f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    c.setFont('Helvetica', 7)
    c.drawString(40, h - 74, 'Documento de auditoría')

    y = h - 94
    cols = [40, 110, 175, 225, 275, 340, 395, 490]
    labels = ['Fecha', 'Especialista', 'Acción', 'Entidad', 'Campo', 'Anterior', 'Nuevo', '']
    c.setFont('Helvetica-Bold', 7)
    for col, label in zip(cols, labels):
        c.drawString(col, y, label)
    y -= 12
    c.setFont('Helvetica', 7)

    logs = AuditLog.query.order_by(AuditLog.fecha.desc()).limit(200).all()
    for log in logs:
        if y < 50:
            c.showPage(); y = h - 50; c.setFont('Helvetica', 7)
        u = Usuario.query.get(log.usuario_id) if log.usuario_id else None
        uname = (u.nombre_completo or u.username)[:14] if u else 'Sistema'
        c.drawString(40,  y, log.fecha.strftime('%d/%m/%y %H:%M') if log.fecha else '')
        c.drawString(110, y, uname)
        c.drawString(175, y, (log.accion or '')[:10])
        c.drawString(225, y, (log.entidad_tipo or '')[:12])
        c.drawString(275, y, (log.campo or '')[:16])
        c.drawString(340, y, (log.valor_ant or '—')[:14])
        c.drawString(395, y, (log.valor_nue or '—')[:18])
        y -= 11

    c.save()
    output.seek(0)
    filename = f"auditoria_glucoamigo_{datetime.now().strftime('%Y%m%d')}.pdf"
    return output, filename, 'application/pdf'
