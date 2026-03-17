from flask import current_app

def register_blueprints(app):
    # Import blueprints lazily to avoid circular imports at module import time
    from routes.auth_routes   import auth_bp
    from routes.heroe_routes  import heroe_bp
    from routes.dosis_routes  import dosis_bp
    from routes.psico_routes  import psico_bp
    from routes.panel_routes  import panel_bp
    from routes.comida_routes import comida_bp
    from routes.growth_routes import growth_bp
    from routes.recommendations_routes import recom_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(heroe_bp)
    app.register_blueprint(dosis_bp)
    app.register_blueprint(psico_bp)
    app.register_blueprint(panel_bp)
    app.register_blueprint(comida_bp)
    app.register_blueprint(growth_bp)
    app.register_blueprint(recom_bp)

def configure_app(app):
    # Placeholder for future app-wide configuration
    app.config.setdefault('JSON_SORT_KEYS', False)
