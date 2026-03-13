# 📚 Guía de Desarrollo - Agro-Master

## Sistema de Gestión Ganadera Integral

**Versión:** 2.1.0  
**Productor:** CRISTIAN J GARCIA  
**Tipo:** Progressive Web App (PWA) Full-Stack  
**Stack Tecnológico:** Flask (Python) + Vanilla JavaScript + SQLite  
**Características:** SPA + PWA + RBAC + Offline-First

---

## 📋 Índice de Documentación

Esta guía de desarrollo está organizada en múltiples documentos especializados para facilitar la comprensión y replicación del proyecto:

### 1. **01_ARQUITECTURA_Y_DISEÑO.md**
- Visión general del sistema
- Arquitectura de capas
- Patrones de diseño implementados
- Decisiones técnicas clave

### 2. **02_INSTALACION_DESDE_CERO.md**
- Requisitos del sistema
- Instalación paso a paso
- Configuración del entorno
- Primera ejecución

### 3. **03_BASE_DE_DATOS.md**
- Modelo de datos completo
- Diagrama ER
- Migraciones y esquemas
- Relaciones entre tablas

### 4. **04_BACKEND_DESARROLLO.md**
- Estructura del backend Flask
- Blueprints y rutas
- Servicios y lógica de negocio
- Sistema de autenticación

### 5. **05_FRONTEND_DESARROLLO.md**
- Estructura del frontend
- Sistema SPA (Single Page Application)
- Componentes JavaScript
- Sistema de estilos

### 6. **06_API_ENDPOINTS.md**
- Documentación completa de la API REST
- Ejemplos de request/response
- Códigos de estado
- Autenticación y permisos

### 7. **07_MODULOS_ESPECIALIZADOS.md**
- Módulo de Genealogía
- Sistema de Grafos Complejos
- Exportación de documentos
- Análisis predictivo

### 8. **08_TESTING_Y_DEPLOYMENT.md**
- Estrategias de testing
- Compilación a ejecutable
- Deployment en producción
- Troubleshooting común

---

## 🎯 Propósito del Proyecto

**Agro-Master** es un sistema integral de gestión ganadera diseñado para optimizar la administración de rebaños mediante:

- **Registro y seguimiento** de animales (bovinos, ovinos, caprinos, porcinos, equinos)
- **Gestión de salud** con protocolos veterinarios y expedientes médicos
- **Planificación nutricional** basada en cálculos científicos
- **Análisis genealógico** con visualización de árboles familiares
- **Reportes y exportación** en PDF y Excel
- **Dashboard analítico** con gráficas en tiempo real
- **PWA (Progressive Web App)** con funcionalidad offline
- **Navegación contextual** por rol de usuario
- **Sistema RBAC** con 8 roles especializados

---

## 🏗️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR WEB                        │
│  (Chrome, Firefox, Edge - HTML5 + CSS3 + JavaScript)   │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP/AJAX
                  ▼
┌─────────────────────────────────────────────────────────┐
│              SERVIDOR FLASK (Python 3.x)                │
│  ┌──────────┬──────────┬──────────┬──────────────────┐ │
│  │ Routes   │ Services │ Models   │ Utils            │ │
│  │ (API)    │ (Logic)  │ (ORM)    │ (Decorators)     │ │
│  └──────────┴──────────┴──────────┴──────────────────┘ │
└─────────────────┬───────────────────────────────────────┘
                  │ SQLAlchemy ORM
                  ▼
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS SQLite                       │
│  (ganado.db - Relacional con 10+ tablas)               │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# 1. Clonar o extraer el proyecto
cd agro_proyect

# 2. Crear entorno virtual
python -m venv venv
venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar servidor
python app.py

# 5. Acceder en navegador
http://localhost:5000
```

---

## 📊 Estadísticas del Proyecto

- **Líneas de código Python:** ~8,000
- **Líneas de código JavaScript:** ~5,500
- **Líneas de código HTML/CSS:** ~3,000
- **Número de endpoints API:** 45+
- **Tablas en base de datos:** 12
- **Módulos principales:** 8
- **Bibliotecas Python:** 15+
- **Tiempo de desarrollo:** 180+ horas

---

## 🔧 Tecnologías Core

### Backend
- **Flask 2.3+** - Framework web micro
- **SQLAlchemy** - ORM para base de datos
- **FPDF** - Generación de PDFs
- **Matplotlib** - Gráficas científicas
- **OpenPyXL** - Exportación Excel
- **BCrypt** - Hash de contraseñas

### Frontend
- **Vanilla JavaScript** - Sin frameworks pesados
- **Chart.js** - Visualización de datos
- **Vis.js** - Grafos y diagramas de red
- **Font Awesome** - Iconografía
- **Google Fonts (Inter)** - Tipografía

### Database & Tools
- **SQLite** - Base de datos embebida
- **PyInstaller** - Compilación a .exe
- **Git** - Control de versiones

---

## 📁 Estructura del Proyecto

```
agro_proyect/
├── app.py                    # Aplicación Flask principal
├── models.py                 # Modelos SQLAlchemy
├── requirements.txt          # Dependencias Python
├── run_project.bat          # Script de ejecución Windows
├── routes/                   # Blueprints de rutas
│   ├── animal_routes.py     # CRUD de animales
│   ├── export_routes.py     # Exportación PDF/Excel
│   ├── nutricion_routes.py  # Gestión nutricional
│   └── analisis_routes.py   # Análisis y estadísticas
├── services/                 # Lógica de negocio
│   ├── animal_service.py    # Servicios de animales
│   ├── auth_service.py      # Autenticación
│   ├── export_service.py    # Exportadores
│   └── genealogia_service.py # Análisis genealógico
├── static/                   # Recursos estáticos
│   ├── css/                 # Hojas de estilo
│   ├── js/                  # Scripts JavaScript
│   │   ├── app.js          # Lógica principal SPA
│   │   ├── app-advanced.js # Funciones avanzadas
│   │   ├── genealogia.js   # Árboles genealógicos
│   │   ├── grafos_complex.js # Visualización de grafos
│   │   └── agro_notify.js  # Sistema de notificaciones
│   └── img/                 # Imágenes y assets
├── templates/                # Plantillas HTML
│   ├── index.html           # Dashboard principal
│   ├── login.html           # Autenticación
│   └── [otros templates]
├── instance/                 # Datos de instancia
│   └── ganado.db            # Base de datos SQLite
├── docs/                     # Documentación original
└── guia_desarrollo/         # Esta guía técnica
    ├── README.md            # Este archivo
    └── [archivos detallados]
```

---

## 🎓 Conceptos Clave Implementados

### 1. **Single Page Application (SPA)**
El frontend carga una vez y cambia contenido dinámicamente sin recargar la página.

### 2. **API RESTful**
Comunicación cliente-servidor mediante JSON sobre HTTP.

### 3. **ORM (Object-Relational Mapping)**
SQLAlchemy mapea objetos Python a tablas de base de datos.

### 4. **Blueprint Pattern**
Organización modular de rutas Flask en blueprints.

### 5. **Service Layer**
Separación de lógica de negocio de las rutas web.

### 6. **Decorator Pattern**
Uso de decoradores para autenticación y permisos.

### 7. **Repository Pattern**
Funciones centralizadas para acceso a datos.

---

## 🔐 Sistema de Seguridad

- **Autenticación** basada en sesiones Flask
- **Hash de contraseñas** con BCrypt
- **RBAC** (Role-Based Access Control) con 8 roles
- **Navegación contextual** por rol
- **Validación de permisos** en frontend y backend
- **Decoradores** de permisos por rol
- **Protección CSRF** en formularios
- **Validación de datos** en cliente y servidor
- **Auditoría completa** con tabla `HistorialCambios`
- **Gestión de usuarios** con desactivación y reactivación
- **Preguntas de seguridad** para recuperación de contraseña

---

## 📈 Módulos Principales

### 1. Gestión de Ganado
CRUD completo de animales con filtros y búsqueda.

### 2. Salud Veterinaria
Protocolos, expedientes médicos, historial de tratamientos.

### 3. Nutrición
Cálculo automático de requerimientos nutricionales por especie.

### 4. Genealogía
Árbol familiar interactivo con visualización de grafos.

### 5. Maternidad
Registro de gestaciones, partos y crías.

### 6. Inventario
Control de insumos, alimentos y medicamentos.

### 7. Análisis
Dashboard con gráficas, estadísticas y tendencias.

### 8. Exportación
Generación de reportes en PDF y Excel.

---

## 🛠️ Herramientas de Desarrollo Recomendadas

- **IDE:** Visual Studio Code
- **Python:** 3.10 o superior
- **Navegador:** Chrome (con DevTools)
- **Base de datos:** DB Browser for SQLite
- **API Testing:** Postman o Thunder Client
- **Git:** Git Bash o GitHub Desktop

---

## 📞 Soporte y Contribución

Este proyecto fue desarrollado con fines educativos y de producción para gestión ganadera.

**Desarrollador:** CRISTIAN J GARCIA  
**Licencia:** Propietario  
**Año:** 2026

---

## 🔄 Próximos Pasos

1. Leer **01_ARQUITECTURA_Y_DISEÑO.md** para entender el sistema
2. Seguir **02_INSTALACION_DESDE_CERO.md** para configurar el entorno
3. Revisar **03_BASE_DE_DATOS.md** para comprender el modelo de datos
4. Estudiar **04_BACKEND_DESARROLLO.md** y **05_FRONTEND_DESARROLLO.md**
5. Consultar **06_API_ENDPOINTS.md** para integrar servicios
6. Explorar **07_MODULOS_ESPECIALIZADOS.md** para funciones avanzadas

---

**¡Bienvenido al desarrollo de Agro-Master! 🐄🌾**
