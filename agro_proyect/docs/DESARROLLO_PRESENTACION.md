# Documentación de Desarrollo: Landing de Presentación
> **PROYECTO:** Agro-Master Presentation v2.1
> **AUTOR:** Cristian J. García

Este documento detalla el proceso creativo, las tecnologías empleadas y la arquitectura técnica detrás de la landing page de presentación diseñada para la defensa del proyecto Agro-Master.

## 1. Concepto y Filosofía de Diseño
La interfaz fue concebida bajo una estética **Ultra-Premium Dark**, orientada a transmitir innovación tecnológica en el sector agropecuario, ahora evolucionada a una versión v2.1 con mayor interactividad y pulido visual.

### Principios de UX/UI aplicados:
*   **Glassmorphism & Depth**: Uso refinado de contenedores con desenfoque (`backdrop-filter`) y bordes semi-transparentes. Se añadieron animaciones de fondo ("pulsing glow") para crear atmósferas vivas y dinámicas.
*   **Neo-Brutalismo Tech**: Tipografía de gran formato (H1 con clamp) y espaciados generosos.
*   **Colorimetría Estratégica**: Paleta basada en la "Esmeralda Profunda" (`#10b981`) que simboliza la agricultura tecnificada, combinada con acentos ambar (`#f59e0b`) para resaltar lógica y advertencias.
*   **Interactive Feedback**: Cada elemento responde a la interacción del usuario. Las tarjetas ahora poseen efectos de rotación y escalado 3D sutiles, y el código se "escribe" en tiempo real.

---

## 2. Stack Tecnológico
Para garantizar la calidad visual y la funcionalidad, se expandió el stack manteniéndolo ligero:

*   **HTML5 Semántico**: Estructura robusta para SEO técnico y accesibilidad.
*   **CSS3 Avanzado**:
    *   **Animaciones Keyframes**: Implementación de ciclos de respiración (pulse-glow) y deriva (drift) en el fondo.
    *   **Custom Properties (Variables)**: Gestión centralizada de colores y efectos.
    *   **Transitions & Transforms**: Micro-interacciones suaves en botones y tarjetas.
*   **FontAwesome 6 (CDN)**: Integración de iconografía vectorial profesional para reemplazar emojis, elevando la percepción de calidad del producto.
*   **Vanilla JavaScript (ES6+)**: 
    *   **IntersectionObserver**: Para animaciones de entrada y activación de scripts bajo demanda.
    *   **Typewriter Logic**: Algoritmo personalizado para simular escritura de código en tiempo real.

---

## 3. Implementación de Funciones Avanzadas

### 3.1. Motor de Animaciones (Reveal on Scroll)
Se utiliza la API **`IntersectionObserver`** para un rendimiento óptimo (60 FPS).
*   **Mejora Reciente**: Se optimizó el umbral de detección para que las animaciones se sientan más naturales al hacer scroll.

### 3.2. Efecto "Typewriter" (Simulación de Código)
Para demostrar la lógica interna sin abrumar con texto estático:
*   **Funcionamiento**: Un script detecta cuando el contenedor de código entra en el *viewport*.
*   **Ejecución**: Itera sobre una cadena de texto predefinida, inyectando caracteres uno a uno con un retraso variable, simulando la escritura humana. Incluye un cursor parpadeante CSS puro.

### 3.3. Iconografía Dinámica
Se reemplazaron los emojis estáticos por iconos `<i>` de FontAwesome.
*   **Estilizado**: Los iconos están contenidos en "burbujas" con fondo semitransparente que reaccionan al *hover* cambiando a colores de alto contraste y rotando ligeramente, atrayendo la atención a las funcionalidades clave.

### 3.4. Fondo Hero Vivo
El fondo de la sección principal ya no es estático.
*   **Implementación**: Dos pseudo-elementos (`::before`, `::after`) con gradientes radiales se mueven y pulsan independientemente usando `keyframes`, creando un efecto de "aurora boreal" tecnológica sutil.

### 3.5. Nuevos Hitos: Seguridad e Inventario 360°
Para la versión Final v2.5, se han añadido:
*   **Security Challenge**: Simulación de biometría/credenciales para acciones críticas.
*   **Inventory Intelligence**: Clasificación en 5 categorías con iconos dinámicos y alertas de stock en tiempo real.
*   **Activity Feed**: Un historial vivo en el Dashboard que conecta todas las áreas del sistema.

---

## 4. Proceso de Desarrollo (Workflow)

1.  **Fase de Estructura**: Definición de los módulos críticos (Dashboard, Grafos, Salud).
2.  **Fase de Estilizado v1**: Creación del sistema de variables CSS y estética básica.
3.  **Fase de Pulido v2**: Inyección de libería de iconos profesional y script de escritura.
4.  **Fase de Robustez v2.5 (Actual)**: 
    *   Integración de reglas de negocio para alertas automáticas.
    *   Normalización total de la base de datos (Especies, Razas, Insumos).
    *   Implementación de flujos de seguridad (Action Challenge).

---

## 5. Instrucciones de Visualización
La presentación es un módulo independiente del backend Flask. 
*   **Ruta local**: `presentacion/index.html`
*   **Requisitos**: Navegador moderno. 
*   **Sincronización**: Los datos mostrados en la presentación son coherentes con los generados por `populate_db_final.py` en el sistema real.
