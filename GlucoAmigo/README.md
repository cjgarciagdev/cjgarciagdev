#  GlucoAmigo: Monitoreo Glucémico Pediátrico en Tiempo Real

![Status](https://img.shields.io/badge/status-production-brightgreen)
![Tech](https://img.shields.io/badge/stack-Flask--SocketIO--PostgreSQL-orange)
![Category](https://img.shields.io/badge/category-HealthTech-red)

**GlucoAmigo** es una solución tecnológica diseñada para transformar el manejo de la diabetes tipo 1 en niños. Facilita un ecosistema de monitorización colaborativa entre padres, instituciones educativas y especialistas médicos, garantizando la seguridad del menor en todo momento.

---

## Ecosistema Colaborativo (Roles)

El sistema ofrece interfaces personalizadas según el perfil del usuario:

### 1.  Portal del Niño (Gamificado)
*   Interfaz simplificada con colores y elementos visuales amigables.
*   Registro de niveles de glucosa integrado con mecánicas de feedback positivo.

### 2.  Portal del Representante/Padre
*   **Monitorización en Vivo:** Visualización inmediata de las últimas mediciones.
*   **Gestión de Emergencias:** Acceso rápido a números de contacto y protocolos de acción inmediata (SOS).
*   **Historial Detallado:** Gráficos de tendencias para identificar patrones de hiper e hipoglucemia.

### 3.  Portal del Maestro/Institución
*   Permite a los docentes supervisar a múltiples alumnos de forma simultánea.
*   Alertas visuales y sonoras directas en el navegador mediante WebSockets ante cualquier medición fuera de rango.

### 4. 🩺 Portal Especialista (Médico)
*   **Análisis Clínico:** Herramientas para endocrinólogos pediátricos que permiten ajustar el tratamiento basándose en datos reales.
*   **Configuración del Sistema:** Los especialistas pueden ajustar los rangos objetivo de glucosa para cada paciente de forma individual.

---

## Especificaciones Técnicas

*   **Comunicación Bidireccional:** Uso de `Flask-SocketIO` para garantizar que las alertas lleguen al representante y al médico en milisegundos.
*   **Persistencia de Sesión:** Sistema robusto inspirado en redes sociales para evitar logouts accidentales durante emergencias.
*   **Arquitectura de Datos:** Diseñado para escalar de SQLite (desarrollo) a PostgreSQL (producción/Render).
*   **Auditoría Integral:** Cada cambio en la configuración médica se registra (`AuditLog`) para cumplir con normativas de seguridad de datos de salud.

---

##  Despliegue y Ejecución

1.  **Instalar dependencias:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Variables de Entorno (.env):**
    ```env
    DATABASE_URL=postgresql://usuario:password@host:port/dbname
    SECRET_KEY=clave_secreta_gluco
    ```

3.  **Iniciar Servidor con WebSockets:**
    ```bash
    python server.py
    ```

---

## Autor
**Cristian J Garcia**
*   Email: [cjgarciag.dev@gmail.com](mailto:cjgarciag.dev@gmail.com)
*   GitHub: [@cjgarciagdev](https://github.com/cjgarciagdev)

---

> [!IMPORTANT]
> Esta aplicación es una herramienta de apoyo y no sustituye la supervisión médica profesional. Siempre consulte con su endocrinólogo ante cambios en el tratamiento.
