import React, { useState } from 'react';
import ProductoDetalle from './ProductoDetalle';
import * as XLSX from 'xlsx';
import { Producto } from '../types/Producto';
import '../styles/productoslist.css';

interface ProductosListProps {
  productos: Producto[];
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
}

const ProductosList: React.FC<ProductosListProps> = ({ productos, setProductos }) => {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [detalleIndex, setDetalleIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Producto>({ nombre: '', codigo: '', stock: 0, precio: 0, vencimiento: '' });
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Editar producto
  const handleEdit = (index: number) => {
    setEditIndex(index);
    setForm(productos[index]);
  };

  // Actualizar producto en la lista local
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.codigo || !form.stock || !form.precio || !form.vencimiento) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setError('');
    if (editIndex !== null) {
      setProductos(prev =>
        prev.map((p, i) => (i === editIndex ? { ...form } : p))
      );
      setEditIndex(null);
      setForm({ nombre: '', codigo: '', stock: 0, precio: 0, vencimiento: '' });
    }
  };

  // Eliminar producto de la lista local
  const handleDelete = (index: number) => {
    if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
      setProductos(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Guardar historial (actualiza el producto en la lista local)
  const handleSaveHistorial = (historial: string) => {
    if (detalleIndex !== null) {
      setProductos(prev =>
        prev.map((p, i) =>
          i === detalleIndex ? { ...p, historial } : p
        )
      );
    }
  };

  const exportarExcel = () => {
    const encabezados = [
      ['Nombre', 'Código', 'Stock', 'Precio', 'Vencimiento', 'Historial'],
    ];
    const filas = productos.map(producto => [
      producto.nombre,
      producto.codigo,
      producto.stock,
      producto.precio,
      producto.vencimiento,
      producto.historial || '',
    ]);
    const hoja = XLSX.utils.aoa_to_sheet([...encabezados, ...filas]);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Productos');
    XLSX.writeFile(libro, 'productos.xlsx');
  };

  const importarExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = (e) => {
      const datos = new Uint8Array(e.target?.result as ArrayBuffer);
      const libro = XLSX.read(datos, { type: 'array' });
      const hoja = libro.Sheets[libro.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json(hoja, { header: 1 }) as string[][];
      const nuevosProductos = filas.slice(1).map(fila => ({
        nombre: fila[0],
        codigo: fila[1],
        stock: parseInt(fila[2], 10),
        precio: parseFloat(fila[3]),
        vencimiento: fila[4],
        historial: fila[5] || '',
      }));
      setProductos(prev => [...prev, ...nuevosProductos]);
    };
    lector.readAsArrayBuffer(archivo);
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="productos-list">
      <h2 className="productos-title">Insumos</h2>
      <input
        type="text"
        placeholder="Buscar por nombre o código"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="productos-search"
      />
      <div className="actions-container">
        <button onClick={exportarExcel}>Exportar a Excel</button>
        <button
          type="button"
          onClick={() => document.getElementById('importar-excel-input')?.click()}
        >
          Importar desde Excel
        </button>
        <input
          id="importar-excel-input"
          type="file"
          accept=".xlsx"
          style={{ display: 'none' }}
          onChange={importarExcel}
        />
      </div>
      <div className="tabla-scroll">
        <table className="productos-table mobile-card-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Código</th>
              <th>Stock</th>
              <th>Precio</th>
              <th>Vencimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p, i) => (
              <tr key={i} className="stagger-item" style={{ animationDelay: `${0.05 * i}s` }}>
                <td data-label="Nombre">{p.nombre}</td>
                <td data-label="Código">{p.codigo}</td>
                <td data-label="Stock" className={p.stock && p.stock < 10 ? 'text-red-600 font-bold' : ''}>{p.stock}</td>
                <td data-label="Precio">${p.precio}</td>
                <td data-label="Vencimiento">{p.vencimiento}</td>
                <td data-label="Acciones">
                  <button onClick={() => handleEdit(i)} className="productos-edit">Editar</button>
                  <button onClick={() => handleDelete(i)} className="productos-delete">Eliminar</button>
                  <button onClick={() => setDetalleIndex(i)} className="productos-details">Ver detalles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editIndex !== null && (
        <form onSubmit={handleUpdate} className="productos-edit-form">
          <h3>Editar Producto</h3>
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
          <input name="codigo" placeholder="Código" value={form.codigo} onChange={handleChange} required />
          <input name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} required type="number" />
          <input name="precio" placeholder="Precio" value={form.precio} onChange={handleChange} required type="number" />
          <input name="vencimiento" placeholder="Vencimiento" value={form.vencimiento} onChange={handleChange} required type="date" />
          {error && <div className="productos-error">{error}</div>}
          <button type="submit" className="productos-save">Guardar</button>
          <button type="button" onClick={() => setEditIndex(null)} className="productos-cancel">Cancelar</button>
        </form>
      )}
      {detalleIndex !== null && (
        <ProductoDetalle
          producto={productos[detalleIndex]}
          onClose={() => setDetalleIndex(null)}
          onSave={handleSaveHistorial}
        />
      )}
    </div>
  );
};

// Creador Cristian García CI:32.170.910
export default ProductosList;