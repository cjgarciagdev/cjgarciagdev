# Protocolo de Seguridad: Roles y Permisos (RBAC)
> **OBJETIVO DEL DOCUMENTO:** Establecer la matriz de responsabilidades y los mecanismos técnicos detallados que garantizan que el dato sea accedido solo por personal autorizado y bajo una lógica de integridad estricta.

---

## 1. Filosofía de Seguridad: Privilegio Mínimo y Segregación de Funciones
*   **¿Por qué?**: Un error accidental de un operario (como borrar un registro histórico o alterar una ración nutricional) puede tener consecuencias fatales para el animal o costos financieros masivos. La segregación asegura que el personal solo interactúe con lo que ha sido capacitado.
*   **¿Cómo?**: Implementando un **Control de Acceso Basado en Roles (RBAC)** multincapa. El sistema valida el permiso en el frontend (ocultando elementos), en el middleware (bloqueando rutas) y en el servicio (validando la lógica de negocio).

---

## 2. Navegación Contextual por Rol

### 2.1 Filosofía de Diseño
El sistema implementa **navegación inteligente basada en roles**. Cada usuario inicia sesión directamente en su área de trabajo principal, eliminando distracciones y mejorando la eficiencia operativa.

### 2.2 Mapeo de Roles a Secciones Iniciales

| Rol | Sección Inicial | Justificación |
|-----|----------------|---------------|
| **Veterinario** | Salud | Acceso directo a protocolos médicos y tratamientos |
| **Nutricionista** | Nutrición | Gestión inmediata de planes alimenticios |
| **Inventario** | Stock | Control de insumos y medicamentos |
| **Operador** | Ganado | Registro y consulta de animales |
| **Auditor** | Auditoría | Logs y registros de cambios |
| **Admin/Gerente/Supervisor** | Dashboard | Vista estratégica completa |

### 2.3 Implementación Técnica

**Backend (`app.py`):**
```python
@app.route('/')
@require_login
def index():
    # Determinar sección inicial según rol
    initial_section = 'dashboard'
    rol = g.user.rol
    
    if rol == 'veterinario': initial_section = 'salud'
    elif rol == 'nutricionista': initial_section = 'nutricion'
    elif rol == 'inventario': initial_section = 'inventario'
    elif rol == 'operador': initial_section = 'ganado'
    elif rol == 'auditor': initial_section = 'auditoria'
    
    return render_template('index.html', initial_section=initial_section)
```

**Frontend (`app.js`):**
```javascript
function showSection(id) {
    // Validación de permisos antes de navegar
    if (window.userPermissions) {
        const p = window.userPermissions;
        let allowed = true;

        switch (id) {
            case 'salud': allowed = p.gestionar_salud; break;
            case 'nutricion': allowed = p.gestionar_nutricion; break;
            case 'inventario': allowed = p.gestionar_inventario; break;
            case 'auditoria': allowed = p.ver_logs; break;
            case 'usuarios': allowed = p.gestionar_usuarios; break;
        }

        if (!allowed) {
            agroToast('🛑 Acceso restringido para tu perfil.', 'warning');
            return;
        }
    }
    // ... resto de la lógica
}
```

---

## 3. Definición y Creación de Roles: Guía Técnica (Para Desarrolladores)

### 3.1 ¿Por qué crear nuevos roles?
A medida que la finca crece, surgen necesidades específicas. Por ejemplo, un "Especialista en Reproducción" o un "Auditor Externo". El sistema es escalable para permitir estas definiciones.

### 3.2 ¿Cómo crear un nuevo rol y definir sus permisos? (Paso a Paso)

#### Paso 1: Actualización del Enum de Roles (`auth_service.py`)
```python
class RoleEnum(Enum):
    ADMIN = "admin"
    VETERINARIO = "veterinario"
    SUPERVISOR = "supervisor"
    OPERADOR = "operador"
    NUTRICIONISTA = "nutricionista"
    INVENTARIO = "inventario"
    AUDITOR = "auditor"
    GERENTE = "gerente"
    # Agregar nuevo rol aquí
    NUEVO_ROL = "nuevo_rol"
```

#### Paso 2: Actualización del Modelo de Datos (`models.py`)
Cada permiso se representa como una columna booleana en la tabla `Usuario`.
1.  **Justificación**: Usar booleanos permite una validación de tiempo constante $O(1)$ sin necesidad de joins complejos.
2.  **Acción**: Añadir a la clase `Usuario`:
    ```python
    rol = db.Column(db.String(50), default='operador')
    puede_gestionar_reproduccion = db.Column(db.Boolean, default=False)
    ```

#### Paso 3: Implementación de la Lógica de Verificación (`auth_service.py`)
El servicio debe mapear el rol a sus permisos específicos de forma determinista.
1.  **Justificación**: Centralizar la lógica de asignación evita inconsistencias. Se aplica el principio de **Privilegio Mínimo** por defecto.
2.  **Acción**: En la función `crear_usuario`, el sistema realiza un **Reset de Seguridad**:
    ```python
    # 1. Reset total (Todo en False)
    usuario.puede_crear_animales = False
    usuario.puede_gestionar_salud = False
    # ... todos los permisos se bloquean primero ...

    # 2. Asignación específica por Rol
    if rol == 'veterinario':
        usuario.puede_gestionar_salud = True
        usuario.puede_gestionar_genealogia = True
    elif rol == 'nutricionista':
        usuario.puede_gestionar_nutricion = True
    elif rol == 'nuevo_rol':
        usuario.puede_gestionar_reproduccion = True
    ```

#### Paso 4: Protección de Endpoints y Vistas
1.  **Backend**: Usar el decorador `@require_permission('permiso_especifico')`.
2.  **Frontend (Jinja2)**: 
    ```html
    {% if has_perm('gestionar_salud') %}
        <button id="btn-salud">Registrar Tratamiento</button>
    {% endif %}
    ```

#### Paso 5: Configurar Navegación Inicial
Actualizar la lógica de `initial_section` en `app.py`:
```python
elif rol == 'nuevo_rol': initial_section = 'seccion_correspondiente'
```

---

## 4. Jerarquía de Roles Actuales (Matriz de Responsabilidades)

| Rol | Descripción | Permisos Clave | Sección Inicial |
| :--- | :--- | :--- | :--- |
| **Administrador** | Control total del sistema. | Bypass de seguridad total (True para todo). | Dashboard |
| **Gerente** | Gestión estratégica. | Aprobar Acciones, Ver Logs, Reportes Avanzados, Auditoría. | Dashboard |
| **Veterinario** | Especialista médico. | Gestionar Salud, Genealogía, Reportes Médicos, Exportación. | Salud |
| **Nutricionista** | Especialista en dietas. | Gestionar Nutrición, Ver Análisis, Reportes. | Nutrición |
| **Supervisor** | Gestión intermedia. | Crear/Editar Animales, Ver Reportes, Exportar Datos. | Dashboard |
| **Operador** | Personal de campo. | Crear/Editar Animales, Ver Dashboards. NO elimina ni accede a logs. | Ganado |
| **Inventario** | Logística y stock. | Gestionar Inventario, Stock, Proveedores. | Stock |
| **Auditor** | Fiscalización y consultoría. | Solo Lectura Total, Ver Logs de Cambios, Exportar Reportes. | Auditoría |

> **NOTA IMPORTANTE:** El rol **Consultor** fue fusionado con **Auditor** para simplificar la gestión de permisos. Ahora, el rol Auditor incluye capacidades de consultoría externa con acceso de solo lectura.

---

## 5. Gestión del Ciclo de Vida de Usuarios

### 5.1 Desactivación de Usuarios
Los usuarios pueden ser **desactivados** (borrado lógico) en lugar de eliminados físicamente:
- Se establece `activo = False`
- El usuario no puede iniciar sesión
- Los registros históricos se mantienen intactos
- Auditoría completa del cambio

### 5.2 Reactivación de Usuarios
Los administradores pueden **reactivar** usuarios inactivos:
```javascript
async function reactivateUser(id) {
    const res = await fetch(`/api/auth/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: true })
    });
    // Usuario puede volver a acceder al sistema
}
```

**Ventajas:**
- Preserva el historial de acciones
- Mantiene la integridad referencial
- Permite auditorías completas
- Facilita la reincorporación de personal

---

## 6. El "Challenge" de Seguridad: Verificación Dinámica
*   **¿Por qué?**: Las computadoras en campo a menudo quedan encendidas. Un tercero podría realizar una acción destructiva en una sesión abierta. Necesitamos confirmar la "Presencia Humana Autorizada".
*   **¿Cómo?**: Mediante el servicio `verify_action_challenge`. 
    1.  El frontend dispara una petición AJAX con la contraseña ingresada en el modal.
    2.  El backend compara el hash usando `check_password_hash`.
    3.  Si es válido, se emite un "Token de Acción" de vida corta para completar el `DELETE`.

---

## 7. Matriz de Auditoría y Registro de Logs
*   **¿Por qué?**: En caso de un reclamo sanitario, el sistema debe probar quién ordenó cada tratamiento. Es la fundamentación legal del sistema.
*   **¿Cómo?**: Cada vez que un servicio modifica la DB, inyecta una entrada en la tabla `HistorialCambios` con: `user_id`, `timestamp`, `campo`, `valor_anterior` y `valor_nuevo`.

### 7.1 Trazabilidad Completa
```python
# Ejemplo de registro automático
def registrar_cambio(animal_id, campo, valor_anterior, valor_nuevo):
    cambio = HistorialCambios(
        animal_id=animal_id,
        usuario_id=session['user_id'],
        campo=campo,
        valor_anterior=str(valor_anterior),
        valor_nuevo=str(valor_nuevo),
        fecha_cambio=datetime.utcnow()
    )
    db.session.add(cambio)
    db.session.commit()
```

---

## 8. Seguridad Multicapa

### 8.1 Capa 1: Frontend (UX)
- Ocultación de elementos no autorizados
- Validación de permisos antes de navegación
- Feedback inmediato al usuario

### 8.2 Capa 2: Backend (API)
- Decoradores `@require_permission`
- Validación en cada endpoint
- Respuestas HTTP 403 para accesos denegados

### 8.3 Capa 3: Base de Datos
- Integridad referencial
- Constraints y validaciones
- Auditoría automática de cambios

---

> **Estado de Seguridad:** Sistema implementado bajo normas de ciberseguridad para aplicaciones empresariales, garantizando la inmutabilidad de la auditoría y el principio de privilegio mínimo en todos los niveles.

