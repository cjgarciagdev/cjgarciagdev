# Arquitectura del Sistema GlucoAmigo 🏗️
> **DESARROLLADOR ÚNICO:** CRISTIAN J GARCIA | CI: 32.170.910 | Email: cjgarciag.dev@gmail.com

GlucoAmigo está diseñado bajo una arquitectura monolítica modular, optimizada para entornos de salud. Combina la potencia de **Flask** como motor de servidor con una interfaz **SPA (Single Page Application)** fluida y capacidades **WebSocket** para alertas en tiempo real.

---

## 🛰️ 1. Diagrama de Flujo de Operaciones

Así es como interactúan los componentes cuando el usuario realiza una acción:

```
[ INTERFAZ DE USUARIO (Frontend) ]
      |
      V (1) Evento de Usuario (Click en "Guardar Glucosa")
[ JS CORE (app.js) ] -----------------> [ VALIDACIÓN LOCAL ]
      |                                        | (Si falla) -> [ ALERTA DOM ]
      V (2) Petición AJAX (Fetch API)          |
[ API REST (Backend Flask) ] <-----------------+ 
      |
      V (3) Control de Acceso (Auth / Permissions)
[ LOGICA DE NEGOCIO ] -----------------> [ SERVICIOS (Alertas, Export) ]
      |
      V (4) Persistencia (SQLAlchemy ORM)
[ BASE DE DATOS (SQLite/PostgreSQL) ]

      +
      |
      V (5) WebSocket - Alertas en Tiempo Real
[ Socket.IO ] -------------------------> [ CLIENTE ]
      |
      V (6) Notificación Push
[ NAVEGADOR ]
```

---

## 🏛️ 2. El Corazón Tecnológico

GlucoAmigo se apoya en cuatro pilares fundamentales que garantizan su estabilidad.

### 2.1 Backend: El Motor Flask
*   **Modularidad (Blueprints)**: Las rutas no están centralizadas en un solo archivo, sino divididas por dominios (`auth_routes.py`, `panel_routes.py`, `comida_routes.py`, etc.).
*   **Seguridad Activa**: Implementa un middleware que intercepta todas las peticiones para verificar la sesión y los permisos del rol asignado.
*   **WebSockets**: Socket.IO para comunicación en tiempo real.

### 2.2 Base de Datos: Esquema Normalizado
Usamos una arquitectura de **3ra Forma Normal (3NF)** para evitar la redundancia de datos:
*   **Usuarios**: Tabla principal con roles diferenciados
*   **Héroes**: Datos demográficos y parámetros clínicos
*   **Registros**: Relación 1:N para glucose, comidas, crecimiento
*   **Auditoría**: Tabla `AuditLog` con trazabilidad completa

### 2.3 Frontend: El Concepto SPA
A diferencia de las webs tradicionales, GlucoAmigo no recarga el navegador al navegar.
*   **`showSection(id)`**: Oculta y muestra capas CSS dinámicamente
*   **Carga de Datos bajo Demanda**: El sistema solo pide al servidor los trozos de información (JSON) que necesita
*   **Integración Socket.IO**: Alertas en tiempo real sin polling

### 2.4 Tiempo Real: Socket.IO
*   **WebSockets**: Comunicación bidireccional cliente-servidor
*   **Rooms**: Salas privadas por usuario y por héroe
*   **Monitor Background**: Hilo que verifica glucosa cada 30 segundos

---

## 🔧 3. Arquitectura de Plantillas (Jinja2)

La interfaz se construye como un "rompecabezas" de componentes:

```
index.html (Contenedor Maestro)
├── _head.html (Metadatos, Assets y PWA Manifest)
├── _scripts.html (Lógica de UI y Socket.IO)
├── Plantillas de Portal:
│   ├── portal_especialista.html (Panel médico)
│   ├── portal_representante.html (Panel padre)
│   └── portal_nino.html (Interfaz gamificada)
├── Componentes:
│   ├── sidebar.html (Navegador lateral)
│   ├── topbar.html (Barra superior)
│   └── modals/ (Modales reutilizables)
└── Secciones:
    └── sections/
        └── especialista/
            ├── sec_dashboard.html
            ├── sec_pacientes.html
            ├── sec_alertas.html
            └── sec_exportar.html
```

---

## 🎯 4. Sistema de Navegación Contextual

### 4.1 Filosofía
Cada rol inicia sesión directamente en su área de trabajo principal, eliminando distracciones.

### 4.2 Implementación

**Backend:**
```python
@app.route('/')
def index():
    if not current_user.is_authenticated:
        return redirect(url_for('auth.login'))
    
    if current_user.rol in ['especialista', 'admin']:
        return render_template('portal_especialista.html')
    elif current_user.rol == 'padre':
        return render_template('selector.html')
    else:
        return render_template('portal_representante.html')
```

**Frontend:**
```javascript
// Validación de permisos antes de navegación
function showSection(id) {
    if (!hasPermission(id)) {
        showWarning('Acceso restringido');
        return;
    }
    loadSectionData(id);
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
- Roles predefinidos (admin, especialista, padre, etc.)
- Permisos granulares
- Decoradores `@login_required` y `@verificar_permiso`

### 5.3 Capa 3: Sesiones Seguras
- Cookies HttpOnly (protegidas contra XSS)
- SameSite=Lax (protección CSRF)
- Duración configurable (30 días con "recordarme")

### 5.4 Capa 4: Auditoría
- Tabla `AuditLog` con registro automático
- Trazabilidad completa: quién, cuándo, qué cambió
- Valores anteriores y nuevos preservados

---

## 📊 6. Análisis de Datos y Reportes

La arquitectura incluye un motor de generación de reportes:
*   **Excel**: `export_group_excel()` - Usa XlsxWriter para formato profesional
*   **PDF**: `export_group_pdf()` - Usa ReportLab para posicionamiento preciso
*   **Gráficos**: Generación en servidor con matplotlib (en servicios avanzados)

---

## 🔔 7. Sistema de Alertas en Tiempo Real

### 7.1 Arquitectura Socket.IO
```
[Servidor Flask] <---> [Socket.IO] <---> [Cliente Browser]
      |
      V
[MonitorGlucosa] (Hilo Background)
      |
      V
[Verificación cada 30s] ---> [Alerta si fuera de rango]
```

### 7.2 Rooms y Canales
| Room | Descripción |
|------|-------------|
| `usuarios` | Sala general de usuarios |
| `heroes` | Sala general de héroes |
| `usuario_{id}` | Sala privada de usuario |
| `heroe_{id}` | Sala de un héroe específico |

### 7.3 Tipos de Alerta
| Tipo | Umbral | Severidad |
|------|--------|-----------|
| Hipoglucemia severa | < 54 mg/dL | Emergencia |
| Hipoglucemia | < 70 mg/dL | Alerta |
| Hiperglucemia | > 250 mg/dL | Alerta |
| Hiperglucemia severa | > 400 mg/dL | Emergencia |

---

## 🎮 8. Gamificación (Portal del Niño)

### 8.1 Sistema de Puntos
- Registro de glucosa: +10 puntos
- Medición pre-comida: +15 puntos
- TIR > 70%: +20 puntos

### 8.2 Niveles
| Nivel | Puntos |
|-------|--------|
| Novato | 0-100 |
| Explorador | 101-500 |
| Guerrero | 501-1000 |
| Héroe | 1001-2500 |
| Leyenda | 2500+ |

---

## 🚀 9. Optimizaciones de Rendimiento

### 9.1 Frontend
- Lazy loading de secciones
- Debouncing en búsquedas
- Cache de datos en memoria
- SPA sin recarga completa

### 9.2 Backend
- Queries optimizadas con SQLAlchemy
- Índices en columnas frecuentemente consultadas
- Paginación en endpoints con muchos datos
- Sesiones persistentes (menos re-autenticaciones)

### 9.3 Base deización 3NF
- Foreign keys Datos
- Normal con índices automáticos
- Backup programable

---

## 📱 10 Web App (. ProgressivePWA)

### 10.1 Características
- **Instalable**: Se puede agregar a la pantalla de inicio
- **Service Worker**: Cache de recursos estáticos
- **Responsive**: Diseño adaptativo para todos los dispositivos

### 10.2 Componentes PWA
```
static/
├── manifest.json          # Metadatos de la PWA
├── service-worker.js      # Cache y offline
└── icons/
    ├── icon-192.png      # Icono para móviles
    └── icon-512.png      # Icono de alta resolución
```

---

## 🔄 11. Gestión del Ciclo de Vida de Datos

### 11.1 Pacientes (Héroes)
- **Creación**: Por especialista o admin
- **Edición**: Auditoría completa de cambios
- **Desactivación**: `activo = False` (borrado lógico)

### 11.2 Registros
- **Glucosa**: Mediciones con marca de tiempo
- **Comidas**: Macronutrientes por comida
- **Crecimiento**: Peso, estatura, IMC

### 11.3 Alertas
- **Generación automática**: Por monitor background
- **Resolución**: Manual por especialista
- **Notificación**: Socket.IO + Email

---

> 🚀 **Nota de Escalabilidad:** Aunque el sistema usa SQLite por defecto, su arquitectura basada en SQLAlchemy permite migrar a bases de datos empresariales (MySQL/PostgreSQL) con un solo cambio en el archivo de configuración.

> 📡 **Nota de Tiempo Real:** El sistema usa Socket.IO con modo 'threading' por compatibilidad con Python 3.14+, permitiendo notificaciones instantáneas sin polling.

---

> 👨‍💻 **Desarrollado por:** Cristian J Garcia | CI: 32.170.910 | Email: cjgarciag.dev@gmail.com
