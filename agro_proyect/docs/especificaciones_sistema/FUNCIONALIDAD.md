# Especificación Técnica y Funcional de Agro-Master
> **OBJETIVO DEL DOCUMENTO:** Definir la lógica de negocio, las justificaciones operativas y los mecanismos técnicos detallados que rigen el sistema Agro-Master. Este es el plano maestro de ingeniería del software.

---

## 1. Visión Arquitectónica: Modelo DB-Centric y Micro-servicios Lógicos
*   **¿Por qué?**: En la gestión ganadera, la pérdida de un solo registro de vacunación o parto puede comprometer la salud de todo el rebaño. Se requiere una arquitectura donde el dato sea la verdad absoluta y la lógica sea reactiva a este. La integridad de los datos biológicos es crítica para la certificación sanitaria y comercial de la finca.
*   **¿Cómo?**: Implementando un patrón de **Servicios Desacoplados**. Cada acción (comer, sanar, crecer) está representada por un servicio en Python que valida la integridad en la base de datos SQLite antes de confirmar cualquier cambio. Utilizamos una **Máquina de Estados** para el ganado, donde un animal solo puede transitar entre estados biológicamente posibles (ej. de Lactancia a Destete, pero no al revés sin un evento de parto registrado).

---

## 2. Detalle de Módulos: El "Por Qué" y el "Cómo" Profundo

### 2.1. Dashboard de Inteligencia (Control-Tower)
*   **¿Por qué?**: El productor no tiene tiempo para revisar tablas extensas. Necesita una vista de 3 segundos que le diga si algo anda mal (Salud Crítica) o si se está quedando sin recursos (Almacén). La visualización de datos permite detectar tendencias que de otro modo serían invisibles, como una caída gradual en el peso promedio que podría indicar un problema nutricional colectivo.
*   **¿Cómo?**: Mediante **Consultas Agregadas en Tiempo Real**. El backend ejecuta funciones `SUM`, `AVG` y `COUNT` al cargar la página. 
    *   **KPIs Dinámicos**: Implementamos "Drill-down dashboards" donde al hacer clic en un total, el sistema filtra instantáneamente la vista sin recargar la página usando **Alpine.js**.
    *   **Visualización**: Utilizamos **Chart.js** con configuraciones personalizadas para renderizar series temporales de peso, comparando el crecimiento real del rebaño contra estándares de raza precargados.

### 2.2. Gestión de Ganado (Inventario Biológico y Genealogía)
*   **¿Por qué?**: La trazabilidad es la base de la certificación ganadera. Sin saber quién es el padre o la madre, no hay mejora genética posible. Además, el control de inventario biológico permite calcular el valor patrimonial de la finca en tiempo real.
*   **¿Cómo?**: Usando **Integridad Referencial de 3ra Generación**. 
    *   **Registro Biométrico**: Cada animal tiene un UUID único vinculado a su ID de oreja.
    *   **Cálculo Cronológico**: El sistema calcula la edad automáticamente mediante la resta de fechas (`date.today() - fecha_nacimiento`). Si un animal supera ciertos umbrales de edad, el sistema dispara eventos de cambio de categoría (ej. de Becerro a Novillo).
    *   **Recursividad Genealógica**: Implementamos relaciones de auto-referencia en SQLAlchemy (`Father_ID`, `Mother_ID`) que permiten subir por el árbol familiar hasta el primer animal registrado.

### 2.3. Salud Veterinaria y Triaje Automatizado
*   **¿Por qué?**: La prevención es más económica que la cura. Detectar una omisión de vacuna a tiempo evita brotes epidémicos catastróficos. Un sistema de triaje digital asegura que los animales más graves sean atendidos primero, optimizando el tiempo del veterinario.
*   **¿Cómo?**: A través de un **Motor de Reglas Lógicas (Logic-Gate)**. 
    *   **Triaje**: Clasificamos a los animales en tres estados: **Normal**, **Alerta** y **Crítico**. 
    *   **Regla de Oro**: El sistema monitorea el historial médico; si detecta que un animal de 3 meses no tiene registrada la "Desparasitación" en una ventana de 72 horas después de la fecha programada, el sistema inyecta una bandera de **ESTADO CRÍTICO** en su ficha y en el Dashboard.
    *   **Trazabilidad de Fármacos**: Cada tratamiento médico descuenta automáticamente la dosis aplicada del inventario de insumos, manteniendo el stock actualizado sin intervención manual extra.

### 2.4. Nutrición de Precisión (Cálculo Bio-Físico y Energético)
*   **¿Por qué?**: El alimento representa hasta el 70% de los costos operativos. Dar de comer "al ojo" es perder dinero por desperdicio o por sub-alimentación. Una nutrición adecuada garantiza una ganancia diaria de peso (GDP) óptima, reduciendo el tiempo de engorde y aumentando la rentabilidad.
*   **¿Cómo?**: Aplicando la **Ley de Kleiber y Requerimientos de Energía Metabolizable (EM)**. 
    *   **Fórmulas**: El sistema toma el peso ($W$) y calcula el metabolismo basal ($70 \times W^{0.75}$). Luego ajusta por factores de crecimiento, gestación o lactancia.
    *   **Raciones**: El software desglosa el requerimiento en Materia Seca (MS), recomendando los kg exactos de Pasto (Forraje) y Suplemento (Concentrado) basados en la composición nutricional del inventario actual.

### 2.5. Análisis Avanzado (Grafometría de Redes y Endogamia)
*   **¿Por qué?**: La consanguinidad (cruzar parientes) degrada la calidad del ganado, reduce la fertilidad y produce defectos genéticos. En rebaños grandes, detectar que un toro es el abuelo de una vaca por otra rama es matemáticamente complejo.
*   **¿Cómo?**: Transformando la base de datos SQL en un **Grafo Dirigido Acíclico (DAG)**. 
    *   **Motor**: Usamos **NetworkX** en el backend para orquestar la red. Los animales son vértices y la paternidad son aristas.
    *   **Algoritmo**: El sistema ejecuta un `find_cycles` y calcula el coeficiente de parentesco. Si el grado de consanguinidad supera el 6.25% (primos segundos), el sistema marca el posible cruce como "Alto Riesgo".
    *   **Interfaz**: **Vis.js** permite al usuario "tocar" la familia, expandir ancestros y ver visualmente cómo fluye la genética en su finca.

---

## 3. Capas de Seguridad, Auditoría y Exportación

### 3.1. RBAC (Acceso Basado en Roles) y Desafíos de Acción
*   **¿Por qué?**: La jerarquía protege la confidencialidad de la finca y evita el sabotaje o errores de personal no capacitado. Acciones críticas (borrar animales, gestionar personal, cerrar protocolos médicos) deben tener una capa de seguridad extra.
*   **¿Cómo?**: Mediante **Decoradores de Python (`@wraps`)** y un sistema de **Desafío de Credenciales (Challenge Response)**.
    *   **Roles Especializados**: El sistema implementa perfiles técnicos (Nutricionista, Auditor, etc.) con una política de **Privilegio Mínimo**. La función `crear_usuario` realiza un "reset" de seguridad de todas las banderas de permisos antes de asignar las facultades estrictas del rol.
    *   **Acciones Verificadas**: Para ejecutar un `DELETE` de animal o modificar perfiles de usuario, el frontend dispara un modal de re-autenticación. Solo si la clave es correcta y el usuario tiene el permiso activo en DB, se ejecuta la operación.

### 3.2. Interfaz de Navegación Inteligente (Smart Sidebar)
*   **¿Por qué?**: En un sistema con múltiples módulos, la sobrecarga cognitiva del usuario puede llevar a errores operacionales. Se requiere una interfaz que permita "focalizar" la atención.
*   **¿Cómo?**: Implementando un **Sidebar Plegable Categorizado**. El sistema agrupa los módulos en zonas lógicas (Gestión, Análisis, Control) y permite colapsar grupos mediante transiciones suaves de altura. El sistema detecta automáticamente la sección activa para mantener el grupo correspondiente expandido al cargar la página.

### 3.2. Centro de Auditoría (Audit Engine)
*   **¿Por qué?**: En agro-negocios de alta escala, la transparencia es ley. Saber qué operario cambió el peso de un animal o quién autorizó la salida de un insumo es crucial para resolver discrepancias y mantener el control de calidad.
*   **¿Cómo?**: Mediante un **Sistema de Event-Logging Bifásico**.
    *   **Historial de Cambios**: Capturamos el estado "Antes" y "Después" de cada campo crítico en la base de datos, registrando autor, fecha y el valor modificado.
    *   **Monitor de Errores**: Capturamos automáticamente excepciones del frontend (JS) y backend, permitiendo una depuración rápida para el administrador sin interrumpir el flujo de trabajo del personal.

### 3.2. Motor de Reportes Profesionales de Alta Fidelidad
*   **¿Por qué?**: El productor necesita documentos físicos para trámites bancarios, ventas de exportación o auditorías sanitarias gubernamentales que exigen registros en papel.
*   **¿Cómo?**: Usando motores de renderizado asíncrono para no bloquear la interfaz. 
    *   **Excel**: `OpenPyXL` genera libros con múltiples pestañas (Inventario, Salud, Nutrición) con fórmulas integradas.
    *   **PDF**: `FPDF2` construye documentos con tipografía vectorial, tablas auto-ajustables y el **Score Ganadero** (gráfica de radar) incrustado mediante la conversión de gráficos de Matplotlib a flujos de bytes en memoria.

---
> **Certificación Técnica:** Este documento describe un sistema de grado industrial, diseñado para ser el cerebro operativo de cualquier unidad de producción agropecuaria moderna.


