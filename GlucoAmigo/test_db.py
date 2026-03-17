from app import create_app
from models_extended import ConfiguracionSistema
app, _ = create_app()
with app.app_context():
    from models import db
    db.create_all() # ensure memory db if sqlite locally
    val = ConfiguracionSistema.obtener("especialista_default_telefono")
    print("El valor es:", val)
