const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  edad: { type: Number, required: true },
  telefono: { type: String, required: true },
  identificacion: { type: String, required: true, unique: true },
  tratamiento: { type: String },
  fechaIngreso: { type: String },
  proximaCita: { type: String },
  condicion: { type: String },
  razonVisita: { type: String },
  departamento: { type: String },
  historial: { type: String },
});

module.exports = mongoose.model('Paciente', pacienteSchema);