import React, { useState } from 'react';
import { Producto } from '../types/Producto';
import '../styles/productoslist.css';

interface ListaComercialProps {
  productos: Producto[];
  onVerDetalle: (producto: Producto) => void;
  onEliminar: (index: number) => void;
}

const ListaComercial: React.FC<ListaComercialProps> = ({ productos, onVerDetalle, onEliminar }) => {
  const [busqueda, setBusqueda] = useState('');

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="productos-list">
      <h2 className="productos-title">Productos Comerciales</h2>
      <input
        type="text"
        placeholder="Buscar por nombre"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="productos-search"
      />

      {productosFiltrados.length === 0 ? (
        <div className="mensaje-vacio">No hay productos registrados.</div>
      ) : (
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
                {/* Mostrar cantidadMedida + unidadMedida */}
                <td>
                  {producto.unidadMedida
                    ? `${producto.unidadMedida} ${producto.unidadMedida}`
                    : producto.unidadMedida}
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

export default ListaComercial;