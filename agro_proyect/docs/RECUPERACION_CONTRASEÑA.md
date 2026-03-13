# Sistema de Recuperación de Contraseñas - AGRO-MASTER

## 📋 Descripción General

El sistema implementa un mecanismo de recuperación de contraseñas robusto y diferenciado según el tipo de usuario y el nivel de seguridad requerido:

- **Usuarios Administradores y Personal Crítico**: Utilizan un sistema de **Múltiples Preguntas de Seguridad** para verificar su identidad sin depender de contraseñas temporales visibles.
- **Usuarios Operativos**: Reciben contraseñas temporales que deben ser cambiadas obligatoriamente en el primer acceso.

## 🔐 Funcionalidades Implementadas

### 1. Recuperación por Preguntas de Seguridad (Sistema Multinivel)

**Flujo:**
1. El usuario accede a "¿Olvidaste tu contraseña?" desde la pantalla de login.
2. Ingresa su nombre de usuario.
3. El sistema identifica al usuario y recupera su set de preguntas de seguridad pre-configuradas.
4. Se presentan las preguntas al usuario.
5. El usuario debe responder **todas** las preguntas correctamente para proceder.
6. Una vez verificado, el sistema permite establecer una nueva contraseña inmediatamente.

**Características:**
- Soporte para múltiples preguntas (mínimo 3 recomendadas).
- Las respuestas se almacenan usando **hashes seguros (PBKDF2-SHA256)**, al igual que las contraseñas.
- Comparación insensible a mayúsculas/minúsculas y espacios innecesarios.
- No se muestra información sensible durante el proceso.

### 2. Recuperación por Contraseña Temporal (Flujo Operativo)

**Flujo:**
1. El usuario ingresa su nombre de usuario en el formulario de recuperación.
2. El sistema genera automáticamente una contraseña temporal alfanumérica de 8 caracteres.
3. Se muestra la contraseña al usuario (o se envía por canal seguro).
4. El usuario inicia sesión con la contraseña temporal.
5. El sistema detecta el flag `cambio_password_requerido` y redirige automáticamente al formulario de cambio obligatorio.

## 🗄️ Cambios en la Base de Datos

### Modelo PreguntaSeguridad (models.py)
Se implementó una tabla dedicada para permitir flexibilidad:

```python
class PreguntaSeguridad(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    pregunta = db.Column(db.String(255), nullable=False)
    respuesta_hash = db.Column(db.String(255), nullable=False)
```

### Modelo Usuario (Campos de Control)
- `cambio_password_requerido`: Booleano para forzar actualización.
- `ultimo_acceso`: Auditoría de seguridad.

## 🛠️ Servicios de Seguridad (auth_service.py)

### `set_security_questions(usuario_id, questions_and_answers)`
Establece o reemplaza el set completo de preguntas de seguridad de un usuario.

### `verificar_todas_preguntas_seguridad(username, answers_dict)`
Valida un conjunto de respuestas contra los hashes almacenados. Requiere éxito total para retornar `True`.

### `generar_password_temporal(username)`
Automatiza la creación de claves efímeras para personal que no tiene configuradas preguntas de seguridad.

## 🌐 Rutas e Interfaz

### `/forgot-password`
Interfaz inteligente que detecta si el usuario debe responder preguntas o recibe una clave temporal basándose en su configuración y rol.

### `/change-password-required`
Middleware de seguridad que intercepta sesiones con claves temporales, impidiendo el acceso a cualquier otro módulo hasta que la clave sea actualizada.

## 🔒 Estándares de Seguridad

1. **Hashing de Respuestas:** A diferencia de sistemas básicos, AGRO-MASTER no guarda las respuestas en texto plano. Si la base de datos es comprometida, las respuestas siguen protegidas.
2. **Normalización de Inputs:** Todas las respuestas se procesan con `.lower().strip()` antes de ser hasheadas o comparadas.
3. **Privilegio Mínimo:** Los administradores **están obligados** a usar preguntas de seguridad; no se les permite el flujo de contraseña temporal por ser perfiles de alto riesgo.
4. **Exclusión de Middleware:** Las rutas de recuperación están explícitamente excluidas del filtro de autenticación para permitir el acceso a usuarios bloqueados.

## 📝 Guía de Configuración

### Para el Usuario (Autogestión):
1. Iniciar sesión y dirigirse al panel de **Seguridad** (icono de escudo 🛡️).
2. Seleccionar 3 preguntas del catálogo o ingresar personalizadas.
3. Guardar cambios (requiere confirmación de contraseña actual).

### Para el Administrador (Gestión de Personal):
1. Al crear un nuevo usuario, se pueden pre-configurar sus retos de seguridad.
2. Si un usuario olvida sus respuestas, el administrador puede resetear su cuenta, devolviéndola al estado de "Cambio de Contraseña Requerido".

---

**Versión:** 2.6  
**Fecha:** 2026-02-01  
**Autor:** Departamento de Seguridad AGRO-MASTER
