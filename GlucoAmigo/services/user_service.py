from models import Usuario, AuditLog, db

# Roles que pueden ser creados por usuarios no-admin
ROLES_LIMITADOS = ['padre', 'especialista']

def list_users_for(current_user):
    """Lista usuarios según el rol. Admin/Maestro ven todos, otros ven solo los creados por ellos."""
    if current_user.rol in ['maestro']:
        return Usuario.query.all()
    elif current_user.rol in ['especialista']:
        # Profesionales ven todos los usuarios padres/representantes
        return Usuario.query.filter_by(rol='padre').all()
    return Usuario.query.filter_by(rol='padre').all()

def create_user_by(current_user, data):
    required = ['username', 'password', 'rol', 'nombre_completo']
    if not all(k in data for k in required):
        return {'error': 'Faltan campos obligatorios'}, 400

    if Usuario.query.filter_by(username=data['username']).first():
        return {'error': 'El nombre de usuario ya está en uso'}, 400

    # Verificar permisos para crear usuarios con roles específicos
    # Solo 'maestro' puede crear el rol 'maestro'
    if data['rol'] == 'maestro' and current_user.rol != 'maestro':
        return {'error': 'Solo el maestro puede crear usuarios maestro'}, 403
    
    # Roles que pueden crear usuarios
    if current_user.rol not in ['admin', 'maestro', 'especialista']:
        return {'error': 'No tiene permisos para crear usuarios'}, 403
    
    # Verificar qué roles puede crear cada usuario
    if current_user.rol in ['especialista']:
        if data['rol'] not in ['especialista']:
            return {'error': 'Solo puede crear especialistas'}, 403
    # admin y maestro pueden crear cualquier rol (excepto maestro que solo admin)

    nuevo = Usuario(
        username=data['username'],
        rol=data['rol'],
        nombre_completo=data['nombre_completo'],
        email=data.get('email', ''),
        cedula=data.get('cedula', ''),
        telefono=data.get('telefono', ''),
        activo=True,
        creado_por_id=current_user.id  # Registrar quién lo creó
    )
    nuevo.set_password(data['password'])
    db.session.add(nuevo)
    db.session.flush()

    # Si el rol requiere perfil profesional (especialista), crearlo
    if data['rol'] in ['especialista']:
        from models import PerfilProfesional
        perfil = PerfilProfesional(
            usuario_id=nuevo.id,
            especialidad=data.get('especialidad', ''),
            consultorio=data.get('consultorio', '')
        )
        db.session.add(perfil)

    audit = AuditLog(
        usuario_id=current_user.id,
        entidad_tipo='Usuario',
        accion='CREATE',
        campo='all',
        valor_nue=f"User: {nuevo.username} | Rol: {nuevo.rol}"
    )
    db.session.add(audit)
    db.session.commit()
    return {'status': 'success', 'message': f'Usuario {nuevo.username} creado exitosamente'}
