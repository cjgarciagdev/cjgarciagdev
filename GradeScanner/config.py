"""
GradeScanner - Configuration
Manejo de configuración para diferentes entornos (local y Supabase)
"""

import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()


def _build_db_uri():
    """
    Construye la URI de base de datos leyendo desde variables de entorno.
    Si no existe la variable, utiliza la URL de Supabase por defecto.
    NO hay fallback a SQLite para evitar pérdida de datos en Render.
    """
    # URL de Supabase explícita como "fallback" en caso de que Render no la inyecte
    default_supabase_url = "postgresql://postgres.uegiyminqnszquekuizs:passwordercopys12@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

    # DATABASE_URL tiene la mayor prioridad
    database_url = os.environ.get('DATABASE_URL', '')
    if not database_url:
        database_url = os.environ.get('SUPABASE_DB_URL', '')
        
    if not database_url:
        database_url = default_supabase_url
        print("✓ Usando Supabase por defecto (no se detectó variable de entorno en Render)")
    else:
        print("✓ Conectando a Supabase (URL detectada en entorno)")

    # Limpieza agresiva de la URL para evitar errores
    database_url = database_url.strip().replace(' ', '')
    
    # Corregir doble arroba si existe (error común al copiar)
    while '@@' in database_url:
        database_url = database_url.replace('@@', '@')

    # Requerimiento de SQLAlchemy 2.0+: usar postgresql://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
        
    return database_url


class Config:
    """Configuración base — siempre usa PostgreSQL/Supabase"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'gradescanner-secret-key-2024')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    OCR_API_KEY = os.environ.get('OCR_API_KEY', 'helloworld')

    # Determinar entorno
    ENV = os.environ.get('FLASK_ENV', 'development')

    # Ya no hay SQLite, siempre es Supabase
    USE_SUPABASE = True

    # URI resuelta una sola vez
    SQLALCHEMY_DATABASE_URI = _build_db_uri()

    # Debug: mostrar driver configurado
    _scheme = SQLALCHEMY_DATABASE_URI.split(':')[0]
    print(f"[DEBUG] DB driver activo: {_scheme}")

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

    # Opciones de conexión para PostgreSQL/Supabase
    # (Adaptado desde GLUCOAMIGO para el Pooler puerto 6543)
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'connect_args': {
            'connect_timeout': 10,
            'sslmode': 'require'
        }
    }
    
    # Si estamos usando el puerto 6543 (PgBouncer en modo Transaction)
    if ':6543/' in SQLALCHEMY_DATABASE_URI:
        # Deshabilitar el caché de sentencias para evitar problemas con Prepared Statements
        SQLALCHEMY_ENGINE_OPTIONS['query_cache_size'] = 0
        print("[INFO] Supabase Pooler detectado (puerto 6543). Estabilidad de PgBouncer ajustada.")


class DevelopmentConfig(Config):
    """Configuración de desarrollo"""
    DEBUG = True
    ENV = 'development'
    SQLALCHEMY_ECHO = True  # Útil para depurar queries en local


class ProductionConfig(Config):
    """Configuración de producción (Render/Supabase)"""
    DEBUG = False
    ENV = 'production'
    SQLALCHEMY_ECHO = False


class TestingConfig(Config):
    """Configuración de pruebas"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


# Mapa de configuraciones
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Obtiene la clase de configuración según el entorno"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])

