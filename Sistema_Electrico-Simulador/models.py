from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# Instancia global de SQLAlchemy para la gestión del ORM
db = SQLAlchemy()

class Usuario(UserMixin, db.Model):
    """ Modelo para los usuarios del sistema (Administradores y Técnicos) """
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    nombre = db.Column(db.String(100))
    # Roles: 'admin' (control total) o 'tecnico' (solo reparaciones)
    rol = db.Column(db.String(20), default='tecnico')
    disponible = db.Column(db.Boolean, default=True)

    # Métodos para manejo seguro de contraseñas mediante hashing
    def set_password(self, password): 
        self.password_hash = generate_password_hash(password)
    def check_password(self, password): 
        return check_password_hash(self.password_hash, password)

class TipoEquipo(db.Model):
    """ 
    TABLA MAESTRA: Clasifica los nodos de la red.
    Ejemplos: plant (generación), substation (subestación), transformer (distribución), house (consumo).
    """
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True)
    descripcion = db.Column(db.String(200))

class Sector(db.Model):
    """ 
    TABLA MAESTRA: Organización geográfica de los componentes de la red.
    Permite filtrar equipos por zona de la ciudad.
    """
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True) # Ejem: Norte, Centro, Sur...
    ciudad = db.Column(db.String(100))

class CatalogoCable(db.Model):
    """ 
    TABLA MAESTRA: Datos técnicos de los conductores eléctricos (aristas).
    Contiene información de resistencia para cálculos de caída de tensión.
    """
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True) # Ejem: Línea 400kV, ACSR 795...
    material = db.Column(db.String(50)) # Aluminio, Cobre, Arvidal...
    resistencia_ohmios_km = db.Column(db.Float)

class TipoFalla(db.Model):
    """ 
    TABLA MAESTRA: Clasificación de las posibles incidencias en la red.
    Ayuda a priorizar según severidad.
    """
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True) # bajo_voltaje, apagon_total...
    nombre_visual = db.Column(db.String(100))
    severidad = db.Column(db.String(20)) # baja, media, alta, critica

class Transformador(db.Model):
    """ 
    MODELO PRINCIPAL: Representa un Nodo en el grafo eléctrico.
    Puede ser una planta, una subestación o un transformador doméstico.
    """
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    codigo = db.Column(db.String(50), unique=True) # Ejem: GEN-1, TRX-A1...
    ubicacion = db.Column(db.String(200)) # Dirección física o coordenadas
    lat = db.Column(db.Float) # Latitud para el mapa
    lng = db.Column(db.Float) # Longitud para el mapa
    estado = db.Column(db.String(20), default='normal') # normal, falla, falla_cascada
    voltaje = db.Column(db.Float, default=13.8) # Voltaje nominal de operación
    carga_actual = db.Column(db.Float, default=0.0) # Demanda actual en MW
    carga_maxima = db.Column(db.Float, default=10.0) # Capacidad nominal del equipo
    fecha_mantenimiento = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Claves foráneas para normalización (Relaciones)
    tipo_id = db.Column(db.Integer, db.ForeignKey('tipo_equipo.id'))
    sector_id = db.Column(db.Integer, db.ForeignKey('sector.id'))
    
    # Enlaces lógicos para facilitar consultas
    tipo_rel = db.relationship('TipoEquipo', backref='equipos')
    sector_rel = db.relationship('Sector', backref='equipos')

class Conexion(db.Model):
    """ 
    MODELO DE ENLACE: Representa una Arista en el grafo eléctrico.
    Modela el cable físico que une dos transformadores o nodos.
    """
    id = db.Column(db.Integer, primary_key=True)
    nodo_a_id = db.Column(db.Integer, db.ForeignKey('transformador.id')) # Nodo Origen
    nodo_b_id = db.Column(db.Integer, db.ForeignKey('transformador.id')) # Nodo Destino
    estado = db.Column(db.String(20), default='normal')
    voltaje = db.Column(db.Float, default=13.8)
    longitud_km = db.Column(db.Float, default=1.0)
    
    # Especificación técnica del cable del catálogo
    tipo_cable_id = db.Column(db.Integer, db.ForeignKey('catalogo_cable.id'))
    tipo_cable_rel = db.relationship('CatalogoCable', backref='conexiones')

class Falla(db.Model):
    """ 
    REGISTRO DE INCIDENCIAS: Almacena cada falla detectada en la red.
    """
    id = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.Text)
    # Una falla puede ser en un nodo O en una arista (cable)
    nodo_id = db.Column(db.Integer, db.ForeignKey('transformador.id'), nullable=True)
    arista_id = db.Column(db.Integer, db.ForeignKey('conexion.id'), nullable=True)
    fecha_deteccion = db.Column(db.DateTime, default=datetime.utcnow)
    estado = db.Column(db.String(20), default='activa') # activa, resuelta
    localizacion = db.Column(db.String(200))
    
    # Categoría de la falla
    tipo_falla_id = db.Column(db.Integer, db.ForeignKey('tipo_falla.id'))
    
    tipo_rel = db.relationship('TipoFalla', backref='fallas')
    nodo = db.relationship('Transformador', backref='fallas')
    arista = db.relationship('Conexion', backref='fallas')

class ReporteReparacion(db.Model):
    """ 
    HISTORIAL TÉCNICO: Documenta la resolución de una falla.
    Cruza la información de la falla con el técnico que la resolvió.
    """
    id = db.Column(db.Integer, primary_key=True)
    falla_id = db.Column(db.Integer, db.ForeignKey('falla.id'), nullable=False)
    tecnico_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    diagnostico = db.Column(db.Text) # Qué se encontró al llegar
    materiales_usados = db.Column(db.Text) # Repuestos, cables, etc.
    tiempo_trabajo = db.Column(db.Float, default=0.0) # Horas trabajadas
    fecha_reparacion = db.Column(db.DateTime, default=datetime.utcnow)
    
    falla = db.relationship('Falla', backref='reporte')
    tecnico = db.relationship('Usuario', backref='reportes_hechos')
