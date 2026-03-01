from models import Usuario

def verificar_permiso(usuario, permiso):
    if not usuario:
        return False
    if getattr(usuario, 'rol', None) == 'admin':
        return True

    permisos_map = {
        'ver_pacientes': ['especialista', 'nutricionista', 'auditor', 'gerente'],
        'editar_pacientes': ['especialista', 'nutricionista'],
        'ver_analisis': ['especialista', 'nutricionista', 'auditor'],
        'ver_logs': ['especialista', 'auditor'],
        'ver_reportes': ['especialista', 'gerente'],
        'gestionar_seguridad': ['admin'],
    }

    return usuario.rol in permisos_map.get(permiso, [])
