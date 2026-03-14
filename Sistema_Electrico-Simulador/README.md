#  SENA: Sistema Eléctrico Nacional (Simulador de Grafos)

![Project Type](https://img.shields.io/badge/tipo-simulador--grafos-purple)
![Core](https://img.shields.io/badge/core-Teoría_de_Grafos-blue)
![Reports](https://img.shields.io/badge/reportes-PDF_ReportLab-green)

**SENA** es una plataforma de ingeniería desarrollada para simular, monitorizar y gestionar la infraestructura de una red eléctrica nacional. El sistema modela la red como un grafo complejo donde los transformadores son **nodos** y el tendido eléctrico son **aristas**.

---

##  Lógica de Ingeniería y Grafo

El núcleo del proyecto reside en su capacidad para procesar la topología de la red mediante algoritmos de grafos:

###  Simulación de Falla en Cascada (Cascading Failure)
*   **Algoritmo de Propagación:** Cuando un nodo crítico (Generador o Subestación) entra en estado de falla, el sistema ejecuta un recorrido recursivo (`propalar_falla_cascada`) para identificar todos los nodos dependientes "aguas abajo" que quedarán sin energía.
*   **Recuperación Automática:** Implementa lógica inversa para restaurar el servicio en cascada una vez resuelta la falla raíz, siempre que no existan averías locales.

###  Visualización Dinámica de Red
*   Mapa interactivo que representa la jerarquía de la red (S/E -> Troncal -> Sectorial -> Puntos de Entrega).
*   Cálculo de **Estrés Operativo** en tiempo real comparando la carga actual contra la carga máxima permitida por cada transformador.

---

##  Funcionalidades del Centro de Control

*   **Gestión de Incidencias:** Reporte y seguimiento de fallas físicas en transformadores o líneas de alta/baja tensión.
*   **Órdenes de Trabajo:** Generación automática de documentos técnicos en PDF (usando `ReportLab`) para las cuadrillas de campo, incluyendo diagnósticos, materiales necesarios y diagnóstico técnico.
*   **Gestión de Sectores:** Clasificación geográfica de la infraestructura por ciudades y sectores para una respuesta rápida.
*   **Mantenimiento Preventivo:** Seguimiento de la antigüedad del último mantenimiento con alertas basadas en días transcurridos.

---

##  Stack Tecnológico

*   **Lenguaje:** Python 3.x
*   **Framework:** Flask + Flask-Login
*   **DB:** SQLAlchemy ORM con base de datos relacional.
*   **Generación de Documentos:** ReportLab (Motor de PDFs profesionales).
*   **Frontend Interactivo:** Vis.js o similar para la renderización dinámica del grafo.

---

##  Autor
**Cristian J Garcia**

*   GitHub: [@cjgarciagdev](https://github.com/cjgarciagdev)

