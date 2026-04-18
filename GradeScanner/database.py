"""
GradeScanner - Database Configuration
Configuración de la base de datos SQLite o PostgreSQL (Supabase)
"""

import os
from flask_sqlalchemy import SQLAlchemy

# Instancia global de SQLAlchemy
db = SQLAlchemy()



def init_app(app):
    """Inicializa la base de datos con la aplicación Flask"""
    from config import get_config

    cfg = get_config()

    # Verificar que tenemos una URL de base de datos válida
    db_uri = cfg.SQLALCHEMY_DATABASE_URI

    if not db_uri or db_uri == 'sqlite:///':
        print(f"ERROR: No se ha configurado la base de datos! (URI detectada: '{db_uri}')")
        print(f"Entorno: {os.environ.get('FLASK_ENV', 'N/A')}")
        print(f"DATABASE_URL presente en ENV: {bool(os.environ.get('DATABASE_URL'))}")
        print("Para Supabase: asegúrese de que DATABASE_URL esté definida en Render.")
        raise ValueError(f"DATABASE_URL no configurada correctamente (URI: '{db_uri}')")

    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = getattr(cfg, 'SQLALCHEMY_ECHO', False)

    # Propagar opciones del pool de conexiones si existen (PostgreSQL en producción)
    engine_options = getattr(cfg, 'SQLALCHEMY_ENGINE_OPTIONS', None)
    if engine_options:
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = engine_options

    db.init_app(app)

    with app.app_context():
        # create_all() NO borra tablas existentes, solo las crea si no existen
        db.create_all()

        # Verificar que las tablas existen
        from sqlalchemy import inspect as sa_inspect
        inspector = sa_inspect(db.engine)
        tables = inspector.get_table_names()

        driver = db_uri.split(':')[0]
        safe_uri = db_uri.split('@')[0] + '@***' if '@' in db_uri else db_uri

        print(f"✓ Base de datos [{driver}] conectada → {safe_uri}")
        if tables:
            print(f"  Tablas encontradas: {', '.join(tables)}")
        else:
            print("  ⚠ No hay tablas aún — se acaban de crear.")

    return db
