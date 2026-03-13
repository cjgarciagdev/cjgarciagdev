import React, { useState } from 'react';
import { Producto } from "../types/Producto";
import '../styles/productoslist.css';

/**
 * ListaClinica: Muestra la lista de productos clínicos.
 * Props:
 * - productos: Array de productos clínicos a mostrar.
 * - onVerDetalle: Función para mostrar los detalles de un producto.
 * - onEliminar: Función para eliminar un producto de la lista.
 */

interface ListaClinicaProps {
  productos: Producto[];
  onVerDetalle: (producto: Producto) => void;
  onEliminar: (index: number) => void;
}

const ListaClinica: React.FC<ListaClinicaProps> = ({ productos, onVerDetalle, onEliminar }) => {
  // Estado para el texto de búsqueda.
  const [busqueda, setBusqueda] = useState('');

  //Filtra los productos según el texto de busqueda.
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="productos-list">
      <h2 className="productos-title">Productos Clínicos</h2>
      <input
        type="text"
        placeholder="Buscar por nombre"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="productos-search"
      />
      {(!productos || productos.length === 0) && (
        <div className="mensaje-vacio">No hay productos registrados.</div>
      )}
      {productos && productos.length > 0 && (
        <table className="productos-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo y presentación</th>
              <th>Cantidad</th>
              <th>Unidad de medida</th>
              <th>Fecha de vencimiento</th>
              <th>Lote</th>
              <th>Ubicación</th>
              <th>Condiciones de almacenamiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((producto, i) => (
              <tr key={i}>
                <td>{producto.nombre}</td>
                <td>{producto.tipoPresentacion}</td>
                <td>{producto.cantidad}</td>
                {/* Muestra solo la unidad de medida */}
                <td>
                  {producto.unidadMedida}
                </td>
                <td>{producto.vencimiento}</td>
                <td>{producto.lote}</td>
                <td>{producto.ubicacion}</td>
                <td>{producto.condicionesAlmacenamiento}</td>
                <td>
                  <button onClick={() => onVerDetalle(producto)} className="productos-details">Información</button>
                  <button onClick={() => onEliminar(i)} className="productos-delete">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default ListaClinica;
