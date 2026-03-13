# Nuevas Características v2.1.0 - Agro-Master

## Fecha de Lanzamiento: 2026-02-01

---

## 📱 Progressive Web App (PWA)

### Descripción
Agro-Master ahora es una **Progressive Web App** completa, lo que significa que puede funcionar como una aplicación nativa en dispositivos móviles y tablets, con capacidad de funcionamiento offline.

### Características Implementadas

#### 1. Instalación en Dispositivos
- **Android/iOS**: Botón "Agregar a pantalla de inicio"
- **Desktop**: Instalable desde Chrome/Edge
- **Icono personalizado**: Logo de Agro-Master en 192x192 y 512x512
- **Splash screen**: Pantalla de carga personalizada

#### 2. Funcionalidad Offline
```javascript
// Service Worker Strategy
- Cache-first: CSS, JavaScript, imágenes
- Network-first: API calls
- Fallback: Páginas offline para rutas críticas
```

#### 3. Archivos PWA
```
static/
├── manifest.json          # Configuración PWA
├── service-worker.js      # Lógica de cache
└── icons/
    ├── icon-192.png      # Icono Android
    └── icon-512.png      # Icono alta resolución
```

### Uso en Campo
1. **Primera carga**: Requiere conexión a internet
2. **Instalación**: "Agregar a pantalla de inicio"
3. **Uso offline**: Funciona completamente sin conexión
4. **Sincronización**: Cambios se guardan al restaurar conexión

### Beneficios
- ✅ Funciona en zonas rurales sin señal
- ✅ Experiencia de app nativa
- ✅ Actualizaciones automáticas
- ✅ Menor consumo de datos
- ✅ Acceso rápido desde pantalla de inicio

---

## 🎯 Navegación Contextual por Rol

### Descripción
Cada usuario ahora inicia sesión directamente en su área de trabajo principal, eliminando distracciones y mejorando la productividad.

### Mapeo de Roles

| Rol | Sección Inicial | Justificación |
|-----|----------------|---------------|
| **Veterinario** | 🏥 Salud | Acceso inmediato a protocolos médicos y tratamientos |
| **Nutricionista** | 🥗 Nutrición | Gestión directa de planes alimenticios |
| **Inventario** | 📦 Stock | Control inmediato de insumos y medicamentos |
| **Operador** | 🐄 Ganado | Registro y consulta de animales |
| **Auditor** | 📊 Auditoría | Logs y registros de cambios |
| **Admin** | 📈 Dashboard | Vista estratégica completa |
| **Gerente** | 📈 Dashboard | Análisis y toma de decisiones |
| **Supervisor** | 📈 Dashboard | Monitoreo general |

### Implementación Técnica

#### Backend (app.py)
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
    
    # Pasar permisos al frontend
    permissions = {
        'ver_dashboard_completo': verificar_permiso(g.user, 'ver_dashboard_completo'),
        'gestionar_salud': verificar_permiso(g.user, 'gestionar_salud'),
        # ... más permisos
    }
    
    return render_template('index.html', 
                         initial_section=initial_section,
                         permissions=permissions)
```

#### Frontend (app.js)
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
    // ... resto de la lógica de navegación
}
```

### Beneficios
- ✅ Mayor productividad (acceso directo a herramientas)
- ✅ Menos errores (usuarios no ven opciones prohibidas)
- ✅ Mejor UX (interfaz personalizada por rol)
- ✅ Seguridad mejorada (validación en frontend y backend)

---

## 🔐 Fusión de Roles: Consultor → Auditor

### Motivación
El rol "Consultor" y "Auditor" tenían permisos muy similares (ambos con acceso de solo lectura), lo que generaba:
- Confusión en la asignación de roles
- Redundancia en la gestión de permisos
- Complejidad innecesaria en el código

### Cambios Realizados

#### Antes (v2.0.0)
```python
# 9 roles
CONSULTOR = "consultor"  # Solo lectura + exportar
AUDITOR = "auditor"      # Solo lectura + logs
```

#### Después (v2.1.0)
```python
# 8 roles
AUDITOR = "auditor"  # Solo lectura + logs + exportar + consultoría
```

### Nuevos Permisos de Auditor
```python
elif rol == 'auditor':
    # FUSIONADO: Auditor + Consultor
    usuario.puede_ver_analisis = True
    usuario.puede_ver_reportes = True
    usuario.puede_exportar = True       # ← Nuevo (de Consultor)
    usuario.puede_ver_logs = True
    usuario.puede_solo_lectura = True
    usuario.puede_ver_dashboard_completo = True
```

### Migración de Usuarios Existentes
```python
# Script de migración (ejecutar una vez)
from models import Usuario, db

consultores = Usuario.query.filter_by(rol='consultor').all()
for usuario in consultores:
    usuario.rol = 'auditor'
    print(f"Migrado: {usuario.username} → auditor")

db.session.commit()
print(f"Total migrados: {len(consultores)}")
```

### Roles Actuales (8)
1. **Administrador** - Control total
2. **Gerente** - Gestión estratégica
3. **Veterinario** - Salud animal
4. **Nutricionista** - Planes alimenticios
5. **Supervisor** - Monitoreo general
6. **Operador** - Registro de campo
7. **Inventario** - Gestión de stock
8. **Auditor** - Fiscalización y consultoría

---

## 👥 Gestión Mejorada de Usuarios

### Reactivación de Usuarios

#### Problema Anterior
Los usuarios desactivados no podían ser reactivados, obligando a:
- Crear nuevos usuarios (perdiendo historial)
- Editar manualmente la base de datos
- Perder trazabilidad de acciones

#### Solución Implementada
```javascript
// Función de reactivación
async function reactivateUser(id) {
    if (!confirm('¿Reactivar este usuario?')) return;
    
    const res = await fetch(`/api/auth/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: true })
    });
    
    const data = await res.json();
    if (data.status === 'success') {
        agroToast('Usuario reactivado con éxito', 'success');
        loadUsuarios();
    }
}
```

#### Interfaz de Usuario
**Desktop:**
- Botón verde "Reactivar" (icono: check-circle)
- Aparece solo para usuarios inactivos
- Reemplaza al botón "Desactivar"

**Mobile:**
- Tarjeta con botón "Reactivar"
- Indicador visual de estado (Activo/Inactivo)
- Diseño responsivo

### Beneficios
- ✅ Preserva historial de acciones
- ✅ Mantiene integridad referencial
- ✅ Facilita reincorporación de personal
- ✅ Auditoría completa del ciclo de vida

---

## 🎨 Mejoras de Interfaz

### Guía de Roles Actualizada
- **Eliminado**: Card de "Consultor" (color rosa)
- **Actualizado**: Card de "Auditor" con descripción expandida
- **Grid**: Ahora muestra 8 roles en lugar de 9
- **Responsive**: Adaptación automática en móviles

### Navegación Móvil
- **Bottom Nav**: Permisos RBAC aplicados
- **Glassmorphism**: Efecto de vidrio en header móvil
- **Indicadores**: Visuales para sección activa

---

## 📊 Estadísticas de Cambios

### Archivos Modificados
- `app.py`: Navegación contextual y permisos
- `models.py`: Fix en `registrar_acceso()`
- `auth_service.py`: Fusión de roles
- `app.js`: Validación de permisos en navegación
- `index.html`: Inyección de permisos y sección inicial
- `_section_usuarios.html`: Guía de roles actualizada

### Líneas de Código
- **Agregadas**: ~350 líneas
- **Modificadas**: ~120 líneas
- **Eliminadas**: ~40 líneas
- **Documentación**: +500 líneas

### Archivos Nuevos
- `static/manifest.json`
- `static/service-worker.js`
- `static/icons/icon-192.png`
- `static/icons/icon-512.png`
- `docs/CHANGELOG.md`
- `docs/NUEVAS_CARACTERISTICAS.md` (este archivo)

---

## 🚀 Cómo Usar las Nuevas Características

### 1. Instalar como PWA
```
1. Abrir Agro-Master en Chrome/Edge
2. Clic en menú (⋮) → "Instalar Agro-Master"
3. Confirmar instalación
4. Usar desde pantalla de inicio
```

### 2. Probar Navegación Contextual
```
1. Crear usuarios con diferentes roles
2. Iniciar sesión con cada uno
3. Observar la sección inicial diferente
4. Intentar navegar a secciones prohibidas
5. Ver mensaje de "Acceso restringido"
```

### 3. Reactivar Usuario
```
1. Ir a Gestión de Personal
2. Buscar usuario inactivo (indicador rojo)
3. Clic en botón verde "Reactivar"
4. Confirmar acción
5. Usuario puede volver a iniciar sesión
```

---

## 🔧 Configuración Técnica

### Manifest.json
```json
{
  "name": "Agro-Master",
  "short_name": "Agro",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    {
      "src": "/static/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/static/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker
```javascript
const CACHE_NAME = 'agro-master-v1';
const urlsToCache = [
  '/',
  '/static/css/styles.css',
  '/static/js/app.js',
  // ... más assets
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

---

## 📖 Documentación Actualizada

### Archivos Actualizados
- ✅ `docs/ROLES_Y_PERMISOS.md`
- ✅ `docs/ARQUITECTURA.md`
- ✅ `docs/CHANGELOG.md` (nuevo)
- ✅ `guia_desarrollo/README.md`
- ✅ `docs/NUEVAS_CARACTERISTICAS.md` (este archivo)

### Próximas Actualizaciones
- [ ] `docs/MANUAL_USUARIO.md`
- [ ] `guia_desarrollo/05_FRONTEND_DESARROLLO.md`
- [ ] `guia_desarrollo/06_API_ENDPOINTS.md`

---

> **Desarrollador**: CRISTIAN J GARCIA | CI: 32.170.910
> **Versión**: 2.1.0
> **Fecha**: 2026-02-01
