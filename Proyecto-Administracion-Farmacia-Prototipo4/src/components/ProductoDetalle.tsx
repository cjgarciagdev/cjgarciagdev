import React from 'react';
import { Producto } from '../types/Producto';
import '../styles/productodetalle.css';

interface ProductoDetalleProps {
  producto: Producto;
  onClose: () => void;
}

const ProductoDetalle: React.FC<ProductoDetalleProps> = ({ producto, onClose }) => {
  return (
    <div className="modal-bg">
      <div className="modal-content">
        <h2 className="modal-title">Detalle de Producto</h2>
        <p><b>Nombre:</b> {producto.nombre}</p>
        <p><b>Tipo y presentación:</b> {producto.tipoPresentacion}</p>
        <p>
          <b>Cantidad:</b> {producto.cantidad} {producto.unidadMedida}
        </p>
        <p><b>Fecha de vencimiento:</b> {producto.vencimiento}</p>
        <p><b>Número de lote o serie:</b> {producto.lote}</p>
        <p><b>Condiciones de almacenamiento:</b> {producto.condicionesAlmacenamiento}</p>
        <div className="modal-actions">
          <button onClick={onClose} className="modal-button modal-button-close">Cerrar</button>
        </div>
      </div>
    </div>
  );
};
export default ProductoDetalle;
