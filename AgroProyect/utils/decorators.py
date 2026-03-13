from functools import wraps
from flask import session, redirect, url_for, jsonify
from services.auth_service import Usuario, verificar_permiso

def require_login(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def require_permission(permiso):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return redirect(url_for('login'))
            usuario = Usuario.query.get(session['user_id'])
            if not usuario or not verificar_permiso(usuario, permiso):
                return jsonify({'error': 'Permiso denegado'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
