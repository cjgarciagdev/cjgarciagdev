# Manual Técnico del Desarrollador - Agro-Master 💻
> **OBJETIVO DEL DOCUMENTO:** Guiar al ingeniero de software en la comprensión, mantenimiento y extensión de la arquitectura del sistema.

---

## 🛠️ 1. Arquitectura de Datos: SQLite + SQLAlchemy

### 1.1 Persistencia Offline
*   **¿Por qué?**: En entornos agropecuarios, la conectividad es intermitente o inexistente. Depender de la nube inutiliza la herramienta en el momento crítico de la jornada.
*   **¿Cómo?**: Se utiliza **SQLite** como una base de datos de archivo único. No requiere un servidor independiente activo, lo que facilita la portabilidad y los backups mediante copiado simple de archivos.

### 1.2 Mapeo Objeto-Relacional (ORM)
*   **¿Por qué?**: Escribir SQL crudo es propenso a errores y difícil de mantener. Necesitamos una capa que traduzca las clases de Python a tablas de forma segura.
*   **¿Cómo?**: Implementando **Flask-SQLAlchemy**. Esto permite realizar consultas complejas mediante métodos de Python (ej: `Ganado.query.filter_by(...)`), garantizando la protección contra inyecciones SQL de forma nativa.

---

## 📂 2. Patrones de Diseño Utilizados

### 2.1 Factory Pattern (App Discovery)
*   **¿Por qué?**: Permite configurar la aplicación de forma dinámica (test vs producción) sin cambiar el código central.
*   **¿Cómo?**: Mediante la función `create_app()` en `app.py`. Esta centraliza la configuración, inicializa extensiones y registra los **Blueprints** de forma ordenada.

### 2.2 Patrón Service-Repository
*   **¿Por qué?**: La lógica de negocio pesada (como el cálculo de nutrición o grafos) no debe estar en las rutas para evitar archivos `app.py` gigantes e ilegibles.
*   **¿Cómo?**: Separando la lógica en la carpeta `/services`. Las rutas solo reciben la petición, llaman al servicio correspondiente y devuelven el resultado.

---

## 🔐 3. Seguridad Granular (RBAC)

### 3.1 Protección de Rutas
*   **¿Por qué?**: Prevenir el acceso no autorizado a funciones sensibles por parte de usuarios con roles menores.
*   **¿Cómo?**: Usando el decorador `@require_permission('permiso_manual')`. Este middleware consulta la base de datos antes de permitir la ejecución del código de la ruta.

### 3.2 Desafío de Credenciales (Challenge Response)
*   **¿Por qué?**: Verificación de identidad para acciones críticas sin necesidad de cerrar sesión.
*   **¿Cómo?**: El backend expone `/api/auth/verify_action`. El frontend captura las credenciales vía `agroChallenge()`, las envía al endpoint y, de ser válidas, procede con la llamada original (ej: `DELETE`).

### 3.3 Sistema de Auditoría y Trazabilidad
*   **¿Por qué?**: Mantener un registro inmutable de operaciones para cumplimiento normativo.
*   **¿Cómo?**:
    - **Registro de Cambios**: Implementado en el servicio de guardado, detecta diferencias entre el objeto actual y el nuevo antes del `commit`, guardando el snapshot en `HistorialCambios`.
    - **Registro de Errores**: Capturador global en el frontend que envía stacks de error al endpoint `/api/log_error` para persistencia en DB.

### 3.4 Interfaz Dinámica (Collapsible Sidebar)
*   **¿Por qué?**: Mejorar la UX permitiendo al usuario focalizar su atención en módulos específicos.
*   **¿Cómo?**: Implementado en `_sidebar.html` y gestionado por `toggleSidebarGroup(groupId)` en `_scripts.html`.
    - Utiliza `max-height` dinámico basado en `scrollHeight` para transiciones CSS fluidas.
    - La persistencia visual del grupo activo se maneja mediante detección de la clase `.active-link` en el DOM al cargar la página (`DOMContentLoaded`).

### 3.5 Endurecimiento de RBAC (Security Hardening)
*   **¿Por qué?**: Evitar que permisos "por defecto" otorguen acceso no deseado si se crea un nuevo rol sin configuración explícita.
*   **¿Cómo?**: La función `crear_usuario` en `auth_service.py` aplica un patrón de **"Reset and Assign"**: primero desactiva todas las banderas booleanas de permisos y luego activa solo las requeridas por el rol específico.

---

## 📊 4. Análisis y Procesamiento Avanzado

### 4.1 Motor de Grafos (NetworkX)
*   **¿Por qué?**: El rastreo genealógico recursivo en SQL es ineficiente. Necesitamos una estructura matemática para detectar parentesco rápido.
*   **¿Cómo?**: El servicio `grafo_service.py` lee la DB, construye un objeto `DiGraph` de NetworkX y exporta una estructura JSON formateada para que **Vis.js** la renderice en el frontend.

### 4.2 Generación de Documentos
*   **¿Por qué?**: Necesitamos generar archivos PDF y Excel que no solo contengan texto, sino también gráficas generadas en el servidor.
*   **¿Cómo?**:
    *   **PDF**: Usamos `FPDF2` para posicionamiento milimétrico de celdas.
    *   **Gráficas**: `Matplotlib` genera la imagen en memoria (`io.BytesIO`), que luego es incrustada en el PDF sin guardarla físicamente en disco.

---

## 🚀 5. Flujo de Mantenimiento

1.  **¿Por qué documentar cambios?**: Para que futuros desarrolladores entiendan la evolución de la lógica de negocio.
2.  **¿Cómo extender el sistema?**:
    *   Definir el modelo en `models.py`.
    *   Crear el servicio en `/services`.
    *   Exponer el endpoint en un Blueprint dentro de `/routes`.

---
> **Nota Técnica:** El sistema está optimizado para Python 3.10+ y utiliza gestión de entornos virtuales (`venv`) para el control de dependencias.

