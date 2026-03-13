# Registro de Cambios - Agro-Master

## [Versión 2.1.0] - 2026-02-01

### 🎯 Navegación Contextual por Rol
- **Implementado**: Sistema de navegación inteligente que redirige a cada usuario a su área de trabajo principal
- **Mapeo de roles**:
  - Veterinario → Sección Salud
  - Nutricionista → Sección Nutrición
  - Inventario → Sección Stock
  - Operador → Sección Ganado
  - Auditor → Sección Auditoría
  - Admin/Gerente/Supervisor → Dashboard
- **Validación**: Permisos verificados en frontend antes de navegación
- **UX**: Eliminación de distracciones, mejora en productividad

### 🔐 Mejoras en Sistema de Roles

#### Fusión de Roles
- **Eliminado**: Rol "Consultor"
- **Fusionado con**: Rol "Auditor"
- **Justificación**: Simplificación de permisos y reducción de redundancia
- **Nuevas capacidades de Auditor**:
  - Lectura de registros críticos
  - Acceso a logs de cambios
  - Exportación de reportes
  - Consultoría externa (solo lectura)

#### Roles Actuales (8 roles)
1. Administrador
2. Gerente
3. Veterinario
4. Nutricionista
5. Supervisor
6. Operador
7. Inventario
8. Auditor

### 👥 Gestión de Usuarios

#### Reactivación de Usuarios
- **Nuevo**: Función para reactivar usuarios desactivados
- **Implementación**: Botón verde "Reactivar" en interfaz de gestión
- **API**: `PUT /api/auth/usuarios/{id}` con `{activo: true}`
- **Beneficios**:
  - Preserva historial de acciones
  - Mantiene integridad referencial
  - Facilita reincorporación de personal
  - Auditoría completa del ciclo de vida

#### Interfaz Mejorada
- **Desktop**: Botón de reactivación en tabla de usuarios
- **Mobile**: Tarjetas responsivas con acción de reactivar
- **Visual**: Indicador de estado (Activo/Inactivo) con colores

### 📱 Progressive Web App (PWA)

#### Implementación Completa
- **Manifest**: `static/manifest.json` con metadatos de la app
- **Service Worker**: `static/service-worker.js` para cache offline
- **Iconos**: Generados en resoluciones 192x192 y 512x512
- **Instalable**: Puede agregarse a pantalla de inicio en móviles
- **Offline**: Funciona sin conexión después de primera carga

#### Estrategia de Cache
- **Cache-first**: Assets estáticos (CSS, JS, imágenes)
- **Network-first**: Llamadas API
- **Fallback**: Páginas offline para rutas críticas

### 🎨 Mejoras de UI/UX

#### Diseño Responsivo
- **Mobile Header**: Glassmorphism con backdrop-blur
- **Bottom Navigation**: Navegación móvil con permisos RBAC
- **Tarjetas de Usuario**: Vista móvil optimizada
- **Transiciones**: Animaciones suaves en navegación

#### Guía de Roles Actualizada
- **Eliminado**: Card de "Consultor"
- **Actualizado**: Card de "Auditor" con descripción expandida
- **Visual**: 8 tarjetas con códigos de color únicos

### 🔧 Mejoras Técnicas

#### Backend
- **Permisos en Frontend**: Objeto `permissions` pasado a templates
- **Sección Inicial**: Variable `initial_section` calculada por rol
- **Validación**: Decoradores `@require_permission` en todas las rutas críticas

#### Frontend
- **Validación de Navegación**: `showSection()` verifica permisos antes de cambiar vista
- **Variables Globales**: `window.userPermissions` y `window.initialSection`
- **Feedback**: Toast de error para accesos denegados

#### Base de Datos
- **Último Acceso**: Fix en `registrar_acceso()` con `db.session.commit()`
- **Auditoría**: Tabla `HistorialCambios` con trazabilidad completa

### 📚 Documentación

#### Actualizada
- `docs/ROLES_Y_PERMISOS.md`: Navegación contextual y fusión de roles
- `docs/ARQUITECTURA.md`: PWA, seguridad multicapa, optimizaciones
- `docs/CHANGELOG.md`: Este archivo

#### Nuevas Secciones
- Navegación Contextual por Rol
- Progressive Web App (PWA)
- Gestión del Ciclo de Vida de Usuarios
- Seguridad Multicapa
- Optimizaciones de Rendimiento

### 🐛 Correcciones de Bugs
- **Fix**: `ultimo_acceso` ahora se guarda correctamente en BD
- **Fix**: Validación de permisos en navegación móvil
- **Fix**: Enum de roles actualizado en `auth_service.py`

---

## [Versión 2.0.0] - 2026-01-30

### Características Principales
- Sistema de autenticación con roles y permisos
- Dashboard interactivo con estadísticas en tiempo real
- Gestión completa de ganado (CRUD)
- Módulo de salud con protocolos médicos
- Módulo de nutrición con planes alimenticios
- Gestión de inventario de insumos
- Análisis genealógico con grafos interactivos
- Exportación a PDF y Excel
- Sistema de auditoría y logs
- Interfaz SPA con Tailwind CSS

---

## Notas de Migración

### De v2.0.0 a v2.1.0

#### Usuarios con rol "Consultor"
Los usuarios existentes con rol "consultor" deben ser actualizados manualmente:
```python
# Script de migración
from models import Usuario, db

consultores = Usuario.query.filter_by(rol='consultor').all()
for u in consultores:
    u.rol = 'auditor'
db.session.commit()
```

#### Service Worker
Limpiar cache del navegador después de actualizar:
```javascript
// En consola del navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
});
```

#### Base de Datos
No se requieren migraciones de esquema. El sistema es compatible con bases de datos existentes.

---

> **Mantenedor**: CRISTIAN J GARCIA | CI: 32.170.910
> **Email**: dicrisog252@gmail.com
> **Última actualización**: 2026-02-01
