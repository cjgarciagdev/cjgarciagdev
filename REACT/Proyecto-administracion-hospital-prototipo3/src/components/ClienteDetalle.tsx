import React, { useState } from 'react';
import { Cliente } from '../types/Cliente'; // Asegúrate de que la ruta sea correcta
import '../styles/clientedetalle.css'; // Importa el archivo CSS para los estilos

interface ClienteDetalleProps {
  cliente: Cliente;
  onClose: () => void;
  onSave: (detalle: Partial<Cliente>) => void;
}

const ClienteDetalle: React.FC<ClienteDetalleProps> = ({ cliente, onClose, onSave }) => {
  const [detalle, setDetalle] = useState<Cliente>({ ...cliente });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDetalle({ ...detalle, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(detalle);
    onClose();
  };

  return (
    <div className="modal-bg">
      <div className="modal-content">
        <h2 className="modal-title">Detalle de Paciente</h2>
        <div className="form-grid">
          <div>
            <label><b>Nombre:</b></label>
            <input name="nombre" value={detalle.nombre} onChange={handleChange} className="form-input" disabled />
          </div>
          <div>
            <label><b>Apellido:</b></label>
            <input name="apellido" value={detalle.apellido} onChange={handleChange} className="form-input" disabled />
          </div>
          <div>
            <label><b>Edad:</b></label>
            <input name="edad" value={detalle.edad} onChange={handleChange} className="form-input" disabled />
          </div>
          <div>
            <label><b>Teléfono:</b></label>
            <input name="telefono" value={detalle.telefono} onChange={handleChange} className="form-input" disabled />
          </div>
          <div>
            <label><b>Tipo de tratamiento:</b></label>
            <input name="tratamiento" value={detalle.tratamiento || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label><b>Fecha de ingreso:</b></label>
            <input name="fechaIngreso" type="date" value={detalle.fechaIngreso || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label><b>Próxima cita:</b></label>
            <input name="proximaCita" type="date" value={detalle.proximaCita || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label><b>Condición:</b></label>
            <input name="condicion" value={detalle.condicion || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label><b>Razón de visita:</b></label>
            <input name="razonVisita" value={detalle.razonVisita || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label><b>Departamento asignado:</b></label>
            <input name="departamento" value={detalle.departamento || ''} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <div className="form-section">
          <label><b>Historial médico:</b></label>
          <textarea
            name="historial"
            value={detalle.historial || ''}
            onChange={handleChange}
            rows={3}
            className="form-textarea"
            placeholder="Agregar historial médico aquí..."
          />
        </div>
        <div className="form-actions">
          <button onClick={handleSave} className="form-button">Guardar</button>
          <button onClick={onClose} className="form-button form-button-close">Cerrar</button>
        </div>
      </div>
    </div>
  );
};
//Creador Cristian García ID:32.170.910
export default ClienteDetalle;