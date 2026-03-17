from models import Usuario

def verificar_permiso(usuario, permiso):
    if not usuario:
        return False
    if getattr(usuario, 'rol', None) in ['maestro']:
        return True

    # Definición de permisos por rol
    permisos_map = {
        # Admin (Maestro): acceso total
        'gestionar_seguridad': ['maestro'],
        'gestionar_usuarios': ['maestro', 'especialista'],
        'editar_roles': ['maestro'],
    }

    return usuario.rol in permisos_map.get(permiso, [])

def puede_editar_rol(usuario, usuario_objetivo):
    """
    Verifica si un usuario puede editar el rol de otro usuario.
    Solo 'maestro' o 'admin' pueden editar roles.
    El propio usuario puede editar su propio perfil pero no su rol.
    """
    if not usuario or not usuario_objetivo:
        return False
    # El propio usuario puede editar su propio perfil
    if usuario.id == usuario_objetivo.id:
        return True
    # Solo maestro puede editar el rol de otros usuarios
    return usuario.rol in ['maestro']
