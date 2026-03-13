import React, { useState } from 'react';
import { Producto } from '../types/Producto';
import '../styles/productodetalle.css'; // Importa el archivo CSS para los estilos

interface ProductoDetalleProps {
  producto: Producto;
  onClose: () => void;
  onSave: (historial: string) => void;
}

const ProductoDetalle: React.FC<ProductoDetalleProps> = ({ producto, onClose, onSave }) => {
  const [historial, setHistorial] = useState(producto.historial || '');

  const handleSave = () => {
    onSave(historial);
    onClose();
  };

  return (
    <div className="modal-bg">
      <div className="modal-content">
        <h2 className="modal-title">Detalle de Producto</h2>
        <p><b>Nombre:</b> {producto.nombre}</p>
        <p><b>Código:</b> {producto.codigo}</p>
        <p><b>Stock:</b> {producto.stock}</p>
        <p><b>Precio:</b> ${producto.precio}</p>
        <p><b>Vencimiento:</b> {producto.vencimiento}</p>
        <div className="historial-container">
          <b>Notas / Historial:</b>
          <textarea
            value={historial}
            onChange={e => setHistorial(e.target.value)}
            rows={6}
            className="historial-textarea"
            placeholder="Agregar historial o notas aquí..."
          />
        </div>
        <div className="modal-actions">
          <button onClick={handleSave} className="modal-button">Guardar</button>
          <button onClick={onClose} className="modal-button modal-button-close">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;
// Creador Cristian García CI:32.170.910
