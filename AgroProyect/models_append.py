
# Modelo: Preguntas de Seguridad (Múltiples)
# Permite que un usuario tenga múltiples preguntas de seguridad configuradas.
class PreguntaSeguridad(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    pregunta = db.Column(db.String(255), nullable=False)
    respuesta_hash = db.Column(db.String(255), nullable=False)

    # Relación configurada en Usuario si es necesario, o uso backref aquí
    # usuario = db.relationship('Usuario', backref=db.backref('preguntas_seguridad', lazy=True))

    def set_respuesta(self, respuesta):
        """Encripta y guarda la respuesta"""
        respuesta_normalizada = respuesta.lower().strip()
        self.respuesta_hash = generate_password_hash(respuesta_normalizada, method='pbkdf2:sha256')
    
    def check_respuesta(self, respuesta):
        """Verifica la respuesta"""
        respuesta_normalizada = respuesta.lower().strip()
        return check_password_hash(self.respuesta_hash, respuesta_normalizada)
