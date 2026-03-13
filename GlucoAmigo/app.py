"""
GlucoAmigo - Aplicación Principal
================================
Sistema de Monitoreo Glucémico Pediátrico

DESARROLLADOR: Cristian J Garcia
CI: 32.170.910
Email: cjgarciag.dev@gmail.com

Este módulo contiene la configuración principal de la aplicación Flask,
incluyendo la inicialización de la base de datos, autenticación,
WebSockets y rutas principales.
"""
import os
from flask import Flask, render_template, redirect, url_for, session, jsonify, request
from flask_login import LoginManager, current_user
from datetime import timedelta
from models import db, Usuario, init_db
from services.app_setup import register_blueprints, configure_app

# optionally load .env for local development
from dotenv import load_dotenv
load_dotenv()

login_manager = LoginManager()
socketio = None  # Se inicializará con SocketIO

def create_app():
    global socketio
    app = Flask(__name__)
    basedir = os.path.abspath(os.path.dirname(__file__))

    # secrets and database configuration are pulled from environment variables
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'glucoamigo-ultra-secret-2025')

    # allow switching between SQLite for local dev and Postgres (Render/Neon) in production
    db_uri = os.getenv('DATABASE_URL')
    if db_uri:
        # Limpieza agresiva de la URL para evitar errores de copia/pega en Render
        db_uri = db_uri.strip().replace(' ', '')
        
        # Corregir doble arroba si existe
        while '@@' in db_uri:
            db_uri = db_uri.replace('@@', '@')

        # Corregir prefijo postgres:// -> postgresql:// (Requerido por SQLAlchemy 2.0+)
        if db_uri.startswith('postgres://'):
            db_uri = db_uri.replace('postgres://', 'postgresql://', 1)
    else:
        # default to a local file when no DATABASE_URL is present
        os.makedirs(os.path.join(basedir, 'instance'), exist_ok=True)
        db_uri = 'sqlite:///' + os.path.join(basedir, 'instance', 'glucoamigo.db')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Detectar URL directa de Supabase (IPv6) y advertir al usuario.
    # Render free tier sólo soporta IPv4. Se debe usar el Connection Pooler URL de Supabase.
    if db_uri and 'db.' in db_uri and '.supabase.co' in db_uri:
        print("[WARNING] ¡Estás usando la URL DIRECTA de Supabase (db.*.supabase.co)!")
        print("[WARNING] Render FREE TIER no soporta IPv6. Usa el Connection Pooler URL de Supabase.")
        print("[WARNING] El host correcto tiene formato: aws-1-us-east-2.pooler.supabase.com")

    # Para conexiones PostgreSQL con Supabase Pooler (puerto 6543 = Transaction mode)
    # pgbouncer en modo Transaction NO soporta prepared statements (threshold 0/None).
    # Render FREE TIER y Supabase requieren SSL explícito para evitar cierres inesperados.
    if db_uri and db_uri.startswith('postgresql'):
        is_pooler = ':6543/' in db_uri
        
        # Engine options para estabilidad en entornos cloud
        # pool_pre_ping: verifica conexión antes de cada uso
        # pool_recycle: recicla conexiones cada 5 min para evitar timeouts de red
        engine_options = {
            'pool_pre_ping': True,
            'pool_recycle': 300,
            'connect_args': {
                'connect_timeout': 10,
                'sslmode': 'require'
            },
        }
        
        # En SQLAlchemy 2.0+ (usado por Flask-SQLAlchemy 3.x), podemos controlar el caché de sentencias
        # para evitar problemas con PgBouncer en modo 'Transaction'
        if is_pooler:
            # Deshabilitar el caché de sentencias a nivel de SQLAlchemy
            engine_options['query_cache_size'] = 0
            print("[INFO] Supabase Pooler detectado (puerto 6543). Estabilidad ajustada.")
        
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = engine_options

    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    # Configuración de sesión persistente (tipo Facebook)
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
    
    # Configurar cookies según el entorno
    is_production = os.getenv('FLASK_ENV') == 'production' or os.getenv('RENDER') == 'true'
    app.config['SESSION_COOKIE_SECURE'] = is_production
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    
    login_manager.remember_cookie_duration = timedelta(days=30)

    @login_manager.user_loader
    def load_user(user_id):
        return Usuario.query.get(int(user_id))

    db.init_app(app)
    try:
        init_db(app)
    except Exception as e:
        print(f"[CRITICAL] init_db falló completamente: {e}")
        print("[HINT] Verifica DATABASE_URL en Render. Si usas Supabase, usa el Connection Pooler URL (IPv4).")
    configure_app(app)
    register_blueprints(app)
    
    from services.alerta_tiempo_real import configurar_alertas_en_app
    socketio = configurar_alertas_en_app(app)

    @app.context_processor
    def inject_user():
        from models_extended import ConfiguracionSistema
        return dict(
            current_user=current_user,
            config_sistema={
                'telefono_emergencia': ConfiguracionSistema.obtener('telefono_emergencia', '0414-1234567'),
                'especialista_default': ConfiguracionSistema.obtener('especialista_default', 'Dr. Jesús García Coello'),
                'especialista_telefono': ConfiguracionSistema.obtener('especialista_default_telefono', '0414-1234567'),
                'especialista_default_telefono': ConfiguracionSistema.obtener('especialista_default_telefono', '0414-1234567'),
                'especialista_default_especialidad': ConfiguracionSistema.obtener('especialista_default_especialidad', 'Endocrinólogo Pediátrico'),
                'hospital_nombre': ConfiguracionSistema.obtener('hospital_nombre', 'Hospital Dr. Jesús García Coello')
            }
        )

    from flask_login import login_required

    @app.route('/')
    def index():
        if not current_user.is_authenticated:
            return redirect(url_for('auth.login'))
        
        if current_user.rol in ['especialista', 'maestro']:
            return render_template('portal_especialista.html')
        elif current_user.rol == 'padre':
            return render_template('selector.html')
        else:
            return render_template('portal_representante.html')
            
    @app.route('/representante')
    @login_required
    def portal_representante():
        if current_user.rol not in ['padre', 'maestro']:
            return redirect(url_for('index'))
        return render_template('portal_representante.html')

    @app.route('/nino')
    @login_required
    def portal_nino():
        return render_template('portal_nino.html')

    @app.route('/api/configuracionSistema', methods=['POST'])
    @login_required
    def guardar_configuracion_sistema():
        if current_user.rol not in ['maestro', 'especialista']:
            return jsonify({'status': 'error', 'message': 'No tienes permiso'}), 403
        
        from models_extended import ConfiguracionSistema
        from models import AuditLog
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'No se recibieron datos'}), 400

        # Mapeo de campos permitidos y sus nombres en la base de datos
        campos_mapeo = {
            'telefono_emergencia': 'telefono_emergencia',
            'hospital_nombre': 'hospital_nombre',
            'especialista_default': 'especialista_default',
            'especialista_telefono': 'especialista_default_telefono',
            'especialista_default_telefono': 'especialista_default_telefono', # Alias para compatibilidad
            'especialista_default_especialidad': 'especialista_default_especialidad',
            'especialista_especialidad': 'especialista_default_especialidad' # Alias para compatibilidad
        }

        any_changed = False
        for key_json, key_db in campos_mapeo.items():
            if key_json in data:
                nuevo_valor = str(data[key_json]).strip()
                valor_ant = ConfiguracionSistema.obtener(key_db)
                if nuevo_valor != str(valor_ant):
                    ConfiguracionSistema.establecer(key_db, nuevo_valor)
                    # Auditoría de cambio de configuración
                    db.session.add(AuditLog(
                        usuario_id=current_user.id,
                        entidad_tipo='ConfiguracionSistema',
                        entidad_id=0, # Global
                        accion='UPDATE',
                        campo=key_db,
                        valor_ant=str(valor_ant),
                        valor_nue=nuevo_valor
                    ))
                    any_changed = True
        
        if any_changed:
            db.session.commit()

        return jsonify({'status': 'success', 'message': 'Configuración guardada correctamente'})

    return app, socketio
