# AGRO-MASTER
## Sistema Integral de Gestión Ganadera

**Desarrollador:** Cristian J. García  
**CI:** 32.170.910  
**Email:** dicrisog252@gmail.com  
**Versión:** 2.1.0 PWA  
**Año:** 2026

---

# 1. PLANTEAMIENTO DEL PROBLEMA

El sector ganadero enfrenta múltiples desafíos en la gestión operativa que limitan la eficiencia y productividad de las fincas:

## 1.1 Gestión Manual Ineficiente
La mayoría de productores ganaderos utilizan métodos tradicionales de registro (cuadernos físicos, hojas de cálculo dispersas) que generan:
- Pérdida de información histórica crítica
- Errores de transcripción manual
- Dificultad para acceder a datos en campo
- Imposibilidad de análisis longitudinal

## 1.2 Ausencia de Trazabilidad
La falta de sistemas integrados impide:
- Seguimiento completo de historiales médicos
- Registro detallado de tratamientos veterinarios
- Control de calendario de vacunación y desparasitación
- Documentación de eventos reproductivos

## 1.3 Limitaciones en Análisis Genealógico
Sin herramientas especializadas, los productores:
- No pueden visualizar árboles familiares completos
- Desconocen riesgos de consanguinidad
- Pierden oportunidades de mejoramiento genético
- Cometen errores en selección de reproductores

## 1.4 Control de Inventario Deficiente
La gestión inadecuada de insumos resulta en:
- Pérdidas por vencimiento de medicamentos
- Desabastecimiento de alimentos críticos
- Falta de control de stock mínimo
- Ausencia de alertas preventivas

## 1.5 Problemas de Seguridad y Acceso
La carencia de sistemas de permisos genera:
- Modificaciones no autorizadas de datos
- Falta de auditoría de cambios
- Imposibilidad de asignar responsabilidades
- Riesgos de pérdida de información

---

# 2. OBJETIVO GENERAL

Desarrollar un sistema web integral de gestión ganadera basado en arquitectura PWA (Progressive Web App) que permita el registro, seguimiento y análisis científico de información de animales, optimizando la toma de decisiones mediante herramientas de análisis genealógico con grafos, control de salud veterinaria, planificación nutricional automatizada y gestión inteligente de inventario, implementando un sistema RBAC (Role-Based Access Control) con 8 roles especializados, navegación contextual y funcionalidad offline para operación en zonas con conectividad limitada.

---

# 3. OBJETIVOS ESPECÍFICOS

## 3.1 Desarrollo del Módulo de Gestión de Ganado
- Implementar sistema CRUD completo para registro de animales
- Diseñar ficha técnica individual con datos genealógicos
- Crear sistema de búsqueda multicriterio y filtros avanzados
- Desarrollar generador de códigos QR individuales
- Implementar exportación a Excel y PDF

## 3.2 Implementación del Módulo de Salud Veterinaria
- Crear expediente médico electrónico por animal
- Desarrollar sistema de protocolos de vacunación
- Implementar calendario de desparasitación automático
- Diseñar registro de tratamientos con alertas
- Generar reportes de salud poblacional

## 3.3 Desarrollo del Motor de Análisis Genealógico
- Implementar algoritmo de generación de árboles familiares
- Crear visualización interactiva mediante grafos (Vis.js)
- Desarrollar detector de consanguinidad
- Calcular coeficientes de parentesco
- Validar ciclos genealógicos inconsistentes

## 3.4 Creación del Sistema de Planificación Nutricional
- Implementar calculadora de peso metabólico (P^0.75)
- Desarrollar ajustes por especie, edad y estado
- Crear recomendaciones de forraje y concentrado
- Generar sugerencias de suplementación
- Diseñar planes nutricionales personalizados

## 3.5 Implementación del Módulo de Inventario Inteligente
- Desarrollar categorización en 5 tipos de insumos
- Crear sistema de alertas de stock crítico
- Implementar notificaciones de vencimiento
- Diseñar historial de movimientos
- Generar reportes de consumo

## 3.6 Desarrollo del Sistema de Seguridad RBAC
- Implementar 8 roles especializados
- Crear sistema de navegación contextual por rol
- Desarrollar validación de permisos en frontend y backend
- Implementar auditoría automática de cambios
- Diseñar sistema de recuperación con preguntas de seguridad

## 3.7 Implementación de PWA y Funcionalidad Offline
- Configurar Service Worker para cache inteligente
- Crear manifest.json para instalación
- Desarrollar estrategia cache-first para assets
- Implementar sincronización al restaurar conexión
- Optimizar para dispositivos móviles

## 3.8 Desarrollo del Sistema de Reportes y Exportación
- Implementar exportador PDF con FPDF
- Crear exportador Excel con OpenPyXL
- Diseñar dashboard analítico con Chart.js
- Generar reportes estadísticos automáticos
- Crear sistema de visualización de tendencias

---

# 4. JUSTIFICACIÓN

## 4.1 Importancia Sectorial y Económica
El sector ganadero representa un componente fundamental de la economía agrícola nacional. Según datos del sector, la producción ganadera contribuye significativamente al PIB agropecuario y genera empleo directo e indirecto en zonas rurales. La implementación de tecnologías de información permite:

- **Incremento de eficiencia operativa:** Reducción de tiempo en tareas administrativas hasta 60%
- **Optimización de recursos:** Mejor control de inventarios minimiza pérdidas por vencimiento
- **Toma de decisiones basada en datos:** Análisis histórico permite identificar tendencias
- **Mejoramiento genético sistemático:** Selección científica de reproductores
- **Cumplimiento normativo:** Facilita trazabilidad requerida por regulaciones

## 4.2 Accesibilidad Tecnológica mediante PWA
La elección de Progressive Web App como arquitectura se justifica por:

**Ventajas Técnicas:**
- No requiere instalación desde tiendas de aplicaciones
- Compatible con múltiples plataformas (Android, iOS, Desktop)
- Menor consumo de almacenamiento vs apps nativas
- Actualizaciones automáticas sin intervención del usuario

**Beneficios para el Usuario Final:**
- Funciona offline en zonas con conectividad limitada
- Instalable en pantalla de inicio
- Experiencia de usuario similar a app nativa
- Accesible desde cualquier navegador moderno

**Ventajas Económicas:**
- Desarrollo único para múltiples plataformas
- Menor costo de mantenimiento
- No requiere aprobación de tiendas
- Distribución inmediata de actualizaciones

## 4.3 Seguridad, Trazabilidad y Cumplimiento Legal

**Sistema RBAC Multinivel:**
- 8 roles especializados con permisos granulares
- Navegación contextual (cada rol inicia en su área)
- Validación en frontend y backend
- Desactivación/reactivación de usuarios
- Preguntas de seguridad para recuperación

**Auditoría Completa:**
- Tabla HistorialCambios con registro automático
- Trazabilidad: quién, cuándo, qué cambió
- Valores anteriores y nuevos preservados
- Inmutabilidad de logs
- Consultas forenses posibles

**Cumplimiento Normativo:**
- Documentación de tratamientos veterinarios
- Historial completo de medicación
- Trazabilidad para certificaciones
- Respaldo ante auditorías sanitarias

## 4.4 Innovación en Análisis Genealógico
La implementación de grafos para análisis genético representa una innovación significativa:

**Algoritmos Avanzados:**
- Visualización topológica de linajes
- Detección automática de consanguinidad
- Cálculo de coeficientes de parentesco
- Validación de consistencia genealógica

**Impacto en Mejoramiento Genético:**
- Selección científica de reproductores
- Prevención de apareamientos riesgosos
- Optimización de diversidad genética
- Planificación estratégica de cruces

**Ventaja Competitiva:**
- Pocas soluciones del mercado ofrecen esta funcionalidad
- Implementación con tecnología de grafos (Vis.js)
- Interfaz intuitiva para usuarios no técnicos

---

# 5. DIAGRAMAS DE FLUJO DE DATOS

## 5.1 Módulo de Autenticación y Navegación Contextual

```
INICIO
  ↓
Usuario accede al sistema (/)
  ↓
Renderizar página de login
  ↓
Usuario ingresa credenciales
  ↓
Enviar datos a /api/auth/login (POST)
  ↓
Backend: Verificar username en BD
  ↓
¿Usuario existe?
  ├─ NO → Retornar error "Usuario no encontrado"
  │         ↓
  │       Mostrar mensaje en frontend
  │         ↓
  │       Retornar a formulario de login
  │
  └─ SÍ → Verificar hash de contraseña (BCrypt)
            ↓
          ¿Contraseña correcta?
            ├─ NO → Retornar error "Contraseña incorrecta"
            │         ↓
            │       Mostrar mensaje en frontend
            │         ↓
            │       Retornar a formulario de login
            │
            └─ SÍ → Verificar usuario.activo == True
                      ↓
                    ¿Usuario activo?
                      ├─ NO → Retornar error "Usuario desactivado"
                      │         ↓
                      │       Mostrar mensaje
                      │         ↓
                      │       Retornar a login
                      │
                      └─ SÍ → Crear session['user_id']
                                ↓
                              Registrar ultimo_acceso
                                ↓
                              Determinar rol del usuario
                                ↓
                              Calcular initial_section según rol:
                                - veterinario → 'salud'
                                - nutricionista → 'nutricion'
                                - inventario → 'inventario'
                                - operador → 'ganado'
                                - auditor → 'auditoria'
                                - otros → 'dashboard'
                                ↓
                              Generar objeto permissions{}
                                ↓
                              Retornar success + redirect
                                ↓
                              Frontend: Redirigir a /
                                ↓
                              Backend: Renderizar index.html
                                ↓
                              Pasar initial_section y permissions
                                ↓
                              Frontend: Ejecutar showSection(initial_section)
                                ↓
                              Usuario en su sección contextual
                                ↓
                              FIN
```

## 5.2 Módulo de Gestión de Ganado (CRUD)

```
INICIO
  ↓
Usuario navega a sección Ganado
  ↓
Frontend: Ejecutar showSection('ganado')
  ↓
Verificar window.userPermissions.ver_dashboard_completo
  ↓
¿Permiso concedido?
  ├─ NO → Mostrar toast "Acceso restringido"
  │         ↓
  │       return (no cambiar sección)
  │         ↓
  │       FIN
  │
  └─ SÍ → Ocultar secciones anteriores
            ↓
          Mostrar #sec-ganado
            ↓
          Ejecutar loadGanado()
            ↓
          Enviar GET /api/ganado
            ↓
          Backend: @require_login verifica sesión
            ↓
          Backend: Ejecutar obtener_todos()
            ↓
          Consultar DB: Ganado.query.all()
            ↓
          Convertir a JSON: [animal.to_dict() for animal in animales]
            ↓
          Retornar JSON Response
            ↓
          Frontend: Recibir array de animales
            ↓
          Guardar en window.allAnimals
            ↓
          Renderizar tabla/tarjetas
            ↓
          Mostrar contadores estadísticos
            ↓
          FIN CARGA
            ↓
          ═══════════════════════════════════
          ACCIÓN: Usuario hace clic en "Agregar Animal"
            ↓
          Abrir modal de registro
            ↓
          Usuario completa formulario
            ↓
          Click en "Guardar"
            ↓
          Validar datos en frontend (campos requeridos)
            ↓
          ¿Válido localmente?
            ├─ NO → Mostrar errores en modal
            │         ↓
            │       return (mantener modal abierto)
            │
            └─ SÍ → Enviar POST /api/ganado
                      ↓
                    Backend: @require_permission('crear_animales')
                      ↓
                    ¿Usuario tiene permiso?
                      ├─ NO → HTTP 403 Forbidden
                      │         ↓
                      │       Frontend: Mostrar error
                      │         ↓
                      │       FIN
                      │
                      └─ SÍ → Validar datos en backend
                                ↓
                              Crear objeto Ganado()
                                ↓
                              db.session.add(ganado)
                                ↓
                              db.session.commit()
                                ↓
                              Registrar en HistorialCambios
                                (acción: "Creación", usuario_id)
                                ↓
                              Retornar success + ID nuevo
                                ↓
                              Frontend: Cerrar modal
                                ↓
                              Mostrar toast "Animal registrado"
                                ↓
                              Recargar loadGanado()
                                ↓
                              FIN
```

## 5.3 Módulo de Inventario con Alertas

```
INICIO
  ↓
Usuario en sección Inventario
  ↓
Frontend: Ejecutar loadInventario()
  ↓
Enviar GET /api/inventario
  ↓
Backend: Consultar DB (Insumo.query.all())
  ↓
Para cada insumo:
  ↓
  Calcular días_hasta_vencimiento
    = (fecha_vencimiento - hoy).days
  ↓
  ¿días_hasta_vencimiento <= 30?
    ├─ SÍ → Marcar como "próximo_vencimiento"
    │
    └─ NO → Estado normal
  ↓
  ¿cantidad <= stock_minimo?
    ├─ SÍ → Marcar como "stock_critico"
    │
    └─ NO → Estado normal
  ↓
Retornar JSON con insumos + alertas
  ↓
Frontend: Renderizar tabla
  ↓
Aplicar estilos visuales:
  - Stock crítico: Fondo rojo
  - Próximo vencimiento: Fondo amarillo
  ↓
Actualizar contador de alertas en Dashboard
  ↓
FIN CARGA
  ↓
═══════════════════════════════════
ACCIÓN: Usuario agrega/modifica insumo
  ↓
Abrir modal de insumo
  ↓
Completar formulario (nombre, categoría, cantidad, fecha_vencimiento)
  ↓
Click "Guardar"
  ↓
Enviar POST /api/inventario
  ↓
Backend: @require_permission('gestionar_inventario')
  ↓
Validar permisos
  ↓
¿Autorizado?
  ├─ NO → HTTP 403
  │
  └─ SÍ → Crear/Actualizar Insumo
            ↓
          Calcular automáticamente alertas
            ↓
          db.session.commit()
            ↓
          ¿Stock crítico O vence pronto?
            ├─ SÍ → Generar notificación
            │         ↓
            │       Registrar en tabla Alertas
            │         ↓
            │       Incrementar contador dashboard
            │
            └─ NO → Guardar normalmente
                      ↓
                    Retornar success
                      ↓
                    Frontend: Recargar inventario
                      ↓
                    Actualizar contadores
                      ↓
                    FIN
```

## 5.4 Módulo de Análisis Genealógico

```
INICIO
  ↓
Usuario selecciona animal
  ↓
Click en botón "Ver Genealogía"
  ↓
Enviar GET /api/genealogia/arbol/{animal_id}
  ↓
Backend: Obtener animal desde BD
  ↓
Ejecutar algoritmo recursivo:
  └─ función construir_arbol(animal, profundidad=0):
       ↓
       Crear nodo {id, nombre, info}
       ↓
       ¿profundidad < 3 Y tiene_madre?
         ├─ SÍ → construir_arbol(madre, profundidad+1)
         │         → Agregar como nodo padre
         │
         └─ NO → Continuar
       ↓
       ¿profundidad < 3 Y tiene_padre?
         ├─ SÍ → construir_arbol(padre, profundidad+1)
         │         → Agregar como nodo padre
         │
         └─ NO → Continuar
       ↓
       Retornar nodo con sub-árbol
  ↓
Construir objeto de grafo con:
  - nodes: [{id, label, info}]
  - edges: [{from, to, label}]
  ↓
Ejecutar detector de consanguinidad:
  └─ función detectar_consanguinidad(arbol):
       ↓
       Obtener todos los IDs de ancestros
       ↓
       Buscar IDs repetidos en ambas ramas
       ↓
       ¿Hay IDs repetidos?
         ├─ SÍ → Marcar como "consanguíneo"
         │         ↓
         │       Calcular coeficiente
         │
         └─ NO → Marcar como "genealogía limpia"
  ↓
Retornar JSON {nodes, edges, consanguinidad}
  ↓
Frontend: Recibir datos
  ↓
Inicializar Vis.js Network
  ↓
Configurar opciones de visualización:
  - Layout jerárquico
  - Flechas direccionales
  - Colores por generación
  ↓
Renderizar grafo interactivo
  ↓
¿Consanguinidad detectada?
  ├─ SÍ → Mostrar alerta visual
  │         ↓
  │       Resaltar nodos comunes
  │
  └─ NO → Visualización normal
            ↓
          FIN
```

---

# 6. DIAGRAMA RELACIONAL DE BASE DE DATOS

## 6.1 Modelo Entidad-Relación

El sistema utiliza una base de datos relacional normalizada en Tercera Forma Normal (3NF) con las siguientes tablas principales:

### Tabla: Ganado
**Clave Primaria:** id (Integer, AUTO_INCREMENT)

**Atributos:**
- especie (String 50, NOT NULL)
- raza (String 50)
- sexo (String 10, NOT NULL)
- fecha_nacimiento (Date)
- peso (Float)
- nombre (String 100)
- numero_identificacion (String 50, UNIQUE)
- estado (String 30) [Sano, Enfermo, En Tratamiento, Vendido, Muerto]
- observaciones (Text)
- fecha_registro (DateTime, DEFAULT NOW)

**Claves Foráneas:**
- madre_id → Ganado(id) [ON DELETE SET NULL]
- padre_id → Ganado(id) [ON DELETE SET NULL]

**Relaciones:**
- 1:N con HistorialMedico
- 1:1 con PlanNutricional
- 1:N con HistorialPeso
- 1:1 con ExpedienteMedico
- 1:N con HistorialCambios
- Auto-relación para genealogía (madre/padre)

### Tabla: Usuario
**Clave Primaria:** id (Integer, AUTO_INCREMENT)

**Atributos:**
- username (String 50, UNIQUE, NOT NULL)
- password_hash (String 255, NOT NULL)
- rol (String 50, NOT NULL) [admin, veterinario, nutricionista, operador, inventario, auditor, gerente, supervisor]
- nombre_completo (String 100)
- activo (Boolean, DEFAULT True)
- ultimo_acceso (DateTime)
- fecha_creacion (DateTime, DEFAULT NOW)

**Permisos (Boolean):**
- puede_crear_animales
- puede_editar_animales
- puede_eliminar_animales
- puede_ver_dashboard_completo
- puede_gestionar_salud
- puede_gestionar_nutricion
- puede_gestionar_inventario
- puede_gestionar_genealogia
- puede_gestionar_usuarios
- puede_ver_reportes
- puede_exportar
- puede_ver_analisis
- puede_ver_logs
- puede_aprobar_acciones
- puede_solo_lectura

**Preguntas de Seguridad:**
- pregunta_seguridad_1 (String 255)
- respuesta_1_hash (String 255)
- pregunta_seguridad_2 (String 255)
- respuesta_2_hash (String 255)
- pregunta_seguridad_3 (String 255)
- respuesta_3_hash (String 255)

**Relaciones:**
- 1:N con HistorialCambios

### Tabla: HistorialMedico
**Clave Primaria:** id (Integer, AUTO_INCREMENT)

**Atributos:**
- tipo (String 50) [Vacunación, Desparasitación, Tratamiento, Cirugía, Revisión]
- descripcion (Text, NOT NULL)
- medicamento (String 100)
- dosis (String 50)
- via_administracion (String 50)
- veterinario (String 100)
- fecha (Date, NOT NULL)
- costo (Float)
- observaciones (Text)
- proxima_dosis (Date)

**Claves Foráneas:**
- animal_id → Ganado(id) [ON DELETE CASCADE]

### Tabla: PlanNutricional
**Clave Primaria:** id (Integer, AUTO_INCREMENT)

**Atributos:**
- forraje_verde_kg (Float)
- concentrado_kg (Float)
- suplementos (Text)
- agua_litros (Float)
- frecuencia_alimentacion (Integer)
- calorias_totales (Float)
- proteina_total (Float)
- observaciones (Text)
- fecha_creacion (DateTime)
- fecha_actualizacion (DateTime)

**Claves Foráneas:**
- animal_id → Ganado(id) [ON DELETE CASCADE]

**Relación:**
- 1:1 con Ganado

### Tabla: Insumo
**Clave Primaria:** id (Integer, AUTO_INCREMENT)

**Atributos:**
- nombre (String 100, NOT NULL)
- categoria (String 50) [Médico, Alimento, Herramientas, Limpieza, Operativo]
- cantidad (Float, NOT NULL)
- unidad (String 20)
- stock_minimo (Float)
- proveedor (String 100)
- costo_unitario (Float)
- fecha_compra (Date)
- fecha_vencimiento (Date)
- ubicacion (String 100)
- observaciones (Text)

**Atributos Calculados:**
- dias_hasta_vencimiento (computed)
- estado_stock (computed: Normal, Crítico, Agotado)

### Tabla: HistorialCambios (Auditoría)
**Clave Primaria:** id (Integer, AUTO_INCREMENT)

**Atributos:**
- campo (String 100, NOT NULL)
- valor_anterior (String 255)
- valor_nuevo (String 255, NOT NULL)
- fecha_cambio (DateTime, DEFAULT NOW)
- ip_address (String 45)
- user_agent (String 255)

**Claves Foráneas:**
- animal_id → Ganado(id) [ON DELETE CASCADE]
- usuario_id → Usuario(id) [ON DELETE SET NULL]

**Índices:**
- idx_fecha_cambio (fecha_cambio DESC)
- idx_usuario (usuario_id)
- idx_animal (animal_id)

## 6.2 Relaciones Entre Tablas

```
Ganado (1) ─────< (N) HistorialMedico
  │
  ├─────< (N) HistorialPeso
  │
  ├─────< (N) HistorialCambios
  │
  ├────── (1) PlanNutricional
  │
  └─────> (1) Ganado [madre_id, padre_id] (auto-relación)

Usuario (1) ─────< (N) HistorialCambios

Insumo (independiente, sin FK)
```

## 6.3 Normalización

**Primera Forma Normal (1NF):**
- Todos los atributos son atómicos
- No hay grupos repetitivos
- Cada columna contiene un solo valor

**Segunda Forma Normal (2NF):**
- Cumple 1NF
- No hay dependencias parciales
- Todos los atributos no-clave dependen de la clave primaria completa

**Tercera Forma Normal (3NF):**
- Cumple 2NF
- No hay dependencias transitivas
- Atributos no-clave no dependen de otros atributos no-clave

**Ejemplo de normalización aplicada:**
- Información genealógica (madre_id, padre_id) NO está duplicada
- Especies, razas y sexos podrían normalizarse en tablas catálogo (opcional)
- Permisos de usuario están en la tabla Usuario (desnormalización intencional para rendimiento)

---

# 7. FUNCIONALIDAD DEL SISTEMA POR MÓDULOS

## 7.1 Dashboard Analítico en Tiempo Real

**Objetivo:** Proveer una vista consolidada de indicadores clave de rendimiento (KPIs) ganaderos.

**Funcionalidades:**
1. **Tarjetas Estadísticas Interactivas**
   - Población Total (con toggle por especie)
   - Peso Promedio (con gráfica de tendencia)
   - Alertas Activas (salud + inventario)
   - Animales en Estado Crítico

2. **Gráficas Dinámicas** (Chart.js)
   - Distribución por especie (Doughnut Chart)
   - Evolución de peso mensual (Line Chart)
   - Tratamientos por tipo (Bar Chart)
   - Stock de inventario (Radar Chart)

3. **Feed de Actividad Reciente**
   - Últimos 10 registros médicos
   - Alertas de stock crítico
   - Animales agregados hoy
   - Cambios pendientes de aprobación

4. **Exportación**
   - PDF del dashboard completo
   - Excel con datos tabulares

**Tecnologías:** Chart.js 4.0, FPDF, OpenPyXL

## 7.2 Gestión Integral de Ganado

**Objetivo:** Control completo del inventario animal con ficha técnica individual.

**Funcionalidades CRUD:**

**CREATE (Agregar Animal):**
- Formulario multi-step con validación
- Generación automática de ID único
- Asignación de código QR
- Cálculo automático de edad
- Validación de datos genealógicos

**READ (Consultar):**
- Vista de tabla (desktop) y tarjetas (mobile)
- Búsqueda en tiempo real (debounced)
- Filtros combinables: especie, raza, sexo, estado
- Ordenamiento por columna
- Paginación optimizada

**UPDATE (Editar):**
- Modificación de datos básicos
- Actualización de peso (genera historial)
- Cambio de estado
- Registro automático en HistorialCambios

**DELETE (Eliminar):**
- Configurado como borrado lógico (estado = "Eliminado")
- Opción de borrado físico (solo admin)
- Confirmación doble con modal "Action Challenge"
- Cascada a registros relacionados

**Características Adicionales:**
- Ficha técnica completa con tabs
- Generador de QR individual
- Timeline de eventos
- Vista de mapa genealógico
- Exportación individual a PDF

## 7.3 Módulo de Salud Veterinaria

**Objetivo:** Gestión completa de expedientes médicos y protocolos sanitarios.

**Funcionalidades:**

**Expediente Médico Digital:**
- Historial completo de tratamientos
- Registro de vacunaciones con calendario
- Control de desparasitación periódica
- Cirugías y procedimientos especiales
- Adjuntar documentos (análisis clínicos)

**Sistema de Alertas Médicas:**
- Notificaciones de próximas vacunas
- Recordatorios de desparasitación
- Animales en tratamiento activo
- Seguimiento post-operatorio

**Protocolos Predefinidos:**
- Calendario de vacunación por especie
- Protocolos de desparasitación estándar
- Tratamientos comunes precargados
- Dosis recomendadas por peso

**Reportes de Salud:**
- Estado sanitario general del rebaño
- Incidencia de enfermedades
- Costos de tratamientos por período
- Eficacia de protocolos aplicados

**Tecnologías:** Calendario interactivo, Chart.js para tendencias

## 7.4 Sistema de Planificación Nutricional Científica

**Objetivo:** Cálculo automático de requerimientos alimenticios basado en principios científicos.

**Algoritmo de Cálculo:**

```
Peso Metabólico = Peso^0.75

Requerimientos Base:
  - Forraje Verde = Peso Metabólico × Factor_Especie × 1.5
  - Concentrado = Peso Metabólico × 0.02 (si en producción)
  - Agua = Peso × 0.08 (8% del peso corporal)

Ajustes por Condición:
  - Gestación: +20% de requerimientos
  - Lactancia: +35% de requerimientos
  - Crecimiento (edad < 12 meses): +15%
  - Trabajo/Monta: +10%

Factores por Especie:
  - Bovino: 2.5
  - Ovino: 2.2
  - Caprino: 2.3
  - Porcino: 2.0
  - Equino: 2.8
```

**Funcionalidades:**
- Cálculo automático al ingresar peso y especie
- Recomendaciones de suplementos (minerales, vitaminas)
- Plan alimenticio semanal
- Ajuste por condición corporal
- Alerta de desnutrición/sobrepeso
- Costo estimado del plan

**Salida del Plan:**
- Cantidad diaria de forraje (kg)
- Cantidad de concentrado (kg)
- Litros de agua requeridos
- Suplementos necesarios
- Frecuencia de alimentación
- Costo mensual estimado

## 7.5 Motor de Análisis Genealógico con Grafos

**Objetivo:** Visualización interactiva de árboles familiares y detección científica de consanguinidad.

**Algoritmo de Construcción:**
1. Partir del animal seleccionado (nodo raíz)
2. Recursivamente obtener padre y madre hasta 3 generaciones
3. Construir grafo bidireccional con nodos y aristas
4. Aplicar layout jerárquico (Vis.js)

**Detector de Consanguinidad:**
```python
def detectar_consanguinidad(animal):
    ancestros_maternos = obtener_ancestros(animal.madre)
    ancestros_paternos = obtener_ancestros(animal.padre)
    
    comunes = ancestros_maternos.intersection(ancestros_paternos)
    
    if len(comunes) > 0:
        coeficiente = calcular_coeficiente_wright(comunes)
        return {
            'consanguineo': True,
            'coeficiente': coeficiente,
            'ancestros_comunes': list(comunes)
        }
    return {'consanguineo': False}
```

**Visualización Interactiva:**
- Grafo con Vis.js
- Nodos coloreados por generación
- Flechas direccionales (padre/madre)
- Zoom y pan
- Click en nodo para ver detalles
- Resaltado de ancestros comunes

**Reportes Genealógicos:**
- Árbol completo en PDF
- Coeficiente de consanguinidad
- Recomendaciones de cruces
- Diversidad genética del rebaño

## 7.6 Gestión Inteligente de Inventario

**Objetivo:** Control de stock de insumos con alertas automáticas.

**Categorías de Insumos:**
1. **Médico:** Vacunas, antibióticos, antiparasitarios
2. **Alimento:** Concentrados, sales minerales, forrajes
3. **Herramientas:** Equipos, instrumentos veterinarios
4. **Limpieza:** Desinfectantes, material de aseo
5. **Operativo:** Cuerdas, marcadores, aretes

**Sistema de Alertas:**
```python
def calcular_alerta(insumo):
    alertas = []
    
    # Alerta de stock crítico
    if insumo.cantidad <= insumo.stock_minimo:
        alertas.append('STOCK_CRITICO')
    
    # Alerta de vencimiento
    dias_restantes = (insumo.fecha_vencimiento - hoy).days
    if dias_restantes <= 30:
        alertas.append('PROXIMO_VENCIMIENTO')
    if dias_restantes <= 7:
        alertas.append('VENCIMIENTO_URGENTE')
    
    return alertas
```

**Funcionalidades:**
- Registro de entradas y salidas
- Historial de movimientos
- Cálculo de consumo promedio
- Predicción de desabastecimiento
- Generación de órdenes de compra
- Valorización de inventario

**Reportes:**
- Insumos por categoría
- Productos críticos
- Próximos a vencer
- Costos de inventario
- Consumo por período

## 7.7 Sistema de Auditoría Completa

**Objetivo:** Trazabilidad total de modificaciones al sistema.

**Tabla HistorialCambios:**
Registra automáticamente:
- Quién realizó el cambio (usuario_id)
- Cuándo se realizó (timestamp)
- Qué campo fue modificado
- Valor anterior
- Valor nuevo
- IP y navegador del usuario

**Implementación Automática:**
```python
@app.before_request
def log_changes():
    if request.method in ['POST', 'PUT', 'DELETE']:
        # Capturar datos antes del cambio
        registro_anterior = obtener_estado_actual()
        
        # Después del cambio
        @after_this_request
        def registrar(response):
            registro_nuevo = obtener_nuevo_estado()
            crear_log_auditoria(
                usuario=session['user_id'],
                antes=registro_anterior,
                despues=registro_nuevo
            )
            return response
```

**Vistas de Auditoría:**
- Timeline de cambios por animal
- Cambios por usuario
- Cambios en rango de fechas
- Cambios por tipo de acción
- Exportación de logs

## 7.8 Sistema RBAC con Navegación Contextual

**Objetivo:** Control de acceso granular con experiencia personalizada por rol.

**8 Roles Implementados:**

1. **Administrador**
   - Todos los permisos
   - Gestión de usuarios
   - Configuración del sistema
   - Sección inicial: Dashboard

2. **Gerente**
   - Ver reportes completos
   - Aprobar acciones
   - Ver logs de auditoría
   - Sección inicial: Dashboard

3. **Veterinario**
   - Gestionar salud
   - Gestionar genealogía
   - Ver reportes médicos
   - Sección inicial: Salud

4. **Nutricionista**
   - Gestionar nutrición
   - Ver análisis
   - Crear planes alimenticios
   - Sección inicial: Nutrición

5. **Supervisor**
   - Crear/Editar animales
   - Ver reportes
   - Exportar datos
   - Sección inicial: Dashboard

6. **Operador**
   - Crear/Editar animales
   - Ver dashboard básico
   - Sin eliminar ni logs
   - Sección inicial: Ganado

7. **Inventario**
   - Gestionar inventario
   - Ver stock
   - Generar órdenes
   - Sección inicial: Inventario

8. **Auditor**
   - Solo lectura total
   - Ver logs
   - Exportar reportes
   - Sección inicial: Auditoría

**Navegación Contextual:**
```python
# Backend determina sección inicial
if rol == 'veterinario': initial_section = 'salud'
elif rol == 'nutricionista': initial_section = 'nutricion'
elif rol == 'inventario': initial_section = 'inventario'
elif rol == 'operador': initial_section = 'ganado'
elif rol == 'auditor': initial_section = 'auditoria'
else: initial_section = 'dashboard'
```

**Validación en Frontend:**
```javascript
function showSection(id) {
    if (window.userPermissions) {
        if (!checkPermission(id)) {
            agroToast('Acceso restringido', 'warning');
            return;
        }
    }
    // Cambiar sección
}
```

---

# 8. DICCIONARIO DE DATOS COMPLETO

## 8.1 Tabla: Ganado

| Campo | Tipo | Longitud | Nulo | Default | Descripción |
|-------|------|----------|------|---------|-------------|
| id | INTEGER | - | NO | AUTO | Identificador único autoincrementable |
| especie | VARCHAR | 50 | NO | - | Bovino, Ovino, Caprino, Porcino, Equino |
| raza | VARCHAR | 50 | SÍ | NULL | Raza específica del animal |
| sexo | VARCHAR | 10 | NO | - | Macho, Hembra, Castrado |
| fecha_nacimiento | DATE | - | SÍ | NULL | Fecha de nacimiento o estimada |
| peso | FLOAT | - | SÍ | NULL | Peso actual en kilogramos |
| nombre | VARCHAR | 100 | SÍ | NULL | Nombre o apodo del animal |
| numero_identificacion | VARCHAR | 50 | SÍ | NULL | Arete, tatuaje o chip RFID (UNIQUE) |
| estado | VARCHAR | 30 | NO | 'Sano' | Sano, Enfermo, En Tratamiento, Vendido, Muerto |
| observaciones | TEXT | - | SÍ | NULL | Notas adicionales de campo libre |
| fecha_registro | DATETIME | - | NO | NOW() | Timestamp de creación del registro |
| madre_id | INTEGER | - | SÍ | NULL | FK a Ganado(id) - Progenitora |
| padre_id | INTEGER | - | SÍ | NULL | FK a Ganado(id) - Progenitor |

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (numero_identificacion)
- INDEX idx_especie (especie)
- INDEX idx_estado (estado)
- INDEX idx_madre (madre_id)
- INDEX idx_padre (padre_id)

**Triggers:**
- BEFORE INSERT: Validar que madre_id sea sexo Hembra
- BEFORE INSERT: Validar que padre_id sea sexo Macho
- AFTER UPDATE: Registrar cambio en HistorialCambios

## 8.2 Tabla: Usuario

| Campo | Tipo | Longitud | Nulo | Default | Descripción |
|-------|------|----------|------|---------|-------------|
| id | INTEGER | - | NO | AUTO | Identificador único |
| username | VARCHAR | 50 | NO | - | Nombre de usuario (UNIQUE) |
| password_hash | VARCHAR | 255 | NO | - | Hash BCrypt de contraseña |
| rol | VARCHAR | 50 | NO | - | admin, veterinario, nutricionista, etc. |
| nombre_completo | VARCHAR | 100 | SÍ | NULL | Nombre real del usuario |
| activo | BOOLEAN | - | NO | TRUE | Estado del usuario |
| ultimo_acceso | DATETIME | - | SÍ | NULL | Última fecha/hora de login |
| fecha_creacion | DATETIME | - | NO | NOW() | Timestamp de creación |
| puede_crear_animales | BOOLEAN | - | NO | FALSE | Permiso CRUD - Crear |
| puede_editar_animales | BOOLEAN | - | NO | FALSE | Permiso CRUD - Editar |
| puede_eliminar_animales | BOOLEAN | - | NO | FALSE | Permiso CRUD - Eliminar |
| puede_ver_dashboard_completo | BOOLEAN | - | NO | FALSE | Acceso a dashboard completo |
| puede_gestionar_salud | BOOLEAN | - | NO | FALSE | Módulo de salud veterinaria |
| puede_gestionar_nutricion | BOOLEAN | - | NO | FALSE | Módulo de nutrición |
| puede_gestionar_inventario | BOOLEAN | - | NO | FALSE | Módulo de inventario |
| puede_gestionar_genealogia | BOOLEAN | - | NO | FALSE | Módulo de genealogía |
| puede_gestionar_usuarios | BOOLEAN | - | NO | FALSE | Gestión de usuarios |
| puede_ver_reportes | BOOLEAN | - | NO | FALSE | Acceso a reportes |
| puede_exportar | BOOLEAN | - | NO | FALSE | Exportación PDF/Excel |
| puede_ver_analisis | BOOLEAN | - | NO | FALSE | Análisis avanzados |
| puede_ver_logs | BOOLEAN | - | NO | FALSE | Auditoría y logs |
| puede_aprobar_acciones | BOOLEAN | - | NO | FALSE | Workflow de aprobaciones |
| puede_solo_lectura | BOOLEAN | - | NO | FALSE | Solo consulta |
| pregunta_seguridad_1 | VARCHAR | 255 | SÍ | NULL | Primera pregunta de seguridad |
| respuesta_1_hash | VARCHAR | 255 | SÍ | NULL | Hash de respuesta 1 |
| pregunta_seguridad_2 | VARCHAR | 255 | SÍ | NULL | Segunda pregunta |
| respuesta_2_hash | VARCHAR | 255 | SÍ | NULL | Hash de respuesta 2 |
| pregunta_seguridad_3 | VARCHAR | 255 | SÍ | NULL | Tercera pregunta |
| respuesta_3_hash | VARCHAR | 255 | SÍ | NULL | Hash de respuesta 3 |

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (username)
- INDEX idx_rol (rol)
- INDEX idx_activo (activo)

**Constraints:**
- CHECK (rol IN ('admin', 'veterinario', 'nutricionista', 'operador', 'inventario', 'auditor', 'gerente', 'supervisor'))

## 8.3 Tabla: HistorialMedico

| Campo | Tipo | Longitud | Nulo | Default | Descripción |
|-------|------|----------|------|---------|-------------|
| id | INTEGER | - | NO | AUTO | Identificador único |
| animal_id | INTEGER | - | NO | - | FK a Ganado(id) ON DELETE CASCADE |
| tipo | VARCHAR | 50 | NO | - | Vacunación, Desparasitación, Tratamiento, Cirugía, Revisión |
| descripcion | TEXT | - | NO | - | Descripción detallada del procedimiento |
| medicamento | VARCHAR | 100 | SÍ | NULL | Nombre del medicamento usado |
| dosis | VARCHAR | 50 | SÍ | NULL | Dosis administrada (ej: "5ml", "2 pastillas") |
| via_administracion | VARCHAR | 50 | SÍ | NULL | IM, IV, SC, Oral, Tópica |
| veterinario | VARCHAR | 100 | SÍ | NULL | Nombre del veterinario responsable |
| fecha | DATE | - | NO | - | Fecha del procedimiento |
| costo | FLOAT | - | SÍ | NULL | Costo del tratamiento |
| observaciones | TEXT | - | SÍ | NULL | Notas adicionales |
| proxima_dosis | DATE | - | SÍ | NULL | Fecha de siguiente aplicación |

**Índices:**
- PRIMARY KEY (id)
- INDEX idx_animal (animal_id)
- INDEX idx_tipo (tipo)
- INDEX idx_fecha (fecha DESC)
- INDEX idx_proxima_dosis (proxima_dosis)

**Constraints:**
- FOREIGN KEY (animal_id) REFERENCES Ganado(id) ON DELETE CASCADE

## 8.4 Tabla: PlanNutricional

| Campo | Tipo | Longitud | Nulo | Default | Descripción |
|-------|------|----------|------|---------|-------------|
| id | INTEGER | - | NO | AUTO | Identificador único |
| animal_id | INTEGER | - | NO | - | FK a Ganado(id) ON DELETE CASCADE (UNIQUE) |
| forraje_verde_kg | FLOAT | - | SÍ | NULL | Cantidad diaria de forraje en kg |
| concentrado_kg | FLOAT | - | SÍ | NULL | Cantidad diaria de concentrado en kg |
| suplementos | TEXT | - | SÍ | NULL | Lista de suplementos (minerales, vitaminas) |
| agua_litros | FLOAT | - | SÍ | NULL | Litros de agua diarios requeridos |
| frecuencia_alimentacion | INTEGER | - | SÍ | 2 | Veces al día de alimentación |
| calorias_totales | FLOAT | - | SÍ | NULL | Calorías estimadas del plan |
| proteina_total | FLOAT | - | SÍ | NULL | Proteína en gramos |
| observaciones | TEXT | - | SÍ | NULL | Notas del nutricionista |
| fecha_creacion | DATETIME | - | NO | NOW() | Timestamp de creación |
| fecha_actualizacion | DATETIME | - | SÍ | NULL | Última modificación |

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (animal_id)

**Constraints:**
- FOREIGN KEY (animal_id) REFERENCES Ganado(id) ON DELETE CASCADE

## 8.5 Tabla: Insumo

| Campo | Tipo | Longitud | Nulo | Default | Descripción |
|-------|------|----------|------|---------|-------------|
| id | INTEGER | - | NO | AUTO | Identificador único |
| nombre | VARCHAR | 100 | NO | - | Nombre del insumo |
| categoria | VARCHAR | 50 | NO | - | Médico, Alimento, Herramientas, Limpieza, Operativo |
| cantidad | FLOAT | - | NO | 0 | Cantidad disponible |
| unidad | VARCHAR | 20 | SÍ | 'unidad' | kg, litros, unidad, paquete, caja |
| stock_minimo | FLOAT | - | NO | 0 | Cantidad mínima antes de alerta |
| proveedor | VARCHAR | 100 | SÍ | NULL | Nombre del proveedor |
| costo_unitario | FLOAT | - | SÍ | NULL | Precio por unidad |
| fecha_compra | DATE | - | SÍ | NULL | Fecha de adquisición |
| fecha_vencimiento | DATE | - | SÍ | NULL | Fecha de caducidad |
| ubicacion | VARCHAR | 100 | SÍ | NULL | Bodega, estante específico |
| observaciones | TEXT | - | SÍ | NULL | Notas adicionales |

**Índices:**
- PRIMARY KEY (id)
- INDEX idx_categoria (categoria)
- INDEX idx_fecha_vencimiento (fecha_vencimiento)
- INDEX idx_stock (cantidad, stock_minimo)

**Constraints:**
- CHECK (categoria IN ('Médico', 'Alimento', 'Herramientas', 'Limpieza', 'Operativo'))
- CHECK (cantidad >= 0)

## 8.6 Tabla: HistorialCambios

| Campo | Tipo | Longitud | Nulo | Default | Descripción |
|-------|------|----------|------|---------|-------------|
| id | INTEGER | - | NO | AUTO | Identificador único |
| animal_id | INTEGER | - | NO | - | FK a Ganado(id) ON DELETE CASCADE |
| usuario_id | INTEGER | - | SÍ | NULL | FK a Usuario(id) ON DELETE SET NULL |
| campo | VARCHAR | 100 | NO | - | Nombre del campo modificado |
| valor_anterior | VARCHAR | 255 | SÍ | NULL | Valor antes del cambio |
| valor_nuevo | VARCHAR | 255 | NO | - | Valor después del cambio |
| fecha_cambio | DATETIME | - | NO | NOW() | Timestamp del cambio |
| ip_address | VARCHAR | 45 | SÍ | NULL | IP del cliente (IPv4 o IPv6) |
| user_agent | VARCHAR | 255 | SÍ | NULL | Navegador y SO del usuario |

**Índices:**
- PRIMARY KEY (id)
- INDEX idx_animal (animal_id)
- INDEX idx_usuario (usuario_id)
- INDEX idx_fecha (fecha_cambio DESC)
- INDEX idx_campo (campo)

**Constraints:**
- FOREIGN KEY (animal_id) REFERENCES Ganado(id) ON DELETE CASCADE
- FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE SET NULL

---

# 9. ARQUITECTURA TECNOLÓGICA

## 9.1 Stack Backend

**Framework:** Flask 2.3+
- Microframework web ligero
- Routing flexible con blueprints
- Jinja2 para templates
- Werkzeug para WSGI

**ORM:** SQLAlchemy 2.0+
- Mapeo objeto-relacional
- Migraciones con Alembic
- Query builder expresivo
- Soporte multi-DB

**Base de Datos:** SQLite 3
- Embebida, sin servidor
- Portátil (un solo archivo)
- Adecuada para 10K-100K registros
- Migrable a PostgreSQL/MySQL

**Seguridad:**
- BCrypt para hashing de contraseñas
- Flask-Session para manejo de sesiones
- CSRF protection
- SQL Injection prevention (ORM)

**Librerías de Exportación:**
- FPDF para generación de PDFs
- OpenPyXL para archivos Excel
- Matplotlib para gráficas embebidas

## 9.2 Stack Frontend

**Core:** Vanilla JavaScript ES6+
- Sin frameworks pesados
- Módulos ES6
- Async/Await
- Fetch API

**UI Framework:** Tailwind CSS 3
- Utility-first CSS
- Responsive design
- JIT compilation
- Diseño glassmorphism

**Visualización de Datos:**
- Chart.js 4.0 para gráficas
- Vis.js para grafos genealógicos
- Font Awesome 6 para iconos

**PWA:**
- Service Worker para cache
- Manifest.json configurado
- Estrategia offline-first
- Instalable en móviles

## 9.3 Arquitectura PWA

**Manifest.json:**
```json
{
  "name": "Agro-Master",
  "short_name": "Agro",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    {"src": "/static/icons/icon-192.png", "sizes": "192x192"},
    {"src": "/static/icons/icon-512.png", "sizes": "512x512"}
  ]
}
```

**Service Worker Strategy:**
- **Cache-first:** CSS, JS, imágenes (assets estáticos)
- **Network-first:** API calls (datos dinámicos)
- **Offline fallback:** Página de "Sin conexión"

## 9.4 Patrones de Diseño Implementados

1. **MVC (Model-View-Controller)**
   - Models: SQLAlchemy classes
   - Views: Jinja2 templates
   - Controllers: Flask routes

2. **Blueprint Pattern**
   - Rutas modulares por dominio
   - Separación de responsabilidades

3. **Service Layer**
   - Lógica de negocio en `services/`
   - Desacoplada de rutas

4. **Repository Pattern**
   - Funciones centralizadas de acceso a datos
   - Abstracción de queries

5. **Decorator Pattern**
   - `@require_login`
   - `@require_permission`
   - `@admin_only`

6. **Factory Pattern**
   - Creación de exportadores
   - Generación de reportes

7. **Observer Pattern**
   - Sistema de notificaciones
   - Alertas automáticas

---

# 10. CONCLUSIONES

## 10.1 Logros del Proyecto

El sistema Agro-Master representa una solución integral que aborda exitosamente las problemáticas identificadas en el sector ganadero:

1. **Digitalización Completa:** Transición de procesos manuales a sistema automatizado
2. **Trazabilidad Total:** Registro histórico completo de todos los eventos
3. **Análisis Científico:** Herramientas basadas en algoritmos para toma de decisiones
4. **Accesibilidad:** PWA funcional en dispositivos móviles con conectividad limitada
5. **Seguridad Robusta:** Sistema RBAC con auditoría completa
6. **Escalabilidad:** Arquitectura preparada para crecimiento

## 10.2 Innovaciones Destacadas

- **Navegación Contextual por Rol:** Primera implementación en soluciones ganaderas
- **Análisis Genealógico con Grafos:** Visualización científica de linajes
- **PWA Offline-First:** Operación en campo sin conectividad
- **Auditoría Automática:** Trazabilidad legal de todas las acciones
- **Calculadora Nutricional:** Basada en peso metabólico científico

## 10.3 Impacto Esperado

- Reducción de 60% en tiempo administrativo
- Incremento de 30% en eficiencia de control sanitario
- Mejora de 25% en planificación nutricional
- Reducción de 40% en pérdidas por vencimiento de insumos
- Optimización de programas de mejoramiento genético

---

**Desarrollado por:** Cristian J. García  
**CI:** 32.170.910  
**Versión:** 2.1.0  
**Fecha:** 2026  
