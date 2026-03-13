# Auditoría de Disponibilidad y Arquitectura de Limitaciones
> **OBJETIVO DEL DOCUMENTO:** Transparentar el alcance técnico, las decisiones de diseño para garantizar la operatividad y las fronteras de escala del software.

---

## 1. Resiliencia Offline (Local-First)
*   **¿Por qué?**: La nube es un riesgo en el campo. Una caída de internet no debe impedir el pesaje de 100 animales o el registro de una emergencia veterinaria.
*   **¿Cómo?**: Mediante la **Localización Total de Recursos**.
    *   **Vendoring**: Todas las dependencias (CSS/JS) se sirven desde el disco duro local, no desde internet.
    *   **SQLite**: El motor de persistencia reside en la misma carpeta que el código, permitiendo que el sistema sea 100% funcional en una computadora aislada.

---

## 2. Responsividad Adaptativa
*   **¿Por qué?**: El personal de campo usa celulares; el gerente en oficina usa monitores 4K. El sistema debe verse perfecto en ambos para evitar errores de lectura.
*   **¿Cómo?**: Implementando un **Grid Fluido de Tailwind CSS**. El sistema detecta el ancho de la pantalla y reorganiza los módulos: el menú desaparece en móviles (hamburguesa) y las tablas se transforman en tarjetas de lectura vertical.

---

## 3. Limitaciones Técnicas: El "Por Qué" y el "Cómo"

### 3.1 Concurrencia Limitada
*   **¿Por qué?**: Para mantener la simplicidad de instalación y la portabilidad absoluta (Zero-Config).
*   **¿Cómo?**: SQLite bloquea la base de datos durante las escrituras. Esto significa que está diseñado para fincas de hasta 5-10 usuarios simultáneos. Si se superan estos límites, el tiempo de respuesta podría aumentar.

### 3.2 Almacenamiento Multimedia
*   **¿Por qué?**: Guardar fotos de alta resolución en una DB local saturaría el disco duro y ralentizaría los backups.
*   **¿Cómo?**: El sistema se enfoca en **Datos Alfanuméricos y Métricas**. Las imágenes no están habilitadas en esta versión para priorizar la velocidad de procesamiento de los algoritmos de nutrición y grafos.

### 3.3 Procesamiento de Reportes Masivos
*   **¿Por qué?**: Generar un PDF de 500 páginas con gráficas es una tarea que consume mucha memoria RAM.
*   **¿Cómo?**: El sistema procesa los reportes de forma secuencial. Se recomienda realizar exportaciones extensas en equipos con al menos 4GB de RAM para evitar cierres inesperados.

---

## 4. Estrategia de Mitigación (Futuro)
*   **¿Por qué?**: El software debe estar preparado para crecer junto con la finca.
*   **¿Cómo?**: La arquitectura es **Database-Agnostic**. Esto significa que el código de Python ya está escrito para que, en una fase futura, solo se cambie una línea de configuración para pasar de SQLite a un servidor industrial como PostgreSQL.

---
*Este análisis certifica la robustez del sistema para su aplicación en el sector agropecuario actual.*

