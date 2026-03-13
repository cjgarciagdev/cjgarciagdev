from flask import Flask, render_template, request, jsonify, send_file
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from datetime import datetime
import os
import json
# Importamos la base de datos y los modelos definidos en models.py
from models import db, Usuario, TipoEquipo, Sector, CatalogoCable, TipoFalla, Transformador, Conexion, Falla, ReporteReparacion

# Inicialización de la aplicación Flask
app = Flask(__name__)
# Clave secreta para la gestión de sesiones y seguridad
app.config['SECRET_KEY'] = 'graph-theory-electric-electric-secret'
# Configuración de la base de datos SQLite (ubicada en el mismo directorio)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sistema_electrico_grafos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Vinculamos la base de datos con la aplicación de Flask
db.init_app(app)

# Configuración de Flask-Login para la gestión de autenticación de usuarios
login_manager = LoginManager(app)
login_manager.login_view = 'login' # Redirección automática si no hay sesión activa

# Función requerida por Flask-Login para cargar un usuario de la DB por su ID
@login_manager.user_loader
def load_user(id): 
    return Usuario.query.get(int(id))

# ==================== RUTAS DE INTERFAZ (UI) ====================

@app.route('/')
@login_required # Requiere que el usuario esté logueado
def index():
    """ Renderiza el dashboard principal con el mapa de red (grafo). """
    return render_template('dashboard.html')

@app.route('/reparaciones')
@login_required
def reparaciones():
    """ Renderiza la página de gestión de reparaciones y cola de trabajo. """
    return render_template('reparaciones.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """ Gestiona el acceso al sistema mediante usuario y contraseña. """
    if request.method == 'POST':
        data = request.get_json()
        # Buscamos al usuario por su nombre único
        u = Usuario.query.filter_by(username=data.get('username')).first()
        # Verificamos hash de contraseña
        if u and u.check_password(data.get('password')):
            login_user(u) # Inicia la sesión
            return jsonify({'success': True})
        return jsonify({'success': False}), 401
    return render_template('login.html')

@app.route('/logout')
def logout():
    """ Cierra la sesión activa del usuario. """
    logout_user()
    return jsonify({'success': True})

# ==================== API (Gestión de Datos y Grafos) ====================

@app.route('/api/nodos', methods=['GET', 'POST'])
@login_required
def api_nodos():
    """ 
    GET: Devuelve la lista completa de nodos (transformadores) en formato JSON para el grafo.
    POST: Registra un nuevo nodo físico en la red eléctrica.
    """
    if request.method == 'GET':
        nodos = Transformador.query.all()
        return jsonify([{
            'id': n.id, 
            'label': n.codigo, # Etiqueta corta (TX-01)
            'title': n.nombre, # Nombre descriptivo
            'ubicacion': n.ubicacion, 
            'estado': n.estado,
            'tipo': n.tipo_rel.nombre if n.tipo_rel else 'transformer', 
            'sector': n.sector_rel.nombre if n.sector_rel else 'General',
            'lat': n.lat, 
            'lng': n.lng,
            'voltaje': n.voltaje, 
            'carga': n.carga_actual, 
            'carga_max': n.carga_maxima,
            # Cálculo de estrés operativo en tiempo real
            'estres': (n.carga_actual / n.carga_maxima * 100) if n.carga_maxima > 0 else 0,
            # Cálculo de antigüedad del último mantenimiento
            'dias_mantenimiento': (datetime.utcnow() - n.fecha_mantenimiento).days
        } for n in nodos])
    
    # Lógica para crear nuevo nodo (POST)
    data = request.get_json()
    tipo = TipoEquipo.query.filter_by(nombre=data.get('tipo', 'transformer')).first()
    nuevo_nodo = Transformador(
        codigo=data['codigo'],
        nombre=data['nombre'],
        tipo_id=tipo.id if tipo else None,
        voltaje=data.get('voltaje', 13.8),
        carga_maxima=data.get('carga_max', 10.0),
        ubicacion=data.get('ubicacion', 'Ubicación Provisoria'),
        lat=data.get('lat', 11.70),
        lng=data.get('lng', -70.18)
    )
    db.session.add(nuevo_nodo)
    db.session.commit()
    return jsonify({'success': True, 'id': nuevo_nodo.id})

@app.route('/api/aristas', methods=['GET', 'POST'])
@login_required
def api_aristas():
    """
    GET: Devuelve todas las conexiones físicas entre nodos.
    POST: Crea un nuevo cable o tendido entre dos puntos de red.
    """
    if request.method == 'GET':
        aristas = Conexion.query.all()
        return jsonify([{
            'id': a.id, 
            'from': a.nodo_a_id, 
            'to': a.nodo_b_id, 
            'tipo': a.tipo_cable_rel.nombre if a.tipo_cable_rel else 'Estándar', 
            'estado': a.estado,
            'voltaje': a.voltaje, 
            'longitud': a.longitud_km
        } for a in aristas])
    
    data = request.get_json()
    cable = CatalogoCable.query.filter_by(nombre=data.get('tipo')).first()
    nueva_arista = Conexion(
        nodo_a_id=data['from_id'],
        nodo_b_id=data['to_id'],
        tipo_cable_id=cable.id if cable else None,
        voltaje=13.8 # Voltaje por defecto
    )
    db.session.add(nueva_arista)
    db.session.commit()
    return jsonify({'success': True, 'id': nueva_arista.id})

def propalar_falla_cascada(nodo_id, visitados=None):
    """ 
    ALGORITMO DE RECORRIDO DE GRAFOS:
    Propaga una falla "aguas abajo". Si un transformador falla, todos sus hijos quedan sin energía.
    Evita ciclos infinitos mediante un set de 'visitados'.
    """
    if visitados is None:
        visitados = set()
    
    if nodo_id in visitados:
        return
    visitados.add(nodo_id)

    # Buscamos todas las conexiones donde este nodo es el origen
    conexiones = Conexion.query.filter_by(nodo_a_id=nodo_id).all()
    tf_c = TipoFalla.query.filter_by(codigo='apagon_total').first()
    
    for con in conexiones:
        nodo_dest = Transformador.query.get(con.nodo_b_id)
        if nodo_dest and nodo_dest.estado == 'normal':
            nodo_dest.estado = 'falla_cascada'
            # Se registra automáticamente una falla de apagón inducido
            falla_c = Falla(
                tipo_falla_id=tf_c.id if tf_c else None,
                descripcion=f'Apagón inducido por falla en red superior',
                nodo_id=nodo_dest.id,
                localizacion=f'Ubicación: {nodo_dest.ubicacion}',
                estado='activa'
            )
            db.session.add(falla_c)
            # Llamada recursiva para seguir bajando en el árbol de red
            propalar_falla_cascada(nodo_dest.id, visitados)

@app.route('/api/nodos/<int:id>', methods=['DELETE'])
@login_required
def api_borrar_nodo(id):
    """ Elimina físicamente un nodo y sus relaciones. Solo para ADMIN. """
    if current_user.rol != 'admin': 
        return jsonify({'success': False, 'message': 'Solo administradores pueden borrar'}), 403
    n = Transformador.query.get_or_404(id)
    # Limpieza de seguridad: borrar cables y fallas antes de borrar el nodo
    Conexion.query.filter((Conexion.nodo_a_id == id) | (Conexion.nodo_b_id == id)).delete()
    Falla.query.filter_by(nodo_id=id).delete()
    db.session.delete(n)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/aristas/<int:id>', methods=['DELETE'])
@login_required
def api_borrar_arista(id):
    """ Elimina una conexión entre dos nodos. Solo para ADMIN. """
    if current_user.rol != 'admin': 
        return jsonify({'success': False, 'message': 'Solo administradores pueden borrar'}), 403
    a = Conexion.query.get_or_404(id)
    Falla.query.filter_by(arista_id=id).delete()
    db.session.delete(a)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/sectores')
@login_required
def api_sectores():
    """ Devuelve la lista de sectores geográficos disponibles. """
    sectores = Sector.query.all()
    return jsonify([{'id': s.id, 'nombre': s.nombre, 'ciudad': s.ciudad} for s in sectores])

@app.route('/api/fallas', methods=['GET', 'POST'])
@login_required
def api_fallas():
    """
    GET: Lista de todas las fallas activas y resueltas.
    POST: Reporta una nueva incidencia (Simulación de falla).
    """
    if request.method == 'GET':
        fallas = Falla.query.all()
        return jsonify([{
            'id': f.id, 
            'tipo': f.tipo_rel.codigo if f.tipo_rel else 'desconocida',
            'tipo_label': f.tipo_rel.nombre_visual if f.tipo_rel else 'Falla',
            'estado': f.estado,
            'nodo_id': f.nodo_id, 
            'arista_id': f.arista_id,
            'localizacion': f.localizacion, 
            'descripcion': f.descripcion,
            'fecha': f.fecha_deteccion.strftime('%Y-%m-%d %H:%M')
        } for f in fallas])
    
    data = request.get_json()
    tf = TipoFalla.query.filter_by(codigo=data['type']).first()
    f = Falla(
        tipo_falla_id=tf.id if tf else None,
        descripcion=data.get('description', ''),
        nodo_id=data.get('node_id'),
        arista_id=data.get('arista_id'),
        localizacion=data.get('localizacion', 'Desconocida')
    )
    
    # Si la falla es en un nodo, cambiamos su estado visual
    if f.nodo_id:
        n = Transformador.query.get(f.nodo_id)
        if n: 
            n.estado = 'falla'
            # Si el componente es vital (Generador o S/E), activamos efecto cascada
            if n.codigo.startswith('GEN-') or n.codigo.startswith('SE-'):
                propalar_falla_cascada(n.id)
                
    if f.arista_id:
        a = Conexion.query.get(f.arista_id)
        if a: a.estado = 'falla'
        
    db.session.add(f)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/reportes/pdf/<int:id>')
@login_required
def export_report_pdf(id):
    """
    Genera un PDF profesional del reporte técnico usando ReportLab.
    """
    from reportlab.lib.pagesizes import LETTER
    from reportlab.pdfgen import canvas
    from io import BytesIO
    from reportlab.lib import colors
    from reportlab.lib.units import inch

    base_reporte = ReporteReparacion.query.get_or_404(id)
    falla_org = base_reporte.falla
    
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=LETTER)
    width, height = LETTER

    # Header de SENA
    p.setFillColor(colors.HexColor('#10b981'))
    p.rect(0, height - 1.2*inch, width, 1.2*inch, fill=1)
    
    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 18)
    p.drawString(0.5*inch, height - 0.5*inch, "SISTEMA ELÉCTRICO NACIONAL")
    p.setFont("Helvetica", 10)
    p.drawString(0.5*inch, height - 0.8*inch, "CENTRO DE CONTROL Y MANTENIMIENTO TÉCNICO")
    p.drawRightString(width-0.5*inch, height - 0.5*inch, f"ID: OT-{base_reporte.id}")

    # Cuerpo del reporte
    p.setFillColor(colors.black)
    p.setFont("Helvetica-Bold", 14)
    p.drawString(0.5*inch, height - 1.8*inch, "ORDEN DE TRABAJO - REPORTE DE RESOLUCIÓN")
    
    p.setFont("Helvetica", 11)
    y = height - 2.2*inch
    
    datos = [
        ("FECHA DE CIERRE:", base_reporte.fecha_reparacion.strftime('%Y-%m-%d %H:%M')),
        ("TÉCNICO RESPONSABLE:", base_reporte.tecnico.nombre if base_reporte.tecnico else "S/D"),
        ("FALLA ATENDIDA:", falla_org.tipo_rel.nombre_visual if falla_org and falla_org.tipo_rel else "Mantenimiento"),
        ("LOCALIZACIÓN:", falla_org.localizacion if falla_org else "Sistema General")
    ]

    for label, val in datos:
        p.setFont("Helvetica-Bold", 11)
        p.drawString(0.5*inch, y, label)
        p.setFont("Helvetica", 11)
        p.drawString(2.5*inch, y, str(val))
        y -= 0.3*inch

    p.line(0.5*inch, y, width-0.5*inch, y)
    y -= 0.4*inch

    # Secciones Informativas
    p.setFont("Helvetica-Bold", 12)
    p.drawString(0.5*inch, y, "I. DIAGNÓSTICO TÉCNICO (IN-SITU)")
    y -= 0.25*inch
    p.setFont("Helvetica", 11)
    
    # Manejo básico de wrapping
    text = base_reporte.diagnostico
    lines = [text[i:i+85] for i in range(0, len(text), 85)]
    for line in lines:
        p.drawString(0.7*inch, y, line)
        y -= 0.2*inch
    
    y -= 0.3*inch
    p.setFont("Helvetica-Bold", 12)
    p.drawString(0.5*inch, y, "II. MATERIALES Y REPUESTOS UTILIZADOS")
    y -= 0.25*inch
    p.setFont("Helvetica", 11)
    
    text_m = base_reporte.materiales_usados
    lines_m = [text_m[i:i+85] for i in range(0, len(text_m), 85)]
    for line in lines_m:
        p.drawString(0.7*inch, y, line)
        y -= 0.2*inch

    # Pie de página y firmas
    p.line(1*inch, 1.5*inch, 3*inch, 1.5*inch)
    p.drawCentredString(2*inch, 1.3*inch, "Firma del Técnico")
    
    p.line(width-3*inch, 1.5*inch, width-1*inch, 1.5*inch)
    p.drawCentredString(width-2*inch, 1.3*inch, "Centro de Control")

    p.setFont("Helvetica-Oblique", 8)
    p.drawCentredString(width/2, 0.5*inch, "Este documento es un comprobante digital generado automáticamente por el sistema SENA.")

    p.showPage()
    p.save()
    
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f"Reporte_SENA_{base_reporte.id}.pdf", mimetype='application/pdf')

@app.route('/api/reparar', methods=['POST'])
@login_required
def reparar_falla():
    """ 
    Registra el cierre de una incidencia. 
    Cambia el estado de la falla a 'resuelta' y restaura el nodo en la base de datos.
    """
    data = request.get_json()
    falla = Falla.query.get_or_404(data['falla_id'])
    
    falla.estado = 'resuelta'
    
    # Si la falla es en un nodo, intentamos normalizar el sistema
    if falla.nodo_id:
        n = Transformador.query.get(falla.nodo_id)
        # Comprobar si existen otras averías pendientes en este nodo
        otras = Falla.query.filter_by(nodo_id=n.id, estado='activa').count()
        if otras <= 0: 
            n.estado = 'normal'
            # RECOBRAMOS EN CASCADA: Si este nodo vuelve a la normalidad, 
            # sus hijos en 'falla_cascada' podrían recuperarse.
            restaurar_sistema_cascada(n.id)
        
    if falla.arista_id:
        a = Conexion.query.get(falla.arista_id)
        if a: a.estado = 'normal'
    
    # Validar que se haya seleccionado un técnico
    tecnico_id = data.get('tecnico_id')
    if not tecnico_id:
        return jsonify({'success': False, 'message': 'Debe indicar el técnico responsable.'}), 400

    # Generamos el reporte histórico técnico
    db.session.add(ReporteReparacion(
        falla_id=falla.id, 
        tecnico_id=tecnico_id,
        diagnostico=data['diagnostico'], 
        materiales_usados=data['materiales'],
        tiempo_trabajo=data.get('tiempo_trabajo', 0.0)
    ))
    db.session.commit()
    return jsonify({'success': True})

def restaurar_sistema_cascada(nodo_id):
    """
    Intenta restaurar los nodos aguas abajo que fueron afectados por un apagón inducido.
    Solo restaura si el nodo no tiene fallas directas (propias).
    """
    conexiones = Conexion.query.filter_by(nodo_a_id=nodo_id).all()
    for con in conexiones:
        nodo_dest = Transformador.query.get(con.nodo_b_id)
        if nodo_dest and nodo_dest.estado == 'falla_cascada':
            # Resolvemos la falla de cascada para este nodo hijo
            falla_cascada = Falla.query.filter_by(
                nodo_id=nodo_dest.id, 
                estado='activa'
            ).filter(Falla.descripcion.like('%Apagón inducido%')).first()
            
            if falla_cascada:
                falla_cascada.estado = 'resuelta'
            
            # Verificamos si tiene más fallas. Si no, vuelve a normal
            otras = Falla.query.filter_by(nodo_id=nodo_dest.id, estado='activa').count()
            if otras <= 0:
                nodo_dest.estado = 'normal'
                # Recursión para seguir restaurando la red
                restaurar_sistema_cascada(nodo_dest.id)

@app.route('/api/tecnicos')
@login_required
def get_tecnicos():
    """ Devuelve la lista de usuarios con rol técnico para selección. """
    tecnicos = Usuario.query.filter_by(rol='tecnico').all()
    # Si no hay técnicos específicos, devolver todos para no bloquear el flujo
    if not tecnicos:
        tecnicos = Usuario.query.all()
    return jsonify([{'id': t.id, 'nombre': t.nombre} for t in tecnicos])

@app.route('/api/reportes')
@login_required
def get_reportes():
    """ Devuelve el historial completo de mantenimientos y reparaciones. """
    reps = ReporteReparacion.query.all()
    return jsonify([{
        'id': r.id,
        'falla_tipo': r.falla.tipo_rel.nombre_visual if r.falla.tipo_rel else 'Falla',
        'severidad': r.falla.tipo_rel.severidad if r.falla.tipo_rel else 'media',
        'tecnico': r.tecnico.nombre,
        'diagnostico': r.diagnostico,
        'materiales': r.materiales_usados,
        'tiempo_trabajo': r.tiempo_trabajo,
        'fecha': r.fecha_reparacion.strftime('%Y-%m-%d %H:%M'),
        'localizacion': r.falla.localizacion
    } for r in reps])

if __name__ == '__main__':
    # El servidor se inicia directamente. 
    # Para inicializar la base de datos, ejecute 'python init_db.py' por separado.
    app.run(debug=True, port=5000)
