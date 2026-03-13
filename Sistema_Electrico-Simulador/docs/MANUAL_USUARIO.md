# Manual de Usuario - Sistema de Monitoreo Eléctrico

Bienvenido al sistema de control de red eléctrica. Este manual le guiará a través de las funciones principales de la plataforma, ahora con capacidades interactivas avanzadas.

## 1. Acceso al Sistema
Para ingresar, utilice sus credenciales asignadas:
- **Administrador:** `admin` / `admin123`
- **Técnico:** `tecnico` / `tecnico123`

El sistema es plenamente **Responsivo**, por lo que puede acceder desde una PC, tablet o teléfono inteligente.

## 2. Vista de Grafo (Dashboard)
Es la pantalla principal donde verá la red representada por iconos técnicos:
- **Iconos de Rayo (Azul):** Plantas de generación.
- **Iconos de Torres (Morado):** Subestaciones.
- **Iconos de Transformador (Verde):** Transformadores operativos.
- **Iconos de Casa (Gris):** Puntos de consumo.

### Funciones de Navegación:
- **Zoom y Movimiento:** Use el ratón o gestos táctiles para explorar la ciudad. Las posiciones de los nodos pueden fijarse usando el botón **"Fijar Posición"**.
- **Tooltips Premium:** Al pasar el ratón (o tocar) un nodo, verá un desglose técnico con:
    *   **Voltaje (kV):** Tensión nominal.
    *   **Estrés Operativo:** Una barra de progreso que indica qué tan cerca está el equipo de una sobrecarga.
- **Búsqueda Avanzada:** Localice cualquier componente instantáneamente por código o nombre.

## 3. Gestión de Infraestructura (Solo Admin)
- **Nuevo Nodo:** Añada transformadores o plantas. El sistema asigna prefijos técnicos automáticamente (TX, SE, PL).
- **Dibujo de Conexiones:** ¡Ahora es más fácil! Deje presionado el botón **"Nueva Conexión"** y simplemente **arrastre un cable** desde el nodo de origen al de destino en el mapa. Se le pedirá seleccionar el tipo de conductor (400kV, 13.8kV, etc.).
- **Edición en Caliente:** Puede eliminar cables o nodos seleccionándolos y usando el botón de papelera.

## 4. Simulaciones de Tiempo Real
- **Tormentas Eléctricas:** Al activar el modo tormenta, el sistema simulará impactos de rayos con un **efecto visual de relámpago**. 
- **Fallas en Cables:** Las tormentas ahora pueden causar "Caída de Gualla" (cables rotos), que se tornarán rojos y punteados en el mapa.
- **Ciclo de Demanda:** Simule picos de consumo diario. Observe cómo los transformadores se tornan rojos cuando la demanda supera su capacidad nominal.

## 5. Gestión de Reparaciones
Acceda a la pestaña **"Página de Trabajo"**:
1. **Cola de Atención:** Lista priorizada de fallas activas (Crítica, Alta, Media, Baja).
2. **Formulario Técnico:** Documente el diagnóstico y los materiales usados.
3. **Cierre de Orden:** Al finalizar, el sistema restaura el servicio y registra la reparación en el historial.

## 6. Reportes Técnicos
Cada reparación genera una **Orden de Trabajo (OT)** formal. Puede consultarlas en el historial y descargarlas como **PDF profesional** para auditoría externa.

---
**Seguridad:** El sistema protege las acciones críticas. Intentar borrar infraestructura principal sin permisos resultará en un aviso de seguridad.
