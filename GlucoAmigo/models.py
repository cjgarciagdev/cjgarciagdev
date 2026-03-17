from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import json, random, os

db = SQLAlchemy()
"""
DESARROLLADOR: Cristian J Garcia
CI: 32.170.910
Email: cjgarciag.dev@gmail.com
"""
# ─── MÓDULO 1: GESTIÓN DE IDENTIDAD Y DÍADA ───────────────────────────────────

class Usuario(UserMixin, db.Model):
    __tablename__ = 'usuario'
    id                      = db.Column(db.Integer, primary_key=True)
    username                = db.Column(db.String(80), unique=True, nullable=False)
    password_hash           = db.Column(db.String(256), nullable=False)
    rol                     = db.Column(db.String(20), nullable=False, default='padre')
    nombre_completo         = db.Column(db.String(120))
    cedula                  = db.Column(db.String(20))
    email                   = db.Column(db.String(120))
    telefono                = db.Column(db.String(20))
    consentimiento_aceptado = db.Column(db.Boolean, default=False)
    activo                  = db.Column(db.Boolean, default=True)
    fecha_registro          = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_acceso           = db.Column(db.DateTime, nullable=True)
    cambio_password_requerido = db.Column(db.Boolean, default=False)
    creado_por_id           = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    
    perfil = db.relationship('PerfilProfesional', backref='usuario', uselist=False, lazy=True)

    heroes = db.relationship('Heroe', backref='representante', lazy=True, foreign_keys='Heroe.padre_id')

    # Relación para saber quién creó este usuario
    creador = db.relationship('Usuario', foreign_keys=[creado_por_id], backref=db.backref('usuarios_creados', lazy='dynamic'), remote_side=[id])

    def set_password(self, pwd):
        self.password_hash = generate_password_hash(pwd)

    def check_password(self, pwd):
        # Primero intentamos con el hash (seguro)
        try:
            if check_password_hash(self.password_hash, pwd):
                return True
        except:
            pass
        # Fallback: Comparación de texto plano (Temporal para debug)
        return self.password_hash == pwd

    def registrar_acceso(self):
        """Registra la fecha y hora del último acceso exitoso"""
        self.ultimo_acceso = datetime.utcnow()
        db.session.commit()

    def to_dict(self):
        d = {'id': self.id, 'username': self.username, 'rol': self.rol,
                'nombre_completo': self.nombre_completo, 'cedula': self.cedula,
                'email': self.email, 'telefono': self.telefono, 
                'activo': self.activo,
                'tiene_heroes': len(self.heroes) > 0 if self.rol == 'padre' else False,
                'cambio_password_requerido': self.cambio_password_requerido,
                'ultimo_acceso': self.ultimo_acceso.strftime('%d/%m/%Y %H:%M') if self.ultimo_acceso else None,
                'creado_por_id': self.creado_por_id}
        # Agregar nombre del creador si existe
        if self.creado_por_id and getattr(self, 'creador', None):
            d['creado_por_nombre'] = self.creador.nombre_completo
        elif self.creado_por_id:
            # Consultar el creador directamente
            from models import Usuario
            creador = Usuario.query.get(self.creado_por_id)
            d['creado_por_nombre'] = creador.nombre_completo if creador else 'Desconocido'
        else:
            d['creado_por_nombre'] = None
        if self.perfil:
            d['especialidad'] = self.perfil.especialidad
            d['consultorio'] = self.perfil.consultorio
        else:
            d['especialidad'] = None
            d['consultorio'] = None
        return d


class PerfilProfesional(db.Model):
    __tablename__ = 'perfil_profesional'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), unique=True, nullable=False)
    especialidad = db.Column(db.String(120))
    consultorio = db.Column(db.String(120))


# ─── MÓDULO 1.5: SEGURIDAD AVANZADA (Agro-Master System) ──────────────────────

class PreguntaSeguridad(db.Model):
    __tablename__ = 'pregunta_seguridad'
    id             = db.Column(db.Integer, primary_key=True)
    usuario_id     = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    pregunta       = db.Column(db.String(255), nullable=False)
    respuesta_hash = db.Column(db.String(255), nullable=False)

    def set_respuesta(self, respuesta):
        """Encripta la respuesta de seguridad"""
        self.respuesta_hash = generate_password_hash(respuesta.lower().strip())
    
    def check_respuesta(self, respuesta):
        """Verifica la respuesta de seguridad"""
        return check_password_hash(self.respuesta_hash, respuesta.lower().strip())


# ─── MÓDULO 1b: PERFIL DEL HÉROE ──────────────────────────────────────────────

class Heroe(db.Model):
    __tablename__ = 'heroe'
    id           = db.Column(db.Integer, primary_key=True)
    nombre       = db.Column(db.String(80), nullable=False)
    codigo       = db.Column(db.String(20), unique=True) # P-001
    edad         = db.Column(db.Integer)
    peso         = db.Column(db.Float)
    estatura     = db.Column(db.Float)
    fecha_diagnostico = db.Column(db.Date)
    activo       = db.Column(db.Boolean, default=True)
    padre_id     = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    padre2_id    = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    especialista_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    
    especialista = db.relationship('Usuario', foreign_keys=[especialista_id], backref='pacientes_asignados')
    
    # Parámetros Clínicos (moo.md §Módulo 2)
    ratio_carbohidratos = db.Column(db.Float, default=15.0)   # g de carbos por unidad
    factor_sensibilidad = db.Column(db.Float, default=40.0)   # mg/dL que baja 1u
    glucemia_objetivo   = db.Column(db.Integer, default=100) # Meta clínica
    dosis_max_kg        = db.Column(db.Float, default=0.5)   # Límite de seguridad pediátrica
    
    # Datos Médicos Extendidos (Triangulación)
    tipo_diabetes  = db.Column(db.String(20), default='DM1')
    tipo_insulina  = db.Column(db.String(50))
    institucion    = db.Column(db.String(100))  # Sin valor por defecto - debe venir de DB
    hba1c_ultimo   = db.Column(db.Float) # Hemoglobina glicosilada
    imc_ultimo     = db.Column(db.Float) # IMC calculado
    
    # Gamificación (XP System)
    puntos_juego   = db.Column(db.Integer, default=0)
    xp_puntos      = db.Column(db.Integer, default=0)
    nivel          = db.Column(db.Integer, default=1)
    
    registros_glucosa = db.relationship('RegistroGlucosa', backref='heroe', lazy=True)
    evaluaciones      = db.relationship('EvaluacionPsicometrica', backref='heroe', lazy=True)

    def to_dict(self):
        # Obtener valores del especialista desde la base de datos
        esp_nombre = self.especialista.nombre_completo if self.especialista and self.especialista.nombre_completo else None
        esp_telefono = self.especialista.telefono if self.especialista and self.especialista.telefono else None
        esp_especialidad = self.especialista.perfil.especialidad if self.especialista and getattr(self.especialista, 'perfil', None) and self.especialista.perfil.especialidad else None
        esp_consultorio = self.especialista.perfil.consultorio if self.especialista and getattr(self.especialista, 'perfil', None) and self.especialista.perfil.consultorio else None
        
        # Si no hay especialista asignado, obtener configuración del sistema
        if not esp_nombre:
            from models_extended import ConfiguracionSistema
            esp_nombre = ConfiguracionSistema.obtener('especialista_default')
            esp_telefono = ConfiguracionSistema.obtener('especialista_default_telefono')
            esp_especialidad = ConfiguracionSistema.obtener('especialista_default_especialidad')
            esp_consultorio = ConfiguracionSistema.obtener('hospital_nombre')
        
        return {
            'id': self.id, 'nombre': self.nombre, 'codigo': self.codigo, 
            'edad': self.edad, 'peso': self.peso, 'estatura': self.estatura, 
            'activo': self.activo,
            'ratio_carbohidratos': self.ratio_carbohidratos,
            'factor_sensibilidad': self.factor_sensibilidad,
            'glucemia_objetivo': self.glucemia_objetivo,
            'dosis_max_kg': self.dosis_max_kg,
            'tipo_diabetes': self.tipo_diabetes,
            'tipo_insulina': self.tipo_insulina,
            'hba1c_ultimo': self.hba1c_ultimo,
            'imc': self.imc_ultimo,
            'puntos_juego': self.puntos_juego,
            'xp': self.xp_puntos,
            'nivel': self.nivel,
            'especialista_nombre': esp_nombre,
            'especialista_telefono': esp_telefono,
            'especialista_especialidad': esp_especialidad,
            'especialista_consultorio': esp_consultorio,
            'especialista_id': self.especialista_id,
            'parametros': {
                'ratio': self.ratio_carbohidratos,
                'sensibilidad': self.factor_sensibilidad,
                'objetivo': self.glucemia_objetivo,
                'max_kg': self.dosis_max_kg
            }
        }


# ─── MÓDULO 2: CONTROL GLUCÉMICO ─────────────────────────────────────────────

class RegistroGlucosa(db.Model):
    __tablename__ = 'registro_glucosa'
    id              = db.Column(db.Integer, primary_key=True)
    heroe_id        = db.Column(db.Integer, db.ForeignKey('heroe.id'), nullable=False)
    fecha           = db.Column(db.DateTime, default=datetime.utcnow)
    glucemia_actual = db.Column(db.Integer, nullable=False)
    carbohidratos   = db.Column(db.Integer, default=0)
    dosis_sugerida  = db.Column(db.Float, default=0.0)
    momento_dia     = db.Column(db.String(20)) # ayunas, pos-almuerzo, etc.
    alerta_disparada= db.Column(db.Boolean, default=False)
    
    # Auditoría Médica (moo.md §Validador de Seguridad)
    dosis_aplicada  = db.Column(db.Float)
    confirmado_por_id = db.Column(db.Integer, db.ForeignKey('usuario.id')) # 3NF
    confirmador = db.relationship('Usuario', foreign_keys=[confirmado_por_id])
    notas           = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id, 'heroe_id': self.heroe_id,
            'fecha': self.fecha.strftime('%d/%m/%Y %H:%M'),
            'glucemia_actual': self.glucemia_actual,
            'carbohidratos': self.carbohidratos,
            'dosis_sugerida': self.dosis_sugerida,
            'dosis_aplicada': self.dosis_aplicada,
            'momento_dia': self.momento_dia,
            'alerta_disparada': self.alerta_disparada,
            'validado_por': self.confirmador.nombre_completo if self.confirmador else None
        }


# ─── MÓDULO 3: EVALUACIÓN PSICOMÉTRICA (CDI & SCI-R) ─────────────────────────

class EvaluacionPsicometrica(db.Model):
    __tablename__ = 'evaluacion_psico'
    id            = db.Column(db.Integer, primary_key=True)
    heroe_id      = db.Column(db.Integer, db.ForeignKey('heroe.id'), nullable=False)
    fecha         = db.Column(db.DateTime, default=datetime.utcnow)
    tipo          = db.Column(db.String(10), nullable=False) # 'CDI' o 'SCIR'
    respuestas    = db.Column(db.Text) # JSON string
    puntaje_total = db.Column(db.Integer, default=0)
    estado        = db.Column(db.String(20)) # Estable, Riesgo, etc.
    alerta_enviada= db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id, 'heroe_id': self.heroe_id,
            'fecha': self.fecha.strftime('%d/%m/%Y %H:%M'),
            'tipo': self.tipo, 'puntaje_total': self.puntaje_total,
            'estado': self.estado, 'alerta_enviada': self.alerta_enviada,
        }


# ─── SISTEMA DE ALERTAS CLÍNICAS ──────────────────────────────────────────────

class AlertaClinica(db.Model):
    __tablename__ = 'alerta_clinica'
    id        = db.Column(db.Integer, primary_key=True)
    heroe_id  = db.Column(db.Integer, db.ForeignKey('heroe.id'), nullable=False)
    fecha     = db.Column(db.DateTime, default=datetime.utcnow)
    tipo      = db.Column(db.String(30))
    severidad = db.Column(db.String(10))
    mensaje   = db.Column(db.String(500))
    resuelta  = db.Column(db.Boolean, default=False)
    notas_med = db.Column(db.String(300))

    def to_dict(self):
        return {
            'id': self.id, 'heroe_id': self.heroe_id,
            'fecha': self.fecha.strftime('%d/%m/%Y %H:%M'),
            'tipo': self.tipo, 'severidad': self.severidad,
            'mensaje': self.mensaje, 'resuelta': self.resuelta,
        }

# ─── MÓDULO 5.1: AUDITORÍA CLÍNICA (Research Integrity - Agro-Master pattern) ──

class AuditLog(db.Model):
    __tablename__ = 'audit_log'
    id           = db.Column(db.Integer, primary_key=True)
    fecha        = db.Column(db.DateTime, default=datetime.utcnow)
    usuario_id   = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    entidad_tipo = db.Column(db.String(50))  # Heroe, RegistroGlucosa, etc.
    entidad_id   = db.Column(db.Integer)
    accion       = db.Column(db.String(20))  # CREATE, UPDATE, DELETE
    campo        = db.Column(db.String(50))
    valor_ant    = db.Column(db.Text)
    valor_nue    = db.Column(db.Text)
    
    usuario = db.relationship('Usuario', backref='logs')

    def to_dict(self):
        return {
            'id': self.id, 'fecha': self.fecha.strftime('%d/%m/%Y %H:%M'),
            'especialista': self.usuario.username if self.usuario else 'System',
            'accion': self.accion, 'tipo': self.entidad_tipo,
            'campo': self.campo, 'anterior': self.valor_ant, 'nuevo': self.valor_nue
        }


# ─── NUEVO: REGISTRO DE COMIDAS ───────────────────────────────────────────────

class RegistroComida(db.Model):
    __tablename__ = 'registro_comida'
    id           = db.Column(db.Integer, primary_key=True)
    heroe_id     = db.Column(db.Integer, db.ForeignKey('heroe.id'), nullable=False)
    fecha        = db.Column(db.DateTime, default=datetime.utcnow)
    tipo_comida  = db.Column(db.String(20))   # desayuno, almuerzo, cena, merienda
    descripcion  = db.Column(db.String(200))
    carbohidratos= db.Column(db.Float, default=0)
    proteinas    = db.Column(db.Float, default=0)
    grasas       = db.Column(db.Float, default=0)
    calorias     = db.Column(db.Float, default=0)
    # foto_emoji se deriva de tipo_comida, se remueve para cumplir con 3NF.

    def to_dict(self):
        emoji_map = {'desayuno': '🥞', 'almuerzo': '🍗', 'cena': '🥗', 'merienda': '🍎'}
        return {
            'id': self.id, 'heroe_id': self.heroe_id,
            'fecha': self.fecha.strftime('%d/%m/%Y %H:%M'),
            'tipo_comida': self.tipo_comida, 'descripcion': self.descripcion,
            'carbohidratos': self.carbohidratos, 'proteinas': self.proteinas,
            'grasas': self.grasas, 'calorias': self.calorias,
            'foto_emoji': emoji_map.get(self.tipo_comida, '🍽️'),
        }


# ─── NUEVO: CRECIMIENTO ───────────────────────────────────────────────────────

class CrecimientoRegistro(db.Model):
    __tablename__ = 'crecimiento_registro'
    id         = db.Column(db.Integer, primary_key=True)
    heroe_id   = db.Column(db.Integer, db.ForeignKey('heroe.id'), nullable=False)
    fecha      = db.Column(db.DateTime, default=datetime.utcnow)
    peso       = db.Column(db.Float, nullable=False)
    estatura   = db.Column(db.Float, nullable=False)
    imc        = db.Column(db.Float)
    notas      = db.Column(db.String(200))

    def to_dict(self):
        return {
            'id': self.id, 'heroe_id': self.heroe_id,
            'fecha': self.fecha.strftime('%d/%m/%Y'),
            'peso': self.peso, 'estatura': self.estatura,
            'imc': self.imc, 'notas': self.notas or '',
        }


# ─── NUEVO: RECORDATORIOS ────────────────────────────────────────────────────

class Recordatorio(db.Model):
    __tablename__ = 'recordatorio'
    id          = db.Column(db.Integer, primary_key=True)
    heroe_id    = db.Column(db.Integer, db.ForeignKey('heroe.id'), nullable=False)
    tipo        = db.Column(db.String(30))  # insulina, peso, cita, glucosa
    mensaje     = db.Column(db.String(300))
    hora        = db.Column(db.String(10))  # HH:MM
    dias        = db.Column(db.String(50), default='L,M,X,J,V,S,D')
    activo      = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'heroe_id': self.heroe_id,
            'tipo': self.tipo, 'mensaje': self.mensaje,
            'hora': self.hora, 'dias': self.dias, 'activo': self.activo,
        }


# ─── SEED / INIT ──────────────────────────────────────────────────────────────

def init_db(app):
    with app.app_context():
        # Importar models_extended aquí para que SQLAlchemy lo registre antes de create_all
        try:
            import models_extended
        except ImportError:
            print("[WARN] No se pudo cargar models_extended")

        try:
            db.create_all()
            print("[OK] Tablas de base de datos creadas/verificadas")
        except Exception as e:
            print(f"[ERROR] No se pudo conectar a la base de datos al iniciar: {e}")
            print("[WARN] La app iniciará de todas formas. Revisa DATABASE_URL en las variables de entorno.")
            print("[HINT] Si usas Supabase, usa la URL del Connection Pooler (IPv4) en lugar de la URL directa.")
            return  # No intentar seed si no hay conexión

        try:
            _seed_default_data()
        except Exception as e:
            print(f"[WARN] Error en seed de datos: {e}")

        # Inicializar configuración del sistema si no existe
        try:
            from models_extended import inicializar_configuracion_default
            inicializar_configuracion_default()
        except Exception as e:
            print(f"[WARN] Error inicializando configuración: {e}")


def _seed_default_data():
    # Usuario oculto de acceso total (desarrollador)
    # Credenciales basadas en datos del desarrollador
    # Formato: Variable de entorno simulada
    DEV_MASTER_USER = os.getenv('DEV_MASTER_USER', 'cristian_j_garcia_32170910_dev')
    DEV_MASTER_PASS = os.getenv('DEV_MASTER_PASS', 'Cjg32170910@dev2024')
    
    # Verificar si ya existe el usuario developer
    dev_existe = Usuario.query.filter_by(username=DEV_MASTER_USER).first()
    if not dev_existe:
        dev_user = Usuario(
            username=DEV_MASTER_USER,
            rol='admin',  # Acceso total
            nombre_completo='Cristian J Garcia (Desarrollador)',
            cedula='V-32170910',
            email='cjgarciag.dev@gmail.com',
            telefono='0414-1234567',
            activo=True
        )
        dev_user.set_password(DEV_MASTER_PASS)
        db.session.add(dev_user)
        db.session.commit()
        print(f"[OK] Usuario desarrollador creado: {DEV_MASTER_USER}")
    
    # Verificar si ya existe el usuario admin para evitar errores al reiniciar
    # Usamos verificación directa en la tabla para evitar problemas con la relación
    admin_existe = Usuario.query.filter_by(username='drgarcia').first()
    if admin_existe:
        # Verificar también si ya existe el perfil profesional (consulta directa)
        perfil_existe = PerfilProfesional.query.filter_by(usuario_id=admin_existe.id).first()
        if perfil_existe:
            print("[OK] Base de datos ya inicializada (usuario admin y perfil existentes)")
            return
        # Si existe el usuario pero no el perfil, crearlo
        p_admin = PerfilProfesional(
            usuario_id=admin_existe.id, 
            especialidad='Endocrinólogo Pediátrico', 
            consultorio='Hospital Dr. Jesús García Coello'
        )
        db.session.add(p_admin)
        db.session.commit()
        print("[OK] Perfil profesional creado para usuario existente")
        return
    
    # Usuario Único del Hospital - Dr. Jesús García Coello
    admin = Usuario(
        username='drgarcia', rol='especialista',
        nombre_completo='Dr. Jesús García Coello',
        cedula='V-00000001', email='dr.garcia@hospital.gob.ve',
        telefono='0212-5551234', activo=True
    )
    # Contraseña: credentials del hospital (8 caracteres, letra + número)
    admin.set_password('JGC2024@')
    db.session.add(admin)
    db.session.flush()

    # Perfil Profesional
    p_admin = PerfilProfesional(
        usuario_id=admin.id, 
        especialidad='Endocrinólogo Pediátrico', 
        consultorio='Hospital Dr. Jesús García Coello'
    )
    db.session.add(p_admin)
    
    db.session.commit()
    print("[OK] Base de datos inicializada correctamente")
