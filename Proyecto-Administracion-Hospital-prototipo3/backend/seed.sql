-- PHARMACORE INITIAL DATA

-- Insert Patients
INSERT INTO clientes (numero_consulta, nombre, apellido, edad, telefono, identificacion, fecha_ingreso, proxima_cita, departamento, condicion, razon_visita, historial, resultado_revision, tratamiento) VALUES
(101, 'Alejandro', 'Martínez', 45, 5550101, 10203040, '2026-01-15', '2026-02-20', 'Cardiología', 'Hipertensión arterial controlada', 'Chequeo trimestral', 'Paciente con antecedentes familiares de cardiopatía. Mantiene dieta baja en sodio.', 'Presión estable 120/80. Continuar con medicación actual.', 'Enalapril 10mg diario, Aspirina 81mg.'),
(45, 'Isabella', 'Rodríguez', 28, 5550202, 20304050, '2026-02-01', '2026-03-01', 'Dermatología', 'Dermatitis atópica', 'Brote en extremidades superiores', 'Alergia conocida al polen y ácaros.', 'Inflamación moderada. Se receta crema corticoide.', 'Betametasona crema, Cetirizina 10mg.'),
(89, 'Ricardo', 'Sosa', 62, 5550303, 30405060, '2026-01-10', '2026-02-15', 'Endocrinología', 'Diabetes Tipo 2', 'Control de glucemia', 'Diagnosticado hace 5 años. Buen cumplimiento del tratamiento.', 'Hemoglobina glicosilada en 6.5%. Nivel óptimo.', 'Metformina 850mg c/12h.');

-- Insert Products
INSERT INTO productos (codigo, nombre, stock, precio, vencimiento, historial) VALUES
('MED-001', 'Paracetamol 500mg', 150, 5.50, '2027-12-31', 'Lote recibido en Enero 2026'),
('MED-002', 'Ibuprofeno 400mg', 5, 8.25, '2026-06-15', 'Stock crítico - Requiere reposición inmediata'),
('INS-001', 'Jeringas estériles 5ml', 500, 1.20, '2030-01-01', 'Uso frecuente en enfermería'),
('MED-003', 'Amoxicilina 875mg', 45, 15.00, '2026-11-20', 'Antibiótico de amplio espectro');

-- Insert Personnel
INSERT INTO personal (id, nombre, apellido, especializacion, departamento, disponibilidad_dias, disponibilidad_horario) VALUES
('101', 'Elena', 'Vásquez', 'Farmacología Clínica', 'Farmacia General', 'Lunes, Martes, Miércoles, Jueves, Viernes', '08:00 - 16:00'),
('102', 'Marcos', 'Linares', 'Emergenciología', 'Urgencias', 'Sábado, Domingo', 'Turno 24h');
