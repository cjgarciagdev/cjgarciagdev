"""
GlucoAmigo - Modelos Extendidos
================================
Extensiones del modelo de datos para nuevas funcionalidades:
- Sitios de inyección
- Registro de ejercicio
- Enfermedades concurrentes
- Chat con especialista
- Backup automático
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date

# Importar db desde models.py para evitar múltiples instancias de SQLAlchemy
# Esto asegura que todas las tablas (models y models_extended) estén en la misma DB
from models import db

# ═══════════════════════════════════════════════════════════════
# SITIOS DE INYECCIÓN (Rotación)
# ═══════════════════════════════════════════════════════════════

class SitioInyeccion(db.Model):
    """Registro de sitios de inyección para evitar lipodistrofia"""
    __tablename__ = 'sitio_inyeccion'
    
    id = db.Column(db.Integer, primary_key=True)
    heroe_id = db.Column(db.Integer, db.ForeignKey('heroe.id'), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    sitio = db.Column(db.String(30))  # abdomen, brazo, muslo, gluteo
    lado = db.Column(db.String(10))    # izq, der
    zona = db.Column(db.String(20))   # superior, inferior, lateral
    insulina = db.Column(db.String(30))  # rapida, lenta
    unidades = db.Column(db.Float)
    observaciones = db.Column(db.String(200))
    
    heroe = db.relationship('Heroe', backref='sitios_inyeccion')
    
    def to_dict(self):
        return {
            'id': self.id, 'heroe_id': self.heroe_id,
            'fecha': self.fecha.strftime('%d/%m/%Y %H:%M'),
            'sitio': self.sitio, 'lado': self.lado,
            'zona': self.zona, 'insulina': self.insulina,
            'unidades': self.unidades,
            'sitio_display': self._get_display_name()
        }
    
    def _get_display_name(self):
        sitios = {
            'abdomen': 'Abdomen',
            'brazo': 'Brazo',
            'muslo': 'Muslo',
            'gluteo': 'Glúteo'
        }
        return f"{sitios.get(self.sitio, self.sitio)} {self.lado or ''} {self.zona or ''}".strip()


# ═══════════════════════════════════════════════════════════════
# REGISTRO DE EJERCICIO
# ═══════════════════════════════════════════════════════════════

class RegistroEjercicio(db.Model):
    """Registro de actividad física y su impacto en glucosa"""
    __tablename__ = 'registro_ejercicio'
    
    id = db.Column(db.Integer, primary_key=True)
    heroe_id = db.Column(db.Integer, db.ForeignKey('heroe.id'), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    tipo_ejercicio = db.Column(db.String(50))  # correr, nadar, futbol, bicicleta
    duracion_min = db.Column(db.Integer)  # minutos
    intensidad = db.Column(db.String(20))  # baja, media, alta
    glucemia_antes = db.Column(db.Integer)
    glucemia_despues = db.Column(db.Integer)
    observaciones = db.Column(db.String(200))
    impacto_glucosa = db.Column(db.String(20))  # bajo, estable, alto
    
    heroe = db.relationship('Heroe', backref='ejercicios')
    
    TIPOS_EJERCICIO = [
        ('futbol', 'Fútbol'),
        ('natacion', 'Natación'),
        ('correr', 'Correr/Jogging'),
        ('bicicleta', 'Bicicleta'),
        ('caminata', 'Caminata'),
        ('gimnasio', 'Gimnasio'),
        ('baile', 'Baile'),
        ('otros', 'Otros')
    ]
    
    def to_dict(self):
        return {
            'id': self.id, 'heroe_id': self.heroe_id,
            'fecha': self.fecha.strftime('%d/%m/%Y %H:%M'),
            'tipo_ejercicio': self.tipo_ejercicio,
            'duracion_min': self.duracion_min,
            'intensidad': self.intensidad,
            'glucemia_antes': self.glucemia_antes,
            'glucemia_despues': self.glucemia_despues,
            'impacto': self.impacto_glucosa,
            'variacion_glucosa': self._calcular_variacion()
        }
    
    def _calcular_variacion(self):
        if self.glucemia_antes and self.glucemia_despues:
            return self.glucemia_despues - self.glucemia_antes
        return 0


# ═══════════════════════════════════════════════════════════════
# ENFERMEDADES CONCURRENTES
# ═══════════════════════════════════════════════════════════════

class EnfermedadConcurrente(db.Model):
    """Registro de enfermedades que afectan la glucosa"""
    __tablename__ = 'enfermedad_concurrente'
    
    id = db.Column(db.Integer, primary_key=True)
    heroe_id = db.Column(db.Integer, db.ForeignKey('heroe.id'), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    fecha_inicio = db.Column(db.Date)
    fecha_fin = db.Column(db.Date)
    activa = db.Column(db.Boolean, default=True)
    sintomas = db.Column(db.Text)
    tratamiento = db.Column(db.String(200))
    notas = db.Column(db.Text)
    
    heroe = db.relationship('Heroe', backref='enfermedades')
    
    ENFERMEDADES_COMUNES = [
        ('gripe', 'Gripe/Resfriado'),
        ('infección', 'Infección'),
        ('gastroenteritis', 'Gastroenteritis'),
        ('fiebre', 'Fiebre'),
        ('estrés', 'Estrés'),
        ('menstruación', 'Menstruación'),
        ('otros', 'Otros')
    ]
    
    def to_dict(self):
        return {
            'id': self.id, 'heroe_id': self.heroe_id,
            'nombre': self.nombre,
            'fecha_inicio': self.fecha_inicio.strftime('%d/%m/%Y') if self.fecha_inicio else None,
            'fecha_fin': self.fecha_fin.strftime('%d/%m/%Y') if self.fecha_fin else None,
            'activa': self.activa, 'sintomas': self.sintomas,
            'tratamiento': self.tratamiento, 'notas': self.notas
        }


# ═══════════════════════════════════════════════════════════════
# CHAT CON ESPECIALISTA
# ═══════════════════════════════════════════════════════════════

class MensajeChat(db.Model):
    """Sistema de mensajería entre representantes y especialistas"""
    __tablename__ = 'mensaje_chat'
    
    id = db.Column(db.Integer, primary_key=True)
    heroe_id = db.Column(db.Integer, db.ForeignKey('heroe.id'), nullable=False)
    remitente_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    destinatario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    mensaje = db.Column(db.Text, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    leido = db.Column(db.Boolean, default=False)
    tipo = db.Column(db.String(20), default='texto')  # texto, sistema
    
    remitente = db.relationship('Usuario', foreign_keys=[remitente_id])
    destinatario = db.relationship('Usuario', foreign_keys=[destinatario_id])
    heroe = db.relationship('Heroe', backref='mensajes')
    
    def to_dict(self):
        return {
            'id': self.id, 'heroe_id': self.heroe_id,
            'remitente_id': self.remitente_id,
            'remitente_nombre': self.remitente.nombre_completo if self.remitente else 'Usuario',
            'remitente_rol': self.remitente.rol if self.remitente else '',
            'mensaje': self.mensaje,
            'fecha': self.fecha.strftime('%d/%m/%Y %H:%M'),
            'fecha_iso': self.fecha.isoformat(),
            'leido': self.leido, 'tipo': self.tipo
        }


# ═══════════════════════════════════════════════════════════════
# BACKUP AUTOMÁTICO
# ═══════════════════════════════════════════════════════════════

class BackupRegistro(db.Model):
    """Registro de backups automáticos realizados"""
    __tablename__ = 'backup_registro'
    
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    tipo = db.Column(db.String(20))  # automatico, manual
    estado = db.Column(db.String(20))  # success, failed, in_progress
    tamano_bytes = db.Column(db.Integer)
    ubicacion = db.Column(db.String(200))  # cloud, local
    notas = db.Column(db.String(200))
    
    def to_dict(self):
        return {
            'id': self.id,
            'fecha': self.fecha.strftime('%d/%m/%Y %H:%M'),
            'tipo': self.tipo,
            'estado': self.estado,
            'tamano': self._format_size(),
            'ubicacion': self.ubicacion
        }
    
    def _format_size(self):
        if not self.tamano_bytes:
            return 'N/A'
        for unit in ['B', 'KB', 'MB', 'GB']:
            if self.tamano_bytes < 1024:
                return f"{self.tamano_bytes:.1f} {unit}"
            self.tamano_bytes /= 1024
        return f"{self.tamano_bytes:.1f} TB"


# ═══════════════════════════════════════════════════════════════
# UTILIDADES PARA MODELOS
# ═══════════════════════════════════════════════════════════════

def obtener_ultimo_sitio(heroe_id):
    """Obtiene el último sitio de inyección usado"""
    ultimo = SitioInyeccion.query.filter_by(heroe_id=heroe_id).order_by(
        SitioInyeccion.fecha.desc()
    ).first()
    return ultimo.to_dict() if ultimo else None


def sugerir_sitio(heroe_id):
    """Sugiere el siguiente sitio de inyección según rotación"""
    ultimo = obtener_ultimo_sitio(heroe_id)
    
    # Secuencia de rotación: abdomen -> brazo -> muslo -> glúteo
    secuencia = ['abdomen', 'brazo', 'muslo', 'gluteo']
    
    if ultimo and ultimo.get('sitio') in secuencia:
        idx = secuencia.index(ultimo['sitio'])
        siguiente = secuencia[(idx + 1) % len(secuencia)]
    else:
        siguiente = 'abdomen'
    
    return {
        'sugerido': siguiente,
        'mensaje': f'Para prevenir lipodistrofia, usa el {siguiente}',
        'sitio_anterior': ultimo.get('sitio') if ultimo else None
    }


def calcular_impacto_ejercicio(glucemia_antes, glucemia_despues):
    """Calcula el impacto del ejercicio en la glucosa"""
    variacion = glucemia_despues - glucemia_antes
    
    if variacion < -50:
        return 'muy_bajo'
    elif variacion < -20:
        return 'bajo'
    elif variacion <= 20:
        return 'estable'
    elif variacion <= 50:
        return 'alto'
    else:
        return 'muy_alto'


def iniciar_backup():
    """Inicia un proceso de backup (placeholder para implementación real)"""
    import os
    from flask import current_app
    
    backup = BackupRegistro(
        tipo='automatico',
        estado='in_progress',
        ubicacion='cloud'
    )
    db.session.add(backup)
    db.session.commit()
    
    try:
        # Aquí iría la lógica real de backup
        # Por ahora solo registramos el intento
        backup.estado = 'success'
        backup.notas = 'Backup simulado completado'
        db.session.commit()
        return {'status': 'success', 'backup_id': backup.id}
    except Exception as e:
        backup.estado = 'failed'
        backup.notas = f'Error: {str(e)}'
        db.session.commit()
        return {'status': 'failed', 'error': str(e)}


# ═══════════════════════════════════════════════════════════════
# CONFIGURACIÓN DEL SISTEMA (Reemplaza datos hardcoded)
# ═══════════════════════════════════════════════════════════════

class ConfiguracionSistema(db.Model):
    """Configuración global del sistema - datos que antes estaban hardcoded"""
    __tablename__ = 'configuracion_sistema'
    
    id = db.Column(db.Integer, primary_key=True)
    clave = db.Column(db.String(50), unique=True, nullable=False)
    valor = db.Column(db.Text)
    descripcion = db.Column(db.String(200))
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Claves de configuración predefinidas
    CLAVES = {
        'hospital_nombre': 'Hospital Dr. Jesús García Coello',
        'hospital_direccion': 'Caracas, Venezuela',
        'especialista_default': 'Dr. Jesús García Coello',
        'especialista_default_telefono': '0414-1234567',
        'especialista_default_especialidad': 'Endocrinólogo Pediátrico',
        'telefono_emergencia': '0414-1234567',
        'email_soporte': 'soporte@glucoamigo.gob.ve',
    }
    
    @staticmethod
    def obtener(clave, valor_default=None):
        """Obtiene un valor de configuración"""
        config = ConfiguracionSistema.query.filter_by(clave=clave).first()
        if config:
            return config.valor
        # Si no existe, crear con valor por defecto
        if clave in ConfiguracionSistema.CLAVES:
            valor = ConfiguracionSistema.CLAVES[clave]
            nueva_config = ConfiguracionSistema(clave=clave, valor=valor)
            db.session.add(nueva_config)
            db.session.commit()
            return valor
        return valor_default
    
    @staticmethod
    def establecer(clave, valor):
        """Establece un valor de configuración"""
        config = ConfiguracionSistema.query.filter_by(clave=clave).first()
        if config:
            config.valor = valor
        else:
            config = ConfiguracionSistema(clave=clave, valor=valor)
            db.session.add(config)
        db.session.commit()


def obtener_configuracion_sistema():
    """Obtiene todas las configuraciones del sistema como diccionario"""
    configs = ConfiguracionSistema.query.all()
    result = {}
    for c in configs:
        result[c.clave] = c.valor
    # Agregar valores por defecto si no existen
    for clave, valor in ConfiguracionSistema.CLAVES.items():
        if clave not in result:
            result[clave] = valor
    return result


def inicializar_configuracion_default():
    """Inicializa la configuración por defecto del sistema"""
    for clave, valor in ConfiguracionSistema.CLAVES.items():
        if not ConfiguracionSistema.query.filter_by(clave=clave).first():
            config = ConfiguracionSistema(clave=clave, valor=valor)
            db.session.add(config)
    db.session.commit()
