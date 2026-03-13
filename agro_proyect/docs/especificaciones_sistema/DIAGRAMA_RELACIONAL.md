# Diagrama Entidad-Relación Integral (ERD)
> **PRODUCTOR UNICO:** CRISTIAN J GARCIA | CI: 32.170.910 | Email: dicrisog252@gmail.com

Este diagrama abarca la totalidad de las entidades y relaciones del sistema Agro-Master.

```mermaid
erDiagram
    %% Eje Central
    GANADO ||--o{ REGISTRO_PESO : "histórico de crecimiento"
    GANADO ||--o{ HISTORIAL_MEDICO : "eventos clínicos"
    GANADO ||--o{ PROTOCOLO_SALUD : "agenda veterinaria"
    GANADO ||--o{ PLAN_NUTRICIONAL : "dieta activa"
    GANADO ||--o{ PLAN_MATERNIDAD : "reproducción"
    GANADO ||--o{ HISTORIAL_CAMBIOS : "auditoría"
    GANADO ||--|| EXPEDIENTE_MEDICO : "ficha clínica fija"
    GANADO ||--o{ PREDICCION_PRODUCTIVIDAD : "proyecciones"
    GANADO ||--o{ ANALISIS_AVANZADO : "datos de grafos"
    GANADO |o--o| GANADO : "padre/madre (recursiva)"

    %% Catálogos de Ganado
    GANADO }|--|| ESPECIE : "tipo"
    GANADO }|--|| RAZA : "linaje"
    GANADO }|--|| SEXO : "género"
    GANADO }|--|| ESTADO_ANIMAL : "condición"
    RAZA }|--|| ESPECIE : "sub-catálogo"

    %% Salud y Medicina
    HISTORIAL_MEDICO }|--|| TIPO_EVENTO_MEDICO : "categoría"
    HISTORIAL_MEDICO }|--|| USUARIO : "registrado por (vete)"
    PROTOCOLO_SALUD }|--|| TIPO_PROTOCOLO : "clase"
    PROTOCOLO_SALUD }|--|| ESTADO_PROTOCOLO : "estatus"
    PROTOCOLO_SALUD }|--|| USUARIO : "asignado a"
    VACUNA }|--|| ESPECIE : "uso específico por"

    %% Nutrición e Insumos
    PLAN_NUTRICIONAL }|--|| TIPO_ALIMENTACION : "estilo"
    INSUMO }|--|| CATEGORIA_INSUMO : "tipo stock"
    INSUMO }|--|| UNIDAD_MEDIDA : "métrica"
    
    %% Maternidad
    PLAN_MATERNIDAD }|--|| TIPO_PLAN_REPRODUCTIVO : "fase"

    %% Seguridad y Logs
    USUARIO ||--o{ HISTORIAL_CAMBIOS : "realiza"
    USUARIO ||--o{ ERROR_LOG : "reporta (opcional)"

    GANADO {
        int id PK
        int especie_id FK
        int raza_id FK
        int sexo_id FK
        int estado_id FK
        string fecha_nacimiento
        int edad
        float peso
        int padre_id FK
        int madre_id FK
    }

    USUARIO {
        int id PK
        string username
        string rol
        boolean activo
    }

    PLAN_NUTRICIONAL {
        int id PK
        int animal_id FK
        float cantidad_forraje
        float cantidad_concentrado
        string agua
        string suplementos
        boolean activo
    }

    INSUMO {
        int id PK
        string nombre
        float cantidad
        int categoria_id FK
        int unidad_id FK
    }
```

## Relaciones Críticas Operativas
1.  **Núcleo Biológico (`GANADO`)**: Es la entidad pivote. Casi todas las tablas nacen de un ID de animal.
2.  **Sistema de Usuarios (`USUARIO`)**: No solo gestiona el acceso, sino que vincula responsabilidades en `HistorialMedico` y `Protocolos`, actuando como la firma auditiva de cada acción.
3.  **Catálogos Normalizados**: Garantizan que el sistema no colapse por errores tipográficos en especies o unidades de medida.
4.  **Integridad en Cascada**: El borrado de un animal elimina automáticamente sus registros de peso y dietas para evitar datos huérfanos.
