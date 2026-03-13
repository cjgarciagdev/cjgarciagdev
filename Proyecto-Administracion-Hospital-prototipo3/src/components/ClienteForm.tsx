import React, { useState } from 'react';
import { Cliente } from '../types/Cliente';
import { dbService } from '../services/dbService';
import '../styles/clienteform.css';

interface ClienteFormProps {
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  clientes: Cliente[];
}

const ClienteForm: React.FC<ClienteFormProps> = ({ setClientes, clientes }) => {
  const [cliente, setCliente] = useState<Omit<Cliente, 'id'>>({
    nombre: '',
    apellido: '',
    edad: undefined as unknown as number,
    telefono: undefined as unknown as number,
    identificacion: undefined as unknown as number,
    numeroConsulta: undefined as unknown as number,
    fechaIngreso: '',
    proximaCita: '',
    condicion: '',
    razonVisita: '',
    departamento: '',
    historial: '',
    resultadoRevision: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !cliente.nombre ||
      !cliente.apellido ||
      !cliente.edad ||
      !cliente.telefono ||
      !cliente.identificacion ||
      !cliente.fechaIngreso ||
      !cliente.razonVisita ||
      !cliente.departamento ||
      !cliente.condicion
    ) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setError('');

    // Guardar en SQL
    const saveToDb = async () => {
      const result = await dbService.addCliente(cliente);

      // Actualiza el estado local con el ID devuelto por SQL
      setClientes([
        ...clientes,
        {
          ...cliente,
          id: result?.id || Date.now(),
        },
      ]);
    };

    saveToDb();

    // Limpia el formulario
    setCliente({
      nombre: '',
      apellido: '',
      edad: undefined as unknown as number,
      telefono: undefined as unknown as number,
      identificacion: undefined as unknown as number,
      numeroConsulta: undefined as unknown as number,
      fechaIngreso: '',
      proximaCita: '',
      condicion: '',
      razonVisita: '',
      departamento: '',
      historial: '',
      resultadoRevision: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="cliente-form">
      <h2 className="form-title">Agregar Paciente</h2>
      <div className="form-grid">
        <input name="nombre" placeholder="Nombre" value={cliente.nombre} onChange={handleChange} required />
        <input name="apellido" placeholder="Apellido" value={cliente.apellido} onChange={handleChange} required />
        <input name="edad" placeholder="Edad" value={cliente.edad || ''} onChange={handleChange} required type="number" />
        <input
          name="telefono"
          placeholder="Teléfono"
          value={cliente.telefono || ''}
          onChange={(e) => {
            if (/^\d{0,11}$/.test(e.target.value)) {
              setCliente({ ...cliente, telefono: e.target.value === '' ? 0 : Number(e.target.value) });
            }
          }}
          required
          maxLength={11}
          inputMode="numeric"
          pattern="[0-9]*"
          type="text"
        />
        <input
          name="identificacion"
          placeholder="Identificación"
          value={cliente.identificacion || ''}
          onChange={(e) => {
            if (/^\d{0,11}$/.test(e.target.value)) {
              setCliente({ ...cliente, identificacion: e.target.value === '' ? 0 : Number(e.target.value) });
            }
          }}
          required
          maxLength={11}
          inputMode="numeric"
          pattern="[0-9]*"
          type="text"
        />
        <input
          name="numeroConsulta"
          placeholder="Número de consulta"
          value={cliente.numeroConsulta || ''}
          onChange={handleChange}
          required
          type="number"
        />
        <input name="razonVisita" placeholder="Razón de visita" value={cliente.razonVisita} onChange={handleChange} required />
        <input name="departamento" placeholder="Departamento asignado" value={cliente.departamento} onChange={handleChange} required />
        <div className="form-group">
          <label>Fecha de ingreso:</label>
          <input
            name="fechaIngreso"
            placeholder="Fecha de ingreso"
            value={cliente.fechaIngreso}
            onChange={handleChange}
            required
            type="date"
          />
        </div>
        <div className="form-group">
          <label>Próxima cita:</label>
          <input
            name="proximaCita"
            placeholder="Próxima cita"
            value={cliente.proximaCita}
            onChange={handleChange}
            type="date"
          />
        </div>
      </div>
      <div className="form-section">
        <label><b>Condición:</b></label>
        <textarea
          name="condicion"
          value={cliente.condicion}
          onChange={handleChange}
          required
          rows={2}
          placeholder="Describe la condición aquí..."
        />
      </div>
      <div className="form-section">
        <label><b>Historial médico:</b></label>
        <textarea
          name="historial"
          value={cliente.historial || ''}
          onChange={handleChange}
          rows={3}
          placeholder="Agregar historial médico aquí..."
        />
      </div>
      {error && <div className="form-error">{error}</div>}
      <button type="submit" className="form-button">Guardar</button>
    </form>
  );
};
// Creador Cristian García CI:32.170.910
export default ClienteForm;