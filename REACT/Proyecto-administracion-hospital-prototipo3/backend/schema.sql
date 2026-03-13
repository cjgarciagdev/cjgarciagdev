-- PHARMACORE SQL SCHEMA

-- Table for Patients (Clientes)
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_consulta INTEGER,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    edad INTEGER,
    telefono INTEGER,
    identificacion INTEGER UNIQUE,
    fecha_ingreso TEXT,
    proxima_cita TEXT,
    departamento TEXT,
    condicion TEXT,
    razon_visita TEXT,
    historial TEXT,
    resultado_revision TEXT,
    tratamiento TEXT
);

-- Table for Products (Productos)
CREATE TABLE IF NOT EXISTS productos (
    codigo TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    precio REAL DEFAULT 0.0,
    vencimiento TEXT,
    historial TEXT
);

-- Table for Personnel (Personal)
CREATE TABLE IF NOT EXISTS personal (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    especializacion TEXT,
    departamento TEXT,
    disponibilidad_dias TEXT, -- Stored as comma-separated values
    disponibilidad_horario TEXT
);
