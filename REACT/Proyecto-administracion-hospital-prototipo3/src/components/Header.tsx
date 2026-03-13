/**
 * COMPONENTE HEADER
 * Barra superior de la aplicación que muestra el título del sistema y el logo
 * Se muestra en todas las páginas de la aplicación
 */

import React from 'react';
import logo from '../imagens/Logo.png'; // Logo del sistema hospitalario
import '../styles/header.css';

/**
 * COMPONENTE FUNCIONAL HEADER
 * Renderiza la barra superior con título y logo
 */
const Header: React.FC = () => {
  const [searchVisible, setSearchVisible] = React.useState(false);

  return (
    <header>
      {/* Título principal del sistema - responsive */}
      <div className="header-brand">
        <i className="fas fa-microscope" style={{ color: 'var(--primary)', marginRight: '0.75rem', fontSize: '1.5rem' }}></i>
        <h1>
          <span className="brand-name">PharmaCore</span>
          <strong className="brand-subtitle">Management</strong>
        </h1>
      </div>

      {/* Búsqueda rápida */}
      <div className={`header-search ${searchVisible ? 'active' : ''}`}>
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Buscar paciente, producto..."
          onFocus={() => setSearchVisible(true)}
          onBlur={() => setSearchVisible(false)}
        />
      </div>

      {/* Contenedor del usuario y acciones */}
      <div className="header-user">
        {/* Notificaciones */}
        <div className="header-notification">
          <i className="fas fa-bell"></i>
          <span className="notification-badge">3</span>
        </div>

        {/* Info del usuario */}
        <div className="user-info">
          <span className="user-name">Administrador</span>
          <span className="user-role">Acceso Premium</span>
        </div>

        {/* Avatar */}
        <div className="user-avatar-wrapper">
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="status-indicator online"></div>
        </div>
      </div>
    </header>
  );
};


// Creador: Cristian García CI:32.170.910
export default Header;