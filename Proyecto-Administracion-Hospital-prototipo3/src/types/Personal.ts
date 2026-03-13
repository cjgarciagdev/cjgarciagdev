/**
 * INTERFAZ PERSONAL
 * Define la estructura de datos para el personal médico y administrativo del hospital
 * Incluye información de especialización, departamento y disponibilidad
 */
export interface Personal {
    /** Identificador único del miembro del personal (generado automáticamente) */
    id: string;

    /** Nombre del miembro del personal */
    nombre: string;

    /** Apellido del miembro del personal */
    apellido: string;

    /** 
     * Especialización o área de expertise
     * Ejemplos: "Cardiología", "Enfermería", "Administración"
     */
    especializacion: string;

    /** 
     * Departamento del hospital al que está asignado
     * Ejemplos: "Emergencias", "UCI", "Consulta Externa"
     */
    departamento: string;

    /** Información de disponibilidad laboral del personal */
    disponibilidad: {
        /** 
         * Array de días de la semana en que está disponible
         * Ejemplo: ["Lunes", "Miércoles", "Viernes"]
         */
        dias: string[];

        /** 
         * Horario de trabajo
         * Formato: "HH:MM - HH:MM"
         * Ejemplo: "08:00 - 16:00"
         */
        horario: string;
    };
}

// Creador: Cristian García CI:32.170.910