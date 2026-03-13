/**
 * IMPORTACIONES
 * Se importan todas las dependencias necesarias para el funcionamiento de la aplicación
 */
import React, { useState } from 'react';
// Componentes de la interfaz
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ClientesList from './components/ClientesList';
import ProductosList from './components/ProductosList';
import ClienteForm from './components/ClienteForm';
import ProductoForm from './components/ProductoForm';
import Login from './components/Login';
import PersonalList from './components/PersonalList';
import Dashboard from './components/Dashboard';
// Tipos TypeScript para tipado fuerte
import { Cliente } from './types/Cliente';
import { Personal } from './types/Personal';
import { Producto } from './types/Producto';
import { INITIAL_CLIENTES, INITIAL_PRODUCTOS, INITIAL_PERSONAL } from './data';
import { dbService } from './services/dbService';
import { useEffect } from 'react';
// Estilos globales
import './styles/index.css';


/**
 * COMPONENTE PRINCIPAL APP
 * Este es el componente raíz de la aplicación que gestiona:
 * - Autenticación de usuarios
 * - Navegación entre secciones
 * - Estado global de pacientes, productos y personal
 */
const App: React.FC = () => {
  // ========== ESTADOS DE AUTENTICACIÓN ==========
  // Almacena el nombre del usuario actualmente logueado (null si no hay sesión)
  const [usuario, setUsuario] = useState<string | null>(null);

  // Controla la visibilidad del modal de confirmación para cerrar sesión
  const [mostrarLoginCerrarSesion, setMostrarLoginCerrarSesion] = useState(false);

  // Credenciales temporales para validar el cierre de sesión
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ========== ESTADO DE NAVEGACIÓN ==========
  // Controla qué sección de la aplicación se está mostrando actualmente
  const [section, setSection] = useState<'inicio' | 'pacientes' | 'agregarPaciente' | 'productos' | 'agregarProducto' | 'personal'>('inicio');

  // ========== ESTADOS DE DATOS CON PERSISTENCIA ==========
  // Array de pacientes del hospital
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Array de productos/insumos médicos
  const [productos, setProductos] = useState<Producto[]>([]);

  // Array del personal médico y administrativo
  const [personal, setPersonal] = useState<Personal[]>([]);

  // CARGA INICIAL DESDE SQL
  useEffect(() => {
    const initData = async () => {
      const dbClientes = await dbService.getClientes();
      const dbProductos = await dbService.getProductos();
      const dbPersonal = await dbService.getPersonal();

      if (dbClientes) setClientes(dbClientes);
      else setClientes(INITIAL_CLIENTES);

      if (dbProductos) setProductos(dbProductos);
      else setProductos(INITIAL_PRODUCTOS);

      if (dbPersonal) setPersonal(dbPersonal);
      else setPersonal(INITIAL_PERSONAL);
    };
    initData();
  }, []);

  // PERSISTENCIA LOCAL: Backup secundario cuando los datos cambien
  useEffect(() => {
    if (clientes.length > 0) dbService.save('clientes', clientes);
  }, [clientes]);

  useEffect(() => {
    if (productos.length > 0) dbService.save('productos', productos);
  }, [productos]);

  useEffect(() => {
    if (personal.length > 0) dbService.save('personal', personal);
  }, [personal]);


  /**
   * VALIDACIÓN DE AUTENTICACIÓN
   * Si no hay usuario logueado, muestra la pantalla de login
   * y previene el acceso al resto de la aplicación
   */
  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  /**
   * RENDERIZADO CONDICIONAL DE CONTENIDO
   * Según la sección seleccionada en el sidebar, se muestra el componente correspondiente
   */
  let content: React.ReactNode;
  switch (section) {
    case 'inicio':
      // Muestra el panel de inicio/dashboard con datos reales
      content = <Dashboard clientes={clientes} productos={productos} personal={personal} />;
      break;
    case 'pacientes':
      // Muestra la lista de todos los pacientes registrados
      content = <ClientesList clientes={clientes} setClientes={setClientes} />;
      break;
    case 'agregarPaciente':
      // Muestra el formulario para registrar un nuevo paciente
      content = <ClienteForm clientes={clientes} setClientes={setClientes} />;
      break;
    case 'productos':
      // Muestra la lista de productos/insumos médicos
      content = <ProductosList productos={productos} setProductos={setProductos} />;
      break;
    case 'agregarProducto':
      // Muestra el formulario para agregar nuevos productos/insumos
      content = <ProductoForm productos={productos} setProductos={setProductos} />;
      break;
    case 'personal':
      // Muestra la lista del personal médico y administrativo
      content = <PersonalList personal={personal} setPersonal={setPersonal} />;
      break;
    default:
      // Caso por defecto (no debería ocurrir con TypeScript)
      content = null;
  }

  /**
   * RENDERIZADO PRINCIPAL
   * Layout de la aplicación con estructura de sidebar + contenido principal
   */
  return (
    <div className="App">
      {/* SIDEBAR - Menú de navegación lateral */}
      <Sidebar
        activeSection={section}
        onSelect={(section) => {
          // Valida que la sección seleccionada sea válida antes de cambiar
          if (
            section === 'inicio' ||
            section === 'pacientes' ||
            section === 'agregarPaciente' ||
            section === 'productos' ||
            section === 'agregarProducto' ||
            section === 'personal'
          ) {
            setSection(section as any);
          }
        }}
        // Cuando se hace clic en "Cerrar sesión", muestra el modal de confirmación
        onLogout={() => setMostrarLoginCerrarSesion(true)}
      />

      {/* ÁREA PRINCIPAL - Contiene el header y el contenido dinámico */}
      <main>
        {/* Header con logo y título del sistema */}
        <Header />

        {/* Contenedor del contenido dinámico */}
        {content}
      </main>

      {/* 
        MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN
        Este modal requiere que el usuario ingrese sus credenciales nuevamente
        antes de cerrar sesión, como medida de seguridad adicional
      */}
      {mostrarLoginCerrarSesion && (
        <div className="modal-bg">
          <div className="login-form scale-in" style={{ padding: '2.5rem', width: '90%', maxWidth: '400px' }}>
            <div className="login-brand" style={{ marginBottom: '2rem' }}>
              <i className="fas fa-sign-out-alt" style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '1rem' }}></i>
              <h2 className="login-title" style={{ fontSize: '1.75rem' }}>Finalizar <span>Sesión</span></h2>
              <p className="login-subtitle">Confirme sus credenciales para salir</p>
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

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                className="primary"
                style={{ flex: 1, padding: '0.875rem', background: 'var(--accent)' }}
                onClick={() => {
                  if (username === 'admin' && password === '1234') {
                    setUsuario(null);
                    setMostrarLoginCerrarSesion(false);
                    setUsername('');
                    setPassword('');
                  } else {
                    alert('Usuario o contraseña incorrectos');
                  }
                }}
              >
                Cerrar Sesión
              </button>
              <button
                className="secondary"
                style={{ flex: 1, padding: '0.875rem' }}
                onClick={() => {
                  setMostrarLoginCerrarSesion(false);
                  setUsername('');
                  setPassword('');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Creador: Cristian García CI:32.170.910
export default App;