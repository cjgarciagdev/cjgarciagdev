/**
 * INTERFAZ PACIENTE (DÍADA PEDIÁTRICA)
 * Define la estructura de datos para el sistema GlucoAmigo
 * Basado en la arquitectura de Módulos mHealth Pediatría
 */
export interface Paciente {
  /** Identificador único */
  id: number;

  /** Datos del Héroe (Niño) */
  nombreHeroe: string;
  edad: number;
  peso: number;

  /** Datos del Representante (Díada) */
  nombreRepresentante: string;
  cedulaRepresentante: string;

  /** Parámetros Clínicos (Dosificación) */
  ratioCarbohidratos: number;
  factorSensibilidad: number;
  glucemiaActual: number;

  /** Variables Psicométricas */
  puntajeCDI: number; // Sintomatología Depresiva
  puntajeSCIR: number; // Adherencia Terapéutica

  /** Metadatos de seguimiento */
  fechaUltimoRegistro: string;
  estadoAnimo: 'Estable' | 'Riesgo';
  adherencia: 'Alta' | 'Baja';
}

// Creador: Cristian García CI:32.170.910
