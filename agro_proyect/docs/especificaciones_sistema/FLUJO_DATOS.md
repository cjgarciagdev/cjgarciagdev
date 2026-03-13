# Diagrama de Flujo de Datos Integral (DFD)
> **PRODUCTOR UNICO:** CRISTIAN J GARCIA | CI: 32.170.910 | Email: dicrisog252@gmail.com

Este documento describe el flujo completo de la información, desde la seguridad hasta los procesos biológicos automatizados.

## 1. Módulo de Seguridad y Acceso
1.  **Entrada**: Credenciales de usuario cifradas enviadas al endpoint de autenticación.
2.  **Procesamiento**:
    *   Backend verifica identidad contra la tabla `USUARIO` mediante hash.
    *   Carga de privilegios dinámicos (RBAC) en la sesión del servidor.
3.  **Salida**: Autorización de acceso al Dashboard y habilitación de botones de acción (Exportar, Editar, Eliminar) según rol.

---

## 2. Ciclo de Gestión Animal
### 2.1. Registro y Auditoría
1.  **Entrada**: Actualización de peso, cambio de estado o edición biográfica.
2.  **Procesamiento**:
    *   Backend detecta cambios y genera un log automático en `HISTORIAL_CAMBIOS`.
    *   Si el peso cambia, se inyecta un nuevo registro en `REGISTRO_PESO` para mantener la curva de crecimiento.
3.  **Resultado**: Refresco instantáneo de métricas en el Dashboard (SOA).

### 2.2. Nutrición y Recetas
1.  **Flujo**: Perfil del Animal (Especie/Peso) -> Motor de Calibración Nutricional -> Plan Nutricional.
2.  **Persistencia**: El nuevo plan se vuelve `activo`, marcando registros previos como históricos.
3.  **Sincronización**: Al ajustar un plan, se recalculan las diferencias contra la dosis recomendada para visualización en el panel avanzado.

### 2.3. Salud y Protocolos (Automatización)
1.  **Flujo de Programación**: Usuario crea Protocolo -> El sistema lo inyecta en el calendario pendiente.
2.  **Flujo de Cierre**: Completar Protocolo -> **Actualización Automática** -> Generación de entrada en el Historial Médico con detalles de fármacos y dosis.
3.  **Alertas**: Motor de Inferencia Lógica escanea fechas próximas y dispara notificaciones visuales al Dashboard.

### 2.4. Ciclo Reproductivo (Maternidad)
1.  **Activación**: Detección de Hembra -> Creación de Plan de Maternidad.
2.  **Inyección de Datos**: El plan dispara una "cascada de eventos":
    *   Inyección de protocolos médicos preventivos (pre-parto).
    *   Actualización de requerimientos nutricionales específicos para gestación/lactancia.

---

## 3. Flujo de Inventario de Operaciones
1.  **Entrada**: Uso de insumos (Vacunas, Concentrados) registrados en protocolos.
2.  **Procesamiento**:
    *   Reducción automática de existencias en `INSUMO`.
    *   Control de umbral de `stock_minimo`.
3.  **Salida**: Disparo de alerta de "Reabastecimiento Necesario" en el almacén digital.

---

## 4. Análisis Científico y Grafos
1.  **Extracción**: Backend consulta relaciones de parentesco recursivas.
2.  **Algoritmia**:
    *   Procesamiento con NetworkX para detectar centralidad y caminos genéticos.
    *   Evaluación de circuitos lógicos para score de vigor y riesgos de consanguinidad.
3.  **Visualización**: Envío de estructuras JSON normalizadas para renderizado en frontend (Vis.js).

---

## 5. Exportación y Reportabilidad
*   **Procesamiento asíncrono**: Datos BD -> Generador PDF/Excel (Servicios) -> Streams de memoria (BytesIO).
*   **Enriquecimiento**: Inserción de gráficas de tendencia (Matplotlib) y Marca de Agua corporativa dinámicamente.
*   **Salida**: Descarga de archivo físico cifrado y nombrado según fecha y animal.
