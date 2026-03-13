# ==============================================================================
# AGRO-MASTER: SISTEMA INTEGRAL DE GESTIÓN GANADERA
# PRODUCTOR UNICO: CRISTIAN J GARCIA | CI: 32.170.910 | Email: dicrisog252@gmail.com
# ==============================================================================
# Este archivo (app.py) sirve como el punto de entrada principal de la aplicación Flask.
# Es responsable de la configuración del servidor, la gestión de rutas (endpoints),
# y la orquestación entre la base de datos, los servicios lógicos y la presentación web.
#
# ESTRUCTURA DEL ARCHIVO:
# 1. Imports y Configuración
# 2. Inicialización de la App (Factory Pattern)
# 3. Middlewares y Decoradores (Autenticación)
# 4. Rutas Principales (Vistas HTML)
# 5. API Endpoints (JSON para el Frontend)
#    - Estadísticas
#    - Ganado (CRUD)
#    - Salud y Protocolos
#    - Inventario
#    - Análisis Avanzado (Grafos)
# ==============================================================================

# Importación de librerías del sistema y terceras
import os
import io
import logging
import random
from datetime import datetime, date, timedelta
from functools import wraps  # Para crear decoradores personalizados
from dotenv import load_dotenv  # Para cargar variables de entorno (.env)

# Importación de Flask y sus extensiones
from flask import Flask, render_template, jsonify, request, send_file, session, redirect, url_for, g

# Importación de modelos de base de datos (SQLAlchemy)
# models.py contiene las definiciones de todas las tablas: Ganado, Usuario, HistorialMedico, etc.
from models import (
    db, init_db, guardar_o_actualizar, obtener_todos, obtener_estadisticas, 
    obtener_animal, obtener_pesos_animal,
    PlanNutricional, ErrorLog, ProtocoloSalud, HistorialCambios, PreguntaSeguridad, HistorialInsumo
)
from models_notifications import NotificacionDescartada

# Importación de servicios de negocio
# Separamos la lógica compleja en servicios para mantener el controlador (app.py) limpio.
from services.animal_service import calcular_nutricion, predecir_productividad, analisis_avanzado_animal
from services.grafo_service import GrafoGenealogia, construir_grafo_desde_bd
from services.logica_service import CircuitoLogico, EvaluadorSaludAnimal, AnalizadorGeneticoLogico, ReglaManejador
from services.auth_service import (
    Usuario, crear_usuario_defecto, autenticar_usuario, verificar_permiso,
    obtener_todos_usuarios, crear_usuario, actualizar_usuario, cambiar_password,
    generar_password_temporal, verificar_pregunta_seguridad, set_security_question, resetear_password
)
from services.export_service import ExportadorExcel, ExportadorPDF, generar_grafica_especie, generar_grafica_pesos
from services.visualizador_grafos import VisualizadorGrafosAvanzado, AnalizadorCircuitosLogicos

# Carga de variables de entorno
load_dotenv()

# Configuración de Logging del servidor
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    """
    Patrón Factory para crear la aplicación Flask.
    Permite tener múltiples instancias (útil para testing) y configuración encapsulada.
    """
    app = Flask(__name__)
    
    # Configuración de Seguridad
    # SECRET_KEY es necesaria para firmar cookies de sesión y protección CSRF.
    # Debe ser una cadena aleatoria y secreta en producción.
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback_secret_key_agro_2024')
    
    # Inicializar Base de Datos (SQLite)
    # Se conecta al archivo 'instance/agro.db' usando SQLAlchemy ORM.
    init_db(app)
    
    # Inicialización de Datos Base
    # Crea un usuario admin si no existe, para asegurar acceso inicial al sistema.
    with app.app_context():
        crear_usuario_defecto(app)

    # Registro de Blueprints (Modularización de Rutas)
    # Los blueprints permiten dividir las rutas en múltiples archivos.
    # Aquí importamos y registramos las rutas de exportación, animales y nutrición.
    from routes.export_routes import export_bp
    from routes.animal_routes import animal_bp
    from routes.nutricion_routes import nutricion_bp
    from routes.analisis_routes import analisis_bp
    from routes.produccion_routes import produccion_bp

    from routes.finanzas_routes import finanzas_bp
    from routes.calendario_routes import calendario_bp
    
    app.register_blueprint(export_bp)
    app.register_blueprint(animal_bp)
    app.register_blueprint(nutricion_bp)
    app.register_blueprint(analisis_bp)
    app.register_blueprint(produccion_bp)

    app.register_blueprint(finanzas_bp)
    app.register_blueprint(calendario_bp)
    
    # ==========================================================================
    # DECORADORES DE SEGURIDAD (MIDDLEWARE PERSONALIZADO)
    # ==========================================================================
    
    def require_login(f):
        """
        Protege las rutas que requieren autenticación.
        Si el usuario no ha iniciado sesión ('user_id' no está en session),
        lo redirige a la página de login.
        """
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return redirect(url_for('login'))
            return f(*args, **kwargs)
        return decorated_function
    
    def require_permission(permiso):
        """
        Verifica si el usuario autenticado tiene un permiso (rol) específico.
        Útil para funcionalidades administrativas o sensibles.
        """
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                if 'user_id' not in session:
                    return redirect(url_for('login'))
                usuario = Usuario.query.get(session['user_id'])
                # Llama al servicio de autenticación para comprobar roles
                if not usuario or not verificar_permiso(usuario, permiso):
                    return jsonify({'error': 'Permiso denegado'}), 403
                return f(*args, **kwargs)
            return decorated_function
        return decorator
    
    # ==========================================================================
    # RUTAS DE AUTENTICACIÓN Y SESIÓN
    # ==========================================================================

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        """
        Maneja el inicio de sesión.
        """
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            
            usuario = autenticar_usuario(username, password)
            if usuario:
                session['user_id'] = usuario.id
                session['username'] = usuario.username
                session['rol'] = usuario.rol
                
                if usuario.cambio_password_requerido:
                    return redirect(url_for('change_password_required'))
                
                return redirect(url_for('index'))
            else:
                error = 'Usuario o contraseña incorrectos'
                return render_template('login.html', error=error)
        
        return render_template('login.html')

    @app.route('/logout')
    def logout():
        """Cierra la sesión del usuario limpiando las cookies."""
        session.clear()
        return redirect(url_for('login'))

    @app.route('/api/auth/identify', methods=['POST'])
    def api_identify_user():
        """Identifica al usuario y devuelve sus preguntas de seguridad."""
        data = request.json
        username = data.get('username')
        email = data.get('email')
        
        usuario = Usuario.query.filter_by(username=username, email=email, activo=True).first()
        if not usuario:
            return jsonify({'status': 'fail', 'error': 'Usuario o correo electrónico no coinciden'}), 404
        
        preguntas = PreguntaSeguridad.query.filter_by(usuario_id=usuario.id).all()
        
        if not preguntas:
            # Soporte legacy
            if usuario.pregunta_seguridad:
                return jsonify({
                    'status': 'success',
                    'username': username,
                    'questions': [{'id': 'legacy', 'text': usuario.pregunta_seguridad}],
                    'is_legacy': True
                })
            
            # Si no hay preguntas y no es admin, generar temporal
            if usuario.rol != 'admin':
                temp_pass, msg = generar_password_temporal(username)
                if temp_pass:
                    return jsonify({'status': 'temp_pass', 'temp_pass': temp_pass})
                return jsonify({'status': 'fail', 'error': msg}), 400
            
            return jsonify({'status': 'fail', 'error': 'No se han configurado preguntas de seguridad.'}), 400

        # Seleccionar 3 preguntas aleatorias si hay suficientes, de lo contrario todas
        import random
        num_preguntas = min(len(preguntas), 3)
        preguntas_seleccionadas = random.sample(preguntas, num_preguntas)
        
        res_questions = [{'id': q.id, 'text': q.pregunta} for q in preguntas_seleccionadas]
        
        return jsonify({
            'status': 'success',
            'username': username,
            'questions': res_questions,
            'is_legacy': False
        })

    @app.route('/api/auth/reset-password', methods=['POST'])
    def api_reset_password():
        """Restablece la contraseña tras verificar todas las preguntas."""
        data = request.json
        username = data.get('username')
        answers = data.get('answers', {}) # {id: respuesta}
        nueva_pass = data.get('nueva_password')
        
        if not nueva_pass or len(nueva_pass) < 6:
            return jsonify({'status': 'fail', 'error': 'Contraseña inválida (mín. 6 caracteres)'}), 400
            
        usuario = Usuario.query.filter_by(username=username, activo=True).first()
        if not usuario:
            return jsonify({'status': 'fail', 'error': 'Error de integridad'}), 404
            
        # Verificar respuestas
        exito = True
        msg_error = ""
        
        if 'legacy' in answers:
            # Caso legacy
            from services.auth_service import verificar_pregunta_seguridad
            exito_legacy, _ = verificar_pregunta_seguridad(username, answers['legacy'])
            if not exito_legacy:
                exito = False
                msg_error = "Respuesta de seguridad incorrecta"
        else:
            # Verificar solo las preguntas que el usuario proporcionó (que deberían ser las 3 aleatorias)
            for q_id, resp in answers.items():
                p = PreguntaSeguridad.query.get(q_id)
                if not p or p.usuario_id != usuario.id or not p.check_respuesta(resp):
                    exito = False
                    msg_error = "Una o más respuestas son incorrectas"
                    break
            
            # Asegurarse de que al menos se respondieron preguntas si el usuario las tiene
            if not answers:
                exito = False
                msg_error = "No se proporcionaron respuestas"
                    
        if exito:
            usuario.set_password(nueva_pass)
            usuario.cambio_password_requerido = False
            db.session.commit()
            return jsonify({'status': 'success', 'message': 'Contraseña restablecida correctamente'})
            
        return jsonify({'status': 'fail', 'error': msg_error}), 400

    @app.route('/forgot-password')
    def forgot_password():
        """Renderiza la vista de recuperación (ahora dinámica)."""
        return render_template('forgot_password.html')


    @app.route('/change-password-required', methods=['GET', 'POST'])
    @require_login
    def change_password_required():
        if not g.user.cambio_password_requerido:
            return redirect(url_for('index'))
            
        if request.method == 'POST':
            nueva_pass = request.form.get('nueva_password')
            confirm_pass = request.form.get('confirm_password')
            
            if nueva_pass != confirm_pass:
                return render_template('change_password_required.html', error="Las contraseñas no coinciden")
            
            g.user.set_password(nueva_pass)
            g.user.cambio_password_requerido = False
            db.session.commit()
            return redirect(url_for('index'))
            
        return render_template('change_password_required.html')

    @app.route('/api/auth/set_security_question', methods=['POST'])
    @require_login
    def api_set_security_question():
        if g.user.rol != 'admin':
            return jsonify({'error': 'Solo el administrador puede configurar preguntas de seguridad'}), 403
            
        data = request.json
        pregunta = data.get('pregunta')
        respuesta = data.get('respuesta')
        
        if not pregunta or not respuesta:
            return jsonify({'error': 'Pregunta y respuesta son requeridas'}), 400
            
        exito, msg = set_security_question(g.user.id, pregunta, respuesta)
        if exito:
            return jsonify({'status': 'success', 'message': msg})
        return jsonify({'error': msg}), 400

    @app.route('/api/auth/verify_action', methods=['POST'])
    def verify_action_challenge():
        """Verifica credenciales para una acción protegida (Supervisión en tiempo real)."""
        data = request.json
        username = data.get('user')
        password = data.get('pass')
        permiso = data.get('permiso') # p.ej. 'eliminar_ganado', 'veterinario', etc.
        
        from services.auth_service import autenticar_usuario, verificar_permiso
        usuario = autenticar_usuario(username, password)
        
        if not usuario:
            return jsonify({'status': 'fail', 'error': 'Credenciales inválidas'}), 401
        
        # Si el permiso solicitado es un rol (ej: 'admin', 'veterinario')
        if permiso in ['admin', 'veterinario', 'supervisor', 'operador']:
            if usuario.rol == permiso or usuario.rol == 'admin':
                return jsonify({'status': 'success', 'user': usuario.nombre_completo})
            else:
                return jsonify({'status': 'fail', 'error': f'Se requiere nivel de {permiso}'}), 403
        
        # Si es un permiso específico (ej: 'eliminar_ganado')
        if verificar_permiso(usuario, permiso):
            return jsonify({'status': 'success', 'user': usuario.nombre_completo})
        
        return jsonify({'status': 'fail', 'error': 'Permiso insuficiente para esta zona'}), 403

    @app.before_request
    def load_current_user():
        """Carga el usuario actual en la variable global de Flask 'g'."""
        from flask import g
        g.user = None
        if 'user_id' in session:
            g.user = Usuario.query.get(session['user_id'])

    @app.context_processor
    def inject_permissions():
        """Inyecta una función de verificación de permisos en todas las plantillas Jinja2."""
        from services.auth_service import verificar_permiso
        def has_perm(permiso):
            from flask import g
            if not g.user:
                return False
            return verificar_permiso(g.user, permiso)
        return dict(has_perm=has_perm)

    @app.before_request
    def check_authentication():
        """
        Middleware Global: Se ejecuta antes de CADA petición.
        Redirige a login si se intenta acceder a una ruta protegida sin sesión.
        Excluye 'login' y 'static' (assets) para evitar bucles infinitos.
        """
        if request.endpoint not in ['login', 'static', 'forgot_password', 'api_identify_user', 'api_reset_password'] and 'user_id' not in session:
            # Si es una petición AJAX, devolver 401 en lugar de redirección
            if request.path.startswith('/api/'):
                return jsonify({'error': 'No autorizado'}), 401
            return redirect(url_for('login'))

    # ==========================================================================
    # RUTA PRINCIPAL (VISTA)
    # ==========================================================================

    @app.route('/')
    @require_login
    def index():
        from services.auth_service import verificar_permiso
        
        # Cargar estadísticas iniciales para el renderizado
        poblacion, peso_avg, alertas, criticos, desparasitacion, inv_critico = obtener_estadisticas()
        
        # Determinar Sección Inicial según Rol
        initial_section = 'dashboard'
        rol = g.user.rol
        
        if rol == 'veterinario': initial_section = 'salud'
        elif rol == 'nutricionista': initial_section = 'nutricion'
        elif rol == 'inventario': initial_section = 'inventario'
        elif rol == 'operador': initial_section = 'ganado'
        elif rol == 'auditor' or rol == 'consultor': initial_section = 'auditoria'
        elif rol == 'gerente': initial_section = 'dashboard'
        elif rol == 'supervisor': initial_section = 'dashboard'
        elif rol == 'admin': initial_section = 'dashboard'
        
        # Build permissions object for frontend
        permissions = {
            'ver_dashboard_completo': verificar_permiso(g.user, 'ver_dashboard_completo'),
            'crear_animales': verificar_permiso(g.user, 'crear_animales'),
            'editar_animales': verificar_permiso(g.user, 'editar_animales'),
            'eliminar_animales': verificar_permiso(g.user, 'eliminar_animales'),
            'exportar': verificar_permiso(g.user, 'exportar'),
            'ver_analisis': verificar_permiso(g.user, 'ver_analisis'),
            'gestionar_usuarios': verificar_permiso(g.user, 'gestionar_usuarios'),
            'ver_reportes': verificar_permiso(g.user, 'ver_reportes'),
            'gestionar_nutricion': verificar_permiso(g.user, 'gestionar_nutricion'),
            'gestionar_inventario': verificar_permiso(g.user, 'gestionar_inventario'),
            'gestionar_salud': verificar_permiso(g.user, 'gestionar_salud'),
            'gestionar_genealogia': verificar_permiso(g.user, 'gestionar_genealogia'),
            'ver_logs': verificar_permiso(g.user, 'ver_logs'),
            'aprobar_acciones': verificar_permiso(g.user, 'aprobar_acciones'),
            'solo_lectura': verificar_permiso(g.user, 'solo_lectura'),
            'rol': g.user.rol # IMPORTANTE: Exponemos rol para lógica frontend fina
        }
        
        return render_template('index.html', 
                             poblacion=poblacion, 
                             peso_avg=peso_avg, 
                             alertas=alertas, 
                             criticos=criticos,
                             desparasitacion=desparasitacion,
                             inv_critico=inv_critico,
                             initial_section=initial_section, 
                             permissions=permissions)

    # ==========================================================================
    # API ENDPOINTS: ESTADÍSTICAS Y DASHBOARD
    # ==========================================================================

    def _get_active_notifications(usuario_id):
        """Lógica central de generación y filtrado de notificaciones para el usuario."""
        from datetime import date, datetime, timedelta
        from models import Insumo, ProtocoloSalud, EstadoProtocolo, Ganado, HistorialCambios, Usuario
        from models_notifications import NotificacionDescartada
        from sqlalchemy import and_

        usuario = Usuario.query.get(usuario_id)
        if not usuario: return []
        rol = usuario.rol

        try:
            descartadas = [d.referencia for d in NotificacionDescartada.query.filter_by(usuario_id=usuario_id).all()]
        except:
            descartadas = []

        notificaciones = []
        hoy = date.today()
        hoy_dt = datetime.now()
        
        # 1. Insumos Críticos (Prioridad: Inventario, Admin, Gerente, Supervisor, Nutricionista)
        if rol in ['admin', 'gerente', 'supervisor', 'inventario', 'veterinario', 'nutricionista']:
            try:
                # Stock bajo
                insumos_bajo = Insumo.query.filter(Insumo.cantidad <= Insumo.stock_minimo).all()
                for i in insumos_bajo:
                    ref = f"insumo_{i.id}_stock"
                    if ref not in descartadas:
                        notificaciones.append({
                            'ref': ref, 'tipo': 'critico', 'prioridad': 'alta',
                            'titulo': f'Stock Bajo: {i.nombre}',
                            'mensaje': f'Quedan {i.cantidad} {i.cat_unidad.nombre if i.cat_unidad else ""}.'
                        })
                    
                # Vencimiento (15 días)
                vence_pronto = Insumo.query.filter(and_(Insumo.fecha_vencimiento <= (hoy + timedelta(days=15)), Insumo.fecha_vencimiento >= hoy)).all()
                for i in vence_pronto:
                    ref = f"insumo_{i.id}_vence"
                    if ref not in descartadas:
                        notificaciones.append({
                            'ref': ref, 'tipo': 'critico', 'prioridad': 'alta',
                            'titulo': f'Próximo a Vencer: {i.nombre}',
                            'mensaje': f'Vence el {i.fecha_vencimiento}.'
                        })
            except: pass

        # 2. Protocolos Pendientes (Prioridad: Veterinario, Admin, Gerente, Supervisor, Operador)
        if rol in ['admin', 'gerente', 'supervisor', 'veterinario', 'operador']:
            try:
                est_realizado = EstadoProtocolo.query.filter_by(nombre='Realizado').first()
                p_pendientes = ProtocoloSalud.query.filter(ProtocoloSalud.estado_id != (est_realizado.id if est_realizado else 0), ProtocoloSalud.fecha_programada <= hoy_dt).all()
                for p in p_pendientes:
                    ref = f"protocolo_{p.id}"
                    if ref not in descartadas:
                        notificaciones.append({
                            'ref': ref, 'tipo': 'vacunacion', 'id': p.id, 'entity_type': 'protocolo', 'prioridad': 'media',
                            'titulo': f'Protocolo: {p.cat_tipo.nombre if p.cat_tipo else "Salud"}',
                            'mensaje': f'Animal #{p.animal_id}: {p.descripcion[:40]}...'
                        })
            except: pass

        # 3. Nuevos Ingresos (Prioridad: Admin, Gerente, Supervisor, Operador, Auditor)
        if rol in ['admin', 'gerente', 'supervisor', 'operador', 'auditor']:
            try:
                nuevos = Ganado.query.order_by(Ganado.id.desc()).limit(3).all()
                for a in nuevos:
                    ref = f"ganado_{a.id}"
                    if ref not in descartadas:
                        notificaciones.append({
                            'ref': ref, 'tipo': 'parto', 'prioridad': 'media',
                            'titulo': f'Nuevo Ingreso: #{a.id}',
                            'mensaje': f'Registrado un {a.cat_especie.nombre if a.cat_especie else "Animal"}.'
                        })
            except: pass

        return notificaciones

    @app.route('/api/estadisticas')
    @require_login
    def get_estadisticas():
        """Retorna contadores generales sincronizados con las alertas reales del usuario."""
        poblacion, peso_avg, _, criticos, desparasitacion, inv_critico = obtener_estadisticas()
        
        # SINCRONIZACIÓN: Contar solo lo que el usuario NO ha marcado como visto
        active_notifs = _get_active_notifications(g.user.id)
        alertas_reales = len(active_notifs)
        
        return jsonify({
            'poblacion': poblacion, 'peso_avg': peso_avg, 'alertas': alertas_reales,
            'criticos': criticos, 'desparasitacion': desparasitacion, 'inv_critico': inv_critico
        })

    @app.route('/api/sync/version')
    def get_sync_version():
        """Retorna la versión actual de la base de datos para sincronización real-time."""
        from models import SistemaSync
        sync = SistemaSync.query.first()
        if not sync:
            return jsonify({'version': 0})
        return jsonify({'version': sync.version, 'last_update': sync.last_update.isoformat()})

    @app.route('/api/estadisticas/especies')
    def get_estadisticas_especies():
        """Retorna estadísticas agrupadas por especie (población y peso promedio)."""
        try:
            from models import obtener_estadisticas_especies
            pob, pes = obtener_estadisticas_especies()
            return jsonify({
                'poblacion_por_especie': pob,
                'peso_por_especie': pes
            })
        except Exception as e:
            logger.error(f"Error en estadísticas por especie: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/notificaciones')
    @require_login
    def get_notificaciones():
        """Retorna la lista de notificaciones activa para el usuario."""
        return jsonify({'notificaciones': _get_active_notifications(g.user.id)})


    @app.route('/api/notificaciones/descartar', methods=['POST'])
    @require_login
    def descartar_notificacion():
        """Registra una notificación como 'vista' para el usuario actual."""
        try:
            data = request.json
            referencia = data.get('referencia')
            if not referencia:
                return jsonify({'error': 'referencia requerida'}), 400
            
            # Verificar si ya está descartada
            existente = NotificacionDescartada.query.filter_by(usuario_id=g.user.id, referencia=referencia).first()
            if not existente:
                nueva = NotificacionDescartada(usuario_id=g.user.id, referencia=referencia)
                db.session.add(nueva)
                db.session.commit()
            
            return jsonify({'status': 'success'})
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error en descartar_notificacion: {e}")
            return jsonify({'error': str(e)}), 500


    @app.route('/api/graficos')
    def get_graficos():
        """Prepara datasets formateados para Chart.js con TODOS los registros individuales."""
        from models import Especie, Ganado, RegistroPeso
        
        especies_lista = ['Bovino', 'Ovino', 'Caprino', 'Porcino', 'Equino', 'Otro']
        colors = {'Bovino': '#ef4444', 'Ovino': '#f97316', 'Caprino': '#eab308', 'Porcino': '#22c55e', 'Equino': '#3b82f6', 'Otro': '#8b5cf6'}
        datasets = []
        
        for esp_nombre in especies_lista:
            esp_obj = Especie.query.filter_by(nombre=esp_nombre).first()
            if not esp_obj: continue
            
            animales = Ganado.query.filter_by(especie_id=esp_obj.id).all()
            ids = [a.id for a in animales]
            if not ids: continue

            # Mostrar solo peso actual (ignorar historial)
            data_points = []
            for a in animales:
                data_points.append({
                    "x": a.edad,
                    "y": a.peso,
                    "animal_id": a.id
                })
            
            if data_points:
                datasets.append({
                    "label": esp_nombre,
                    "data": sorted(data_points, key=lambda x: x['x']),
                    "borderColor": colors.get(esp_nombre, '#ccc'),
                    "backgroundColor": colors.get(esp_nombre, '#ccc'),
                    "showLine": True, # Conectar puntos
                    "fill": False,
                    "tension": 0.4,
                    "pointRadius": 6,
                    "pointHoverRadius": 8
                })
        
        return jsonify({"datasets": datasets})

    @app.route('/api/graficos/especie/<string:especie>')
    def get_graficos_especie(especie):
        """Prepara dataset para una sola especie para Chart.js con todos los puntos"""
        from models import Especie, RegistroPeso, Ganado
        
        esp_obj = Especie.query.filter_by(nombre=especie).first()
        if not esp_obj:
            return jsonify({"data": []})
        
        animales = Ganado.query.filter_by(especie_id=esp_obj.id).all()
        ids = [a.id for a in animales]
        if not ids:
            return jsonify({"data": []})

        data_points = []
        for a in animales:
            data_points.append({
                "x": a.edad, 
                "y": a.peso, 
                "animal_id": a.id
            })
            
        return jsonify({"data": sorted(data_points, key=lambda x: x['x'])})

    # ==========================================================================
    # API ENDPOINTS: SALUD Y VETERINARIA
    # ==========================================================================

    @app.route('/api/salud/<int:animal_id>')
    @require_permission('gestionar_salud')
    def get_salud_animal(animal_id):
        """
        Retorna el expediente médico completo de un animal.
        Consolida: Historial, Vacunas, Protocolos futuros y Expediente detallado.
        """
        try:
            from models import Ganado, HistorialMedico, Vacuna, ExpedienteMedico, ProtocoloSalud, PlanMaternidad
            animal = Ganado.query.get(animal_id)
            if not animal:
                return jsonify({'error': 'Animal not found'}), 404
            
            historial = HistorialMedico.query.filter_by(animal_id=animal_id).order_by(HistorialMedico.fecha.desc()).all()
            vacunas = Vacuna.query.filter_by(especie_id=animal.especie_id).all()
            protocolos = ProtocoloSalud.query.filter_by(animal_id=animal_id).order_by(ProtocoloSalud.fecha_programada.asc()).all()
            expediente = ExpedienteMedico.query.filter_by(animal_id=animal_id).first()
            
            # Integración con módulo maternidad
            plan_maternidad = PlanMaternidad.query.filter_by(animal_id=animal_id, activo=True).first()
            
            return jsonify({
                'historial': [h.to_dict() for h in historial],
                'protocolos': [p.to_dict() for p in protocolos],
                'vacunas_disponibles': [v.to_dict() for v in vacunas],
                'animal': animal.to_dict(),
                'expediente': expediente.to_dict() if expediente else None,
                'plan_maternidad': plan_maternidad.to_dict() if plan_maternidad else None
            })
        except Exception as e:
            logger.error(f"Error en get_salud_animal: {str(e)}")
            return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

    @app.route('/api/salud/expediente', methods=['POST'])
    @require_permission('gestionar_salud')
    def save_expediente():
        """Crea o actualiza el expediente médico base de un animal (datos estáticos)."""
        from models import ExpedienteMedico, db
        try:
            data = request.json
            animal_id = data.get('animal_id')
            if not animal_id:
                return jsonify({'error': 'animal_id es requerido'}), 400
            
            # Buscar si ya existe un expediente para este animal
            expediente = ExpedienteMedico.query.filter_by(animal_id=animal_id).first()
            if not expediente:
                expediente = ExpedienteMedico(animal_id=animal_id)
                db.session.add(expediente)
            
            # Actualizar campos
            expediente.tipo_sangre = data.get('tipo_sangre', '')
            expediente.alergias = data.get('alergias', 'Ninguna')
            expediente.condiciones_cronicas = data.get('condiciones_cronicas', 'Ninguna')
            expediente.antecedentes_geneticos = data.get('antecedentes_geneticos', 'Sin registro')
            expediente.notas_generales = data.get('notas_generales', '')
            expediente.ultima_actualizacion = datetime.utcnow()
            
            db.session.commit()
            return jsonify({'status': 'success'})
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error en save_expediente: {str(e)}")
            return jsonify({'error': str(e)}), 400

    @app.route('/api/salud/agregar', methods=['POST'])
    @require_permission('gestionar_salud')
    def agregar_historial_salud():
        """Registra una nueva intervención médica o evento de salud."""
        try:
            from models import HistorialMedico, TipoEventoMedico, Usuario, db
            from datetime import datetime

            data = request.json
            animal_id = data.get('animal_id')
            if not animal_id:
                return jsonify({'error': 'animal_id es requerido'}), 400
            
            # Parsing flexible de fecha
            fecha = datetime.now()
            if data.get('fecha'):
                try:
                    if 'T' in data['fecha']:
                        fecha_str = data['fecha'].replace('T', ' ')[:16]
                        fecha = datetime.strptime(fecha_str, '%Y-%m-%d %H:%M')
                    else:
                        fecha = datetime.strptime(data['fecha'], '%Y-%m-%d')
                except ValueError: 
                    pass
            
            tipo_nombre = data.get('tipo', 'Consulta')
            tipo_obj = TipoEventoMedico.query.filter_by(nombre=tipo_nombre).first()
            if not tipo_obj:
                tipo_obj = TipoEventoMedico(nombre=tipo_nombre)
                db.session.add(tipo_obj)
                db.session.flush()

            desc = data.get('descripcion', 'Sin descripción')
            med = data.get('medicamento', '')
            ds = data.get('dosis', '')
            
            # En lugar de concatenar en la descripción, usamos los campos si existen o los agregamos
            if med: desc += f" [Med: {med}]"
            if ds: desc += f" [Dosis: {ds}]"

            vet_id = None
            if data.get('veterinario'):
                vet = Usuario.query.filter(Usuario.nombre_completo.contains(data['veterinario'])).first()
                if vet: vet_id = vet.id

            nuevo = HistorialMedico(
                animal_id=animal_id,
                tipo_id=tipo_obj.id,
                descripcion=desc,
                fecha=fecha,
                veterinario_id=vet_id
            )
            db.session.add(nuevo)
            db.session.commit()
            return jsonify({'status': 'success', 'id': nuevo.id})

        except ImportError as e:
            logger.error(f"Error IMPORT en agregar_historial_salud: {str(e)}")
            return jsonify({'error': f'Error interno (Import): {str(e)}'}), 500
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error en agregar_historial_salud: {str(e)}")
            return jsonify({'error': str(e)}), 400

    @app.route('/api/salud/historial/<int:id>', methods=['PUT'])
    @require_permission('gestionar_salud')
    def actualizar_historial_salud(id):
        """Actualiza un registro de historial médico existente."""
        try:
            from models import HistorialMedico, TipoEventoMedico, Usuario, db
            from datetime import datetime

            data = request.json
            historial = HistorialMedico.query.get(id)
            if not historial:
                return jsonify({'error': 'Registro no encontrado'}), 404
            
            if data.get('tipo'):
                tipo_obj = TipoEventoMedico.query.filter_by(nombre=data['tipo']).first()
                if not tipo_obj:
                    tipo_obj = TipoEventoMedico(nombre=data['tipo'])
                    db.session.add(tipo_obj)
                    db.session.flush()
                historial.tipo_id = tipo_obj.id
            
            if 'descripcion' in data:
                desc = data['descripcion']
                if data.get('medicamento'): desc += f" [Med: {data['medicamento']}]"
                if data.get('dosis'): desc += f" [Dosis: {data['dosis']}]"
                historial.descripcion = desc
            
            if data.get('fecha'):
                try:
                    if 'T' in data['fecha']:
                        fecha_str = data['fecha'].replace('T', ' ')[:16]
                        historial.fecha = datetime.strptime(fecha_str, '%Y-%m-%d %H:%M')
                    else:
                        historial.fecha = datetime.strptime(data['fecha'], '%Y-%m-%d')
                except ValueError: pass
            
            if data.get('veterinario'):
                vet = Usuario.query.filter(Usuario.nombre_completo.contains(data['veterinario'])).first()
                if vet: historial.veterinario_id = vet.id

            db.session.commit()
            return jsonify({'status': 'success'})

        except ImportError as e:
            logger.error(f"Error IMPORT en actualizar_historial_salud: {str(e)}")
            return jsonify({'error': f'Error interno (Import): {str(e)}'}), 500
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400

    @app.route('/api/protocolos/agregar', methods=['POST'])
    @require_permission('gestionar_salud')
    def agregar_protocolo():
        """Registra un nuevo protocolo de salud programado."""
        from models import ProtocoloSalud, TipoProtocolo, EstadoProtocolo, Usuario
        data = request.json
        try:
            animal_id = data.get('animal_id')
            
            tipo_obj = TipoProtocolo.query.filter_by(nombre=data['tipo']).first()
            if not tipo_obj:
                tipo_obj = TipoProtocolo(nombre=data['tipo'])
                db.session.add(tipo_obj)
                db.session.flush()
            
            estado_obj = EstadoProtocolo.query.filter_by(nombre=data.get('estado', 'Pendiente')).first()
            if not estado_obj:
                estado_obj = EstadoProtocolo.query.filter_by(nombre='Pendiente').first()
            
            fecha_prog = datetime.now()
            if data.get('fecha_programada'):
                try:
                    fecha_prog = datetime.strptime(data['fecha_programada'], '%Y-%m-%d')
                except ValueError: 
                    try:
                        fecha_prog = datetime.strptime(data['fecha_programada'][:10], '%Y-%m-%d')
                    except: pass

            vet_id = None
            if data.get('veterinario'):
                from services.auth_service import Usuario as UserSrv
                vet = UserSrv.query.filter(UserSrv.nombre_completo.contains(data['veterinario'])).first()
                if vet: vet_id = vet.id

            nuevo = ProtocoloSalud(
                animal_id=animal_id,
                tipo_protocolo_id=tipo_obj.id,
                descripcion=data['descripcion'],
                fecha_programada=fecha_prog,
                estado_id=estado_obj.id if estado_obj else 1,
                veterinario_id=vet_id,
                medicamento=data.get('medicamento'),
                dosis=data.get('dosis')
            )
            db.session.add(nuevo)
            db.session.commit()
            return jsonify({'status': 'success', 'id': nuevo.id})
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error en agregar_protocolo: {str(e)}")
            return jsonify({'error': str(e)}), 400

    @app.route('/api/protocolos/<int:id>', methods=['PUT', 'DELETE'])
    @require_permission('gestionar_salud')
    def gestionar_protocolo(id):
        """Actualiza o elimina un protocolo programado."""
        from models import ProtocoloSalud, TipoProtocolo, EstadoProtocolo, Usuario
        if request.method == 'DELETE':
            return eliminar_protocolo(id)
            
        data = request.json
        try:
            proto = ProtocoloSalud.query.get(id)
            if not proto:
                return jsonify({'error': 'Protocolo no encontrado'}), 404
            
            if data.get('tipo'):
                tipo_obj = TipoProtocolo.query.filter_by(nombre=data['tipo']).first()
                if not tipo_obj:
                    tipo_obj = TipoProtocolo(nombre=data['tipo'])
                    db.session.add(tipo_obj)
                    db.session.flush()
                proto.tipo_protocolo_id = tipo_obj.id
            
            if 'descripcion' in data: proto.descripcion = data['descripcion']
            if 'medicamento' in data: proto.medicamento = data['medicamento']
            if 'dosis' in data: proto.dosis = data['dosis']
            
            if data.get('fecha_programada'):
                try:
                    proto.fecha_programada = datetime.strptime(data['fecha_programada'], '%Y-%m-%d')
                except ValueError:
                    try:
                        proto.fecha_programada = datetime.strptime(data['fecha_programada'][:10], '%Y-%m-%d')
                    except: pass
            
            if data.get('estado'):
                est_obj = EstadoProtocolo.query.filter_by(nombre=data['estado']).first()
                if est_obj: proto.estado_id = est_obj.id
                
            if data.get('veterinario'):
                vet = Usuario.query.filter(Usuario.nombre_completo.contains(data['veterinario'])).first()
                if vet: proto.veterinario_id = vet.id

            db.session.commit()
            return jsonify({'status': 'success'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400


    @app.route('/api/salud/protocolo/completar/<int:id>', methods=['POST'])
    @require_permission('gestionar_salud')
    def completar_protocolo(id):
        """
        LÓGICA DE TRANSICIÓN DE ESTADO (PROTOCOLOS):
        Esta función maneja el ciclo de vida de un tratamiento médico o preventivo.
        
        Funcionamiento:
        1. Localiza el protocolo por ID.
        2. Transiciona el estado del protocolo a 'Realizado' (Update).
        3. Genera AUTOMÁTICAMENTE un registro en el Historial Médico del animal (Insert).
        4. Consolida la información (Medicamento, Dosis, Descripcion) en el registro histórico.
        
        Razonamiento: Evitar la duplicidad de entrada de datos. El usuario solo marca como 
        completado y el sistema asegura la trazabilidad en el expediente histórico permanente.
        """
        from models import ProtocoloSalud, HistorialMedico, EstadoProtocolo
        try:
            proto = ProtocoloSalud.query.get(id)
            if not proto:
                return jsonify({'error': 'Protocolo no encontrado'}), 404
            
            # 1. Cambiar estado a 'Realizado'
            estado_realizado = EstadoProtocolo.query.filter_by(nombre='Realizado').first()
            proto.estado_id = estado_realizado.id if estado_realizado else 2
            
            # 2. Mover a historial medico
            nuevo_historial = HistorialMedico(
                animal_id=proto.animal_id,
                tipo_id=proto.tipo_protocolo_id,
                descripcion=f"[PROTOCOLO COMPLETADO] {proto.descripcion}. Aplicado: {proto.medicamento or 'N/A'} - {proto.dosis or 'N/A'}",
                fecha=datetime.now(),
                veterinario_id=proto.veterinario_id
            )
            db.session.add(nuevo_historial)
            db.session.commit()
            return jsonify({'status': 'success'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400

    @app.route('/api/salud/protocolo/eliminar/<int:id>', methods=['DELETE'])
    @require_permission('gestionar_salud')
    def eliminar_protocolo(id):
        """Elimina un protocolo (lo marca como eliminado o lo borra)."""
        from models import ProtocoloSalud
        try:
            proto = ProtocoloSalud.query.get(id)
            if not proto:
                return jsonify({'error': 'Protocolo no encontrado'}), 404
            
            db.session.delete(proto)
            db.session.commit()
            return jsonify({'status': 'success'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    # ==========================================================================
    # API ENDPOINTS: INVENTARIO DE INSUMOS
    # ==========================================================================

    @app.route('/api/protocolos/hoy')
    def get_protocolos_hoy():
        """Retorna los protocolos programados para el día de hoy."""
        from models import ProtocoloSalud, Ganado
        from datetime import date
        hoy = date.today()
        prots = ProtocoloSalud.query.filter(
            db.func.date(ProtocoloSalud.fecha_programada) == hoy,
            ProtocoloSalud.estado_id != 2 # 2 es Realizado usualmente, ajustar segun DB
        ).all()
        
        res = []
        for p in prots:
            d = p.to_dict()
            animal = Ganado.query.get(p.animal_id)
            d['animal_raza'] = animal.cat_raza.nombre if animal and animal.cat_raza else 'N/A'
            res.append(d)
        return jsonify(res)

    @app.route('/api/inventario')
    @require_permission('gestionar_inventario')
    def get_inventario():
        """Lista todos los insumos y calcula estados de vencimiento."""
        from models import Insumo
        insumos = Insumo.query.all()
        res = []
        hoy = date.today()
        
        for i in insumos:
            d = i.to_dict()
            if i.fecha_vencimiento:
                dias_venc = (i.fecha_vencimiento - hoy).days
                if dias_venc < 0: d['estado_vencimiento'] = 'Vencido'
                elif dias_venc <= 30: d['estado_vencimiento'] = 'Por Vencer'
                else: d['estado_vencimiento'] = 'OK'
            else:
                d['estado_vencimiento'] = 'N/A'
            res.append(d)
        return jsonify(res)

    @app.route('/api/inventario', methods=['POST'])
    @require_permission('gestionar_inventario')
    def add_insumo():
        """Crea un nuevo ítem en el inventario."""
        from models import Insumo
        data = request.json
        try:
            vencimiento = None
            if data.get('fecha_vencimiento') and data['fecha_vencimiento'].strip() != '':
                vencimiento = datetime.strptime(data['fecha_vencimiento'], '%Y-%m-%d').date()

            from models import CategoriaInsumo, UnidadMedida
            cat_obj = CategoriaInsumo.query.filter_by(nombre=data['categoria']).first()
            if not cat_obj:
                cat_obj = CategoriaInsumo(nombre=data['categoria'])
                db.session.add(cat_obj)
                db.session.flush()
            
            uni_obj = UnidadMedida.query.filter_by(nombre=data['unidad']).first()
            if not uni_obj:
                uni_obj = UnidadMedida(nombre=data['unidad'])
                db.session.add(uni_obj)
                db.session.flush()

            nuevo = Insumo(
                nombre=data['nombre'],
                categoria_id=cat_obj.id,
                cantidad=float(data['cantidad']),
                unidad_id=uni_obj.id,
                stock_minimo=float(data.get('stock_minimo', 5)),
                fecha_vencimiento=vencimiento,
                ubicacion=data.get('ubicacion', ''),
                nota=data.get('nota', '')
            )
            db.session.add(nuevo)
            db.session.flush() # Para tener el ID

            # Registrar en Historial
            historial = HistorialInsumo(
                insumo_id=nuevo.id,
                tipo_movimiento='ALTA',
                cantidad_cambio=f"Stock Inicial: {nuevo.cantidad}",
                stock_nuevo=nuevo.cantidad,
                usuario=session.get('username', 'admin')
            )
            db.session.add(historial)

            db.session.commit()
            return jsonify({'status': 'success', 'id': nuevo.id})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400

    @app.route('/api/inventario/<int:id>', methods=['PUT'])
    @require_permission('gestionar_inventario')
    def update_insumo(id):
        """Actualiza un insumo o ajusta su stock."""
        from models import Insumo
        data = request.json
        try:
            insumo = Insumo.query.get(id)
            if not insumo:
                return jsonify({'error': 'Insumo no encontrado'}), 404
            
            # Ajuste de stock (incremento/decremento)
            if 'ajuste_stock' in data:
                insumo.cantidad += float(data['ajuste_stock'])
                if insumo.cantidad < 0: insumo.cantidad = 0
                if insumo.cantidad < 0: insumo.cantidad = 0
                
                # Registrar Historial Ajuste (ENTRADA o SALIDA)
                cantidad_ajuste = float(data['ajuste_stock'])
                tipo_mov = 'ENTRADA' if cantidad_ajuste > 0 else 'SALIDA'
                
                historial = HistorialInsumo(
                    insumo_id=insumo.id,
                    tipo_movimiento=tipo_mov,
                    cantidad_cambio=f"{'+' if cantidad_ajuste > 0 else ''}{cantidad_ajuste}",
                    stock_nuevo=insumo.cantidad,
                    usuario=session.get('username', 'admin')
                )
                db.session.add(historial)

                db.session.commit()
                return jsonify({'status': 'success', 'nuevo_stock': insumo.cantidad})
            
            # Actualización completa
            if 'nombre' in data: insumo.nombre = data['nombre']
            if 'cantidad' in data: insumo.cantidad = float(data['cantidad'])
            if 'stock_minimo' in data: insumo.stock_minimo = float(data['stock_minimo'])
            if 'fecha_vencimiento' in data:
                venc = data['fecha_vencimiento']
                insumo.fecha_vencimiento = datetime.strptime(venc, '%Y-%m-%d').date() if venc else None
            if 'ubicacion' in data: insumo.ubicacion = data['ubicacion']
            
            if 'ubicacion' in data: insumo.ubicacion = data['ubicacion']
            
            # Registrar Historial Edición
            cambios = []
            if 'nombre' in data: cambios.append('Nombre')
            if 'stock_minimo' in data: cambios.append('Stock Min')
            if 'cantidad' in data: cambios.append('Cantidad Manual')
            
            if cambios:
                historial = HistorialInsumo(
                    insumo_id=insumo.id,
                    tipo_movimiento='EDICION',
                    cantidad_cambio=f"Campos: {', '.join(cambios)}",
                    stock_nuevo=insumo.cantidad,
                    usuario=session.get('username', 'admin')
                )
                db.session.add(historial)
            
            db.session.commit()
            return jsonify({'status': 'success'})
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error en update_insumo: {str(e)}")
            return jsonify({'error': str(e)}), 400

    @app.route('/api/inventario/<int:id>', methods=['DELETE'])
    @require_permission('gestionar_inventario')
    def delete_insumo(id):
        """Elimina un insumo del inventario."""
        from models import Insumo
        try:
            insumo = Insumo.query.get(id)
            if not insumo:
                return jsonify({'error': 'Insumo no encontrado'}), 404
            if not insumo:
                return jsonify({'error': 'Insumo no encontrado'}), 404
            
            # Registrar Historial Eliminación (Nota: si se borra el insumo cascada se lleva el historial, idealmente soft delete, 
            # pero asumimos que queremos al menos intentar loguearlo o el historial queda con ID nulo si seteamos FK nullable, 
            # en este diseño simple no tenemos tabla separada de historial permanente independiente. 
            # Si el usuario quiere ver "quien borró", necesitariamos no borrar físicamente.)
            # Por ahora, solo borramos. Si se quiere auditoría de borrado, necesitamos soft-delete.
            # Asumiremos la limitación: "Cambios realizados" implica cosas vivas. Borrar = Desaparece.
            # O mejor, guardamos un log en HistorialCambios genérico? No, ErrorLog o similar?
            # Si borramos el insumo, el historial vinculado por FK cascade tambien muere.
            # Hack provisional: Loguear en ErrorLog como evento de sistema para que quede constancia.
            
            log = ErrorLog(
                mensaje=f"Insumo ELIMINADO: {insumo.nombre}", 
                zona="Inventario", 
                detalles=f"Stock final: {insumo.cantidad}. Usuario: {session.get('username', 'admin')}",
                usuario=session.get('username', 'admin')
            )
            db.session.add(log)
            
            db.session.delete(insumo)
            db.session.commit()
            return jsonify({'status': 'success'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    # ==========================================================================
    # API ENDPOINTS: ANÁLISIS AVANZADO Y GRAFOS
    # ==========================================================================



    @app.route('/api/circuitos/simular', methods=['POST'])
    @require_permission('ver_analisis')
    def simular_circuito_animal():
        """
        Simulación de lógica booleana aplicada a datos biológicos.
        Permite evaluar expresiones personalizadas (ej. "peso > 500 AND sexo == 'M'")
        sobre un animal específico.
        """
        try:
            data = request.json
            animal_id = data.get('animal_id')
            expresion = data.get('expresion')
            
            animal = obtener_animal(animal_id)
            if not animal: return jsonify({'error': 'Animal not found'}), 404
                
            # Variables de contexto para el motor de evaluación
            variables = {
                'id': animal['id'],
                'peso': animal['peso'],
                'edad': animal['edad'],
                'sexo': animal['sexo'],
                'especie': animal['especie'],
                'raza': animal['raza'],
                'estado': animal['estado'],
                'score_genetico': animal['score_genetico'],
                'salud_critica': animal['salud_critica'],
                'tiene_padre': bool(animal['padre_id']),
                'tiene_madre': bool(animal['madre_id'])
            }
            
            circuito = CircuitoLogico()
            circuito.establecer_variables(variables)
            
            if not expresion: # Modo automático (reglas predefinidas)
                evaluador = EvaluadorSaludAnimal(
                    animal['peso'], animal['edad'], animal['especie'], animal['estado'], animal['sexo']
                )
                resultados = evaluador.evaluar_salud()
                return jsonify({'modo': 'auto', 'animal': animal, 'evaluacion': resultados})
            else: # Modo manual (circuitos lógicos personalizados)
                resultado = circuito.evaluar_expresion(expresion)
                return jsonify({
                    'modo': 'manual', 
                    'animal': animal, 
                    'evaluacion': resultado, 
                    'variables_usadas': variables
                })
                
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    # ==========================================================================
    # MANEJO DE ERRORES GLOBAL
    # ==========================================================================

    @app.route('/api/log_error', methods=['POST'])
    def log_error():
        """Endpoint para capturar errores del cliente (JS) y guardarlos en DB."""
        data = request.json
        try:
            nuevo_log = ErrorLog(
                mensaje=data.get('mensaje', 'Error desconocido'),
                zona=data.get('zona', 'General'),
                detalles=data.get('detalles', ''),
                usuario=session.get('username', 'Anónimo')
            )
            db.session.add(nuevo_log)
            db.session.commit()
            return jsonify({'status': 'success', 'id': nuevo_log.id})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # ==========================================================================
    # API ENDPOINTS: AUDITORÍA Y REGISTROS
    # ==========================================================================

    @app.route('/api/auditoria/cambios')
    @require_permission('ver_logs')
    def get_auditoria_cambios():
        """Retorna el historial completo de cambios realizados en el sistema con filtrado dinámico."""
        tab = request.args.get('tab', 'poblacion')
        try:
            if tab == 'medicos':
                from models import HistorialMedico
                registros = HistorialMedico.query.order_by(HistorialMedico.fecha.desc()).all()
                return jsonify([r.to_dict() for r in registros])
            
            elif tab == 'insumos':
                from models import HistorialInsumo
                registros = HistorialInsumo.query.order_by(HistorialInsumo.fecha.desc()).all()
                return jsonify([r.to_dict() for r in registros])
            
            elif tab == 'nutricionales':
                from models import PlanNutricional
                registros = PlanNutricional.query.order_by(PlanNutricional.fecha_inicio.desc()).all()
                return jsonify([r.to_dict() for r in registros])
            
            else: # poblacion
                # Todo excepto cambios de peso
                registros = HistorialCambios.query.filter(HistorialCambios.campo != 'peso').order_by(HistorialCambios.fecha_cambio.desc()).all()
                return jsonify([r.to_dict() for r in registros])
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/auditoria/errores')
    @require_permission('ver_logs')
    def get_auditoria_errores():
        """Retorna el log de errores capturados en el sistema."""
        try:
            errores = ErrorLog.query.order_by(ErrorLog.fecha.desc()).all()
            return jsonify([e.to_dict() for e in errores])
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # ==========================================================================
    # API ENDPOINTS: GESTIÓN DE USUARIOS (ADMIN)
    # ==========================================================================

    @app.route('/api/auth/usuarios')
    @require_permission('gestionar_usuarios')
    def get_usuarios():
        """Lista todos los usuarios del sistema."""
        return jsonify(obtener_todos_usuarios())

    @app.route('/api/auth/usuarios', methods=['POST'])
    @require_permission('gestionar_usuarios')
    def api_crear_usuario():
        """Crea un nuevo usuario con preguntas de seguridad."""
        data = request.json
        
        # Extraer preguntas de seguridad si vienen en el request
        # Formato esperado: questions: [{pregunta: '...', respuesta: '...'}, ...]
        security_questions = []
        if 'questions' in data:
            for q_data in data['questions']:
                p = q_data.get('pregunta')
                r = q_data.get('respuesta')
                if p and r:
                    security_questions.append((p, r))
        
        usuario, msg = crear_usuario(
            username=data.get('username'),
            email=data.get('email'),
            password=data.get('password'),
            nombre_completo=data.get('nombre_completo'),
            rol=data.get('rol', 'operador'),
            security_questions=security_questions
        )
        if usuario:
            return jsonify({'status': 'success', 'message': msg})
        return jsonify({'status': 'fail', 'error': msg}), 400

    @app.route('/api/auth/usuarios/<int:id>', methods=['PUT'])
    @require_permission('gestionar_usuarios')
    def api_actualizar_usuario(id):
        """Actualiza datos de un usuario."""
        data = request.json
        usuario, msg = actualizar_usuario(id, **data)
        if usuario:
            return jsonify({'status': 'success', 'message': msg})
        return jsonify({'status': 'fail', 'error': msg}), 400
    @app.route('/api/auth/usuarios/<int:id>', methods=['DELETE'])
    @require_permission('gestionar_usuarios')
    def api_eliminar_usuario(id):
        """Desactiva un usuario (soft delete)."""
        try:
            usuario = Usuario.query.get(id)
            if not usuario:
                return jsonify({'status': 'fail', 'error': 'Usuario no encontrado'}), 404
            
            if usuario.username == 'admin':
                return jsonify({'status': 'fail', 'error': 'No se puede eliminar el usuario admin principal'}), 403
            
            usuario.activo = False
            db.session.commit()
            return jsonify({'status': 'success', 'message': 'Usuario desactivado'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'status': 'fail', 'error': str(e)}), 500

    @app.route('/api/auth/set_security_questions', methods=['POST'])
    @require_login
    def api_set_security_questions():
        """Establece múltiples preguntas de seguridad para el usuario actual."""
        data = request.json
        questions_raw = data.get('questions', [])
        
        # Convertir a formato de tuplas para el servicio
        questions_and_answers = []
        for q in questions_raw:
            questions_and_answers.append((q.get('pregunta'), q.get('respuesta')))
            
        if len(questions_and_answers) < 3:
            return jsonify({'status': 'fail', 'error': 'Se requieren al menos 3 preguntas de seguridad.'}), 400
            
        exito, msg = set_security_questions(session['user_id'], questions_and_answers)
        if exito:
            return jsonify({'status': 'success', 'message': msg})
        return jsonify({'status': 'fail', 'error': msg}), 400

    @app.route('/fix-db')
    def fix_db():
        """Ruta de utilidad para inicializar DB y datos de prueba."""
        try:
            db.create_all()
            if Ganado.query.count() == 0:
                from models import Especie, Raza, EstadoAnimal
                esp = Especie.query.filter_by(nombre='Bovino').first()
                if not esp:
                    esp = Especie(nombre='Bovino')
                    db.session.add(esp)
                    db.session.flush()
                
                raz = Raza.query.filter_by(nombre='Holstein', especie_id=esp.id).first()
                if not raz:
                    raz = Raza(nombre='Holstein', especie_id=esp.id)
                    db.session.add(raz)
                    db.session.flush()
                
                est = EstadoAnimal.query.filter_by(nombre='Saludable').first()
                if not est:
                    est = EstadoAnimal(nombre='Saludable')
                    db.session.add(est)
                    db.session.flush()

                sx = Sexo.query.filter_by(nombre='Hembra').first()
                if not sx:
                    sx = Sexo(nombre='Hembra')
                    db.session.add(sx)
                    db.session.flush()

                a = Ganado(
                    especie_id=esp.id, 
                    raza_id=raz.id, 
                    sexo_id=sx.id, 
                    fecha_nacimiento='2024-01-01', 
                    edad=24, 
                    peso=550.0, 
                    estado_id=est.id
                )
                db.session.add(a)
                db.session.commit()
                return "Base de datos inicializada y registro de prueba creado.<br><a href='/'>Volver al inicio</a>"
            return f"Base de datos OK. {Ganado.query.count()} registros existentes.<br><a href='/'>Volver al inicio</a>"
        except Exception as e:
            return f"Error: {str(e)}"

    return app

# Punto de entrada para ejecución directa (python app.py)
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)