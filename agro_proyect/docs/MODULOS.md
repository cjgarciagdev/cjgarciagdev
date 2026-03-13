# Documentación Detallada de Módulos - Agro-Master 🧱
> **PRODUCTOR UNICO:** CRISTIAN J GARCIA | CI: 32.170.910 | Email: dicrisog252@gmail.com

Agro-Master está compuesto por 5 módulos core interconectados. Cada módulo está diseñado para ser independiente en su UI pero dependiente de un núcleo de datos centralizado.

---

## 🏎️ 1. Módulo Core: Dashboard & Monitor Proactivo
Es la "torre de control" del sistema. Utiliza un ciclo de vida de actualización de 60 segundos para los datos globales y 10 segundos para las actividades.

### Flujo de Datos Visual:
```text
[ DB (SQLite) ] ---> [ API /notificaciones ] ---> [ JS: loadNotifications() ]
      |                      |                           |
      | (1) Conteo           | (2) Alertas Lógicas        | (3) Feed Visual
      V                      V                           V
[ Stats Cards ]        [ Activity Panel ] <---------- [ Toast Alerts ]
```

---

## 🐄 2. Módulo de Ganado: Registro & Biometría
Gestiona el ciclo de vida del animal desde su nacimiento o compra hasta su salida del sistema.

### Capacidades:
*   **Identificación Única**: Generación de códigos internos correlativos.
*   **Seguimiento de Peso**: Registro histórico que alimenta la curva de crecimiento.
*   **Genealogía Recursiva**: Cada animal puede referenciar a un `padre_id` y `madre_id` preexistente en la tabla.

### Interfaz del Registro (Visión lógica):
```text
+-----------------------------------------------------------+
| [🔍 Buscar] [🐄 Especie ↓] [🛡️ Salud/Nutrición ↓] [➕ Nuevo] |
+-----------------------------------------------------------+
| ID  | Animal (Raza) | Sexo   | Edad | Peso  | Acciones    |
|-----+---------------+--------+------+-------+-------------|
| #32 | Angus         | Hembra | 6m   | 180kg | [👁️] [🗑️]    |
+-----------------------------------------------------------+
```

---

## ⚕️ 3. Módulo de Salud & Medicina Preventiva
Transforma la medicina reactiva en proactiva mediante protocolos automatizados.

### Lógica de Transición de Estado:
Cuando un veterinario marca un protocolo como **"Completado"**:
1.  **UPDATE**: `ProtocolosSalud.estado_id` cambia a 'Realizado'.
2.  **INSERT**: Se crea automáticamente una fila en `HistorialMedico`.
3.  **CLEANUP**: Se eliminan las alertas de notificación asociadas.

### Alertas Críticas Automáticas:
*   **Retraso > 48h**: Si un animal en edad clave (3/6m) no tiene registro médico, el sistema inyecta una alerta visual roja en la tabla de ganado.

---

## 🥗 4. Módulo de Nutrición: Ingeniería de Dietas
Calcula los requerimientos basándose en el **Peso Metabólico**.

### El Algoritmo:
```text
Peso Metabólico = Peso_Actual ^ 0.75
Forraje (Kg) = Peso_Actual * 0.10 (aprox. 10% del peso vivo)
Concentrado (Kg) = Función(Peso, Especie, Edad)
```
*   **Resultado**: Un plan descargable en PDF optimizado para el personal de campo, evitando el desperdicio de alimento.

---

## 📦 5. Gestión de Inventario (Suministros)
Control de stock con lógica de categorías cruzadas.

### Las 5 Columnas del Inventario:
| Categoría | Uso Principal | Alerta Crítica |
| :--- | :--- | :--- |
| **Médico** | Vacunas, Antibióticos | Fecha de Vencimiento |
| **Alimenticio** | Ensilaje, Harinas | Stock Mínimo |
| **Operativo** | Aretes, Jeringas | Stock Mínimo |
| **Herramienta** | Equipo de campo | Cantidad < 1 |
| **Limpieza** | Yodo, Amonio | Stock Mínimo |

---

## 🧬 6. Análisis Avanzado (Grafometría)
El módulo más inteligente de Agro-Master.

### Análisis de Redes:
*   **Detección de Inbreeding**: Analiza el camino más corto entre dos nodos. Si existen ancestros comunes en menos de 3 generaciones, el sistema emite un aviso de "Riesgo Genético".
*   **Visualización Dinámica**: Permite "arrastrar" y expandir familias enteras para una mejor comprensión visual de la raza.

## 👥 7. Módulo de Personal & Recursos Humanos (RH)
Control de acceso y auditoría de identidad.
*   **Gestión RBAC**: Creación y edición de perfiles especializados mediante un sistema de permisos basado en banderas (flags).
*   **Challenge de Seguridad**: Cada acción de alto riesgo (como borrar animales) requiere una validación de contraseña en caliente via modal interactivo.
*   **Trazabilidad**: Integrado con el motor de Auditoría para saber quién opera cada parte de la finca.

## 🛠️ 8. Interfaz UI Inteligente
*   **Sidebar Proactivo**: El menú lateral ahora es plegable y organizado por categorías. Permite al usuario contraer secciones de administración cuando está enfocado en tareas de campo, optimizando el espacio visual.

## 💰 9. Módulo Financiero (Balance y Flujo de Caja)
Gestión económica integral de la finca.
*   **Movimientos**: Registro de Ingresos (Ventas de leche, animales) y Egresos (Alimento, medicinas, nómina).
*   **Balance en Tiempo Real**: Cálculo automático de ganancias/pérdidas.
*   **Categorización Inteligente**: Clasificación automática para reportes de costos por área (Nutrición vs Salud).

## 🥛 10. Módulo de Producción (Control Lechero/Cárnico)
Monitorización del rendimiento productivo del rebaño.
*   **Registro Diario**: Entrada rápida de litros de leche (mañana/tarde) o pesajes de canal.
*   **Curvas de Lactancia**: Gráficos históricos por animal para identificar picos de producción y momentos de secado.
*   **Calidad**: Registro de porcentajes de grasa y proteína para control de calidad.

## 📅 11. Calendario Inteligente (Agenda Unificada)
Punto de convergencia de todas las actividades temporales.
*   **Sincronización Automática**: 
    *   Si crea un protocolo de salud -> Aparece en el calendario.
    *   Si registra una monta -> Aparece la fecha probable de parto.
    *   Si hay una cuenta por pagar -> Aparece el vencimiento.
*   **Alertas**: Notificaciones visuales para eventos de "Hoy" y "Próximos 7 días".

---

> 📓 **Nota Técnica:** Todos los módulos utilizan el motor de seguridad de **"Doble Factor"** (Action Challenge) y un sistema **RBAC** de endurecido. Antes de realizar cualquier edición, el sistema valida que el rol del usuario tenga el permiso explícito activado, aplicando por defecto una política de **Privilegio Mínimo**.
