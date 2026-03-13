/**
 * COMPONENTE SIDEBAR
 * Menú de navegación lateral del sistema hospitalario
 * Permite navegar entre las diferentes secciones y cerrar sesión
 */

import React from 'react';
import '../styles/sidebar.css'; // Importa los estilos del sidebar

/**
 * INTERFAZ DE PROPIEDADES
 * Define las props que recibe el componente Sidebar
 */
interface SidebarProps {
  // Callback que se ejecuta cuando se selecciona una sección del menú
  onSelect: (section: 'inicio' | 'login' | 'pacientes' | 'agregarPaciente' | 'detallePaciente' | 'productos' | 'agregarProducto' | 'detalleProducto' | 'personal') => void;

  // Callback que se ejecuta cuando se hace clic en "Cerrar sesión"
  onLogout: () => void;

  // Sección activa para resaltar
  activeSection: string;
}

/**
 * COMPONENTE FUNCIONAL SIDEBAR
 * Renderiza el menú lateral con todas las opciones de navegación
 */
const Sidebar: React.FC<SidebarProps> = ({ onSelect, onLogout, activeSection }) => {
  return (
    <div className="sidebar">
      {/* Título del menú - Luxe Pharmacy branding */}
      <h2 className="sidebar-logo">
        <i className="fas fa-microscope"></i> PHARMA<span>CORE</span>
      </h2>

      <div className="sidebar-nav">
        {/* Botón para ver el dashboard */}
        <div
          className={`sidebar-item ${activeSection === 'inicio' ? 'active' : ''}`}
          onClick={() => onSelect('inicio')}
        >
          <i className="fas fa-chart-line sidebar-icon"></i>
          <span className="sidebar-label">Panel de Inicio</span>
        </div>

        {/* Botón para ver la lista de pacientes */}
        <div
          className={`sidebar-item ${activeSection === 'pacientes' ? 'active' : ''}`}
          onClick={() => onSelect('pacientes')}
        >
          <i className="fas fa-user-injured sidebar-icon"></i>
          <span className="sidebar-label">Gestión de Pacientes</span>
        </div>

        {/* Botón para agregar un nuevo paciente */}
        <div
          className={`sidebar-item ${activeSection === 'agregarPaciente' ? 'active' : ''}`}
          onClick={() => onSelect('agregarPaciente')}
        >
          <i className="fas fa-user-plus sidebar-icon"></i>
          <span className="sidebar-label">Registrar Paciente</span>
        </div>

        {/* Botón para ver la lista de insumos médicos */}
        <div
          className={`sidebar-item ${activeSection === 'productos' ? 'active' : ''}`}
          onClick={() => onSelect('productos')}
        >
          <i className="fas fa-capsules sidebar-icon"></i>
          <span className="sidebar-label">Inventario Insumos</span>
        </div>

        {/* Botón para agregar nuevos insumos */}
        <div
          className={`sidebar-item ${activeSection === 'agregarProducto' ? 'active' : ''}`}
          onClick={() => onSelect('agregarProducto')}
        >
          <i className="fas fa-plus-square sidebar-icon"></i>
          <span className="sidebar-label">Nuevos Insumos</span>
        </div>

        {/* Botón para ver la lista del personal */}
        <div
          className={`sidebar-item ${activeSection === 'personal' ? 'active' : ''}`}
          onClick={() => onSelect('personal')}
        >
          <i className="fas fa-user-md sidebar-icon"></i>
          <span className="sidebar-label">Personal Médico</span>
        </div>
      </div>

      {/* Botón para cerrar sesión (requiere confirmación) */}
      <div className="sidebar-logout" onClick={onLogout}>
        <i className="fas fa-sign-out-alt"></i>
        <span>Cerrar sesión</span>
      </div>
    </div>
  );
};

// Creador: Cristian García CI:32.170.910
export default Sidebar;
