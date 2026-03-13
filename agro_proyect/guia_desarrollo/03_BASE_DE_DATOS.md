# 🗄️ Base de Datos - Modelo Completo

## Estructura y Diseño de la Base de Datos SQLite

---

## 📊 Diagrama Entidad-Relación

```
┌─────────────────────────────────────────────────────────────────┐
│                         GANADO (Core Entity)                     │
│  • id (PK) INTEGER                                              │
│  • especie VARCHAR(50)                                          │
│  • raza VARCHAR(100)                                            │
│  • sexo VARCHAR(10)                                             │
│  • fecha_nacimiento DATE                                        │
│  • peso FLOAT                                                   │
│  •ESTADO VARCHAR(50)                                            │
│  • fecha_registro DATETIME                                      │
│  • madre_id (FK referencia a GANADO)                            │
│  • padre_id (FK referencia a GANADO)                            │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ 1:N Relaciones
           │
    ┌──────┴────────┬───────────┬───────────┬────────────┬─────────────┐
    │               │           │           │            │             │
    ▼               ▼           ▼           ▼            ▼             ▼
┌─────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐  ┌────────┐  ┌────────┐
│Historial│  │Plan      │  │Historial│ │Protocolo│  │Expediente││Gestacion│
│Médico   │  │Nutric.   │  │Peso    │  │Salud    │  │Médico   │ │        │
└─────────┘  └──────────┘  └─────────┘  └─────────┘  └─────────┘ └────────┘


┌──────────────────┐
│  Usuario         │
│  • id (PK)       │
│  • username      │
│  • password_hash │
│  • rol           │
└──────────────────┘

┌──────────────────┐
│  Insumo          │
│  • id (PK)       │
│  • nombre        │
│  • cantidad      │
│  • unidad        │
│  • tipo          │
└──────────────────┘
```

---

## 📋 Tablas Detalladas

### 1. Tabla `ganado` (Entidad Principal)

```sql
CREATE TABLE ganado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(100) NOT NULL,
    sexo VARCHAR(10) NOT NULL CHECK(sexo IN ('Macho', 'Hembra')),
    fecha_nacimiento DATE NOT NULL,
    peso FLOAT NOT NULL CHECK(peso > 0),
    estado VARCHAR(50) DEFAULT 'Saludable',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    madre_id INTEGER,
    padre_id INTEGER,
    FOREIGN KEY (madre_id) REFERENCES ganado(id) ON DELETE SET NULL,
    FOREIGN KEY (padre_id) REFERENCES ganado(id) ON DELETE SET NULL
);
```

**Campos:**
- `id`: Identificador único auto-incremental
- `especie`: Bovino, Ovino, Caprino, Porcino, Equino, Otro
- `raza`: Raza específica del animal
- `sexo`: Macho o Hembra
- `fecha_nacimiento`: Para calcular edad automáticamente
- `peso`: Peso actual en kilogramos
- `estado`: Saludable, Enfermo, En Tratamiento, Gestante
- `fecha_registro`: Timestamp de creación del registro
- `madre_id`: Referencia genealógica a madre
- `padre_id`: Referencia genealógica a padre

**Índices:**
```sql
CREATE INDEX idx_ganado_especie ON ganado(especie);
CREATE INDEX idx_ganado_sexo ON ganado(sexo);
CREATE INDEX idx_ganado_madre ON ganado(madre_id);
CREATE INDEX idx_ganado_padre ON ganado(padre_id);
```

---

### 2. Tabla `historial_medico`

```sql
CREATE TABLE historial_medico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    veterinario VARCHAR(200),
    FOREIGN KEY (animal_id) REFERENCES ganado(id) ON DELETE CASCADE
);
```

**Tipos de eventos:**
- Vacunación
- Tratamiento
- Desparasitación
- Revisión Veterinaria
- Actualización Expediente
- Cirugía
- Emergencia

**Ejemplo de registro:**
```json
{
    "id": 1,
    "animal_id": 5,
    "tipo": "Vacunación",
    "descripcion": "Vacuna triple viral: Fiebre aftosa, Brucelosis, Carbunclo. Dosis 5ml.",
    "fecha": "2026-01-15T10:30:00",
    "veterinario": "Dr. Juan Pérez MVZ"
}
```

---

### 3. Tabla `historial_peso`

```sql
CREATE TABLE historial_peso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER NOT NULL,
    peso FLOAT NOT NULL CHECK(peso > 0),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,
    FOREIGN KEY (animal_id) REFERENCES ganado(id) ON DELETE CASCADE
);
```

**Propósito:** 
- Seguimiento de evolución de peso en el tiempo
- Cálculo de ganancia diaria promedio (GDP)
- Detección de anomalías de crecimiento
- Generación de gráficas de tendencia

**Índice:**
```sql
CREATE INDEX idx_peso_animal_fecha ON historial_peso(animal_id, fecha);
```

---

### 4. Tabla `plan_nutricional`

```sql
CREATE TABLE plan_nutricional (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER NOT NULL,
    tipo_alimentacion VARCHAR(100) NOT NULL,
    cantidad_forraje FLOAT DEFAULT 0,
    cantidad_concentrado FLOAT DEFAULT 0,
    suplementos TEXT,
    minerales TEXT,
    vitaminas TEXT,
    agua TEXT,
    frecuencia VARCHAR(100),
    observaciones TEXT,
    fecha_inicio DATE NOT NULL,
    activo BOOLEAN DEFAULT 1,
    FOREIGN KEY (animal_id) REFERENCES ganado(id) ON DELETE CASCADE
);
```

**Tipos de alimentación:**
- Pastoreo Extensivo
- Pastoreo Intensivo
- Estabulado
- Semi-estabulado
- Mixto

**Ejemplo de plan:**
```json
{
    "animal_id": 10,
    "tipo_alimentacion": "Pastoreo Intensivo",
    "cantidad_forraje": 12.5,
    "cantidad_concentrado": 3.0,
    "suplementos": "Sal mineralizada, Melaza",
    "minerales": "Calcio, Fósforo, Magnesio",
    "vitaminas": "A, D, E",
    "agua": "Ad libitum (libre acceso)",
    "frecuencia": "2 veces al día (mañana y tarde)",
    "observaciones": "Aumentar concentrado si peso < 500kg",
    "activo": true
}
```

---

### 5. Tabla `protocolo_salud`

```sql
CREATE TABLE protocolo_salud (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER NOT NULL,
    tipo_protocolo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_programada DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente',
    medicamento VARCHAR(200),
    dosis VARCHAR(100),
    via_administracion VARCHAR(100),
    FOREIGN KEY (animal_id) REFERENCES ganado(id) ON DELETE CASCADE
);
```

**Estados posibles:**
- Pendiente
- Realizado
- Cancelado
- Retrasado

**Tipos de protocolo:**
- Vacunación programada
- Desparasitación periódica
- Revisión preventiva
- Tratamiento de seguimiento
- Control reproductivo

---

### 6. Tabla `expediente_medico`

```sql
CREATE TABLE expediente_medico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER UNIQUE NOT NULL,
    tipo_sangre VARCHAR(20),
    alergias TEXT,
    condiciones_cronicas TEXT,
    antecedentes_geneticos TEXT,
    notas_generales TEXT,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES ganado(id) ON DELETE CASCADE
);
```

**Propósito:**
- Ficha médica permanente
- Historial clínico consolidado
- Información crítica para tratamientos

---

### 7. Tabla `gestacion`

```sql
CREATE TABLE gestacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    madre_id INTEGER NOT NULL,
    padre_id INTEGER,
    fecha_servicio DATE NOT NULL,
    fecha_parto_estimada DATE NOT NULL,
    fecha_parto_real DATE,
    numero_crias INTEGER,
    tipo VARCHAR(50) DEFAULT 'Natural',
    estado VARCHAR(50) DEFAULT 'En Gestación',
    observaciones TEXT,
    FOREIGN KEY (madre_id) REFERENCES ganado(id) ON DELETE CASCADE,
    FOREIGN KEY (padre_id) REFERENCES ganado(id) ON DELETE SET NULL
);
```

**Estados:**
- En Gestación
- Parto Exitoso
- Aborto
- Complicaciones

**Tipos:**
- Natural
---

### 8. Tabla `usuario` (Control de Acceso)
Se implementa un modelo **RBAC (Role-Based Access Control)** con permisos granulares representados por columnas booleanas.

```sql
CREATE TABLE usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(200),
    rol VARCHAR(50) DEFAULT 'operador',
    activo BOOLEAN DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME,
    -- Matriz de Permisos (Banderas Booleanas)
    puede_crear_animales BOOLEAN DEFAULT 1,
    puede_editar_animales BOOLEAN DEFAULT 1,
    puede_eliminar_animales BOOLEAN DEFAULT 0,
    puede_exportar BOOLEAN DEFAULT 1,
    puede_ver_analisis BOOLEAN DEFAULT 1,
    puede_gestionar_usuarios BOOLEAN DEFAULT 0,
    puede_ver_reportes BOOLEAN DEFAULT 1,
    puede_gestionar_nutricion BOOLEAN DEFAULT 1,
    puede_gestionar_inventario BOOLEAN DEFAULT 1,
    puede_gestionar_salud BOOLEAN DEFAULT 1,
    puede_gestionar_genealogia BOOLEAN DEFAULT 1,
    puede_ver_logs BOOLEAN DEFAULT 0,
    puede_aprobar_acciones BOOLEAN DEFAULT 0,
    puede_ver_dashboard_completo BOOLEAN DEFAULT 1,
    puede_solo_lectura BOOLEAN DEFAULT 0
);
```

**Roles Especializados Disponibles:**
- `admin`: Superusuario con bypass de seguridad (todos los permisos).
- `veterinario`: Gestión de salud, genealogía y reportes médicos.
- `nutricionista`: Gestión del motor de alimentación y dietas.
- `operador`: Tareas de campo, registro y edición básica de peso/estado.
- `inventario`: Control de stock, compras y logística de insumos.
- `auditor`: Solo lectura total, acceso a logs de cambios y reportes.
- `gerente`: Dashboards estratégicos, aprobación de acciones y auditoría.

---

### 9. Tabla `insumo`

```sql
CREATE TABLE insumo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(200) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    cantidad FLOAT NOT NULL DEFAULT 0,
    unidad VARCHAR(50) NOT NULL,
    costo_unitario FLOAT,
    proveedor VARCHAR(200),
    fecha_ingreso DATE,
    fecha_vencimiento DATE,
    lote VARCHAR(100),
    ubicacion VARCHAR(200)
);
```

**Tipos de insumo:**
- Alimento (Forraje, Concentrado, Suplementos)
- Medicamento (Antibióticos, Vacunas, Antiparasitarios)
- Material (Herramientas, Equipos)
- Otro

---

## 🔗 Relaciones y Cardinalidad

### Relaciones 1:N (Uno a Muchos)

```
GANADO (1) ──── (N) HISTORIAL_MEDICO
GANADO (1) ──── (N) HISTORIAL_PESO
GANADO (1) ──── (N) PLAN_NUTRICIONAL
GANADO (1) ──── (N) PROTOCOLO_SALUD
GANADO (1) ──── (1) EXPEDIENTE_MEDICO  [1:1]
GANADO (1) ──── (N) GESTACION (como madre)
```

### Relaciones Autoreferenciadas

```
GANADO.madre_id ──► GANADO.id
GANADO.padre_id ──► GANADO.id
```

**Esto permite:**
- Árboles genealógicos
- Cálculo de consanguinidad
- Análisis de líneas genéticas

---

## 📊 Modelo en SQLAlchemy (Python ORM)

```python
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Ganado(db.Model):
    __tablename__ = 'ganado'
    
    id = db.Column(db.Integer, primary_key=True)
    especie = db.Column(db.String(50), nullable=False)
    raza = db.Column(db.String(100), nullable=False)
    sexo = db.Column(db.String(10), nullable=False)
    fecha_nacimiento = db.Column(db.Date, nullable=False)
    peso = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(50), default='Saludable')
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    madre_id = db.Column(db.Integer, db.ForeignKey('ganado.id'))
    padre_id = db.Column(db.Integer, db.ForeignKey('ganado.id'))
    
    # Relaciones
    historial_medico = db.relationship('HistorialMedico', backref='animal', 
                                       lazy=True, cascade='all, delete-orphan')
    historial_pesos = db.relationship('HistorialPeso', backref='animal',
                                      lazy=True, cascade='all, delete-orphan')
    planes_nutricionales = db.relationship('PlanNutricional', backref='animal',
                                          lazy=True, cascade='all, delete-orphan')
    protocolos = db.relationship('ProtocoloSalud', backref='animal',
                                lazy=True, cascade='all, delete-orphan')
    expediente = db.relationship('ExpedienteMedico', uselist=False, backref='animal',
                                cascade='all, delete-orphan')
    
    # Genealogía
    madre = db.relationship('Ganado', remote_side=[id], foreign_keys=[madre_id],
                           backref='hijos_madre')
    padre = db.relationship('Ganado', remote_side=[id], foreign_keys=[padre_id],
                           backref='hijos_padre')
    
    def to_dict(self):
        edad_meses = (datetime.now().date() - self.fecha_nacimiento).days // 30
        return {
            'id': self.id,
            'especie': self.especie,
            'raza': self.raza,
            'sexo': self.sexo,
            'fecha_nacimiento': self.fecha_nacimiento.isoformat(),
            'peso': self.peso,
            'edad': edad_meses,
            'estado': self.estado,
            'madre_id': self.madre_id,
            'padre_id': self.padre_id
        }
```

---

## 🛡️ Integridad Referencial

### Cascadas de Eliminación

```
ON DELETE CASCADE:
- Si se elimina un animal, se eliminan todos sus:
  • Historiales médicos
  • Registros de peso
  • Planes nutricionales
  • Protocolos de salud
  • Expediente médico

ON DELETE SET NULL:
- Si se elimina un animal que es padre/madre:
  • Los hijos conservan su registro
  • madre_id / padre_id se ponen en NULL
```

### Constraints (Restricciones)

```sql
-- Pesos deben ser positivos
CHECK (peso > 0)

-- Sexo debe ser válido
CHECK (sexo IN ('Macho', 'Hembra'))

-- Fechas de parto lógicas
CHECK (fecha_parto_real >= fecha_servicio)

-- Cantidades no negativas
CHECK (cantidad >= 0)
```

---

## 🔐 Seguridad de Datos

### Hash de Contraseñas

```python
import bcrypt

def hash_password(password):
    """Generar hash seguro de contraseña"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt)

def verify_password(password, hashed):
    """Verificar contraseña contra hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed)
```

---

## 📈 Consultas Frecuentes (Queries)

### 1. Animales por Especie y Estado

```sql
SELECT especie, estado, COUNT(*) as total
FROM ganado
GROUP BY especie, estado
ORDER BY especie, total DESC;
```

```python
# SQLAlchemy
from sqlalchemy import func

stats = db.session.query(
    Ganado.especie,
    Ganado.estado,
    func.count(Ganado.id).label('total')
).group_by(Ganado.especie, Ganado.estado).all()
```

### 2. Historial Médico Completo de un Animal

```sql
SELECT 
    g.id, g.raza, g.especie,
    hm.tipo, hm.descripcion, hm.fecha, hm.veterinario
FROM ganado g
LEFT JOIN historial_medico hm ON g.id = hm.animal_id
WHERE g.id = ?
ORDER BY hm.fecha DESC;
```

### 3. Árbol Genealógico (Hasta 3 Generaciones)

```sql
WITH RECURSIVE genealogia AS (
    -- Caso base: animal actual
    SELECT id, madre_id, padre_id, raza, 0 as nivel
    FROM ganado
    WHERE id = ?
    
    UNION ALL
    
    -- Caso recursivo: padres
    SELECT g.id, g.madre_id, g.padre_id, g.raza, gen.nivel + 1
    FROM ganado g
    INNER JOIN genealogia gen 
        ON g.id = gen.madre_id OR g.id = gen.padre_id
    WHERE gen.nivel < 3
)
SELECT * FROM genealogia;
```

### 4. Animales con Bajo Peso

```sql
SELECT g.*, 
    (SELECT AVG(peso) FROM ganado WHERE especie = g.especie) as peso_promedio
FROM ganado g
WHERE g.peso < (SELECT AVG(peso) * 0.8 FROM ganado WHERE especie = g.especie);
```

---

## 🔄 Migraciones de Base de Datos

### Script de Migración Ejemplo

```python
# migrations/001_add_genealogia.py

from app import db

def upgrade():
    """Agregar campos genealógicos"""
    db.engine.execute('''
        ALTER TABLE ganado 
        ADD COLUMN madre_id INTEGER REFERENCES ganado(id)
    ''')
    db.engine.execute('''
        ALTER TABLE ganado 
        ADD COLUMN padre_id INTEGER REFERENCES ganado(id)
    ''')
    print("✅ Migración aplicada: Genealogía")

def downgrade():
    """Revertir cambios"""
    # SQLite no soporta DROP COLUMN directamente
    # Requiere recrear tabla
    pass
```

---

## 🗂️ Backups y Restauración

### Backup Automático

```python
import shutil
from datetime import datetime

def backup_database():
    """Crear backup de la base de datos"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    source = "instance/ganado.db"
    destination = f"backups/ganado_backup_{timestamp}.db"
    
    shutil.copy2(source, destination)
    print(f"✅ Backup creado: {destination}")
```

### Restaurar Backup

```python
def restore_database(backup_file):
    """Restaurar desde un backup"""
    destination = "instance/ganado.db"
    shutil.copy2(backup_file, destination)
    print(f"✅ Base de datos restaurada desde: {backup_file}")
```

---

## 📊 Estadísticas de la Base de Datos

```python
def get_database_stats():
    """Obtener estadísticas generales"""
    stats = {
        'total_animales': Ganado.query.count(),
        'total_historiales': HistorialMedico.query.count(),
        'total_pesos': HistorialPeso.query.count(),
        'total_planes': PlanNutricional.query.count(),
        'total_protocolos': ProtocoloSalud.query.count(),
        'tamaño_db_mb': os.path.getsize('instance/ganado.db') / (1024 * 1024)
    }
    return stats
```

---

## 🎯 Próximo Documento

👉 **04_BACKEND_DESARROLLO.md** - Desarrollo del backend Flask completo
