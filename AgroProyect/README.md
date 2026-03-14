#  AgroProyect: Sistema Integral de Gestión Ganadera

![Versión](https://img.shields.io/badge/version-2.0.0-blue)
![Licencia](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.9+-yellow)

**AgroProyect** es una solución empresarial de vanguardia diseñada para la digitalización y optimización de explotaciones ganaderas. A diferencia de los sistemas de registro tradicionales, AgroProyect integra Teoría de Grafos, Análisis Predictivo y Lógica de Negocio avanzada para transformar datos brutos en decisiones estratégicas.

---

## Funcionalidades Principales

### 1. Gestión Inteligente de Inventario (CRUD Avanzado)
*   **Trazabilidad Garantizada:** Registro completo de animales con identificación única, especie, raza, sexo y estado reproductivo.
*   **Control de Pesaje Histórico:** Visualización de curvas de crecimiento y comparación con estándares de la industria.

### 2. Módulo de Salud y Veterinaria
*   **Expediente Médico Digital:** Historial clínico detallado, incluyendo enfermedades pasadas, tratamientos aplicados y alergias.
*   **Protocolos Automáticos:** Programación de ciclos de desparasitación y vacunación con alertas preventivas.
*   **Módulo de Maternidad:** Seguimiento detallado de preñeces, partos y salud neonatal.

### 3. Inteligencia de Datos y Análisis
*   **Genealogía con Grafos:** Visualización interactiva de linajes mediante `grafo_service.py`, permitiendo identificar consanguinidad y pureza racial.
*   **Predicción de Productividad:** Algoritmos de Machine Learning básico para estimar el rendimiento cárnico o lácteo futuro.
*   **Análisis Nutricional:** Cálculo automático de dietas basadas en la edad, peso y objetivo del animal.

### 4. Gestión Financiera y Logística
*   **Contabilidad Integrada:** Registro de gastos e ingresos asociados directamente a cada lote o animal.
*   **Control de Insumos:** Inventario de alimentos y medicamentos con avisos de stock bajo.

---

##  Arquitectura Técnica

El sistema sigue un patrón de diseño **Modular/Service-Oriented** sobre Flask para garantizar escalabilidad:

*   **`services/auth_service.py`**: Gestión de seguridad robusta con roles (Admin, Veterinario, Nutricionista, Auditor).
*   **`services/grafo_service.py`**: Motor de lógica para el procesamiento de redes genealógicas.
*   **`services/export_service.py`**: Generador de reportes en PDF (ReportLab) y Excel (Pandas).
*   **`models/`**: Capa de persistencia utilizando SQLAlchemy ORM con soporte para triggers lógicos.

---

##  Autor
**Cristian J Garcia**
*   CI: 32.170.910
*   Email: [cjgarciag.dev@gmail.com](mailto:dicrisog252@gmail.com)
*   GitHub: [@cjgarciagdev](https://github.com/cjgarciagdev)

---
