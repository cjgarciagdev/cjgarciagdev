# PRODUCTOR UNICO: CRISTIAN J GARCIA | CI: 32.170.910 | Email: dicrisog252@gmail.com
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

# Instancia global de la base de datos SQLAlchemy
# Esta instancia se utilizará para definir modelos y realizar consultas
db = SQLAlchemy()

from sqlalchemy import event, Engine
from sqlalchemy.orm import joinedload

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.execute("PRAGMA busy_timeout=30000")
    cursor.close()

# Modelo: SistemaSync
# Rastrea la última actualización global de datos para sincronización en tiempo real
class SistemaSync(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    last_update = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    version = db.Column(db.Integer, default=1)

def update_sync_timestamp(session=None):
    """Actualiza la versión de sincronización del sistema"""
    # Usamos una conexión directa para evitar bucles si se llama desde un evento
    try:
        # Intentar obtener el registro sin disparar eventos de sesión si es posible
        sync = SistemaSync.query.first()
        if not sync:
            sync = SistemaSync(version=1)
            db.session.add(sync)
        else:
            sync.version += 1
        db.session.commit()
    except Exception as e:
        print(f"Error actualizando sync timestamp: {e}")

# Listener automático para cualquier cambio en la base de datos
@event.listens_for(db.Session, "after_flush")
def receive_after_flush(session, flush_context):
    """Se ejecuta después de que los cambios se envían a la DB pero antes del commit"""
    # Evitar recursión infinita: no actualizar si el cambio es en SistemaSync
    if any(isinstance(obj, SistemaSync) for obj in session.new | session.dirty | session.deleted):
        return
        
    # Actualizar la versión
    sync = session.query(SistemaSync).first()
    if not sync:
        sync = SistemaSync(version=1)
        session.add(sync)
    else:
        sync.version += 1

# Modelo: Especie
# Representa el catálogo de especies disponibles (ej. Bovino, Ovino)
# 
# IMPORTANCIA: Sirve como el primer nivel de categorización. Hereda comportamientos 
# de visualización (colores en gráficas) y validación de planes nutricionales.
class Especie(db.Model):
    # Identificador único de la especie
    id = db.Column(db.Integer, primary_key=True)
    # Nombre de la especie (debe ser único)
    nombre = db.Column(db.String(100), unique=True, nullable=False)

    # Convierte el objeto a un diccionario para respuestas JSON fáciles
    def to_dict(self):
        return {'id': self.id, 'nombre': self.nombre}


# Modelo: Raza
# Representa las razas asociadas a una especie específica
class Raza(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    # Clave foránea que vincula la raza con su especie padre
    especie_id = db.Column(db.Integer, db.ForeignKey('especie.id'), nullable=False)

    def to_dict(self):
        return {'id': self.id, 'nombre': self.nombre, 'especie_id': self.especie_id}

# --- TABLAS DE NORMALIZACIÓN ---

class TipoEventoMedico(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    def to_dict(self): return {'id': self.id, 'nombre': self.nombre}

class CategoriaInsumo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    def to_dict(self): return {'id': self.id, 'nombre': self.nombre}

class UnidadMedida(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)
    def to_dict(self): return {'id': self.id, 'nombre': self.nombre}

class TipoAlimentacion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    def to_dict(self): return {'id': self.id, 'nombre': self.nombre}

class TipoPlanReproductivo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    def to_dict(self): return {'id': self.id, 'nombre': self.nombre}

class TipoProtocolo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    def to_dict(self): return {'id': self.id, 'nombre': self.nombre}

class EstadoAnimal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)
    def to_dict(self): return {'id': self.id, 'nombre': self.nombre}

class Sexo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(20), unique=True, nullable=False)
    def to_dict(self): return {'id': self.id, 'nombre': self.nombre}

class EstadoProtocolo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)
    def to_dict(self): return {'id': self.id, 'nombre': self.nombre}

# Modelo: Preguntas de Seguridad (Múltiples)
# Permite que un usuario tenga múltiples preguntas de seguridad configuradas.
class PreguntaSeguridad(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    pregunta = db.Column(db.String(255), nullable=False)
    respuesta_hash = db.Column(db.String(255), nullable=False)

    def set_respuesta(self, respuesta):
        """Encripta y guarda la respuesta"""
        respuesta_normalizada = respuesta.lower().strip()
        self.respuesta_hash = generate_password_hash(respuesta_normalizada, method='pbkdf2:sha256')
    
    def check_respuesta(self, respuesta):
        """Verifica la respuesta"""
        respuesta_normalizada = respuesta.lower().strip()
        return check_password_hash(self.respuesta_hash, respuesta_normalizada)

# Modelo: Usuario del Sistema (Veterinarios, Admins, Operadores)
# Se define aquí para evitar problemas de importación circular y permitir claves foráneas
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    nombre_completo = db.Column(db.String(200))
    rol = db.Column(db.String(50), default="operador")  # admin, veterinario, supervisor, operador, consultor, nutricionista, inventario, auditor, gerente
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_acceso = db.Column(db.DateTime, nullable=True)
    cambio_password_requerido = db.Column(db.Boolean, default=False)
    pregunta_seguridad = db.Column(db.String(255), nullable=True)
    respuesta_seguridad = db.Column(db.String(255), nullable=True)
    
    # Permisos Generales (Compatibles con roles existentes)
    puede_crear_animales = db.Column(db.Boolean, default=True)
    puede_editar_animales = db.Column(db.Boolean, default=True)
    puede_eliminar_animales = db.Column(db.Boolean, default=False)
    puede_exportar = db.Column(db.Boolean, default=True)
    puede_ver_analisis = db.Column(db.Boolean, default=True)
    puede_gestionar_usuarios = db.Column(db.Boolean, default=False)
    puede_ver_reportes = db.Column(db.Boolean, default=True)
    
    # Permisos Específicos (Para roles especializados - Nuevos)
    puede_gestionar_nutricion = db.Column(db.Boolean, default=True)      # Crear/editar planes nutricionales
    puede_gestionar_inventario = db.Column(db.Boolean, default=True)     # Gestionar insumos/stock
    puede_gestionar_salud = db.Column(db.Boolean, default=True)          # Gestionar historial médico
    puede_gestionar_genealogia = db.Column(db.Boolean, default=True)     # Editar árboles genealógicos
    puede_ver_logs = db.Column(db.Boolean, default=False)                # Ver historial de cambios/auditoría
    puede_aprobar_acciones = db.Column(db.Boolean, default=False)        # Aprobar acciones críticas
    puede_ver_dashboard_completo = db.Column(db.Boolean, default=True)   # Ver estadísticas completas
    puede_solo_lectura = db.Column(db.Boolean, default=False)            # Modo solo lectura (auditor)
    
    preguntas_seguridad = db.relationship('PreguntaSeguridad', backref='usuario', lazy=True, cascade="all, delete-orphan")
    
    def set_password(self, password):
        """Encripta y guarda la contraseña usando PBKDF2-SHA256"""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    
    def check_password(self, password):
        """Verifica si la contraseña proporcionada es correcta"""
        return check_password_hash(self.password_hash, password)
    
    def registrar_acceso(self):
        """Registra la fecha y hora del último acceso exitoso"""
        self.ultimo_acceso = datetime.utcnow()
        db.session.commit()
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'nombre_completo': self.nombre_completo,
            'rol': self.rol,
            'activo': self.activo,
            'fecha_creacion': self.fecha_creacion.strftime('%Y-%m-%d %H:%M:%S'),
            'ultimo_acceso': self.ultimo_acceso.strftime('%Y-%m-%d %H:%M:%S') if self.ultimo_acceso else None,
            'cambio_password_requerido': self.cambio_password_requerido,
            'pregunta_seguridad': self.pregunta_seguridad,
            'permisos': {
                # Permisos Generales
                'crear_animales': self.puede_crear_animales,
                'editar_animales': self.puede_editar_animales,
                'eliminar_animales': self.puede_eliminar_animales,
                'exportar': self.puede_exportar,
                'ver_analisis': self.puede_ver_analisis,
                'gestionar_usuarios': self.puede_gestionar_usuarios,
                'ver_reportes': self.puede_ver_reportes,
                # Permisos Específicos (Nuevos)
                'gestionar_nutricion': self.puede_gestionar_nutricion,
                'gestionar_inventario': self.puede_gestionar_inventario,
                'gestionar_salud': self.puede_gestionar_salud,
                'gestionar_genealogia': self.puede_gestionar_genealogia,
                'ver_logs': self.puede_ver_logs,
                'aprobar_acciones': self.puede_aprobar_acciones,
                'ver_dashboard_completo': self.puede_ver_dashboard_completo,
                'solo_lectura': self.puede_solo_lectura
            }
        }

# -------------------------------

# Modelo PRINCIPAL: Ganado
# Esta es la tabla central del sistema. Almacena la información de cada animal individual.
# 
# DISEÑO DE DATOS: 
# - Utiliza Relaciones de Clave Foránea para normalizar Especie, Raza, Estado y Sexo.
# - El peso se almacena como un valor actual (denormalizado para rendimiento en listas), 
#   pero se complementa con la tabla RegistroPeso para trazabilidad histórica.
# 
class Ganado(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # NORMALIZACIÓN 2NF/3NF: Usamos IDs referenciales en lugar de strings repetitivos
    especie_id = db.Column(db.Integer, db.ForeignKey('especie.id', ondelete='RESTRICT'), nullable=False)
    raza_id = db.Column(db.Integer, db.ForeignKey('raza.id', ondelete='RESTRICT'), nullable=False)
    
    # NORMALIZACIÓN: Sexo referenciado
    sexo_id = db.Column(db.Integer, db.ForeignKey('sexo.id'), nullable=False)
    
    fecha_nacimiento = db.Column(db.String(10), nullable=False) # Formato YYYY-MM-DD
    edad = db.Column(db.Integer, nullable=False)        # Calculada en meses
    peso = db.Column(db.Float, nullable=False)          # Peso actual en kg
    
    # NORMALIZACIÓN: Estado referenciado
    estado_id = db.Column(db.Integer, db.ForeignKey('estado_animal.id'), nullable=True)
    
    # Genealogía: Referencias recursivas a la misma tabla (Auto-relación)
    padre_id = db.Column(db.Integer, db.ForeignKey('ganado.id', ondelete='SET NULL'), nullable=True)
    madre_id = db.Column(db.Integer, db.ForeignKey('ganado.id', ondelete='SET NULL'), nullable=True)

    # MEJORA: Campos adicionales para gestión operativa
    codigo_identificacion = db.Column(db.String(50), nullable=True)  # Código de arete, chip RFID o tatuaje
    observaciones = db.Column(db.Text, nullable=True)                # Notas del operador
    lote_id = db.Column(db.Integer, db.ForeignKey('lote.id', ondelete='SET NULL'), nullable=True)  # Asignación a lote
    foto_url = db.Column(db.String(255), nullable=True)              # Ruta a foto del animal
    fecha_ingreso = db.Column(db.DateTime, default=datetime.utcnow)  # Fecha de registro en el sistema

    # Relaciones SQLAlchemy para facilitar el acceso a los objetos vinculados
    cat_especie = db.relationship('Especie', backref='animales')
    cat_raza = db.relationship('Raza', backref='animales')
    cat_estado = db.relationship('EstadoAnimal', backref='animales')
    cat_sexo = db.relationship('Sexo', backref='animales')
    padre = db.relationship('Ganado', remote_side=[id], foreign_keys=[padre_id])
    madre = db.relationship('Ganado', remote_side=[id], foreign_keys=[madre_id])
    lote = db.relationship('Lote', backref='animales')

    def to_dict(self):
        """Retorna una representación serializable del animal, resolviendo los nombres de catálogos."""
        # Cálculo de Score Ganadero Dinámico (0-100)
        score = 50 
        if self.padre_id: score += 10
        if self.madre_id: score += 10
        if self.cat_estado and self.cat_estado.nombre == 'Saludable': score += 15
        
        # Lógica de salud crítica por desparasitación
        salud_critica = False
        razon_critica = None
        
        if self.edad in [3, 6]:
            tipo_desp = TipoEventoMedico.query.filter_by(nombre='Desparasitación').first()
            if tipo_desp:
                hace_poco = datetime.now() - timedelta(days=15)
                has_desp = HistorialMedico.query.filter_by(
                    animal_id=self.id, 
                    tipo_id=tipo_desp.id
                ).filter(HistorialMedico.fecha >= hace_poco).first()
                if not has_desp:
                    try:
                        nacimiento = datetime.strptime(self.fecha_nacimiento, '%Y-%m-%d')
                        fecha_objetivo = nacimiento + timedelta(days=self.edad * 30.44)
                        if datetime.now() > (fecha_objetivo + timedelta(hours=48)):
                            salud_critica = True
                            razon_critica = "Desparasitación omitida (>48h)"
                    except (ValueError, TypeError, Exception): 
                        pass

        if self.cat_estado and self.cat_estado.nombre in ['Crítico', 'Enfermo', 'Cuarentena']:
            salud_critica = True
            razon_critica = f"Estado: {self.cat_estado.nombre}"
        elif salud_critica:
            # Si era critica por desparasitación, pero el estado NO es de riesgo,
            # solo la marcamos si el estado no es 'Saludable' o 'Vendido'/'Muerto'
            if self.cat_estado and self.cat_estado.nombre in ['Saludable', 'Vendido', 'Muerto', 'Gestante', 'Lactancia', 'Parto Reciente', 'Secado']:
                salud_critica = False
                razon_critica = None

        if salud_critica: score -= 30

        return {
            'id': self.id,
            'especie_id': self.especie_id,
            'especie': self.cat_especie.nombre if self.cat_especie else 'N/A',
            'raza_id': self.raza_id,
            'raza': self.cat_raza.nombre if self.cat_raza else 'N/A',
            'sexo_id': self.sexo_id,
            'sexo': self.cat_sexo.nombre if self.cat_sexo else 'N/A',
            'fecha_nacimiento': self.fecha_nacimiento,
            'edad': self.edad,
            'peso': self.peso,
            'estado_id': self.estado_id,
            'estado': self.cat_estado.nombre if self.cat_estado else 'N/A',
            'padre_id': self.padre_id,
            'madre_id': self.madre_id,
            'codigo_identificacion': self.codigo_identificacion,
            'observaciones': self.observaciones,
            'lote_id': self.lote_id,
            'lote': self.lote.nombre if self.lote else None,
            'foto_url': self.foto_url,
            'fecha_ingreso': self.fecha_ingreso.strftime('%Y-%m-%d') if self.fecha_ingreso else None,
            'score_genetico': min(100, max(0, score)),
            'salud_critica': salud_critica,
            'razon_critica': razon_critica,
            'tiene_plan_activo': db.session.query(db.exists().where(db.and_(PlanNutricional.animal_id == self.id, PlanNutricional.activo == True))).scalar()
        }

# Modelo: Historial de Cambios
# Auditoría: Registra cuando se modifican campos críticos de un animal (ej. cambio de peso o corrección de datos)
class HistorialCambios(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id'), nullable=True) # Nullable para soportar borrados
    campo = db.Column(db.String(50), nullable=False)       # Campo modificado
    valor_anterior = db.Column(db.String(100))             # Valor antes del cambio
    valor_nuevo = db.Column(db.String(100), nullable=False)# Nuevo valor
    fecha_cambio = db.Column(db.DateTime, default=datetime.utcnow) # Cuándo ocurrió
    usuario = db.Column(db.String(50), default='admin')    # Quién hizo el cambio
    accion = db.Column(db.String(20), default='EDIT')      # ADD, EDIT, DELETE

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'campo': self.campo,
            'valor_anterior': self.valor_anterior,
            'valor_nuevo': self.valor_nuevo,
            'fecha_cambio': self.fecha_cambio.strftime('%Y-%m-%d %H:%M:%S'),
            'usuario': self.usuario,
            'accion': self.accion
        }

# Modelo: Historial Médico
# Registro clínico de eventos pasados: enfermedades, tratamientos, chequeos.
class HistorialMedico(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id'), nullable=False)
    
    # NORMALIZACIÓN: Tipo de evento médico
    tipo_id = db.Column(db.Integer, db.ForeignKey('tipo_evento_medico.id'), nullable=False)
    
    descripcion = db.Column(db.String(200), nullable=False) # Detalles del evento
    fecha = db.Column(db.DateTime, default=datetime.utcnow) # Fecha del suceso
    
    # NORMALIZACIÓN: Veterinario (ID de Usuario)
    veterinario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    
    cat_tipo = db.relationship('TipoEventoMedico')
    cat_veterinario = db.relationship('Usuario')

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'tipo_id': self.tipo_id,
            'tipo': self.cat_tipo.nombre if self.cat_tipo else 'N/A',
            'descripcion': self.descripcion,
            'fecha': self.fecha.strftime('%Y-%m-%d %H:%M'),
            'veterinario_id': self.veterinario_id,
            'veterinario': self.cat_veterinario.nombre_completo if self.cat_veterinario else 'Dr. Default'
        }

# Modelo: Expediente Médico Detallado
# Información estática o a largo plazo sobre la salud del animal ( alergias, genética)
class ExpedienteMedico(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Relación 1 a 1 con Ganado (un animal tiene un único expediente base)
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id'), nullable=False, unique=True)
    tipo_sangre = db.Column(db.String(10), nullable=True)
    alergias = db.Column(db.String(500), default='Ninguna')
    condiciones_cronicas = db.Column(db.String(500), default='Ninguna')
    antecedentes_geneticos = db.Column(db.String(500), default='Sin registro')
    notas_generales = db.Column(db.String(1000), default='')
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    ultima_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'tipo_sangre': self.tipo_sangre,
            'alergias': self.alergias,
            'condiciones_cronicas': self.condiciones_cronicas,
            'antecedentes_geneticos': self.antecedentes_geneticos,
            'notas_generales': self.notas_generales,
            'fecha_creacion': self.fecha_creacion.strftime('%Y-%m-%d'),
            'ultima_actualizacion': self.ultima_actualizacion.strftime('%Y-%m-%d')
        }

# Modelo: Vacuna
# Catálogo de vacunas disponibles en el sistema
class Vacuna(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    
    # NORMALIZACIÓN: Especie vinculada
    especie_id = db.Column(db.Integer, db.ForeignKey('especie.id'), nullable=False)
    
    dosis = db.Column(db.String(50))
    intervalo_meses = db.Column(db.Integer, default=12) # Frecuencia recomendada

    cat_especie = db.relationship('Especie')

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'especie_id': self.especie_id,
            'especie': self.cat_especie.nombre if self.cat_especie else 'N/A',
            'dosis': self.dosis,
            'intervalo_meses': self.intervalo_meses
        }

# Modelo: Registro de Peso
# Almacena el historial de crecimiento. Permite generar gráficas de evolución.
class RegistroPeso(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id'), nullable=False)
    peso = db.Column(db.Float, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'peso': self.peso,
            'fecha': self.fecha.strftime('%Y-%m-%d %H:%M:%S')
        }

# Modelo: Plan Nutricional
# Define la dieta asignada a un animal.
class PlanNutricional(db.Model):
    __tablename__ = 'plan_nutricional'
    
    id = db.Column(db.Integer, primary_key=True)
    # INTEGRIDAD REFERENCIAL: Vinculado formalmente al animal con borrado en cascada
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id', ondelete='CASCADE'), nullable=False)
    
    # NORMALIZACIÓN: Tipo de alimentación
    tipo_alimentacion_id = db.Column(db.Integer, db.ForeignKey('tipo_alimentacion.id'), nullable=False)
    
    cantidad_forraje = db.Column(db.Float, nullable=False)  # Kg de alimento verde
    cantidad_concentrado = db.Column(db.Float, nullable=False)  # Kg de alimento procesado
    minerales = db.Column(db.String(200))
    vitaminas = db.Column(db.String(200))
    fecha_inicio = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_fin = db.Column(db.DateTime, nullable=True)
    activo = db.Column(db.Boolean, default=True) # Indica si es la dieta vigente
    observaciones = db.Column(db.String(500))
    # Nuevos campos para mejora nutricional
    agua = db.Column(db.String(100))        # Requerimiento hídrico
    frecuencia = db.Column(db.String(100))  # Frecuencia de alimentación
    suplementos = db.Column(db.String(500)) # Lista de suplementos detallados
    usuario = db.Column(db.String(50), default='admin') # Creador del plan

    cat_tipo = db.relationship('TipoAlimentacion')

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'tipo_alimentacion_id': self.tipo_alimentacion_id,
            'tipo_alimentacion': self.cat_tipo.nombre if self.cat_tipo else 'N/A',
            'cantidad_forraje': self.cantidad_forraje,
            'cantidad_concentrado': self.cantidad_concentrado,
            'minerales': self.minerales,
            'vitaminas': self.vitaminas,
            'fecha_inicio': self.fecha_inicio.strftime('%Y-%m-%d'),
            'fecha_fin': self.fecha_fin.strftime('%Y-%m-%d') if self.fecha_fin else None,
            'activo': self.activo,
            'agua': self.agua,
            'frecuencia': self.frecuencia,
            'suplementos': self.suplementos,
            'observaciones': self.observaciones,
            'usuario': self.usuario
        }

# Modelo: Protocolo de Salud (Eventos Futuros)
# Agenda de actividades veterinarias pendientes.
class ProtocoloSalud(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id'), nullable=False)
    
    # NORMALIZACIÓN: Tipo de protocolo
    tipo_protocolo_id = db.Column(db.Integer, db.ForeignKey('tipo_protocolo.id'), nullable=False)
    
    descripcion = db.Column(db.String(500), nullable=False)
    fecha_programada = db.Column(db.DateTime, nullable=False)   # Cuándo se debe hacer
    fecha_realizada = db.Column(db.DateTime, nullable=True)     # Cuándo se hizo (si ya se hizo)
    
    # NORMALIZACIÓN: Veterinario (ID de Usuario)
    veterinario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    
    # NORMALIZACIÓN: Estado referenciado
    estado_id = db.Column(db.Integer, db.ForeignKey('estado_protocolo.id'), nullable=False)
    
    notas = db.Column(db.String(500))
    medicamento = db.Column(db.String(100)) # Nuevo: Producto usado
    dosis = db.Column(db.String(50))        # Nuevo: Cantidad dosis

    cat_tipo = db.relationship('TipoProtocolo')
    cat_veterinario = db.relationship('Usuario')
    cat_estado_p = db.relationship('EstadoProtocolo')

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'tipo_protocolo_id': self.tipo_protocolo_id,
            'tipo_protocolo': self.cat_tipo.nombre if self.cat_tipo else 'N/A',
            'descripcion': self.descripcion,
            'fecha_programada': self.fecha_programada.strftime('%Y-%m-%d %H:%M'),
            'fecha_realizada': self.fecha_realizada.strftime('%Y-%m-%d %H:%M') if self.fecha_realizada else None,
            'veterinario_id': self.veterinario_id,
            'veterinario': self.cat_veterinario.nombre_completo if self.cat_veterinario else 'N/A',
            'estado_id': self.estado_id,
            'estado': self.cat_estado_p.nombre if self.cat_estado_p else 'N/A',
            'notas': self.notas,
            'medicamento': self.medicamento,
            'dosis': self.dosis
        }

# Modelo: Predicción de Productividad
# Almacena resultados de algoritmos predictivos sobre el crecimiento futuro
class PrediccionProductividad(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id'), nullable=False)
    peso_estimado_6m = db.Column(db.Float) # Proyección a 6 meses
    ganancia_diaria_esperada = db.Column(db.Float)
    indice_conversion = db.Column(db.Float)
    edad_reproductiva_estimada = db.Column(db.DateTime, nullable=True)
    fecha_prediccion = db.Column(db.DateTime, default=datetime.utcnow)
    confiabilidad = db.Column(db.Float)  # Nivel de confianza del algoritmo (0-100%)

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'peso_estimado_6m': self.peso_estimado_6m,
            'ganancia_diaria_esperada': self.ganancia_diaria_esperada,
            'indice_conversion': self.indice_conversion,
            'edad_reproductiva_estimada': self.edad_reproductiva_estimada.strftime('%Y-%m-%d') if self.edad_reproductiva_estimada else None,
            'fecha_prediccion': self.fecha_prediccion.strftime('%Y-%m-%d'),
            'confiabilidad': self.confiabilidad
        }

# Modelo: Análisis Avanzado
# Guarda resultados complejos como análisis genéticos o evaluaciones multicriterio
class AnalisisAvanzado(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id'), nullable=False)
    tipo_analisis = db.Column(db.String(100), nullable=False)  # Genealógico, Genético, Productivo
    parametros = db.Column(db.String(500))   # Inputs usados
    resultados = db.Column(db.String(1000))  # Resultados serializados
    fecha_analisis = db.Column(db.DateTime, default=datetime.utcnow)
    recomendaciones = db.Column(db.String(500))
    puntaje = db.Column(db.Float)  # Calificación general (Score)

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'tipo_analisis': self.tipo_analisis,
            'parametros': self.parametros,
            'resultados': self.resultados,
            'fecha_analisis': self.fecha_analisis.strftime('%Y-%m-%d'),
            'recomendaciones': self.recomendaciones,
            'puntaje': self.puntaje
        }

# Modelo: Plan de Maternidad
# Gestiona el ciclo reproductivo, gestación y lactancia.
class PlanMaternidad(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id'), nullable=False)
    
    # NORMALIZACIÓN: Tipo de plan reproductivo
    tipo_plan_id = db.Column(db.Integer, db.ForeignKey('tipo_plan_reproductivo.id'), nullable=False)
    
    fecha_inicio = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_probable_parto = db.Column(db.DateTime, nullable=True)
    controles_realizados = db.Column(db.Integer, default=0)
    estado_salud_fetal = db.Column(db.String(100), default='No evaluado')
    recomendaciones_veterinarias = db.Column(db.Text)
    observaciones = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)

    cat_tipo = db.relationship('TipoPlanReproductivo')

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'tipo_plan_id': self.tipo_plan_id,
            'tipo_plan': self.cat_tipo.nombre if self.cat_tipo else 'N/A',
            'fecha_inicio': self.fecha_inicio.strftime('%Y-%m-%d'),
            'fecha_probable_parto': self.fecha_probable_parto.strftime('%Y-%m-%d') if self.fecha_probable_parto else None,
            'controles_realizados': self.controles_realizados,
            'estado_salud_fetal': self.estado_salud_fetal,
            'recomendaciones_veterinarias': self.recomendaciones_veterinarias,
            'observaciones': self.observaciones,
            'activo': self.activo
        }

# Modelo: Inventario de Insumos
# Gestión de stock de medicina, alimentación y herramientas
class Insumo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    
    # NORMALIZACIÓN: Categoría de insumo
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria_insumo.id'), nullable=False)
    
    cantidad = db.Column(db.Float, default=0)
    
    # NORMALIZACIÓN: Unidad de medida
    unidad_id = db.Column(db.Integer, db.ForeignKey('unidad_medida.id'), nullable=False)
    
    stock_minimo = db.Column(db.Float, default=5)
    fecha_vencimiento = db.Column(db.Date, nullable=True)
    ubicacion = db.Column(db.String(100), nullable=True)
    nota = db.Column(db.String(200), nullable=True)

    cat_categoria = db.relationship('CategoriaInsumo')
    cat_unidad = db.relationship('UnidadMedida')

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'categoria_id': self.categoria_id,
            'categoria': self.cat_categoria.nombre if self.cat_categoria else 'N/A',
            'cantidad': self.cantidad,
            'unidad_id': self.unidad_id,
            'unidad': self.cat_unidad.nombre if self.cat_unidad else 'N/A',
            'stock_minimo': self.stock_minimo,
            'fecha_vencimiento': self.fecha_vencimiento.strftime('%Y-%m-%d') if self.fecha_vencimiento else None,
            'ubicacion': self.ubicacion,
            'nota': self.nota,
            'estado_stock': 'Bajo' if self.cantidad <= self.stock_minimo else 'Optimo'
        }

# Modelo: Historial de Insumos (Auditoría de Inventario)
# Registra cada movimiento de entrada, salida o ajuste.
class HistorialInsumo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumo.id'), nullable=False)
    tipo_movimiento = db.Column(db.String(50), nullable=False) # 'AGREGAR', 'EDITAR', 'ELIMINAR', 'AJUSTE'
    cantidad_cambio = db.Column(db.String(100), nullable=False) # Descripción del cambio (ej. "+50", "Nombre cambiado")
    stock_nuevo = db.Column(db.Float, nullable=True) # Stock tras el cambio
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    usuario = db.Column(db.String(50), default='admin') # Quién hizo el movimiento

    # Relación para acceder al nombre del insumo si se borra (aunque si se borra el insumo, esto podría fallar si no es set null, pero por ahora restrict o cascade en definición DB)
    # Para auditoría, idealmente guardamos el nombre snapshot, pero usaremos relación por ahora.
    insumo_rel = db.relationship('Insumo', backref='historial')

    def to_dict(self):
        return {
            'id': self.id,
            'insumo_id': self.insumo_id,
            'nombre_insumo': self.insumo_rel.nombre if self.insumo_rel else 'Insumo Eliminado',
            'tipo_movimiento': self.tipo_movimiento,
            'cantidad_cambio': self.cantidad_cambio,
            'stock_nuevo': self.stock_nuevo,
            'fecha': self.fecha.strftime('%Y-%m-%d %H:%M:%S'),
            'usuario': self.usuario
        }

# Modelo: Log de Errores
# Almacena errores del sistema para depuración y monitoreo
class ErrorLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mensaje = db.Column(db.String(500), nullable=False)
    zona = db.Column(db.String(100), nullable=False) # Area donde ocurrió: 'Frontend', 'Backend', 'Grafos', etc.
    detalles = db.Column(db.Text) # Stack trace o info adicional
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    usuario = db.Column(db.String(50), default='Desconocido')

    def to_dict(self):
        return {
            'id': self.id,
            'mensaje': self.mensaje,
            'zona': self.zona,
            'detalles': self.detalles,
            'fecha': self.fecha.strftime('%Y-%m-%d %H:%M:%S'),
            'usuario': self.usuario
        }

# ==============================================================================
# NUEVOS MODELOS - FASE 2: FUNCIONALIDADES EXPANDIDAS
# ==============================================================================

# Modelo: Lote (Agrupación de Animales)
# Permite organizar animales en grupos por propósito (engorde, cría, producción)
class Lote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    descripcion = db.Column(db.Text, nullable=True)
    proposito = db.Column(db.String(100), nullable=False, default='General')  # Engorde, Cría, Producción, Cuarentena
    capacidad_maxima = db.Column(db.Integer, nullable=True)  # Límite de animales
    ubicacion = db.Column(db.String(200), nullable=True)     # Potrero o área
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    color = db.Column(db.String(7), default='#22c55e')       # Color para visualización (hex)
    responsable = db.Column(db.String(100), nullable=True)    # Persona a cargo
    
    def to_dict(self):
        count = Ganado.query.filter_by(lote_id=self.id).count() if self.id else 0
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'proposito': self.proposito,
            'capacidad_maxima': self.capacidad_maxima,
            'ubicacion': self.ubicacion,
            'activo': self.activo,
            'fecha_creacion': self.fecha_creacion.strftime('%Y-%m-%d'),
            'color': self.color,
            'responsable': self.responsable,
            'cantidad_animales': count,
            'ocupacion_porcentaje': round((count / self.capacidad_maxima) * 100, 1) if self.capacidad_maxima and self.capacidad_maxima > 0 else 0
        }

# Modelo: Registro de Producción
# Seguimiento diario de producción (leche, lana, huevos, etc.)
class RegistroProduccion(db.Model):
    __tablename__ = 'registro_produccion'
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id', ondelete='CASCADE'), nullable=False)
    tipo_produccion = db.Column(db.String(50), nullable=False)  # Leche, Lana, Carne, Huevos
    cantidad = db.Column(db.Float, nullable=False)               # Cantidad producida
    unidad = db.Column(db.String(20), nullable=False, default='litros')  # litros, kg, unidades
    calidad = db.Column(db.String(50), nullable=True)            # Premium, Estándar, Baja
    # Datos específicos de leche
    grasa_porcentaje = db.Column(db.Float, nullable=True)        # % de grasa
    proteina_porcentaje = db.Column(db.Float, nullable=True)     # % de proteína
    celulas_somaticas = db.Column(db.Integer, nullable=True)     # Conteo de células somáticas
    # Metadata
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    turno = db.Column(db.String(20), default='Mañana')           # Mañana, Tarde, Noche
    observaciones = db.Column(db.Text, nullable=True)
    usuario = db.Column(db.String(50), default='admin')
    
    animal = db.relationship('Ganado', backref='producciones')

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'animal_info': f"#{self.animal_id} - {self.animal.cat_especie.nombre if self.animal and self.animal.cat_especie else 'N/A'}",
            'tipo_produccion': self.tipo_produccion,
            'cantidad': self.cantidad,
            'unidad': self.unidad,
            'calidad': self.calidad,
            'grasa_porcentaje': self.grasa_porcentaje,
            'proteina_porcentaje': self.proteina_porcentaje,
            'celulas_somaticas': self.celulas_somaticas,
            'fecha': self.fecha.strftime('%Y-%m-%d %H:%M'),
            'turno': self.turno,
            'observaciones': self.observaciones,
            'usuario': self.usuario
        }

# Modelo: Movimiento Financiero
# Registro de ingresos y gastos de la finca
class MovimientoFinanciero(db.Model):
    __tablename__ = 'movimiento_financiero'
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(20), nullable=False)              # Ingreso, Gasto
    categoria = db.Column(db.String(100), nullable=False)        # Venta Animal, Leche, Alimento, Veterinario, etc.
    subcategoria = db.Column(db.String(100), nullable=True)      # Sub-categoría detallada
    monto = db.Column(db.Float, nullable=False)                  # Monto en moneda local
    moneda = db.Column(db.String(10), default='USD')             # USD, BS, etc.
    descripcion = db.Column(db.Text, nullable=True)
    # Referencias opcionales
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id', ondelete='SET NULL'), nullable=True)
    lote_id = db.Column(db.Integer, db.ForeignKey('lote.id', ondelete='SET NULL'), nullable=True)
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumo.id', ondelete='SET NULL'), nullable=True)
    # Comprobante
    numero_factura = db.Column(db.String(50), nullable=True)
    proveedor_cliente = db.Column(db.String(200), nullable=True)  # A quién se le compró o vendió
    # Metadata
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_vencimiento = db.Column(db.Date, nullable=True)        # Para pagos pendientes
    estado = db.Column(db.String(20), default='Completado')      # Completado, Pendiente, Cancelado
    usuario = db.Column(db.String(50), default='admin')
    
    animal = db.relationship('Ganado', backref='movimientos_financieros')

    def to_dict(self):
        return {
            'id': self.id,
            'tipo': self.tipo,
            'categoria': self.categoria,
            'subcategoria': self.subcategoria,
            'monto': self.monto,
            'moneda': self.moneda,
            'descripcion': self.descripcion,
            'animal_id': self.animal_id,
            'lote_id': self.lote_id,
            'insumo_id': self.insumo_id,
            'numero_factura': self.numero_factura,
            'proveedor_cliente': self.proveedor_cliente,
            'fecha': self.fecha.strftime('%Y-%m-%d %H:%M'),
            'fecha_vencimiento': self.fecha_vencimiento.strftime('%Y-%m-%d') if self.fecha_vencimiento else None,
            'estado': self.estado,
            'usuario': self.usuario
        }

# Modelo: Evento del Calendario
# Agenda de actividades y recordatorios de la finca
class EventoCalendario(db.Model):
    __tablename__ = 'evento_calendario'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    tipo = db.Column(db.String(50), nullable=False)  # Vacunación, Parto, Destete, Rotación, Veterinario, Reunión, Otro
    color = db.Column(db.String(7), default='#3b82f6')  # Color del evento en calendario
    # Fechas
    fecha_inicio = db.Column(db.DateTime, nullable=False)
    fecha_fin = db.Column(db.DateTime, nullable=True)
    todo_el_dia = db.Column(db.Boolean, default=False)
    # Recurrencia
    recurrente = db.Column(db.Boolean, default=False)
    patron_recurrencia = db.Column(db.String(50), nullable=True)  # diario, semanal, mensual, anual
    # Referencias opcionales
    animal_id = db.Column(db.Integer, db.ForeignKey('ganado.id', ondelete='SET NULL'), nullable=True)
    lote_id = db.Column(db.Integer, db.ForeignKey('lote.id', ondelete='SET NULL'), nullable=True)
    protocolo_id = db.Column(db.Integer, db.ForeignKey('protocolo_salud.id', ondelete='SET NULL'), nullable=True)
    # Estado y metadata
    completado = db.Column(db.Boolean, default=False)
    prioridad = db.Column(db.String(20), default='Media')  # Alta, Media, Baja
    recordatorio_minutos = db.Column(db.Integer, default=60)  # Minutos antes para avisar
    usuario_creador = db.Column(db.String(50), default='admin')
    usuario_asignado = db.Column(db.String(100), nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    animal = db.relationship('Ganado', backref='eventos')

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'tipo': self.tipo,
            'color': self.color,
            'fecha_inicio': self.fecha_inicio.strftime('%Y-%m-%dT%H:%M'),
            'fecha_fin': self.fecha_fin.strftime('%Y-%m-%dT%H:%M') if self.fecha_fin else None,
            'todo_el_dia': self.todo_el_dia,
            'recurrente': self.recurrente,
            'patron_recurrencia': self.patron_recurrencia,
            'animal_id': self.animal_id,
            'lote_id': self.lote_id,
            'protocolo_id': self.protocolo_id,
            'completado': self.completado,
            'prioridad': self.prioridad,
            'recordatorio_minutos': self.recordatorio_minutos,
            'usuario_creador': self.usuario_creador,
            'usuario_asignado': self.usuario_asignado,
            'fecha_creacion': self.fecha_creacion.strftime('%Y-%m-%d %H:%M')
        }

# Función: Inicialización de DB
# Configura Flask-SQLAlchemy y crea las tablas si no existen
def init_db(app):
    import os
    # Usar la ruta de base de datos desde el entorno si está disponible
    # Esto permite que el ejecutable guarde la BD en su carpeta
    db_path = os.environ.get('DATABASE_PATH', 'ganado.db')
    instance_path = os.environ.get('INSTANCE_PATH')
    
    if instance_path:
        app.instance_path = instance_path
    
    # Si db_path es una ruta absoluta, usarla directamente
    if os.path.isabs(db_path):
        db_uri = f'sqlite:///{db_path}'
    else:
        db_uri = f'sqlite:///{db_path}'
    
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    with app.app_context():
        db.create_all()
        # Asegurar que los catálogos básicos existan
        seed_catalogs()

def obtener_todos(page=None, per_page=10, search_query=None, specie_filter=None, health_filter=None, sex_filter=None):
    """
    Retorna la lista de animales con soporte opcional para filtros y paginación.
    Utiliza joinedload para pre-cargar relaciones y join explicito para filtrado.
    """
    from sqlalchemy.orm import joinedload
    query = Ganado.query.options(
        joinedload(Ganado.cat_especie),
        joinedload(Ganado.cat_raza),
        joinedload(Ganado.cat_estado),
        joinedload(Ganado.cat_sexo),
        joinedload(Ganado.lote)
    )

    # Conjunto para rastrear tablas ya unidas y evitar errores de duplicación
    joined_tables = set()

    # Filtrado por búsqueda textual
    if search_query:
        query = query.join(Especie).join(Raza)
        joined_tables.add('especie')
        joined_tables.add('raza')
        query = query.filter(
            (Ganado.id.cast(db.String).ilike(f"%{search_query}%")) |
            (Ganado.codigo_identificacion.ilike(f"%{search_query}%")) |
            (Especie.nombre.ilike(f"%{search_query}%")) |
            (Raza.nombre.ilike(f"%{search_query}%"))
        )

    # Filtro por Especie
    if specie_filter and specie_filter not in ['all', 'Todas']:
        if 'especie' not in joined_tables:
            query = query.join(Especie)
            joined_tables.add('especie')
        query = query.filter(Especie.nombre == specie_filter)

    # Filtro por Sexo
    if sex_filter:
        query = query.join(Sexo) # Sexo se asume no unido previamente por búsqueda
        query = query.filter(Sexo.nombre == sex_filter)

    # Filtros de Salud y Nutrición
    if health_filter and health_filter != 'all':
        if health_filter == 'critical':
            query = query.filter(Ganado.cat_estado.has(EstadoAnimal.nombre == 'Crítico'))
        elif health_filter == 'nutrition':
            from models import PlanNutricional
            query = query.filter(Ganado.planes_nutricionales.any(PlanNutricional.activo == True))

    # Ordenar por ID descendente
    query = query.order_by(Ganado.id.desc())

    if page:
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            'items': [a.to_dict() for a in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': pagination.page
        }
    
    return [a.to_dict() for a in query.all()]
def guardar_o_actualizar(datos_animal, usuario_cambio='admin'):
    from services.animal_service import calcular_edad
    # Calcular edad basada en fecha de nacimiento
    edad = calcular_edad(datos_animal['fecha_nacimiento'])
    
    # NORMALIZACIÓN: Resolver IDs de especie y raza si vienen nombres
    especie_id = datos_animal.get('especie_id')
    raza_id = datos_animal.get('raza_id')
    
    if not especie_id and 'especie' in datos_animal:
        e = Especie.query.filter_by(nombre=datos_animal['especie']).first()
        if e: 
            especie_id = e.id
        else:
            # Crear especie si no existe
            e = Especie(nombre=datos_animal['especie'])
            db.session.add(e)
            db.session.flush()
            especie_id = e.id
        
    if not raza_id and 'raza' in datos_animal:
        r = Raza.query.filter_by(nombre=datos_animal['raza'], especie_id=especie_id).first()
        if r: 
            raza_id = r.id
        else:
            # Crear raza si no existe
            r = Raza(nombre=datos_animal['raza'], especie_id=especie_id)
            db.session.add(r)
            db.session.flush()
            raza_id = r.id

    estado_id = datos_animal.get('estado_id')
    if not estado_id and 'estado' in datos_animal:
        e = EstadoAnimal.query.filter_by(nombre=datos_animal['estado']).first()
        if e: 
            estado_id = e.id
        else:
            # Default to Saludable if not found or create?
            e = EstadoAnimal.query.filter_by(nombre='Saludable').first()
            if e: estado_id = e.id

    sexo_id = datos_animal.get('sexo_id')
    if not sexo_id and 'sexo' in datos_animal:
        s = Sexo.query.filter_by(nombre=datos_animal['sexo']).first()
        if s:
            sexo_id = s.id
        else:
            # Default or create
            s = Sexo(nombre=datos_animal['sexo'])
            db.session.add(s)
            db.session.flush()
            sexo_id = s.id

    # Si viene con ID, es una actualización
    if datos_animal.get('id'):
        animal = Ganado.query.get(datos_animal['id'])
        if animal:
            # Detectar cambios para el historial de auditoría
            cambios = []
            
            # Helper para registrar cambios de forma segura
            def registrar_si_cambia(campo, valor_anterior, valor_nuevo, mostrar_anterior=None, mostrar_nuevo=None):
                if valor_nuevo is not None and str(valor_anterior) != str(valor_nuevo):
                    cambios.append((campo, str(mostrar_anterior or valor_anterior), str(mostrar_nuevo or valor_nuevo)))

            registrar_si_cambia('especie', animal.especie_id, especie_id, 
                               animal.cat_especie.nombre if animal.cat_especie else 'N/A', 
                               datos_animal.get('especie'))
            
            registrar_si_cambia('raza', animal.raza_id, raza_id, 
                               animal.cat_raza.nombre if animal.cat_raza else 'N/A', 
                               datos_animal.get('raza'))
            
            registrar_si_cambia('sexo', animal.sexo_id, sexo_id, 
                               animal.cat_sexo.nombre if animal.cat_sexo else 'N/A', 
                               datos_animal.get('sexo'))
            
            registrar_si_cambia('fecha_nacimiento', animal.fecha_nacimiento, datos_animal.get('fecha_nacimiento'))
            registrar_si_cambia('peso', animal.peso, datos_animal.get('peso'))
            
            registrar_si_cambia('estado', animal.estado_id, estado_id, 
                               animal.cat_estado.nombre if animal.cat_estado else 'N/A', 
                               datos_animal.get('estado'))
            
            # NUEVO: Registrar cambios en genealogía
            registrar_si_cambia('padre_id', animal.padre_id, datos_animal.get('padre_id'))
            registrar_si_cambia('madre_id', animal.madre_id, datos_animal.get('madre_id'))

            # Guardar cada cambio detectado en HistorialCambios
            for campo, anterior, nuevo in cambios:
                historial = HistorialCambios(
                    animal_id=animal.id,
                    campo=campo,
                    valor_anterior=anterior,
                    valor_nuevo=nuevo,
                    usuario=usuario_cambio,
                    accion='EDIT'
                )
                db.session.add(historial)

                # Si cambió el peso, añadir también a RegistroPeso para gráficas
                if campo == 'peso':
                    rp = RegistroPeso(animal_id=animal.id, peso=float(nuevo))
                    db.session.add(rp)

            # Actualizar objeto animal
            if especie_id: animal.especie_id = especie_id
            if raza_id: animal.raza_id = raza_id
            if sexo_id: animal.sexo_id = sexo_id
            if datos_animal.get('fecha_nacimiento'):
                animal.fecha_nacimiento = datos_animal['fecha_nacimiento']
                animal.edad = edad
            if datos_animal.get('peso'):
                animal.peso = float(datos_animal['peso'])
            if estado_id: animal.estado_id = estado_id
            
            # Genealogía
            animal.padre_id = datos_animal.get('padre_id') if datos_animal.get('padre_id') not in ['', None] else None
            animal.madre_id = datos_animal.get('madre_id') if datos_animal.get('madre_id') not in ['', None] else None
    else:
        # Creación de nuevo animal
        animal = Ganado(
            especie_id=especie_id,
            raza_id=raza_id,
            sexo_id=sexo_id,
            fecha_nacimiento=datos_animal.get('fecha_nacimiento'),
            edad=edad,
            peso=float(datos_animal.get('peso', 0)),
            estado_id=estado_id,
            padre_id=datos_animal.get('padre_id') if datos_animal.get('padre_id') not in ['', None] else None,
            madre_id=datos_animal.get('madre_id') if datos_animal.get('madre_id') not in ['', None] else None
        )
        db.session.add(animal)
        db.session.flush()
        rp = RegistroPeso(animal_id=animal.id, peso=float(datos_animal.get('peso', 0)))
        db.session.add(rp)

        # Log Creation
        historial = HistorialCambios(
            animal_id=animal.id,
            campo='Creación',
            valor_anterior='-',
            valor_nuevo='Alta en Sistema',
            usuario=usuario_cambio,
            accion='ADD'
        )
        db.session.add(historial)
    
    db.session.commit()
    return animal.id


def obtener_pesos_animal(id):
    """Recupera todo el historial de pesos ordenado cronológicamente."""
    registros = RegistroPeso.query.filter_by(animal_id=id).order_by(RegistroPeso.fecha.asc()).all()
    return [r.to_dict() for r in registros]


def seed_catalogs():
    """Poblar base de datos con catálogos iniciales (Razas y Especies comunes)."""
    # Lista predefinida de especies y razas populares
    especies_razas = {
        'Bovino': ['Holstein', 'Angus', 'Jersey', 'Brahman', 'Simmental', 'Hereford', 'Limousin', 'Charolais', 'Brangus', 'Pardo Suizo'],
        'Ovino': ['Merino', 'Suffolk', 'Dorper', 'Hampshire', 'Texel', 'Romney'],
        'Caprino': ['Saanen', 'Alpina', 'Nubiana', 'Boer', 'Angora'],
        'Porcino': ['Yorkshire', 'Duroc', 'Hampshire', 'Landrace', 'Berkshire'],
        'Equino': ['Pura Sangre', 'Cuarto de Milla', 'Andaluz', 'Lusitano', 'Hispano'],
        'Otro': ['Otro / No definido']
    }
    # Iterar y crear si no existen
    for especie_nombre, razas in especies_razas.items():
        especie = Especie.query.filter_by(nombre=especie_nombre).first()
        if not especie:
            especie = Especie(nombre=especie_nombre)
            db.session.add(especie)
            db.session.flush()
        for raza_nombre in razas:
            existente = Raza.query.filter_by(nombre=raza_nombre, especie_id=especie.id).first()
            if not existente:
                r = Raza(nombre=raza_nombre, especie_id=especie.id)
                db.session.add(r)
    
    # Poblar estados (Incluyendo estados de maternidad)
    estados = ['Saludable', 'Enfermo', 'Crítico', 'Cuarentena', 'En Observación', 'Vendido', 'Muerto', 'Gestante', 'Lactancia', 'Parto Reciente', 'Secado']
    for e_nombre in estados:
        if not EstadoAnimal.query.filter_by(nombre=e_nombre).first():
            db.session.add(EstadoAnimal(nombre=e_nombre))

    # Poblar tipos de eventos médicos
    tipos_medicos = ['Vacuna', 'Tratamiento', 'Enfermedad', 'Cirugía', 'Chequeo General', 'Parto', 'Desparasitación']
    for t_nombre in tipos_medicos:
        if not TipoEventoMedico.query.filter_by(nombre=t_nombre).first():
            db.session.add(TipoEventoMedico(nombre=t_nombre))

    # Poblar categorías de insumos
    categorias_insumos = ['Médico', 'Alimenticio', 'Operativo', 'Herramienta', 'Limpieza']
    for c_nombre in categorias_insumos:
        if not CategoriaInsumo.query.filter_by(nombre=c_nombre).first():
            db.session.add(CategoriaInsumo(nombre=c_nombre))

    # Poblar unidades de medida
    unidades = ['ml', 'dosis', 'kg', 'unidad', 'saco', 'litro', 'gramo', 'bolsa']
    for u_nombre in unidades:
        if not UnidadMedida.query.filter_by(nombre=u_nombre).first():
            db.session.add(UnidadMedida(nombre=u_nombre))

    # Poblar tipos de alimentación
    tipos_alim = ['Pastoreo', 'Intensivo', 'Suplementación', 'Lactancia', 'Finalización']
    for ta_nombre in tipos_alim:
        if not TipoAlimentacion.query.filter_by(nombre=ta_nombre).first():
            db.session.add(TipoAlimentacion(nombre=ta_nombre))

    # Poblar tipos de protocolos
    tipos_prot = ['Desparasitación', 'Vacunación', 'Chequeo', 'Pesaje', 'Sincronización']
    for tp_nombre in tipos_prot:
        if not TipoProtocolo.query.filter_by(nombre=tp_nombre).first():
            db.session.add(TipoProtocolo(nombre=tp_nombre))

    # Poblar tipos de planes reproductivos
    tipos_rep = ['Gestación', 'Lactancia', 'Secado', 'Recuperación', 'Inseminación']
    for tr_nombre in tipos_rep:
        if not TipoPlanReproductivo.query.filter_by(nombre=tr_nombre).first():
            db.session.add(TipoPlanReproductivo(nombre=tr_nombre))

    # Poblar sexos
    sexos = ['Macho', 'Hembra', 'Castrado']
    for s_nombre in sexos:
        if not Sexo.query.filter_by(nombre=s_nombre).first():
            db.session.add(Sexo(nombre=s_nombre))

    # Poblar estados de protocolo
    est_prot = ['Pendiente', 'En Proceso', 'Realizado', 'Cancelado', 'Pospuesto']
    for ep_nombre in est_prot:
        if not EstadoProtocolo.query.filter_by(nombre=ep_nombre).first():
            db.session.add(EstadoProtocolo(nombre=ep_nombre))

    db.session.commit()

def obtener_estadisticas():
    """Calcular métricas generales para el Dashboard con lógica de salud aumentada."""
    try:
        total = Ganado.query.count()
        if total == 0:
            return 0, 0, 0, 0, 0, 0
        
        # Promedio de peso
        peso_avg = db.session.query(db.func.avg(Ganado.peso)).scalar() or 0
        
        # ALERTAS: Protocolos vencidos + animales en observación + desparasitación pendiente
        fecha_hoy = datetime.now()
        realizado_obj = EstadoProtocolo.query.filter_by(nombre='Realizado').first()
        protocolos_vencidos = ProtocoloSalud.query.filter(
            ProtocoloSalud.estado_id != (realizado_obj.id if realizado_obj else 0), 
            ProtocoloSalud.fecha_programada < fecha_hoy
        ).count()
        
        obs_id = EstadoAnimal.query.filter_by(nombre='En Observación').first()
        animales_observacion = Ganado.query.filter(Ganado.estado_id == obs_id.id).count() if obs_id else 0
        
        # Lógica de desparasitación pendiente
        tipo_desp = TipoEventoMedico.query.filter_by(nombre='Desparasitación').first()
        tipo_desp_id = tipo_desp.id if tipo_desp else 0
        hace_un_mes = datetime.now() - timedelta(days=30)
        ya_desparasitados = db.session.query(HistorialMedico.animal_id).filter(
            HistorialMedico.tipo_id == tipo_desp_id, 
            HistorialMedico.fecha >= hace_un_mes
        ).subquery()
        
        desparasitacion_pendiente = Ganado.query.filter(
            Ganado.edad.in_([3, 4, 6, 7]), 
            ~Ganado.id.in_(ya_desparasitados)
        ).count()

        alertas = protocolos_vencidos + animales_observacion + desparasitacion_pendiente

        # CRÍTICOS: Salud Crítica (Estados de riesgo)
        criticos_status = EstadoAnimal.query.filter(EstadoAnimal.nombre.in_(['Enfermo', 'Crítico', 'Cuarentena'])).all()
        criticos_ids = [s.id for s in criticos_status]
        base_criticos = Ganado.query.filter(Ganado.estado_id.in_(criticos_ids)).count()
        
        # Ya calculado arriba: desparasitacion_pendiente, ya_desparasitados, tipo_desp_id

        # Críticos por desparasitación (>48h de retraso en edad clave)
        # Esto es más difícil de hacer en una sola query SQL sin volverse loco, 
        # así que lo aproximamos o lo hacemos con un contador manual si no son miles.
        omitidos_criticos = 0
        # Solo consideramos omisiones críticas para animales que no están 'Saludables' o 'Vendidos'
        # O mejor dicho, que están en estados que requieren seguimiento activo de salud crítica
        animales_edad_clave = Ganado.query.filter(
            Ganado.edad.in_([3, 6]), 
            ~Ganado.id.in_(ya_desparasitados),
            Ganado.estado_id.in_(criticos_ids) # Solo si ya están en un estado de riesgo
        ).all()
        for a in animales_edad_clave:
            try:
                nac = datetime.strptime(a.fecha_nacimiento, '%Y-%m-%d')
                if datetime.now() > (nac + timedelta(days=a.edad * 30.44) + timedelta(hours=48)):
                    omitidos_criticos += 1
            except: pass

        # Sumamos los omitidos críticos a la cuenta de Críticos
        criticos_totales = base_criticos + omitidos_criticos
        
        # ALERTAS DE INVENTARIO
        from models import Insumo
        proximos_15_dias = datetime.now() + timedelta(days=15)
        inventario_critico = Insumo.query.filter(
            (Insumo.cantidad <= Insumo.stock_minimo) | (Insumo.fecha_vencimiento < proximos_15_dias.date())
        ).count()
        
        return total, round(float(peso_avg), 2), alertas, criticos_totales, omitidos_criticos, inventario_critico
    except Exception as e:
        print(f"Error en obtener_estadisticas: {e}")
        return 0, 0, 0, 0, 0, 0

def obtener_estadisticas_especies():
    """Retorna diccionarios de población y peso promedio por especie."""
    # Población por especie
    r_pob = db.session.query(Especie.nombre, db.func.count(Ganado.id))\
        .join(Ganado, Ganado.especie_id == Especie.id)\
        .group_by(Especie.nombre).all()
    poblacion_por_especie = {nombre: count for nombre, count in r_pob}
    
    # Peso promedio por especie
    r_pes = db.session.query(Especie.nombre, db.func.avg(Ganado.peso))\
        .join(Ganado, Ganado.especie_id == Especie.id)\
        .group_by(Especie.nombre).all()
    peso_por_especie = {nombre: round(float(avg), 2) if avg else 0 for nombre, avg in r_pes}
    
    return poblacion_por_especie, peso_por_especie

def obtener_animal(id):
    """Buscar animal por ID."""
    animal = Ganado.query.get(id)
    return animal.to_dict() if animal else None

def obtener_historial_animal(id):
    """Obtener auditoría de cambios de un animal."""
    return [h.to_dict() for h in HistorialCambios.query.filter_by(animal_id=id).order_by(HistorialCambios.fecha_cambio.desc()).all()]

def obtener_plan_nutricional(animal_id):
    """Obtiene el plan nutricional activo de un animal"""
    plan = PlanNutricional.query.filter_by(animal_id=animal_id, activo=True).first()
    return plan.to_dict() if plan else None

def guardar_plan_nutricional(datos, usuario_creador='admin', auto_commit=True):
    """Guarda o actualiza un plan nutricional"""
    plan_id = datos.get('id')
    animal_id = datos.get('animal_id')
    
    if not animal_id:
        return None

    # 1. Resolver el tipo de alimentación primero para evitar flushes prematuros
    tipo_id = datos.get('tipo_alimentacion_id')
    tipo_nombre = datos.get('tipo_alimentacion') or datos.get('tipo') or 'Pastoreo'
    
    # Limpiamos posibles espacios o nulos extraños
    if isinstance(tipo_nombre, str): tipo_nombre = tipo_nombre.strip()
    if not tipo_nombre: tipo_nombre = 'Pastoreo'

    if not tipo_id:
        ta = TipoAlimentacion.query.filter_by(nombre=tipo_nombre).first()
        if not ta:
            ta = TipoAlimentacion(nombre=tipo_nombre)
            db.session.add(ta)
            db.session.flush() # Este flush es seguro ya que aún no creamos el PlanNutricional
        tipo_id = ta.id

    # Fallback de seguridad si no hay registros
    if not tipo_id:
        ta_def = TipoAlimentacion.query.first()
        if ta_def: 
            tipo_id = ta_def.id
        else:
            # Caso extremo: tabla vacía
            ta_def = TipoAlimentacion(nombre='Pastoreo')
            db.session.add(ta_def)
            db.session.flush()
            tipo_id = ta_def.id

    # 2. Preparar valores numéricos
    try:
        cant_forraje = float(datos.get('cantidad_forraje', datos.get('forraje', 0)) or 0)
        cant_concentrado = float(datos.get('cantidad_concentrado', datos.get('concentrado', 0)) or 0)
    except:
        cant_forraje = 0.0
        cant_concentrado = 0.0

    # 3. Buscar o crear el objeto del plan
    plan = None
    if plan_id:
        plan = PlanNutricional.query.get(plan_id)
    
    if not plan:
        # Desactivar planes anteriores
        PlanNutricional.query.filter_by(animal_id=animal_id, activo=True).update({'activo': False})
        
        # Crear objeto con todos los campos obligatorios al INICIO
        plan = PlanNutricional(
            animal_id=animal_id, 
            tipo_alimentacion_id=tipo_id,
            cantidad_forraje=cant_forraje,
            cantidad_concentrado=cant_concentrado,
            usuario=usuario_creador,
            activo=True
        )
        db.session.add(plan)
    else:
        # Actualizar plan existente
        plan.tipo_alimentacion_id = tipo_id
        plan.cantidad_forraje = cant_forraje
        plan.cantidad_concentrado = cant_concentrado
    
    # 4. Asignar campos opcionales
    plan.minerales = datos.get('minerales', '') or ''
    plan.vitaminas = datos.get('vitaminas', '') or ''
    plan.observaciones = datos.get('observaciones', '') or ''
    plan.agua = datos.get('agua', '') or ''
    plan.frecuencia = datos.get('frecuencia', '') or ''
    plan.suplementos = datos.get('suplementos', '') or ''
    plan.activo = True
    
    if auto_commit:
        db.session.commit()
    else:
        db.session.flush()
    
    return plan.to_dict()
