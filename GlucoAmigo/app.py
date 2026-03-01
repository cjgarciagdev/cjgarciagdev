import os
from flask import Flask, render_template, redirect, url_for
from flask_login import LoginManager, current_user
from models import db, Usuario, init_db
from services.app_setup import register_blueprints, configure_app

# optionally load .env for local development
from dotenv import load_dotenv
load_dotenv()

login_manager = LoginManager()

def create_app():
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

    @login_manager.user_loader
    def load_user(user_id):
        return Usuario.query.get(int(user_id))

    db.init_app(app)
    init_db(app)
    configure_app(app)
    register_blueprints(app)

    @app.context_processor
    def inject_user():
        return dict(current_user=current_user)

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
        if current_user.rol != 'padre':
            return redirect(url_for('index'))
        return render_template('portal_nino.html')

    return app
