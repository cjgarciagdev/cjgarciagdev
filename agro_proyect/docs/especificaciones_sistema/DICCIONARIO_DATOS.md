# Diccionario de Datos Integral - Agro-Master
> **PRODUCTOR UNICO:** CRISTIAN J GARCIA | CI: 32.170.910 | Email: dicrisog252@gmail.com

Este documento contiene la definición técnica exhaustiva de todas las tablas del sistema, garantizando la integridad referencial y la normalización de la información.

## 1. Núcleo: Gestión Ganadera
### 1.1. Tabla: `ganado` (Entidad Pivote)
| Campo | Tipo | Vínculo | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK | Identificador único del ejemplar. |
| `especie_id`| INT | FK -> `especie` | Categoría biológica (Bovino, Ovino, etc.). |
| `raza_id` | INT | FK -> `raza` | Sub-tipo genético normalizado. |
| `sexo_id` | INT | FK -> `sexo` | Género (Macho/Hembra). |
| `estado_id` | INT | FK -> `estado_animal`| Condición actual (Sano, Enfermo, Gestante). |
| `padre_id` | INT | FK -> `ganado` | Referencia recursiva al progenitor. |
| `madre_id` | INT | FK -> `ganado` | Referencia recursiva a la progenitora. |
| `peso` | FLOAT | - | Peso actual (valor denormalizado para performance). |
| `fecha_nacimiento` | DATE | - | Punto cero para el cálculo de edad. |

### 1.2. Tabla: `registro_peso`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `animal_id` | INT | FK -> `ganado`. |
| `peso` | FLOAT | Valor del pesaje en ese momento. |
| `fecha` | DATE | Fecha cronológica del registro. |

---

## 2. Salud Veterinaria y Seguimiento
### 2.1. Tabla: `historial_medico` (Memoria Clínica)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | INT | PK. Registro único de intervención. |
| `animal_id` | INT | FK -> `ganado`. |
| `tipo_id` | INT | FK -> `tipo_evento_medico`. |
| `veterinario_id`| INT | FK -> `usuario`. Firma responsable. |
| `descripcion` | TEXT | Detalles de síntomas y procedimientos. |

### 2.2. Tabla: `protocolo_salud` (Agenda Preventiva)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `fecha_programada` | DATE | Fecha futura de ejecución. |
| `estado_id` | INT | FK -> `estado_protocolo` (Pendiente/Realizado). |
| `medicamento` | STR | Fármaco a aplicar. |

---

## 3. Nutrición y Reproducción
### 3.1. Tabla: `plan_nutricional`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `cantidad_forraje`| FLOAT| Consumo diario de pasto/verde recomendado. |
| `cantidad_concentrado`| FLOAT| Suplemento balanceado diario. |
| `activo` | BOOL | Define si es la dieta actual del animal. |

### 3.2. Tabla: `plan_maternidad`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `animal_id` | INT | FK (Hembras únicamente). |
| `tipo_plan_id` | INT | FK (Gestación, Lactancia, etc.). |
| `fecha_probable_parto` | DATE | Fecha calculada DPP. |

---

## 4. Control de Acceso y Auditoría
### 4.1. Tabla: `usuario` (Seguridad RBAC)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `username` | STR | Credencial única de acceso. |
| `rol` | STR | Rol de acceso (admin, veterinario, etc.). |
| `pued_exportar` | BOOL | Flag de permiso para reportes. |

### 4.2. Tabla: `historial_cambios` (Auditoría)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `animal_id` | INT | Animal afectado por el cambio. |
| `usuario_id` | INT | Responsable de la modificación. |
| `snapshot` | TEXT | Estado anterior de los datos (JSON). |
