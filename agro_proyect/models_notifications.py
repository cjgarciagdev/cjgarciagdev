from models import db
from datetime import datetime

# Modelo: Notificaciones Descartadas
# Almacena hashes o IDs de notificaciones no-persistentes que el usuario ha descartado.
class NotificacionDescartada(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Identificador único del evento (ej: 'insumo_10_stock', 'animal_5_obs')
    referencia = db.Column(db.String(100), nullable=False) 
    fecha_descarte = db.Column(db.DateTime, default=datetime.utcnow)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))

    def to_dict(self):
        return {
            'id': self.id,
            'referencia': self.referencia,
            'fecha': self.fecha_descarte.isoformat()
        }
