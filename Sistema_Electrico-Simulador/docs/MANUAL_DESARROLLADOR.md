# Manual del Desarrollador - Sistema Eléctrico (Grafos)

Este documento detalla la arquitectura técnica para mantenimiento y escalado de la plataforma.

## 1. Stack Tecnológico
- **Backend:** Python con Flask. Generación de reportes PDF con `reportlab`.
- **Base de Datos:** SQLite con Flask-SQLAlchemy.
- **Frontend:** JS Vanilla, CSS3 (Custom Variables), FontAwesome 6.
- **Motor de Grafos:** Vis.js Network Engine.

## 2. Arquitectura de Datos
- `models.py`: Esquemas ORM. Incluye `impacto_viviendas` para análisis de carga y `tipo_cable` para aristas.
- `app.py`: Controladores REST. Lógica de **propagación recursiva** para simulacros de apagón total.
- `static/js/app.js`: Contiene el controlador central `network`. Maneja el estado global y las animaciones (relámpagos, flashes, actualizaciones suaves).

## 3. Características Especiales para Desarrolladores
- **Modo Edición Interactiva:** Implementado mediante el módulo `manipulation` de Vis.js. Permite el manejo de eventos `addEdge` para capturar conexiones dibujadas manualmente.
- **Efectos de Animación:** Definidos en `style.css` mediante `@keyframes` (ej. `lightning-flash` y `slideUp`). Se disparan desde JS manipulando las clases del DOM.
- **Responsividad:** Lograda mediante un sistema de rejilla flexible (Grid) y media queries que ajustan el tamaño del lienzo del grafo dinámicamente.

## 4. Endpoints de la API
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/nodos` | GET/POST | Gestión de infraestructura de nodos. |
| `/api/aristas` | GET/POST | Definición de vínculos y tipos de cable. |
| `/api/fallas` | GET/POST | Trigger de alertas y cola de trabajo. |
| `/api/reparar` | POST | Procesamiento de informes y alta de servicio. |
| `/api/reportes/pdf/<id>` | GET | Generación dinámica de reportes en PDF. |

## 5. Despliegue y Pruebas
1. Requisitos: `pip install -r requirements.txt`.
2. Inicialización: El archivo `init_db.py` poblará una red urbana compleja para pruebas de estrés.
3. Ejecución: `python app.py`.

## 6. Extensibilidad
Para añadir un nuevo efecto visual (ej. cortocircuito), cree la animación en CSS y utilice la función `triggerLightningFlash()` en `app.js` como plantilla para inyectar la animación en el contenedor del grafo.

---
Arquitectura diseñada para alta disponibilidad y visualización técnica robusta.
