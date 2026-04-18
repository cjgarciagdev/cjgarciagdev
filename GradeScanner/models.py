"""
GradeScanner - Data Models
Modelos simplificados para el sistema de registro y verificacion de examenes
"""

from datetime import datetime
from database import db

class Seccion(db.Model):
    """Modelo de Sección (Asignatura + Grado + Letra)"""
    __tablename__ = 'secciones'
    
    id = db.Column(db.Integer, primary_key=True)
    asignatura = db.Column(db.String(100), nullable=False) # ej: Matemáticas
    grado = db.Column(db.String(50), nullable=False)       # ej: 1er Año
    letra = db.Column(db.String(10), nullable=False)       # ej: A, B, U
    lapso = db.Column(db.String(20))                       # ej: 1er Lapso
    profesor = db.Column(db.String(100))
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    examenes = db.relationship('Examen', backref='seccion', lazy='dynamic')
    plantillas = db.relationship('Plantilla', backref='seccion', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'asignatura': self.asignatura,
            'grado': self.grado,
            'letra': self.letra,
            'lapso': self.lapso,
            'profesor': self.profesor,
            'nombre_completo': f"{self.grado} {self.letra} - {self.asignatura}",
            'activo': self.activo
        }

class Plantilla(db.Model):
    """Modelo de Plantilla de Examen"""
    __tablename__ = 'plantillas'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    seccion_id = db.Column(db.Integer, db.ForeignKey('secciones.id'))
    
    # Tipo de examen: 'multiple_choice' (opcion multiple)
    tipo_examen = db.Column(db.String(20), default='multiple_choice')  # multiple_choice
    
    # Para opción múltiple: respuestas correctas en formato JSON
    # [{"pregunta": 1, "respuesta": "A", "puntos": 2}, ...]
    respuestas_correctas = db.Column(db.Text)
    
    puntaje_total = db.Column(db.Float, default=10)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    activa = db.Column(db.Boolean, default=True)
    
    # Relaciones
    examenes = db.relationship('Examen', backref='plantilla', lazy='dynamic')
    preguntas = db.relationship('Pregunta', backref='plantilla', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'seccion_id': self.seccion_id,
            'tipo_examen': self.tipo_examen,
            'respuestas_correctas': self.respuestas_correctas,
            'puntaje_total': self.puntaje_total,
            'activa': self.activa,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'seccion': self.seccion.to_dict() if self.seccion else None
        }

class Examen(db.Model):
    """Modelo de Examen/Evaluación escaneado"""
    __tablename__ = 'examenes'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)  # identificador/titulo del examen
    nombre_estudiante = db.Column(db.String(150))         # nombre del alumno que respondio
    descripcion = db.Column(db.Text)
    seccion_id = db.Column(db.Integer, db.ForeignKey('secciones.id'))
    plantilla_id = db.Column(db.Integer, db.ForeignKey('plantillas.id'))
    
    # Datos del escaneo
    imagen_path = db.Column(db.String(500))
    texto_ocr = db.Column(db.Text)
    confianza_ocr = db.Column(db.Float)
    
    # Estado y resultados
    estado = db.Column(db.String(20), default='pendiente')  # pendiente, procesado, revisado
    nota_final = db.Column(db.Float)
    observaciones = db.Column(db.Text)
    
    # timestamps
    fecha_escaneo = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_revision = db.Column(db.DateTime)
    
    # Relaciones
    preguntas = db.relationship('Pregunta', backref='examen', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'nombre_estudiante': self.nombre_estudiante,
            'descripcion': self.descripcion,
            'seccion_id': self.seccion_id,
            'plantilla_id': self.plantilla_id,
            'imagen_path': self.imagen_path,
            'texto_ocr': self.texto_ocr,
            'confianza_ocr': self.confianza_ocr,
            'estado': self.estado,
            'nota_final': self.nota_final,
            'observaciones': self.observaciones,
            'fecha_escaneo': self.fecha_escaneo.isoformat() if self.fecha_escaneo else None,
            'fecha_revision': self.fecha_revision.isoformat() if self.fecha_revision else None,
            'plantilla': self.plantilla.to_dict() if self.plantilla else None,
            'seccion': self.seccion.to_dict() if self.seccion else None
        }

class Pregunta(db.Model):
    """Modelo de Pregunta individual en un examen"""
    __tablename__ = 'preguntas'
    
    id = db.Column(db.Integer, primary_key=True)
    examen_id = db.Column(db.Integer, db.ForeignKey('examenes.id'), nullable=False)
    plantilla_id = db.Column(db.Integer, db.ForeignKey('plantillas.id'))
    
    numero = db.Column(db.Integer, nullable=False)
    
    # Tipo de pregunta: 'multiple_choice'
    tipo = db.Column(db.String(20), default='multiple_choice')
    
    # Para opción múltiple
    respuesta_estudiante = db.Column(db.String(10))  # Respuesta del estudiante (A, B, C, D)
    respuesta_correcta = db.Column(db.String(10))    # Respuesta correcta
    
    # Puntuación
    puntos = db.Column(db.Float, default=0)
    puntos_obtenidos = db.Column(db.Float, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'examen_id': self.examen_id,
            'plantilla_id': self.plantilla_id,
            'numero': self.numero,
            'tipo': self.tipo,
            'respuesta_estudiante': self.respuesta_estudiante,
            'respuesta_correcta': self.respuesta_correcta,
            'puntos': self.puntos,
            'puntos_obtenidos': self.puntos_obtenidos
        }

class Configuracion(db.Model):
    """Modelo de Configuración del Sistema"""
    __tablename__ = 'configuracion'
    
    id = db.Column(db.Integer, primary_key=True)
    clave = db.Column(db.String(50), unique=True, nullable=False)
    valor = db.Column(db.Text)
    descripcion = db.Column(db.String(200))
    
    @staticmethod
    def get_value(clave, default=None):
        config = Configuracion.query.filter_by(clave=clave).first()
        return config.valor if config else default
    
    @staticmethod
    def set_value(clave, valor, descripcion=None):
        config = Configuracion.query.filter_by(clave=clave).first()
        if config:
            config.valor = valor
            if descripcion:
                config.descripcion = descripcion
        else:
            config = Configuracion(clave=clave, valor=valor, descripcion=descripcion)
            db.session.add(config)
        db.session.commit()

