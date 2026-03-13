import { Cliente } from './types/Cliente';
import { Personal } from './types/Personal';
import { Producto } from './types/Producto';

/**
 * MOCK DATABASE - PHARMACORE LUXE
 * Datos iniciales integrados para el sistema
 */

export const INITIAL_CLIENTES: Cliente[] = [
    {
        id: 1,
        numeroConsulta: 101,
        nombre: 'Alejandro',
        apellido: 'Martínez',
        edad: 45,
        telefono: 5550101,
        identificacion: 10203040,
        fechaIngreso: '2026-01-15',
        proximaCita: '2026-02-20',
        departamento: 'Cardiología',
        condicion: 'Hipertensión arterial controlada',
        razonVisita: 'Chequeo trimestral',
        historial: 'Paciente con antecedentes familiares de cardiopatía. Mantiene dieta baja en sodio.',
        resultadoRevision: 'Presión estable 120/80. Continuar con medicación actual.',
        tratamiento: 'Enalapril 10mg diario, Aspirina 81mg.'
    },
    {
        id: 2,
        numeroConsulta: 45,
        nombre: 'Isabella',
        apellido: 'Rodríguez',
        edad: 28,
        telefono: 5550202,
        identificacion: 20304050,
        fechaIngreso: '2026-02-01',
        proximaCita: '2026-03-01',
        departamento: 'Dermatología',
        condicion: 'Dermatitis atópica',
        razonVisita: 'Brote en extremidades superiores',
        historial: 'Alergia conocida al polen y ácaros.',
        resultadoRevision: 'Inflamación moderada. Se receta crema corticoide.',
        tratamiento: 'Betametasona crema, Cetirizina 10mg.'
    },
    {
        id: 3,
        numeroConsulta: 89,
        nombre: 'Ricardo',
        apellido: 'Sosa',
        edad: 62,
        telefono: 5550303,
        identificacion: 30405060,
        fechaIngreso: '2026-01-10',
        proximaCita: '2026-02-15',
        departamento: 'Endocrinología',
        condicion: 'Diabetes Tipo 2',
        razonVisita: 'Control de glucemia',
        historial: 'Diagnosticado hace 5 años. Buen cumplimiento del tratamiento.',
        resultadoRevision: 'Hemoglobina glicosilada en 6.5%. Nivel óptimo.',
        tratamiento: 'Metformina 850mg c/12h.'
    }
];

export const INITIAL_PRODUCTOS: Producto[] = [
    {
        codigo: 'MED-001',
        nombre: 'Paracetamol 500mg',
        stock: 150,
        precio: 5.50,
        vencimiento: '2027-12-31',
        historial: 'Lote recibido en Enero 2026'
    },
    {
        codigo: 'MED-002',
        nombre: 'Ibuprofeno 400mg',
        stock: 5,
        precio: 8.25,
        vencimiento: '2026-06-15',
        historial: 'Stock crítico - Requiere reposición inmediata'
    },
    {
        codigo: 'INS-001',
        nombre: 'Jeringas estériles 5ml',
        stock: 500,
        precio: 1.20,
        vencimiento: '2030-01-01',
        historial: 'Uso frecuente en enfermería'
    },
    {
        codigo: 'MED-003',
        nombre: 'Amoxicilina 875mg',
        stock: 45,
        precio: 15.00,
        vencimiento: '2026-11-20',
        historial: 'Antibiótico de amplio espectro'
    }
];

export const INITIAL_PERSONAL: Personal[] = [
    {
        id: '101',
        nombre: 'Elena',
        apellido: 'Vásquez',
        especializacion: 'Farmacología Clínica',
        departamento: 'Farmacia General',
        disponibilidad: {
            dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
            horario: '08:00 - 16:00'
        }
    },
    {
        id: '102',
        nombre: 'Marcos',
        apellido: 'Linares',
        especializacion: 'Emergenciología',
        departamento: 'Urgencias',
        disponibilidad: {
            dias: ['Sábado', 'Domingo'],
            horario: 'Turno 24h'
        }
    }
];
