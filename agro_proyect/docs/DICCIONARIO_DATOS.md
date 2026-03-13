# Diccionario de Datos - Agro-Master v2.5
> **PRODUCTOR UNICO:** CRISTIAN J GARCIA | CI: 32.170.910 | Email: dicrisog252@gmail.com

Este documento detalla la estructura técnica de la base de datos de Agro-Master, incluyendo tablas, campos, tipos de datos y relaciones.

## 1. Entidades Maestras (Core)

### Tabla: `ganado`
Almacena el registro individual de cada animal.
| Campo | Tipo | Nulable | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Integer | No | PK. Identificador único del animal. |
| `especie_id` | Integer | No | FK -> `especie.id`. |
| `raza_id` | Integer | No | FK -> `raza.id`. |
| `sexo_id` | Integer | No | FK -> `sexo.id`. |
| `fecha_nacimiento` | String(10) | No | Formato YYYY-MM-DD. |
| `edad` | Integer | No | Calculada en meses. |
| `peso` | Float | No | Peso actual en kilogramos. |
| `estado_id` | Integer | Sí | FK -> `estado_animal.id`. |
| `padre_id` | Integer | Sí | FK -> `ganado.id` (Auto-relación). |
| `madre_id` | Integer | Sí | FK -> `ganado.id` (Auto-relación). |

### Tabla: `insumo`
Gestión de stock e inventario.
| Campo | Tipo | Nulable | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Integer | No | PK. Identificador del producto. |
| `nombre` | String(100) | No | Nombre comercial del insumo. |
| `categoria_id` | Integer | No | FK -> `categoria_insumo.id` (Médico, Alimento, etc). |
| `cantidad` | Float | No | Existencia actual en almacén. |
| `unidad_id` | Integer | No | FK -> `unidad_medida.id`. |
| `stock_minimo` | Float | No | Umbral para alertas de reabastecimiento. |
| `fecha_vencimiento`| Date | Sí | Crítico para productos médicos. |
| `ubicacion` | String(100) | Sí | Almacén o estante físico. |

---

## 2. Definición de Catálogos (Lookup Tables)

| Tabla | Campos | Propósito |
| :--- | :--- | :--- |
| `especie` | `id, nombre` | Define tipos (Bovino, Ovino, Caprino, Porcino). |
| `raza` | `id, nombre, especie_id` | Razas específicas por especie. |
| `sexo` | `id, nombre` | Macho / Hembra. |
| `estado_animal` | `id, nombre` | Sano, Enfermo, Cuarentena, Vendido, Muerto. |
| `categoria_insumo`| `id, nombre` | Médico, Alimenticio, Operativo, Herramienta, Limpieza. |
| `unidad_medida` | `id, nombre` | kg, lt, ml, unidad, bulto. |
| `tipo_evento_medico`| `id, nombre` | Vacunación, Desparasitación, Cirugía, Chequeo. |

### Tabla: `pregunta_seguridad`
Almacena los retos de recuperación para los usuarios.
| Campo | Tipo | Nulable | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Integer | No | PK. Identificador del reto. |
| `usuario_id` | Integer | No | FK -> `usuario.id`. |
| `pregunta` | String(255) | No | Texto de la pregunta de seguridad. |
| `respuesta_hash`| String(255) | No | Hash seguro de la respuesta (PBKDF2-SHA256). |

---

## 3. Seguridad y Usuarios

### Tabla: `usuario`
Catálogo de usuarios y matriz de permisos (RBAC).
| Campo | Tipo | Nulable | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Integer | No | PK. Identificador del usuario. |
| `username` | String(100) | No | Único. Nombre de usuario para login. |
| `email` | String(120) | No | Único. Correo electrónico institucional. |
| `rol` | String(50) | No | admin, veterinario, supervisor, operador, consultor, nutricionista, inventario, auditor, gerente. |
| `password_hash`| String(255) | No | Hash seguro de la contraseña (PBKDF2). |
| `activo` | Boolean | No | Estado de la cuenta (Soft Delete si es False). |
| `cambio_password_requerido`| Boolean | No | Flag de seguridad para forzar cambio de clave. |
| `ultimo_acceso` | DateTime | Sí | Registro de la última sesión exitosa. |

---

## 4. Historiales y Seguimiento

### Tabla: `historial_medico`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Integer | PK. |
| `animal_id` | Integer | FK -> `ganado.id`. |
| `tipo_id` | Integer | FK -> `tipo_evento_medico.id`. |
| `descripcion` | String(200) | Notas clínicas. |
| `fecha` | DateTime | Fecha y hora del evento. |
| `veterinario_id` | Integer | FK -> `usuario.id`. |

### Tabla: `protocolo_salud` (Agenda)
Gestiona eventos futuros y pendientes. 
*Incluye campos de `medicamento` y `dosis` para trazabilidad operativa.*

---

## 5. Gestión Operativa y Económica
 
### Tabla: `movimiento_financiero`
Registro de entradas y salidas de dinero.
| Campo | Tipo | Nulable | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Integer | No | PK. Identificador del movimiento. |
| `tipo` | String(20) | No | Enum: "Ingreso" o "Gasto". |
| `categoria` | String(100)| No | Venta Animal, Nutrición, Servicios, Nómina, etc. |
| `subcategoria` | String(100)| Sí | Detalle (ej. "Antiparasitarios" dentro de "Salud"). |
| `monto` | Float | No | Valor en moneda local (USD por defecto). |
| `fecha` | Date | No | Fecha contable del movimiento. |
| `estado` | String(50) | No | "Completado", "Pendiente", "Cancelado". |
| `usuario_id` | Integer | Sí | FK -> `usuario.id`. Quién registró el movimiento. |

### Tabla: `registro_produccion`
Histórico de rendimiento animal.
| Campo | Tipo | Nulable | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Integer | No | PK. |
| `animal_id` | Integer | No | FK -> `ganado.id`. |
| `tipo_produccion`| String(50) | No | "Leche", "Carne", "Lana", "Huevos". |
| `cantidad` | Float | No | Litros, Kilos, Unidades. |
| `fecha` | DateTime | No | Fecha y hora exacta (importante para turno). |
| `turno` | String(20) | Sí | "Mañana", "Tarde". |
| `calidad` | String(50) | Sí | Premium, Estándar, Baja (o % Sólidos). |

### Tabla: `lote`
Agrupación física de animales.
| Campo | Tipo | Nulable | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Integer | No | PK. |
| `nombre` | String(100)| No | Ej. "Lote de Ordeño 1", "Engorde A". |
| `descripcion` | String(255)| Sí | Detalles sobre la ubicación o propósito. |
| `capacidad` | Integer | No | Límite máximo de animales sugerido. |

### Tabla: `plan_maternidad`
Seguimiento reproductivo avanzado.
| Campo | Tipo | Nulable | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Integer | No | PK. |
| `animal_id` | Integer | No | FK -> `ganado.id`. |
| `fecha_servicio` | Date | No | Fecha de monta o inseminación. |
| `fecha_probable_parto`| Date | No | Calculada automáticamente según especie. |
| `padre_id` | Integer | Sí | FK -> `ganado.id`. Toro semental. |
| `estado` | String(50) | No | "Gestante", "Aborto", "Parto Exitoso". |

### Tabla: `evento_calendario`
Agenda unificada.
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Integer | PK. |
| `titulo` | String(100)| Resumen del evento. |
| `descripcion` | String(200)| Detalles extendidos. |
| `fecha_inicio` | DateTime | Inicio del evento. |
| `fecha_fin` | DateTime | Fin estimado. |
| `tipo` | String(50) | "Salud", "Manejo", "Finanzas", "Reunión", "Otro". |
| `completado` | Boolean | True si ya se realizó. |
| `animal_id` | Integer | FK opcional para vincular a animal. |

---
 
**Versión:** 3.0 (Actualizada)  
**Fecha:** 2026-02-10  
**Autor:** Gestión de Datos AGRO-MASTER
