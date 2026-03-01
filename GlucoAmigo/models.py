from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import json, random

db = SQLAlchemy()

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
    
    perfil = db.relationship('PerfilProfesional', backref='usuario', uselist=False, lazy=True)

    heroes = db.relationship('Heroe', backref='representante', lazy=True, foreign_keys='Heroe.padre_id')

    def set_password(self, pwd):
        self.password_hash = generate_password_hash(pwd)

    def check_password(self, pwd):
        return check_password_hash(self.password_hash, pwd)

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
                'ultimo_acceso': self.ultimo_acceso.strftime('%d/%m/%Y %H:%M') if self.ultimo_acceso else None}
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
    institucion    = db.Column(db.String(100), default='Hospital Dr. Jesús García Coello')
    hba1c_ultimo   = db.Column(db.Float) # Hemoglobina glicosilada
    imc_ultimo     = db.Column(db.Float) # IMC calculado
    
    # Gamificación (XP System)
    puntos_juego   = db.Column(db.Integer, default=0)
    xp_puntos      = db.Column(db.Integer, default=0)
    nivel          = db.Column(db.Integer, default=1)
    
    registros_glucosa = db.relationship('RegistroGlucosa', backref='heroe', lazy=True)
    evaluaciones      = db.relationship('EvaluacionPsicometrica', backref='heroe', lazy=True)

    def to_dict(self):
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
            'especialista_nombre': self.especialista.nombre_completo if self.especialista and self.especialista.nombre_completo else 'Dr. Jesús García Coello',
            'especialista_telefono': self.especialista.telefono if self.especialista and self.especialista.telefono else '0414-1234567',
            'especialista_especialidad': self.especialista.perfil.especialidad if self.especialista and getattr(self.especialista, 'perfil', None) and self.especialista.perfil.especialidad else 'Endocrinólogo Pediátrico',
            'especialista_consultorio': self.especialista.perfil.consultorio if self.especialista and getattr(self.especialista, 'perfil', None) and self.especialista.perfil.consultorio else 'Hospital Dr. Jesús García Coello',
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
        db.create_all()
        _seed_default_data()


def _seed_default_data():
    if Usuario.query.filter_by(username='admin').first():
        return  # Already seeded

    # Especialistas Diversificados (Roles Agro-Master)
    admin = Usuario(
        username='admin', rol='especialista',
        nombre_completo='Dr. Jesús García Coello',
        cedula='V-00000001', email='especialista@hospital.com',
        telefono='0414-1234567'
    )
    admin.set_password('1234')
    db.session.add(admin)
    db.session.flush()

    p_admin = PerfilProfesional(usuario_id=admin.id, especialidad='Endocrinólogo Pediátrico', consultorio='Hospital Dr. Jesús García Coello')
    db.session.add(p_admin)

    # Preguntas de Seguridad para Admin
    p1 = PreguntaSeguridad(usuario_id=admin.id, pregunta='¿Cuál es el nombre de tu primera mascota?')
    p1.set_respuesta('firu')
    p2 = PreguntaSeguridad(usuario_id=admin.id, pregunta='¿En qué ciudad naciste?')
    p2.set_respuesta('caracas')
    db.session.add_all([p1, p2])

    # Nuevos Roles Especializados
    roles = [
        ('nutri_asist', 'nutricionista', 'Lic. Marta Rivas'),
        ('audit_clinico', 'auditor', 'Dr. Roberto Méndez'),
        ('gerente_ops', 'gerente', 'Ing. Carlos Ruiz')
    ]
    for usr, rol, nom in roles:
        nu = Usuario(
            username=usr, rol=rol, nombre_completo=nom, email=f'{usr}@glucoamigo.local'
        )
        nu.set_password('1234')
        nu.cambio_password_requerido = True # Forzar cambio según política Agro-Master
        db.session.add(nu)
        db.session.flush()
        db.session.add(PerfilProfesional(usuario_id=nu.id, especialidad=rol.capitalize(), consultorio='Centro Clínico GlucoAmigo'))

    esp2 = Usuario(
        username='dra_perez', rol='especialista',
        nombre_completo='Dra. María Pérez',
        cedula='V-00000002', email='dra.perez@hospital.com'
    )
    esp2.set_password('1234')
    db.session.add(esp2)
    db.session.flush()
    db.session.add(PerfilProfesional(usuario_id=esp2.id, especialidad='Nutricionista Pediátrica', consultorio='Clínica Pediátrica San Luis'))

    # Demo parent
    padre_demo = Usuario(
        username='papa_demo', rol='padre',
        nombre_completo='Sr. Alberto Blanco',
        cedula='V-12345678', email='alberto@correo.local',
        consentimiento_aceptado=True
    )
    padre_demo.set_password('1234')
    db.session.add(padre_demo)
    db.session.flush()

    # Create dummy heroes
    nombres = ['Carlitos','Anita','Mateo','Lucía']
    now = datetime.utcnow()
    for i, nombre in enumerate(nombres):
        peso = random.randint(15, 30)
        estatura = random.randint(100, 140)
        h = Heroe(
            nombre=nombre,
            codigo=f'P-{i+1:03d}',
            edad=random.randint(6, 12),
            peso=peso,
            estatura=estatura,
            padre_id=padre_demo.id,
            especialista_id=admin.id,
            fecha_diagnostico=(now - timedelta(days=365)).date()
        )
        db.session.add(h)
        db.session.flush()

        # Glucose records
        momentos = ['ayunas', 'pos-desayuno', 'pos-almuerzo', 'pos-cena']
        for d in range(15):
            for m_idx in range(4):
                glucemia = random.randint(60, 280)
                carbos = random.randint(15, 60)
                dosis = round((glucemia - 100) / 40 + (carbos / 15), 1)
                if dosis < 0: dosis = 0
                
                reg = RegistroGlucosa(
                    heroe_id=h.id,
                    fecha=now - timedelta(days=d, hours=3*m_idx),
                    glucemia_actual=glucemia,
                    carbohidratos=carbos,
                    dosis_sugerida=dosis,
                    momento_dia=momentos[m_idx % len(momentos)],
                    alerta_disparada=(glucemia < 70 or glucemia > 250),
                )
                db.session.add(reg)

                if glucemia < 70:
                    db.session.add(AlertaClinica(
                        heroe_id=h.id, tipo='hipo', severidad='roja',
                        fecha=reg.fecha,
                        mensaje=f'⚠️ Hipoglucemia detectada: {glucemia} mg/dL en {nombre}'
                    ))
                elif glucemia > 250:
                    db.session.add(AlertaClinica(
                        heroe_id=h.id, tipo='hiper', severidad='amarilla',
                        fecha=reg.fecha,
                        mensaje=f'⚠️ Hiperglucemia detectada: {glucemia} mg/dL en {nombre}'
                    ))

        # CDI evaluations
        for d in range(3):
            cdi_score = random.randint(3, 25)
            db.session.add(EvaluacionPsicometrica(
                heroe_id=h.id, tipo='CDI',
                fecha=now - timedelta(days=d*7),
                puntaje_total=cdi_score,
                estado='Riesgo' if cdi_score >= 19 else 'Estable',
                respuestas=json.dumps([random.randint(0,3) for _ in range(7)]),
                alerta_enviada=(cdi_score >= 19),
            ))

        # SCIR evaluations
        for d in range(3):
            scir_pct = random.randint(40, 100)
            db.session.add(EvaluacionPsicometrica(
                heroe_id=h.id, tipo='SCIR',
                fecha=now - timedelta(days=d*7),
                puntaje_total=scir_pct,
                estado='Baja' if scir_pct < 70 else 'Alta',
            ))

        # Comidas
        comidas_tipo = ['desayuno','almuerzo','cena','merienda']
        desc_comidas = {
            'desayuno': ['Cereal con leche', 'Arepa con queso', 'Panqueques', 'Avena con frutas'],
            'almuerzo': ['Arroz con pollo', 'Pasta con carne', 'Sopa de verduras', 'Pescado con ensalada'],
            'cena': ['Sándwich integral', 'Ensalada César', 'Tortilla de huevo', 'Pollo a la plancha'],
            'merienda': ['Manzana', 'Yogur natural', 'Galletas integrales', 'Frutos secos'],
        }
        emoji_comida = {'desayuno': '🥞', 'almuerzo': '🍗', 'cena': '🥗', 'merienda': '🍎'}
        for d in range(5):
            for tc in comidas_tipo:
                db.session.add(RegistroComida(
                    heroe_id=h.id,
                    fecha=now - timedelta(days=d, hours=random.randint(0,4)),
                    tipo_comida=tc,
                    descripcion=random.choice(desc_comidas[tc]),
                    carbohidratos=round(random.uniform(15, 65), 1),
                    proteinas=round(random.uniform(5, 25), 1),
                    grasas=round(random.uniform(3, 15), 1),
                    calorias=round(random.uniform(150, 450))
                ))

        # Growth
        for d in range(6):
            m_ago = d * 30
            db.session.add(CrecimientoRegistro(
                heroe_id=h.id,
                fecha=now - timedelta(days=m_ago),
                peso=round(peso - d * random.uniform(0.2, 0.8), 1),
                estatura=round(estatura - d * random.uniform(0.3, 0.6), 1),
                imc=round(peso / ((estatura/100)**2), 1),
            ))

    # Sample audit logs
    db.session.add(AuditLog(
        usuario_id=admin.id, entidad_tipo='Heroe', entidad_id=1,
        accion='UPDATE', campo='ratio_carbohidratos', valor_ant='15.0', valor_nue='12.5'
    ))
    db.session.add(AuditLog(
        usuario_id=admin.id, entidad_tipo='Heroe', entidad_id=2,
        accion='UPDATE', campo='glucemia_objetivo', valor_ant='100', valor_nue='110'
    ))

    db.session.commit()
