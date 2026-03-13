# Arquitectura del Sistema Agro-Master 🏗️
> **PRODUCTOR UNICO:** CRISTIAN J GARCIA | CI: 32.170.910 | Email: dicrisog252@gmail.com

Agro-Master está diseñado bajo una arquitectura monolítica modular, optimizada para entornos locales y de alto rendimiento. Combina la potencia de **Flask** como motor de servidor con una interfaz **SPA (Single Page Application)** fluida y capacidades **PWA (Progressive Web App)** para funcionalidad offline.

---

## 🛰️ 1. Diagrama de Flujo de Operaciones
Así es como interactúan los componentes cuando el usuario realiza una acción:

```text
[ INTERFAZ DE USUARIO (Frontend) ]
      |
      V (1) Evento de Usuario (Click en "Guardar")
[ JS CORE (app.js) ] -----------------> [ VALIDACIÓN LOCAL ]
      |                                        | (Si falla) -> [ ALERTA DOM ]
      V (2) Petición AJAX (Fetch API)          |
[ API REST (Backend Flask) ] <-----------------+ 
      |
      V (3) Control de Acceso (Auth Service / RBAC)
[ LOGICA DE NEGOCIO ] -----------------> [ SERVICIOS (Export, Graph) ]
      |
      V (4) Persistencia (SQLAlchemy ORM)
[ BASE DE DATOS (SQLite) ]
```

---

## 🏛️ 2. El Corazón Tecnológico
Agro-Master se apoya en cuatro pilares fundamentales que garantizan su estabilidad.

### 2.1 Backend: El Motor Flask
*   **Modularidad (Blueprints)**: Las rutas no están centralizadas en un solo archivo, sino divididas por dominios (`animal_routes.py`, `nutricion_routes.py`, etc.).
*   **Seguridad Activa**: Implementa un middleware que intercepta todas las peticiones para verificar la sesión y los permisos del rol asignado.
*   **Navegación Contextual**: El sistema determina automáticamente la sección inicial según el rol del usuario.

### 2.2 Base de Datos: Esquema Normalizado
Usamos una arquitectura de **3ra Forma Normal (3NF)** para evitar la redundancia de datos:
*   **Tablas de Catálogo**: Especies, Razas, Sexos y Estados son tablas independientes relacionadas por claves foráneas (IDs).
*   **Expedientes**: Relación 1:1 para datos estáticos y 1:N para registros evolutivos (pesos, salud).
*   **Auditoría**: Tabla `HistorialCambios` con trazabilidad completa de modificaciones.

### 2.3 Frontend: El Concepto SPA
A diferencia de las webs tradicionales, Agro-Master no recarga el navegador al navegar.
*   **`showSection(id)`**: Oculta y muestra capas CSS dinámicamente con validación de permisos.
*   **Carga de Datos bajo Demanda**: El sistema solo pide al servidor los trozos de información (JSON) que necesita en cada momento, reduciendo drásticamente el uso de memoria.
*   **Validación de Permisos Frontend**: Antes de cada navegación, se verifica que el usuario tenga acceso a la sección solicitada.

### 2.4 PWA: Funcionalidad Offline
*   **Service Worker**: Cachea assets críticos para funcionamiento offline.
*   **Manifest**: Permite instalación como app nativa en dispositivos móviles.
*   **Responsive Design**: Interfaz adaptativa con navegación móvil optimizada.

---

## 🔧 3. Arquitectura de Plantillas (Jinja2)
La interfaz se construye como un "rompecabezas" de componentes:

```text
 index.html (Contenedor Maestro)
 ├── _head.html (Metadatos, Assets y PWA Manifest)
 ├── _sidebar.html (Navegador Lateral - Plegable con RBAC)
 ├── _header_mobile.html (Barra superior móvil con glassmorphism)
 ├── _scripts.html (Lógica de UI, Toggles y Service Worker)
 ├── Componentes de Sección:
 │   ├── _section_dashboard.html
 │   ├── _section_ganado.html
 │   ├── _section_salud.html
 │   ├── _section_nutricion.html
 │   ├── _section_inventario.html
 │   ├── _section_auditoria.html
 │   └── _section_usuarios.html
 └── Modales Globales:
     ├── _modal_animal.html
     ├── _modal_usuario.html
     ├── _modal_salud.html
     ├── _modal_nutricion.html
     └── _modal_confirmacion.html
```

---

## 🎯 4. Sistema de Navegación Contextual

### 4.1 Filosofía
Cada rol inicia sesión directamente en su área de trabajo principal, eliminando distracciones y mejorando la productividad.

### 4.2 Implementación

**Backend:**
```python
@app.route('/')
@require_login
def index():
    # Determinar sección inicial según rol
    initial_section = 'dashboard'
    if g.user.rol == 'veterinario': initial_section = 'salud'
    elif g.user.rol == 'nutricionista': initial_section = 'nutricion'
    elif g.user.rol == 'inventario': initial_section = 'inventario'
    elif g.user.rol == 'operador': initial_section = 'ganado'
    elif g.user.rol == 'auditor': initial_section = 'auditoria'
    
    # Pasar permisos al frontend
    permissions = {perm: verificar_permiso(g.user, perm) for perm in PERMISOS}
    return render_template('index.html', 
                         initial_section=initial_section,
                         permissions=permissions)
```

**Frontend:**
```javascript
// Validación de permisos antes de navegación
function showSection(id) {
    if (window.userPermissions) {
        const allowed = checkPermission(id);
        if (!allowed) {
            agroToast('🛑 Acceso restringido para tu perfil.', 'warning');
            return;
        }
    }
    // ... lógica de navegación
}
```

---

## 🛡️ 5. Sistema de Seguridad Multicapa

### 5.1 Capa 1: Autenticación
- Login con usuario/contraseña
- Hash BCrypt para contraseñas
- Sesiones Flask con cookies seguras
- Preguntas de seguridad para recuperación

### 5.2 Capa 2: Autorización (RBAC)
- 8 roles predefinidos con permisos granulares
- Navegación contextual por rol
- Validación frontend y backend
- Decoradores `@require_permission`

### 5.3 Capa 3: "Action Challenge"
Agro-Master introduce una capa de seguridad extra para acciones críticas:
1.  **Activación**: El usuario hace clic en "Eliminar".
2.  **Challenge**: Se dispara un modal de autenticación (`verifyActionPermission`).
3.  **Backend Check**: Una ruta especial recibe el token temporal y el permiso solicitado.
4.  **Ejecución**: Solo si el servidor retorna `status: 200`, la acción original (vía AJAX) se ejecuta.

### 5.4 Capa 4: Auditoría
- Tabla `HistorialCambios` con registro automático
- Trazabilidad completa: quién, cuándo, qué cambió
- Valores anteriores y nuevos preservados
- Inmutabilidad de logs

---

## 📊 6. Análisis de Datos y Grafos
La arquitectura incluye un motor de análisis genético desconectado de la lógica CRUD principal:
*   **Motor**: `graph_service.py` y `grafos_complex.js`.
*   **Salida**: Grafos interactivos en `Canvas` (Vis.js) que permiten al usuario navegar por la historia familiar del animal sin afectar el rendimiento de las tablas de datos.
*   **Algoritmos**: Detección de consanguinidad, cálculo de coeficientes genéticos, visualización de árboles genealógicos.

---

## 📱 7. Progressive Web App (PWA)

### 7.1 Características
- **Instalable**: Se puede agregar a la pantalla de inicio en móviles
- **Offline**: Funciona sin conexión gracias al Service Worker
- **Responsive**: Diseño adaptativo para todos los dispositivos
- **App-like**: Experiencia de usuario similar a apps nativas

### 7.2 Componentes PWA
```text
static/
├── manifest.json          # Metadatos de la PWA
├── service-worker.js      # Cache y offline functionality
├── icons/
│   ├── icon-192.png      # Icono para Android
│   └── icon-512.png      # Icono de alta resolución
```

### 7.3 Estrategia de Cache
```javascript
// Cache-first para assets estáticos
// Network-first para API calls
// Fallback offline para páginas críticas
```

---

## 🔄 8. Gestión del Ciclo de Vida de Usuarios

### 8.1 Creación
- Asignación automática de permisos según rol
- Preguntas de seguridad obligatorias (mínimo 3)
- Validación de datos en frontend y backend

### 8.2 Desactivación (Borrado Lógico)
- `activo = False` en lugar de DELETE
- Preserva historial de acciones
- Mantiene integridad referencial
- Auditoría completa

### 8.3 Reactivación
- Administradores pueden reactivar usuarios
- Restaura acceso completo
- Preserva configuración original
- Registra en auditoría

---

## 🚀 9. Optimizaciones de Rendimiento

### 9.1 Frontend
- Lazy loading de secciones
- Debouncing en búsquedas
- Virtual scrolling para tablas grandes
- Cache de datos en `window.allAnimals`

### 9.2 Backend
- Queries optimizadas con SQLAlchemy
- Índices en columnas frecuentemente consultadas
- Paginación en endpoints con muchos datos
- Compresión de respuestas JSON

### 9.3 Base de Datos
- Normalización 3NF
- Foreign keys con índices automáticos
- Cascadas de eliminación configuradas
- Backup automático programable

---

> 🚀 **Nota de Escalabilidad:** Aunque el sistema usa SQLite por defecto, su arquitectura basada en SQLAlchemy permite migrar a bases de datos empresariales (MySQL/PostgreSQL) con un solo cambio en el archivo de configuración, sin tocar una sola línea de código de los modelos.

> 📱 **Nota PWA:** El sistema funciona completamente offline después de la primera carga, permitiendo operaciones en campo sin conectividad. Los cambios se sincronizan automáticamente al restaurar la conexión.
