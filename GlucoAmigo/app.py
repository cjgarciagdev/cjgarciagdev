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
        # SQLAlchemy 2.0 prefers the "postgresql://" scheme; many providers
        # (Neon, Render managed DB) still hand out "postgres://".
        if db_uri.startswith('postgres://'):
            db_uri = db_uri.replace('postgres://', 'postgresql://', 1)
    else:
        # default to a local file when no DATABASE_URL is present
        os.makedirs(os.path.join(basedir, 'instance'), exist_ok=True)
        db_uri = 'sqlite:///' + os.path.join(basedir, 'instance', 'glucoamigo.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    # Configuración de sesión persistente (tipo Facebook)
    # Session lifetime: 30 días para sesiones permanentes
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
    
    # Configurar cookies según el entorno
    is_production = os.getenv('FLASK_ENV') == 'production' or os.getenv('RENDER') == 'true'
    app.config['SESSION_COOKIE_SECURE'] = is_production  # Solo HTTPS en producción
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Protegido contra XSS
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
    
    # Configurar Flask-Login para usar sesiones permanentes
    login_manager.remember_cookie_duration = timedelta(days=30)

    @login_manager.user_loader
    def load_user(user_id):
        return Usuario.query.get(int(user_id))

    db.init_app(app)
    init_db(app)
    configure_app(app)
    register_blueprints(app)
    
    # === SocketIO para alertas en tiempo real ===
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
                'especialista_default_especialidad': ConfiguracionSistema.obtener('especialista_default_especialidad', 'Endocrinólogo Pediátrico'),
                'hospital_nombre': ConfiguracionSistema.obtener('hospital_nombre', 'Hospital Dr. Jesús García Coello')
            }
        )

    from flask_login import login_required

    @app.route('/')
    def index():
        if not current_user.is_authenticated:
            return redirect(url_for('auth.login'))
        
        if current_user.rol in ['especialista', 'admin', 'nutricionista', 'auditor', 'gerente']:
            return render_template('portal_especialista.html')
        elif current_user.rol == 'padre':
            return render_template('selector.html')
        else:
            return render_template('portal_representante.html')
            
    @app.route('/representante')
    @login_required
    def portal_representante():
        if current_user.rol != 'padre':
            return redirect(url_for('index'))
        return render_template('portal_representante.html')

    @app.route('/nino')
    @login_required
    def portal_nino():
        # El perfil de niño es para usuarios padre que quieren acceder a la zona de juegos
        # Cualquier usuario padre puede acceder
        return render_template('portal_nino.html')

    # API para guardar configuración del sistema
    @app.route('/api/configuracionSistema', methods=['POST'])
    @login_required
    def guardar_configuracion_sistema():
        if current_user.rol not in ['especialista', 'admin', 'gerente']:
            return jsonify({'status': 'error', 'message': 'No tienes permiso para modificar la configuración'}), 403
        
        from models_extended import ConfiguracionSistema
        data = request.get_json()
        
        if data.get('telefono_emergencia'):
            ConfiguracionSistema.establecer('telefono_emergencia', data['telefono_emergencia'])
        if data.get('hospital_nombre'):
            ConfiguracionSistema.establecer('hospital_nombre', data['hospital_nombre'])
        if data.get('especialista_default'):
            ConfiguracionSistema.establecer('especialista_default', data['especialista_default'])
        if data.get('especialista_telefono'):
            ConfiguracionSistema.establecer('especialista_default_telefono', data['especialista_telefono'])
        if data.get('especialista_default_especialidad'):
            ConfiguracionSistema.establecer('especialista_default_especialidad', data['especialista_default_especialidad'])
        
        return jsonify({'status': 'success', 'message': 'Configuración guardada correctamente'})

    return app, socketio
