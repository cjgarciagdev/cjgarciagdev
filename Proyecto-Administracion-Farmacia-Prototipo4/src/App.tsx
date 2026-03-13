import React, { useState } from 'react';
// Sidebar: Menú lateral de navegación entre secciones
import Sidebar from './components/Sidebar';
// Header: Encabezado superior de la aplicación
import Header from './components/Header';
// ListaClinica: Muestra la lista de productos clínicos
import ListaClinica from './components/listaclinica';
// ListaComercial: Muestra la lista de productos comerciales
import ListaComercial from './components/listacomercial';
// ProductoForm: Formulario para agregar productos a las listas
import ProductoForm from './components/ProductoForm';
// ProductoDetalle: Modal para ver detalles de un producto
import ProductoDetalle from './components/ProductoDetalle';
// Historial: Muestra el historial de movimientos de insumos
import Historial, { HistorialItem } from './components/Historial';
// Login: Pantalla de inicio de sesión
import Login from './components/Login';
// Producto: Tipo de producto (definido en types/Producto)
import RetiroForm from './components/RetiroForm'; // Asegúrate de tener este import
import { Producto } from './types/Producto';
// Estilos globales
import './styles/index.css';
import './styles/modal.css';

const App: React.FC = () => {
  // Estado para el usuario logueado
  const [usuario, setUsuario] = useState<string | null>(null);
  // Estado para mostrar el modal de cierre de sesión
  const [mostrarLoginCerrarSesion, setMostrarLoginCerrarSesion] = useState(false);
  // Estado para el usuario y contraseña del modal de cierre de sesión
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Estado para la sección actual seleccionada en el sidebar
  const [section, setSection] = useState<'clinica' | 'comercial' | 'agregarProducto' | 'historial' | 'retirarProducto'>('clinica');
  // Estado para la lista de productos clínicos
  const [productosClinicos, setProductosClinicos] = useState<Producto[]>([]);
  // Estado para la lista de productos comerciales
  const [productosComerciales, setProductosComerciales] = useState<Producto[]>([]);
  // Estado para el producto seleccionado para ver detalles
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  // Estado para el historial de movimientos de insumos
  const [historial, setHistorial] = useState<HistorialItem[]>([]);

  // Si no hay un usuario logueado, muestra el componente Login
  if (!usuario) {
    // Login: Permite iniciar sesión en la aplicación
    return <Login onLogin={setUsuario} />;
  }

  // content: Renderiza el componente principal según la sección seleccionada
  let content: React.ReactNode;
  switch (section) {
    case 'clinica':
      // ListaClinica: Muestra la lista de productos clínicos
      content = (
        <ListaClinica
          productos={productosClinicos}
          onVerDetalle={setProductoDetalle}
          onEliminar={(index) => {
            setProductosClinicos(productosClinicos.filter((_, i) => i !== index));
          }}
        />
      );
      break;
    case 'comercial':
      // ListaComercial: Muestra la lista de productos comerciales
      content = (
        <ListaComercial
          productos={productosComerciales}
          onVerDetalle={setProductoDetalle}
          onEliminar={(index) => {
            setProductosComerciales(productosComerciales.filter((_, i) => i !== index));
          }}
        />
      );
      break;
    case 'agregarProducto':
      // ProductoForm: Formulario para agregar productos (clínicos o comerciales)
      content = (
        <ProductoForm
          onAgregarClinico={(producto) => {
            setProductosClinicos([...productosClinicos, producto]);
            // Ya NO se agrega al historial aquí
          }}
          onAgregarComercial={(producto) => {
            setProductosComerciales([...productosComerciales, producto]);
            // Ya NO se agrega al historial aquí
          }}
        />
      );
      break;
    case 'retirarProducto':
      // RetiroForm: Formulario para registrar retiros, SÍ agrega al historial
      content = (
        <RetiroForm
          productos={[...productosClinicos, ...productosComerciales]}
          onRetiro={(data) => {
            setHistorial(prev => [
              ...prev,
              {
                nombre: data.nombre,
                medida: data.medida,
                lista: data.lista,
                cantidad: data.cantidad,
                fechaRetiro: data.fechaRetiro,
                persona: {
                  nombre: data.persona,
                  apellido: '', // Puedes agregar campo si lo necesitas
                  cargo: data.cargo,
                },
              },
            ]);
            // Opcional: aquí puedes descontar la cantidad retirada del producto correspondiente
          }}
        />
      );
      break;
    case 'historial':
      // Historial: SOLO muestra los retiros registrados desde el formulario de retiro
      content = (
        <Historial historial={historial} />
      );
      break;
    default:
      content = null;
  }

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar: menú de navegación lateral */}
      <Sidebar
        onSelect={(section) => {
          if (
            section === 'clinica' ||
            section === 'comercial' ||
            section === 'agregarProducto' ||
            section === 'historial' ||
            section === 'retirarProducto' // Permite abrir el formulario de retiro
          ) {
            setSection(section);
          }
        }}
        onLogout={() => setMostrarLoginCerrarSesion(true)}
      />
      <main style={{ flex: 1, background: '#f0f2f5', minHeight: '100vh' }}>
        {/* Header: encabezado superior */}
        <Header />
        <div style={{ padding: 40 }}>
          {/* Renderiza el contenido principal según la sección */}
          {content}
        </div>
      </main>

      {/* Modal de detalle de producto: muestra información detallada del producto seleccionado */}
      {productoDetalle && (
        <ProductoDetalle
          producto={productoDetalle}
          onClose={() => setProductoDetalle(null)}
        />
      )}

      {/* Modal de confirmación de cierre de sesión */}
      {mostrarLoginCerrarSesion && (
        <div className="modal-cerrar-sesion" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: 32,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            minWidth: 320
          }}>
            <h3>Confirmar Cierre de Sesión</h3>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ display: 'block', marginBottom: 12, width: '100%' }}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ display: 'block', marginBottom: 12, width: '100%' }}
            />
            <button
              onClick={() => {
                if (username === 'admin' && password === '1234') {
                  setUsuario(null);
                  setMostrarLoginCerrarSesion(false);
                } else {
                  alert('Usuario o contraseña incorrectos');
                }
              }}
              style={{ marginRight: 8 }}
            >
              Confirmar
            </button>
            <button onClick={() => setMostrarLoginCerrarSesion(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;