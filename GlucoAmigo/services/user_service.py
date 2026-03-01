from models import Usuario, AuditLog, db

def list_users_for(current_user):
    if current_user.rol == 'admin':
        return Usuario.query.all()
    return Usuario.query.filter_by(rol='padre').all()

def create_user_by(current_user, data):
    required = ['username', 'password', 'rol', 'nombre_completo']
    if not all(k in data for k in required):
        return {'error': 'Faltan campos obligatorios'}, 400

    if Usuario.query.filter_by(username=data['username']).first():
        return {'error': 'El nombre de usuario ya está en uso'}, 400

    if current_user.rol != 'admin' and data['rol'] != 'padre':
        return {'error': 'No tiene permisos para crear usuarios con este rol'}, 403

    nuevo = Usuario(
        username=data['username'],
        rol=data['rol'],
        nombre_completo=data['nombre_completo'],
        email=data.get('email', ''),
        cedula=data.get('cedula', ''),
        activo=True
    )
    nuevo.set_password(data['password'])
    db.session.add(nuevo)

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
