import React, { useState } from 'react';
import { Producto } from '../types/Producto'; // Asegúrate de que la ruta sea correcta
import '../styles/productoform.css'; // Importa el archivo CSS para los estilos

interface ProductoFormProps {
  productos: Producto[];
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
}

const ProductoForm: React.FC<ProductoFormProps> = ({ productos, setProductos }) => {
  const [producto, setProducto] = useState<Producto>({ nombre: '', codigo: '', stock: 0, precio: 0, vencimiento: '' });
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProducto({ ...producto, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producto.nombre || !producto.codigo || !producto.stock || !producto.precio || !producto.vencimiento) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setError('');

    // Guardar en SQL
    import('../services/dbService').then(async ({ dbService }) => {
      await dbService.saveProducto({
        ...producto,
        stock: Number(producto.stock),
        precio: Number(producto.precio)
      });

      setProductos([...productos, { ...producto, stock: Number(producto.stock), precio: Number(producto.precio) }]);
      setProducto({ nombre: '', codigo: '', stock: 0, precio: 0, vencimiento: '' });
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container" style={{ minHeight: 'auto', padding: '2rem 0' }}>
        <div className="login-form fade-in" style={{ margin: '0 auto', maxWidth: '400px', padding: '2.5rem' }}>
          <div className="login-brand" style={{ marginBottom: '2rem' }}>
            <i className="fas fa-lock" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
            <h2 className="login-title" style={{ fontSize: '1.75rem' }}>Validación <span>Farmacia</span></h2>
            <p className="login-subtitle">Confirme credenciales para gestionar insumos</p>
          </div>

          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button
            onClick={() => {
              if (username === 'admin' && password === '1234') {
                setIsLoggedIn(true);
              } else {
                alert('Usuario o contraseña incorrectos');
              }
            }}
            className="login-button"
            style={{ padding: '0.875rem' }}
          >
            Acceder a Inventario
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="producto-form">
      <h2 className="form-title">Agregar Insumos</h2>
      <input name="nombre" placeholder="Nombre" value={producto.nombre} onChange={handleChange} required className="form-input" />
      <input name="codigo" placeholder="Código" value={producto.codigo} onChange={handleChange} required className="form-input" />
      <div className="form-group">
        <label>Cantidad:</label>
        <input
          type="number"
          name="stock"
          value={producto.stock}
          onChange={handleChange}
          placeholder="Ejemplo: 50"
          required
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Precio:</label>
        <input
          type="number"
          name="precio"
          value={producto.precio}
          onChange={handleChange}
          placeholder="Ejemplo: 50.00"
          required
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label htmlFor="vencimiento">Fecha de Vencimiento:</label>
        <input
          id="vencimiento"
          name="vencimiento"
          placeholder="Fecha de Vencimiento"
          value={producto.vencimiento}
          onChange={handleChange}
          type="date"
          required
          className="form-input"
        />
        <small className="form-hint">Ejemplo: 2025-12-31</small>
      </div>
      {error && <div className="form-error">{error}</div>}
      <button type="submit" className="form-button">Guardar</button>
    </form>
  );
};

// Creador Cristian García CI:32.170.910
export default ProductoForm;