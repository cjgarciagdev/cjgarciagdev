/**
 * INTERFAZ CLIENTE (PACIENTE)
 * Define la estructura de datos para los pacientes del hospital
 * Incluye información personal, médica y de seguimiento
 */
export interface Cliente {
  /** Identificador único del paciente generado automáticamente */
  id: number;

  /** Número secuencial de la consulta del paciente */
  numeroConsulta: number;

  /** Nombre del paciente */
  nombre: string;

  /** Apellido del paciente */
  apellido: string;

  /** Edad del paciente en años */
  edad: number;

  /** Número de teléfono de contacto (máximo 11 dígitos) */
  telefono: number;

  /** Número de identificación única (cédula/DNI) del paciente */
  identificacion: number;

  /** 
   * Descripción del tratamiento médico actual o prescrito
   * @optional
   */
  tratamiento?: string;

  /** 
   * Fecha en que el paciente ingresó al hospital
   * Formato: YYYY-MM-DD
   * @optional
   */
  fechaIngreso?: string;

  /** 
   * Fecha programada para la próxima cita médica
   * Formato: YYYY-MM-DD
   * @optional
   */
  proximaCita?: string;

  /** 
   * Descripción de la condición médica actual del paciente
   * Puede incluir diagnósticos, síntomas, etc.
   * @optional
   */
  condicion?: string;

  /** 
   * Motivo por el cual el paciente visitó el hospital
   * @optional
   */
  razonVisita?: string;

  /** 
   * Departamento del hospital al que está asignado el paciente
   * Ejemplos: "Cardiología", "Emergencias", "UCI"
   * @optional
   */
  departamento?: string;

  /** 
   * Historial médico completo del paciente
   * Incluye antecedentes, alergias, cirugías previas, etc.
   * @optional
   */
  historial?: string;

  /** 
   * Resultado de la última revisión o consulta médica
   * @optional
   */
  resultadoRevision?: string;
}

// Creador: Cristian García CI:32.170.910