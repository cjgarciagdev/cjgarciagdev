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


# ═══════════════════════════════════════════════════════════════════════════════
# CLASIFICACIÓN DE NIVELES DE GLUCOSA (Según ADA - American Diabetes Association)
# ═══════════════════════════════════════════════════════════════════════════════

class ClasificacionGlucosa:
    """
    Clasificación de niveles de glucosa según estándares ADA.
    
    Referencia:
    - Glucosa en Ayunas: Sin haber comido por 8 horas
    - Glucosa Postprandial: 2 horas después del primer bocado
    - Glucosa Aleatoria: Cualquier momento del día
    
    Kategorien:
    - Normal: Sin evidencia de diabetes o prediabetes
    - Prediabetes: Riesgo aumentado de diabetes tipo 2
    - Diabetes: requiere confirmación adicional para diagnóstico
    """
    
    # ═══════════════════════════════════════════════════════════════════════════
    # RANGOS DE GLUCOSA (mg/dL) - Según ADA 2024
    # ═══════════════════════════════════════════════════════════════════════════
    
    # Glucosa en Ayunas (Fasting Glucose)
    AYUNAS_NORMAL_MIN = 70
    AYUNAS_NORMAL_MAX = 99
    AYUNAS_PREDIABETES_MIN = 100
    AYUNAS_PREDIABETES_MAX = 125
    AYUNAS_DIABETES_MIN = 126
    
    # Glucosa Postprandial (2 horas después de comer)
    POSTPRANDIAL_NORMAL_MAX = 139
    POSTPRANDIAL_PREDIABETES_MIN = 140
    POSTPRANDIAL_PREDIABETES_MAX = 199
    POSTPRANDIAL_DIABETES_MIN = 200
    
    # Glucosa Aleatoria / Casual
    ALEATORIA_DIABETES_MIN = 200
    
    # Glucosa para diagnóstico (Prueba de tolerancia oral a la glucosa - PTOG)
    PTOG_2H_NORMAL_MAX = 139
    PTOG_2H_PREDIABETES_MIN = 140
    PTOG_2H_PREDIABETES_MAX = 199
    PTOG_2H_DIABETES_MIN = 200
    
    # Hemoglobina Glicosilada (HbA1c)
    HBA1C_NORMAL_MAX = 5.6
    HBA1C_PREDIABETES_MIN = 5.7
    HBA1C_PREDIABETES_MAX = 6.4
    HBA1C_DIABETES_MIN = 6.5
    
    # Rangos objetivo terapéuticos (pediátrico - pueden variar según edad)
    OBJETIVO_MIN = 70
    OBJETIVO_MAX = 180
    OBJETIVO_PREPRANDIAL_MIN = 80
    OBJETIVO_PREPRANDIAL_MAX = 130
    OBJETIVO_POSTPRANDIAL_MAX = 180
    
    # Alertas clínicas
    ALERTA_HIPOGLUCEMIA = 70
    ALERTA_HIPERGLUCEMIA_SEVERA = 250
    EMERGENCIA_HIPO = 54
    EMERGENCIA_HIPER = 400
    
    # ═══════════════════════════════════════════════════════════════════════════
    # CLASIFICACIÓN PRINCIPAL
    # ═══════════════════════════════════════════════════════════════════════════
    
    @staticmethod
    def clasificar_ayunas(glucemia):
        """
        Clasifica la glucosa en ayunas (8 horas sin comer).
        
        Args:
            glucemia: Valor de glucosa en mg/dL
            
        Returns:
            dict con: categoria, nivel, color, icono, mensaje, recomendaciones
        """
        if glucemia < ClasificacionGlucosa.AYUNAS_NORMAL_MIN:
            return ClasificacionGlucosa._respuesta_hipoglucemia(glucemia)
        elif glucemia <= ClasificacionGlucosa.AYUNAS_NORMAL_MAX:
            return {
                'categoria': 'normal',
                'nivel': 'normal',
                'titulo': '🟢 Normal',
                'color': 'green',
                'color_hex': '#22c55e',
                'icono': 'fa-check-circle',
                'rango': f'{ClasificacionGlucosa.AYUNAS_NORMAL_MIN}-{ClasificacionGlucosa.AYUNAS_NORMAL_MAX} mg/dL',
                'mensaje': 'Tu nivel de glucosa en ayunas está dentro del rango normal.',
                'recomendaciones': [
                    'Continúa con tus hábitos saludables',
                    'Mantén una alimentación equilibrada',
                    'Realiza actividad física regularmente'
                ]
            }
        elif glucemia <= ClasificacionGlucosa.AYUNAS_PREDIABETES_MAX:
            return {
                'categoria': 'prediabetes',
                'nivel': 'advertencia',
                'titulo': '🟡 Prediabetes',
                'color': 'yellow',
                'color_hex': '#eab308',
                'icono': 'fa-exclamation-triangle',
                'rango': f'{ClasificacionGlucosa.AYUNAS_PREDIABETES_MIN}-{ClasificacionGlucosa.AYUNAS_PREDIABETES_MAX} mg/dL',
                'mensaje': 'Tu glucosa en ayunas indica prediabetes.',
                'recomendaciones': [
                    'Consulta a tu especialista para evaluación',
                    'Reduce el consumo de carbohidratos refinados',
                    'Aumenta la actividad física (30 min/día)',
                    'Mantén un peso saludable',
                    'Reduce el estrés'
                ]
            }
        else:  # >= 126
            return {
                'categoria': 'diabetes',
                'nivel': 'alerta',
                'titulo': '🔴 Diabetes',
                'color': 'red',
                'color_hex': '#ef4444',
                'icono': 'fa-exclamation-circle',
                'rango': f'≥{ClasificacionGlucosa.AYUNAS_DIABETES_MIN} mg/dL',
                'mensaje': 'Tu glucosa en ayunas indica diabetes. Se requiere confirmación con otra prueba.',
                'recomendaciones': [
                    '⚠️ Consulta a tu especialista INMEDIATAMENTE',
                    'No te automediques',
                    'Realiza prueba de HbA1c para confirmar',
                    'Considera prueba de tolerancia oral a la glucosa (PTOG)',
                    'Monitorea tus niveles frecuentemente'
                ]
            }
    
    @staticmethod
    def clasificar_postprandial(glucemia):
        """
        Clasifica la glucosa postprandial (2 horas después de comer).
        
        Args:
            glucemia: Valor de glucosa en mg/dL (2 horas postprandial)
            
        Returns:
            dict con clasificación y recomendaciones
        """
        if glucemia < ClasificacionGlucosa.AYUNAS_NORMAL_MIN:
            return ClasificacionGlucosa._respuesta_hipoglucemia(glucemia)
        elif glucemia <= ClasificacionGlucosa.POSTPRANDIAL_NORMAL_MAX:
            return {
                'categoria': 'normal',
                'nivel': 'normal',
                'titulo': '🟢 Normal',
                'color': 'green',
                'color_hex': '#22c55e',
                'icono': 'fa-check-circle',
                'rango': f'<{ClasificacionGlucosa.POSTPRANDIAL_NORMAL_MAX + 1} mg/dL',
                'mensaje': 'Tu glucosa postprandial está bien controlada.',
                'recomendaciones': [
                    'Excelente control glucémico',
                    'Continúa con tu plan de alimentación',
                    'Mantén las porciones recomendadas'
                ]
            }
        elif glucemia <= ClasificacionGlucosa.POSTPRANDIAL_PREDIABETES_MAX:
            return {
                'categoria': 'prediabetes',
                'nivel': 'advertencia',
                'titulo': '🟡 Prediabetes',
                'color': 'yellow',
                'color_hex': '#eab308',
                'icono': 'fa-exclamation-triangle',
                'rango': f'{ClasificacionGlucosa.POSTPRANDIAL_PREDIABETES_MIN}-{ClasificacionGlucosa.POSTPRANDIAL_PREDIABETES_MAX} mg/dL',
                'mensaje': 'Tu glucosa postprandial indica tolerancia alterada a la glucosa.',
                'recomendaciones': [
                    'Consulta a tu especialista',
                    'Reduce los carbohidratos en las comidas',
                    'Evita comer solo carbohidratos',
                    'Camina 10-15 minutos después de comer',
                    'Distribuye las comidas en porciones más pequeñas'
                ]
            }
        else:  # >= 200
            return {
                'categoria': 'diabetes',
                'nivel': 'alerta',
                'titulo': '🔴 Diabetes',
                'color': 'red',
                'color_hex': '#ef4444',
                'icono': 'fa-exclamation-circle',
                'rango': f'≥{ClasificacionGlucosa.POSTPRANDIAL_DIABETES_MIN} mg/dL',
                'mensaje': 'Tu glucosa postprandial indica diabetes descontrolada.',
                'recomendaciones': [
                    '⚠️ Consulta a tu especialista INMEDIATAMENTE',
                    'Verifica si necesitas dosis de corrección',
                    'Revisa cuerpos cetónicos si es necesario',
                    'Aumenta hidratación con agua',
                    'Monitorea más frecuentemente'
                ]
            }
    
    @staticmethod
    def clasificar_aleatoria(glucemia):
        """
        Clasifica la glucosa en cualquier momento del día.
        Útil para mediciones sin contexto de comida.
        """
        if glucemia < ClasificacionGlucosa.AYUNAS_NORMAL_MIN:
            return ClasificacionGlucosa._respuesta_hipoglucemia(glucemia)
        elif glucemia <= ClasificacionGlucosa.OBJETIVO_POSTPRANDIAL_MAX:
            return {
                'categoria': 'normal',
                'nivel': 'normal',
                'titulo': '🟢 En rango',
                'color': 'green',
                'color_hex': '#22c55e',
                'icono': 'fa-check-circle',
                'rango': f'{ClasificacionGlucosa.AYUNAS_NORMAL_MIN}-{ClasificacionGlucosa.OBJETIVO_POSTPRANDIAL_MAX} mg/dL',
                'mensaje': 'Tu nivel de glucosa está dentro del rango objetivo.',
                'recomendaciones': ['Continúa con tu control habitual']
            }
        elif glucemia < ClasificacionGlucosa.ALERTA_HIPERGLUCEMIA_SEVERA:
            return {
                'categoria': 'elevado',
                'nivel': 'advertencia',
                'titulo': '🟠 Elevado',
                'color': 'orange',
                'color_hex': '#f97316',
                'icono': 'fa-arrow-up',
                'rango': f'{ClasificacionGlucosa.OBJETIVO_POSTPRANDIAL_MAX + 1}-{ClasificacionGlucosa.ALERTA_HIPERGLUCEMIA_SEVERA - 1} mg/dL',
                'mensaje': 'Tu glucosa está elevada. Considera acción si es persistente.',
                'recomendaciones': [
                    'Verifica si es hora de insulina correccional',
                    'Aumenta hidratación',
                    'Revisa si comiste carbohidratos hace poco'
                ]
            }
        else:
            return {
                'categoria': 'hiperglucemia_severa',
                'nivel': 'emergencia',
                'titulo': '🔴 Hiperglucemia Severa',
                'color': 'red',
                'color_hex': '#dc2626',
                'icono': 'fa-triangle-exclamation',
                'rango': f'≥{ClasificacionGlucosa.ALERTA_HIPERGLUCEMIA_SEVERA} mg/dL',
                'mensaje': '⚠️ ¡ALERTA! Glucosa muy alta.',
                'recomendaciones': [
                    '⚠️ Consulta a tu especialista o ve a emergencias',
                    'Verifica cuerpos cetónicos',
                    'Considera insulina correccional si está prescrita',
                    'No ignores esta lectura'
                ]
            }
    
    @staticmethod
    def _respuesta_hipoglucemia(glucemia):
        """Respuesta para niveles de hipoglucemia"""
        if glucemia <= ClasificacionGlucosa.EMERGENCIA_HIPO:
            return {
                'categoria': 'hipoglucemia_severa',
                'nivel': 'emergencia',
                'titulo': '🚨 HIPOGLUCEMIA SEVERA',
                'color': 'purple',
                'color_hex': '#9333ea',
                'icono': 'fa-skull-crossbones',
                'rango': f'≤{ClasificacionGlucosa.EMERGENCIA_HIPO} mg/dL',
                'mensaje': '⚠️ ¡PELIGRO! Glucosa peligrosamente baja.',
                'recomendaciones': [
                    '🚨 TRATA INMEDIATAMENTE CON 15-20g DE CARBOHIDRATOS RÁPIDOS',
                    'Jugo, caramelos, miel o glucosa oral',
                    'Llama a emergencias si no mejora en 15 minutos',
                    'Si está inconsciente, NO des nada por boca',
                    'Considera aplicación de glucagón'
                ]
            }
        else:
            return {
                'categoria': 'hipoglucemia',
                'nivel': 'alerta',
                'titulo': '🟣 Hipoglucemia',
                'color': 'purple',
                'color_hex': '#a855f7',
                'icono': 'fa-arrow-down',
                'rango': f'{ClasificacionGlucosa.AYUNAS_NORMAL_MIN - 1}-{ClasificacionGlucosa.EMERGENCIA_HIPO} mg/dL',
                'mensaje': 'Tu glucosa está baja. Necesitas carbs.',
                'recomendaciones': [
                    'Consume 15g de carbohidratos de acción rápida',
                    'Jugo, frutas, galletas o caramelos',
                    'Mide de nuevo en 15 minutos',
                    'Si tomas insulina, verifica la dosis',
                    'No conduzcas si estás bajo'
                ]
            }
    
    @staticmethod
    def clasificar(glucemia, momento='libre'):
        """
        Clasifica la glucosa según el momento del día.
        
        Args:
            glucemia: Valor de glucosa en mg/dL
            momento: 'ayunas', 'pre-almuerzo', 'post-almuerzo', 'pre-cena', 
                     'post-cena', 'libre', 'noche', 'desayuno', 'post-desayuno'
        
        Returns:
            dict con clasificación completa
        """
        # Determinar tipo de clasificación según momento
        momento_lower = momento.lower().strip() if momento else 'libre'
        
        # Clasificaciones que se consideran "en ayunas"
        ayunas_momentos = ['ayunas', 'desayuno', 'noche']
        
        # Clasificaciones postprandial (después de comer)
        postprandial_momentos = ['post-almuerzo', 'post-cena', 'post-desayuno', 'almuerzo', 'cena']
        
        if momento_lower in ayunas_momentos:
            clasificacion = ClasificacionGlucosa.clasificar_ayunas(glucemia)
        elif momento_lower in postprandial_momentos or 'post' in momento_lower:
            clasificacion = ClasificacionGlucosa.clasificar_postprandial(glucemia)
        else:
            # Para momentos "libre" o no definidos, usamos clasificación aleatoria
            clasificacion = ClasificacionGlucosa.clasificar_aleatoria(glucemia)
        
        # Agregar información adicional
        clasificacion['glucemia'] = glucemia
        clasificacion['momento'] = momento
        clasificacion['momento_display'] = ClasificacionGlucosa._get_momento_display(momento)
        
        return clasificacion
    
    @staticmethod
    def _get_momento_display(momento):
        """Traduce el código del momento a texto legible"""
        momentos = {
            'ayunas': 'En ayunas (sin comer por 8 horas)',
            'desayuno': 'Después del desayuno',
            'post-desayuno': '2 horas después del desayuno',
            'pre-almuerzo': 'Antes del almuerzo',
            'almuerzo': 'Después del almuerzo',
            'post-almuerzo': '2 horas después del almuerzo',
            'pre-cena': 'Antes de la cena',
            'cena': 'Después de la cena',
            'post-cena': '2 horas después de la cena',
            'noche': 'Medición nocturna',
            'libre': 'Otro momento'
        }
        return momentos.get(momento.lower(), momento)
    
    @staticmethod
    def obtener_alerta(glucemia):
        """
        Obtiene el tipo de alerta clínica según el nivel de glucosa.
        
        Returns:
            dict con: tipo (ninguna, hipo, hiper), severidad, mensaje
        """
        if glucemia < ClasificacionGlucosa.ALERTA_HIPOGLUCEMIA:
            return {
                'tipo': 'hipo',
                'severidad': 'roja' if glucemia <= ClasificacionGlucosa.EMERGENCIA_HIPO else 'amarilla',
                'nivel': glucemia,
                'mensaje': '⚠️ Glucosa baja - Trata inmediatamente'
            }
        elif glucemia >= ClasificacionGlucosa.ALERTA_HIPERGLUCEMIA_SEVERA:
            return {
                'tipo': 'hiper',
                'severidad': 'roja' if glucemia >= ClasificacionGlucosa.EMERGENCIA_HIPER else 'amarilla',
                'nivel': glucemia,
                'mensaje': '⚠️ Glucosa alta - Verificacetonas'
            }
        else:
            return {
                'tipo': 'ninguna',
                'severidad': 'verde',
                'nivel': glucemia,
                'mensaje': 'Glucosa dentro de rango'
            }
    
    @staticmethod
    def es_momento_ayunas(momento):
        """Determina si el momento corresponde a una medición en ayunas"""
        ayunas_momentos = ['ayunas', 'desayuno', 'noche']
        return momento.lower() in ayunas_momentos
    
    @staticmethod
    def es_momento_postprandial(momento):
        """Determina si el momento corresponde a una medición postprandial"""
        postprandial = ['post-almuerzo', 'post-cena', 'post-desayuno']
        return any(p in momento.lower() for p in postprandial)


def clasificar_glucosa(glucemia, momento='libre'):
    """
    Función auxiliar para clasificar glucosa.
    
    Args:
        glucemia: Valor de glucosa en mg/dL
        momento: Momento de la medición
        
    Returns:
        dict con la clasificación
    """
    return ClasificacionGlucosa.clasificar(glucemia, momento)


def obtener_info_glucosa(glucemia, momento='libre'):
    """
    Obtiene información completa de la glucosa incluyendo clasificación y alertas.
    
    Args:
        glucemia: Valor de glucosa en mg/dL
        momento: Momento de la medición
        
    Returns:
        dict con toda la información
    """
    clasificacion = ClasificacionGlucosa.clasificar(glucemia, momento)
    alerta = ClasificacionGlucosa.obtener_alerta(glucemia)
    
    return {
        'glucemia': glucemia,
        'momento': momento,
        'clasificacion': clasificacion,
        'alerta': alerta,
        'es_ayunas': ClasificacionGlucosa.es_momento_ayunas(momento),
        'es_postprandial': ClasificacionGlucosa.es_momento_postprandial(momento),
        'necesita_accion': alerta['tipo'] != 'ninguna',
        'es_emergencia': alerta['severidad'] == 'roja'
    }
