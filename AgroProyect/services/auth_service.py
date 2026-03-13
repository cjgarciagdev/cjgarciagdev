# ==============================================================================
# MÓDULO DE SEGURIDAD Y CONTROL DE ACCESO (RBAC)
# Este servicio gestiona el ciclo de vida de los usuarios y sus privilegios.
#
# DISEÑO DE PERMISOS:
# Implementa un modelo de Control de Acceso basado en Roles (RBAC). 
# Cada usuario tiene un 'Rol' maestro (Admin, Vet, etc) que pre-configura un set
# de banderas de permisos booleanas en la base de datos.
# ==============================================================================

from models import db
from datetime import datetime, timedelta
from enum import Enum

class RoleEnum(Enum):
    """Roles disponibles en el sistema"""
    ADMIN = "admin"
    VETERINARIO = "veterinario"
    SUPERVISOR = "supervisor"
    OPERADOR = "operador"
    # Roles Especializados (Nuevos)
    NUTRICIONISTA = "nutricionista"
    INVENTARIO = "inventario"
    AUDITOR = "auditor"
    GERENTE = "gerente"

from models import db, Usuario, PreguntaSeguridad

def crear_usuario_defecto(app):
    """Crea un usuario administrador por defecto si no existe"""
    with app.app_context():
        usuario_exists = Usuario.query.filter_by(username='admin').first()
        if not usuario_exists:
            admin = Usuario(
                username='admin',
                email='admin@agro-master.local',
                nombre_completo='Administrador del Sistema',
                rol='admin',
                activo=True,
                puede_crear_animales=True,
                puede_editar_animales=True,
                puede_eliminar_animales=True,
                puede_exportar=True,
                puede_ver_analisis=True,
                puede_gestionar_usuarios=True,
                puede_ver_reportes=True
            )
            admin.set_password('admin123')  # Contraseña por defecto
            db.session.add(admin)
            db.session.commit()
            print("OK: Usuario administrador creado: admin / admin123")

def crear_usuario(username, email, password, nombre_completo, rol='operador', security_questions=None):
    """Crea un nuevo usuario con los permisos estrictamente definidos según su rol"""
    
    # Verificar que no exista
    if Usuario.query.filter_by(username=username).first():
        return None, "El usuario ya existe"
    
    if Usuario.query.filter_by(email=email).first():
        return None, "El email ya está registrado"
    
    # Crear instancia base de usuario
    usuario = Usuario(
        username=username,
        email=email,
        nombre_completo=nombre_completo,
        rol=rol,
        activo=True
    )
    usuario.set_password(password)
    
    # RESET DE PERMISOS (Seguridad: Privilegio Mínimo)
    # Por defecto, todos los permisos sensibles se ponen en False antes de asignar los del rol
    usuario.puede_crear_animales = False
    usuario.puede_editar_animales = False
    usuario.puede_eliminar_animales = False
    usuario.puede_exportar = False
    usuario.puede_ver_analisis = False
    usuario.puede_gestionar_usuarios = False
    usuario.puede_ver_reportes = False
    usuario.puede_gestionar_nutricion = False
    usuario.puede_gestionar_inventario = False
    usuario.puede_gestionar_salud = False
    usuario.puede_gestionar_genealogia = False
    usuario.puede_ver_logs = False
    usuario.puede_aprobar_acciones = False
    usuario.puede_ver_dashboard_completo = False
    usuario.puede_solo_lectura = False

    # ASIGNACIÓN ESTRICTA POR ROL
    # ASIGNACIÓN ESTRICTA POR ROL (Rol Semántico)

    # 1. ADMIN (Dueño / Superusuario)
    if rol == 'admin':
        usuario.puede_crear_animales = True
        usuario.puede_editar_animales = True
        usuario.puede_eliminar_animales = True
        usuario.puede_exportar = True
        usuario.puede_ver_analisis = True
        usuario.puede_gestionar_usuarios = True
        usuario.puede_ver_reportes = True
        usuario.puede_gestionar_nutricion = True
        usuario.puede_gestionar_inventario = True
        usuario.puede_gestionar_salud = True
        usuario.puede_gestionar_genealogia = True
        usuario.puede_ver_logs = True
        usuario.puede_aprobar_acciones = True
        usuario.puede_ver_dashboard_completo = True # Acceso a Finanzas

    # 2. GERENTE (Visión Estratégica - Solo Lectura + Aprobación)
    elif rol == 'gerente':
        usuario.puede_ver_dashboard_completo = True # Acceso a Finanzas y KPIs
        usuario.puede_ver_reportes = True
        usuario.puede_ver_analisis = True
        usuario.puede_ver_logs = True
        usuario.puede_exportar = True
        usuario.puede_aprobar_acciones = True # Autoriza eliminaciones/gastos fuertes
        usuario.puede_solo_lectura = True     # No modifica datos diarios de campo

    # 3. VETERINARIO (Salud y Bienestar Animal)
    elif rol == 'veterinario':
        usuario.puede_gestionar_salud = True
        usuario.puede_gestionar_nutricion = True
        usuario.puede_gestionar_genealogia = True
        usuario.puede_editar_animales = True  # Para actualizar estados/pesos
        usuario.puede_ver_analisis = True     # Ver curvas de crecimiento/salud
        usuario.puede_ver_reportes = True
        usuario.puede_exportar = True
        # Restricciones:
        usuario.puede_crear_animales = False  # No da altas de inventario
        usuario.puede_eliminar_animales = False
        usuario.puede_gestionar_inventario = False # No maneja insumos/finanzas
        usuario.puede_ver_dashboard_completo = False # No ve Finanzas sensibles

    # 4. SUPERVISOR (Jefe de Campo)
    elif rol == 'supervisor':
        usuario.puede_crear_animales = True
        usuario.puede_editar_animales = True
        usuario.puede_gestionar_inventario = True # Maneja stock y producción
        usuario.puede_gestionar_lotes = True      # (Implícito en lógica de Lotes)
        usuario.puede_ver_dashboard_completo = True # Ve KPIs operativos
        usuario.puede_ver_reportes = True
        usuario.puede_exportar = True
        usuario.puede_ver_logs = True             # Audita a operadores
        # Restricciones:
        usuario.puede_eliminar_animales = False   # Requiere aprobación de Admin/Gerente
        usuario.puede_gestionar_usuarios = False

    # 5. NUTRICIONISTA (Especialista)
    elif rol == 'nutricionista':
        usuario.puede_gestionar_nutricion = True
        usuario.puede_ver_analisis = True
        usuario.puede_ver_reportes = True
        usuario.puede_exportar = True
        usuario.puede_ver_dashboard_completo = False # Solo ve su área

    # 6. ENCARGADO DE INVENTARIO (Almacén)
    elif rol == 'inventario':
        usuario.puede_gestionar_inventario = True
        usuario.puede_ver_reportes = True
        usuario.puede_exportar = True
        usuario.puede_ver_dashboard_completo = False

    # 7. OPERADOR (Trabajador de Campo)
    elif rol == 'operador':
        usuario.puede_editar_animales = True      # Registrar pesos, ordeño
        usuario.puede_gestionar_inventario = True # Registrar uso de insumos/producción
        # Restricciones Fuertes:
        usuario.puede_crear_animales = False
        usuario.puede_eliminar_animales = False
        usuario.puede_ver_analisis = False
        usuario.puede_ver_dashboard_completo = False
        usuario.puede_exportar = False
        usuario.puede_ver_logs = False

    # 8. AUDITOR / CONSULTOR (Externo)
    elif rol in ['auditor', 'consultor']:
        usuario.puede_ver_dashboard_completo = True
        usuario.puede_ver_analisis = True
        usuario.puede_ver_reportes = True
        usuario.puede_ver_logs = True
        usuario.puede_exportar = True
        usuario.puede_solo_lectura = True

    db.session.add(usuario)
    db.session.flush() # Para obtener el ID del usuario

    # Agregar preguntas de seguridad si se proporcionan
    if security_questions:
        for q_text, a_text in security_questions:
            if q_text and a_text:
                q = PreguntaSeguridad(usuario_id=usuario.id, pregunta=q_text)
                q.set_respuesta(a_text)
                db.session.add(q)

    db.session.commit()
    return usuario, "Usuario creado exitosamente con permisos de " + rol

def autenticar_usuario(username, password):
    """Autentica un usuario y retorna sus datos si es correcto"""
    usuario = Usuario.query.filter_by(username=username, activo=True).first()
    
    if not usuario or not usuario.check_password(password):
        return None
    
    usuario.registrar_acceso()
    return usuario

def obtener_todos_usuarios():
    """Obtiene la lista de todos los usuarios"""
    usuarios = Usuario.query.all()
    return [u.to_dict() for u in usuarios]

def actualizar_usuario(usuario_id, **kwargs):
    """Actualiza datos de un usuario"""
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return None, "Usuario no encontrado"
    
    permitidos = ['nombre_completo', 'email', 'rol', 'activo']
    for key, value in kwargs.items():
        if key in permitidos and value is not None:
            setattr(usuario, key, value)
    
    db.session.commit()
    return usuario, "Usuario actualizado"

def cambiar_password(usuario_id, password_anterior, password_nueva):
    """Cambia la contraseña de un usuario"""
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return False, "Usuario no encontrado"
    
    if not usuario.check_password(password_anterior):
        return False, "Contraseña anterior incorrecta"
    
    usuario.set_password(password_nueva)
    usuario.cambio_password_requerido = False
    db.session.commit()
    return True, "Contraseña actualizada"

def resetear_password(usuario_id, password_nueva):
    """Resetea la contraseña de un usuario (solo admin)"""
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return False, "Usuario no encontrado"
    
    usuario.set_password(password_nueva)
    usuario.cambio_password_requerido = True
    db.session.commit()
    return True, "Contraseña reseteada"

def set_security_questions(usuario_id, questions_and_answers):
    """Establece múltiples preguntas y respuestas de seguridad para un usuario"""
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return False, "Usuario no encontrado"
    
    # Eliminar preguntas anteriores
    PreguntaSeguridad.query.filter_by(usuario_id=usuario_id).delete()
    
    for q_text, a_text in questions_and_answers:
        if not q_text or not a_text:
            continue
        nova_q = PreguntaSeguridad(usuario_id=usuario_id, pregunta=q_text)
        nova_q.set_respuesta(a_text)
        db.session.add(nova_q)
    
    db.session.commit()
    return True, "Preguntas de seguridad establecidas"

def verificar_todas_preguntas_seguridad(username, answers_dict):
    """Verifica si TODAS las respuestas proporcionadas son correctas"""
    usuario = Usuario.query.filter_by(username=username).first()
    if not usuario:
        return False, "Usuario no encontrado"
    
    preguntas = PreguntaSeguridad.query.filter_by(usuario_id=usuario.id).all()
    if not preguntas:
        return False, "El usuario no tiene preguntas de seguridad configuradas"
    
    # answers_dict debería ser {pregunta_id: respuesta}
    for p in preguntas:
        resp = answers_dict.get(str(p.id))
        if not resp or not p.check_respuesta(resp):
            return False, f"Respuesta incorrecta para: {p.pregunta}"
            
    return True, usuario

def obtener_preguntas_usuario(username):
    """Obtiene las preguntas de seguridad de un usuario"""
    usuario = Usuario.query.filter_by(username=username).first()
    if not usuario:
        return None
    return PreguntaSeguridad.query.filter_by(usuario_id=usuario.id).all()

def verificar_pregunta_seguridad(username, respuesta):
    """Verifica la respuesta de seguridad (Legacy - un solo campo en Usuario)"""
    usuario = Usuario.query.filter_by(username=username).first()
    if not usuario:
        return False, "Usuario no encontrado"
    
    if not usuario.respuesta_seguridad:
        return False, "No tiene pregunta de seguridad configurada"
        
    from werkzeug.security import check_password_hash
    respuesta_normalizada = respuesta.lower().strip()
    if check_password_hash(usuario.respuesta_seguridad, respuesta_normalizada):
        return True, usuario
    return False, "Respuesta incorrecta"

def set_security_question(usuario_id, pregunta, respuesta):
    """Establece una pregunta de seguridad (Legacy - un solo campo en Usuario)"""
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return False, "Usuario no encontrado"
    
    from werkzeug.security import generate_password_hash
    usuario.pregunta_seguridad = pregunta
    respuesta_normalizada = respuesta.lower().strip()
    usuario.respuesta_seguridad = generate_password_hash(respuesta_normalizada, method='pbkdf2:sha256')
    db.session.commit()
    return True, "Pregunta de seguridad establecida"

def generar_password_temporal(username):
    """Genera una contraseña temporal para un usuario no admin"""
    import random
    import string
    
    usuario = Usuario.query.filter_by(username=username).first()
    if not usuario:
        return None, "Usuario no encontrado"
    
    if usuario.rol == 'admin':
        return None, "Los administradores deben usar preguntas de seguridad"
    
    # Generar clave temporal de 8 caracteres
    temp_pass = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    usuario.set_password(temp_pass)
    usuario.cambio_password_requerido = True
    db.session.commit()
    
    return temp_pass, "Contraseña temporal generada con éxito"

def verificar_permiso(usuario, permiso):
    """Verifica si un usuario tiene un permiso específico"""
    permiso_map = {
        # Permisos Generales
        'crear_animales': 'puede_crear_animales',
        'editar_animales': 'puede_editar_animales',
        'eliminar_animales': 'puede_eliminar_animales',
        'editar_ganado': 'puede_editar_animales',    # Alias
        'eliminar_ganado': 'puede_eliminar_animales',# Alias
        'exportar': 'puede_exportar',
        'ver_analisis': 'puede_ver_analisis',
        'gestionar_usuarios': 'puede_gestionar_usuarios',
        'ver_reportes': 'puede_ver_reportes',
        # Permisos Específicos (Nuevos)
        'gestionar_nutricion': 'puede_gestionar_nutricion',
        'gestionar_inventario': 'puede_gestionar_inventario',
        'gestionar_salud': 'puede_gestionar_salud',
        'gestionar_genealogia': 'puede_gestionar_genealogia',
        'ver_logs': 'puede_ver_logs',
        'aprobar_acciones': 'puede_aprobar_acciones',
        'ver_dashboard_completo': 'puede_ver_dashboard_completo',
        'solo_lectura': 'puede_solo_lectura'
    }
    
    if not usuario:
        return False
    
    # Admin tiene todos los permisos
    if usuario.rol == 'admin':
        return True
    
    attr = permiso_map.get(permiso)
    if attr:
        return getattr(usuario, attr, False)
    
    return False
