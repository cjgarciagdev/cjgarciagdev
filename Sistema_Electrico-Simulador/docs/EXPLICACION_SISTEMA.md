# Explicación del Funcionamiento del Sistema Eléctrico (Grafos)

Plataforma de monitoreo y gestión de red eléctrica basada en la **Teoría de Grafos**.

## 1. El Grafo como Red Eléctrica
La red se modela como un **Grafo Dirigido**:
- **Nodos:** Representan centros de carga y generación. Cada nodo tiene atributos de *Capacidad Térmica* y *Carga de Demanda*.
- **Aristas (Enlaces):** Representan el flujo eléctrico. El sistema calcula pérdidas técnicas basadas en el tipo de cable seleccionado (400kV vs 13.8kV).

## 2. Inteligencia de la Red

### Simulacro de Apagón Escalonado
El sistema implementa un algoritmo de **Recorrido en Profundidad (DFS)**. Cuando ocurre un fallo en un nodo maestro, la falla se propaga automáticamente a todos los nodos conectados cuya única fuente de energía haya sido el nodo afectado. Esto permite ver visualmente cómo un fallo en una subestación deja a oscuras a todo un sector residencial.

### Análisis de Estrés y Demanda
Mediante el multiplicador de demanda, los nodos realizan comparativas de carga. Visualmente, el sistema utiliza un gradiente de colores (Verde -> Amarillo -> Rojo) para indicar la salud del transformador. Si la demanda excede la capacidad, el nodo entra en estado de **Sobrecarga**, aumentando la probabilidad de falla técnica espontánea.

### Meteorología Dinámica y Efectos Visuales
La simulación de tormenta integra un motor estocástico que afecta tanto a nodos como a cables. La visualización incluye un **destello de relámpago** (Flash CSS) que se sincroniza con el evento de falla, proporcionando una respuesta sensorial inmediata al usuario de monitoreo.

## 3. Análisis de Grafo y Redundancia
El sistema incluye herramientas para evaluar la robustez de la red:
- **Redundancia:** Identifica nodos que tienen más de una ruta de alimentación.
- **Puntos Críticos:** Identifica componentes cuya falla causaría el mayor número de desconexiones habitacionales.

## 4. Flujo de Control Profesional
El flujo cierra el círculo de gestión: **Monitoreo -> Alerta -> Reparación -> Reporte**. Esta trazabilidad es clave en sistemas de gestión de activos (Asset Management) para infraestructuras críticas.

---
Este sistema demuestra el poder de la visualización de datos aplicada a la ingeniería eléctrica urbana.
