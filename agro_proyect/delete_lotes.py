from app import app
from models import db, Lote

with app.app_context():
    try:
        num_deleted = Lote.query.delete()
        db.session.commit()
        print(f"Éxito: Se eliminaron {num_deleted} lotes y se limpiaron las referencias en el ganado.")
    except Exception as e:
        db.session.rollback()
        print(f"Error al eliminar lotes: {e}")
