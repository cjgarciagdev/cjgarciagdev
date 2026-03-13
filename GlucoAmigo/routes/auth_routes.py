from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import login_user, logout_user, login_required, current_user
from datetime import timedelta
from models import db, Usuario
from utils.password_validator import ValidacionPassword, validar_password_flasks
"""
DESARROLLADOR: Cristian J Garcia
CI: 32.170.910
Email: cjgarciag.dev@gmail.com
"""
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    error = None
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        remember_me = request.form.get('remember_me') == 'on'
        
        print(f"[AUTH] LOGIN ATTEMPT: User='{username}'")
        
        try:
            # 1. Test database access
            num_users = Usuario.query.count()
            print(f"[AUTH] DB connected! Total Users found in DB: {num_users}")
            
            # 2. Find user
            candidate = Usuario.query.filter_by(username=username).first()
            if not candidate:
                print(f"[AUTH] FAIL: User '{username}' does NOT exist in DB.")
                error = 'Usuario no encontrado'
            elif not candidate.activo:
                print(f"[AUTH] FAIL: User '{username}' is inactive.")
                error = 'Usuario inactivo'
            elif not candidate.check_password(password):
                print(f"[AUTH] FAIL: Wrong password for '{username}'.")
                error = 'Contraseña incorrecta'
            else:
                print(f"[AUTH] SUCCESS! Logging in user: {username}")
                # Forzar sesión permanente para evitar que se pierda en Render
                session.permanent = True
                login_user(candidate, remember=True, duration=timedelta(days=30))
                
                # Registrar el acceso y guardar en DB
                candidate.registrar_acceso()
                
                # Log de redirección
                print(f"[AUTH] Redirecting {username} to main index...")
                
                # Check for forced password change
                if candidate.cambio_password_requerido:
                    return redirect(url_for('auth.cambio_password_vista'))
                
                # Redirección final
                return redirect(url_for('index'))
                
        except Exception as e:
            print(f"[AUTH] ERROR: Exception during login: {e}")
            error = f"Error del sistema: {str(e)}"
    return render_template('login.html', error=error)

@auth_bp.route('/logout')
@login_required
def logout():
    # Cerrar sesión completamente (tipo Facebook)
    # 1. Eliminar el token remember_me de la cookie
    logout_user()
    
    # 2. Eliminar todos los datos de sesión
    session.clear()
    
    # 3. Forzar expiry de la cookie de sesión
    from flask import make_response
    response = make_response(redirect(url_for('auth.login')))
    
    # 4. Eliminar cookies de sesión y remember
    response.set_cookie('session', '', expires=0)
    response.set_cookie('remember_token', '', expires=0)
    
    return response

# ============================================================
# ENDPOINTS DESHABILITADOS PARA SEGURIDAD DEL HOSPITAL
# ============================================================
# El registro de nuevos usuarios y recuperación de contraseña
# están deshabilitados. Solo el administrador del sistema
# puede crear nuevas cuentas.
# ============================================================

# @auth_bp.route('/api/auth/registro-parental', methods=['POST'])
# def registro_parental():
#     ... (deshabilitado)

# @auth_bp.route('/api/auth/recuperar-identificar', methods=['POST'])
# def api_identificar_usuario():
#     ... (deshabilitado)

# @auth_bp.route('/api/auth/reset-password', methods=['POST'])
# def api_reset_password():
#     ... (deshabilitado)

# ============================================================
# PERFIL DE USUARIO (solo usuarios autenticados)
# ============================================================

@auth_bp.route('/api/auth/perfil', methods=['GET', 'PUT'])
@login_required
def perfil_usuario():
    from flask import jsonify
    if request.method == 'GET':
        return jsonify(current_user.to_dict())
    
    data = request.json or {}
    current_user.nombre_completo = data.get('nombre_completo', current_user.nombre_completo)
    current_user.cedula = data.get('cedula', current_user.cedula)
    current_user.email = data.get('email', current_user.email)
    current_user.telefono = data.get('telefono', current_user.telefono)
    
    if current_user.rol != 'padre':
        if not current_user.perfil:
            from models import PerfilProfesional
            current_user.perfil = PerfilProfesional(usuario_id=current_user.id)
            db.session.add(current_user.perfil)
        current_user.perfil.especialidad = data.get('especialidad', current_user.perfil.especialidad)
        current_user.perfil.consultorio = data.get('consultorio', current_user.perfil.consultorio)
    
    # Soporte para cambio de contraseña desde el perfil
    nueva_password = data.get('nueva_password', '').strip()
    if nueva_password:
        # Validar con políticas de seguridad
        es_valida, errores = ValidacionPassword.validar(nueva_password)
        if not es_valida:
            return jsonify({'error': 'La nueva contraseña no cumple los requisitos de seguridad', 'detalles': errores}), 400
        current_user.set_password(nueva_password)
        current_user.cambio_password_requerido = False
    
    db.session.commit()
    return jsonify({'status': 'success', 'user': current_user.to_dict()})


@auth_bp.route('/api/auth/preguntas-seguridad', methods=['POST'])
@login_required
def guardar_preguntas_seguridad():
    """Permite al usuario autenticado configurar (o reemplazar) sus preguntas de seguridad."""
    from flask import jsonify
    from models import PreguntaSeguridad
    data = request.json or {}
    preguntas = data.get('preguntas', [])

    if len(preguntas) < 2:
        return jsonify({'error': 'Se requieren al menos 2 preguntas de seguridad'}), 400

    # Borrar las anteriores de este usuario
    PreguntaSeguridad.query.filter_by(usuario_id=current_user.id).delete()

    for item in preguntas[:2]:
        p = item.get('pregunta', '').strip()
        r = item.get('respuesta', '').strip()
        if p and r:
            ps = PreguntaSeguridad(usuario_id=current_user.id, pregunta=p)
            ps.set_respuesta(r)
            db.session.add(ps)

    db.session.commit()
    return jsonify({'status': 'success'})


# ─── SEGURIDAD AVANZADA (DESHABILITADO) ──────────────────────────────
# La recuperación de contraseña está deshabilitada.
# Solo el administrador puede crear cuentas.
# @auth_bp.route('/api/auth/recuperar-identificar', methods=['POST'])
# def api_identificar_usuario():
#     ...

# @auth_bp.route('/api/auth/reset-password', methods=['POST'])
# def api_reset_password():
#     ...

# @auth_bp.route('/auth/cambio-obligatorio', methods=['GET', 'POST'])
# @login_required
# def cambio_password_vista():
#     ...

# @auth_bp.route('/api/auth/validar-password', methods=['POST'])
# def api_validar_password():
#     ...

# @auth_bp.route('/api/auth/generar-password', methods=['GET'])
# def api_generar_password():
#     ...
