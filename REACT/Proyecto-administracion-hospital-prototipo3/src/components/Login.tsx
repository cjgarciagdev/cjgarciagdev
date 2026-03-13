/**
 * COMPONENTE LOGIN
 * Pantalla de inicio de sesión del sistema hospitalario
 * Valida las credenciales del usuario antes de permitir el acceso
 */

import React, { useState } from 'react';
import '../styles/login.css'; // Importa los estilos específicos del login

/**
 * INTERFAZ DE PROPIEDADES
 * Define las props que recibe el componente Login
 */
interface LoginProps {
  onLogin: (usuario: string) => void; // Callback que se ejecuta cuando el login es exitoso
}

/**
 * COMPONENTE FUNCIONAL LOGIN
 * Maneja la autenticación del usuario en el sistema
 */
const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // ========== ESTADOS DEL COMPONENTE ==========
  // Almacena el nombre de usuario ingresado
  const [usuario, setUsuario] = useState('');

  // Almacena la contraseña ingresada
  const [password, setPassword] = useState('');

  // Almacena mensajes de error para mostrar al usuario
  const [error, setError] = useState('');

  /**
   * MANEJADOR DE ENVÍO DEL FORMULARIO
   * Valida las credenciales y ejecuta el callback onLogin si son correctas
   * Credenciales válidas: usuario = "admin", contraseña = "1234"
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    // Valida las credenciales hardcodeadas
    if (usuario === 'admin' && password === '1234') {
      onLogin(usuario); // Ejecuta el callback con el nombre de usuario
    } else {
      setError('Usuario o contraseña incorrectos'); // Muestra mensaje de error
    }
  };

  /**
   * RENDERIZADO DEL FORMULARIO
   * Muestra los campos de usuario, contraseña y botón de login
   */
  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form" style={{ animation: 'slideUp var(--spring-duration) var(--spring-curve)' }}>
        <div className="login-brand">
          <h2 className="login-title"><i className="fas fa-microscope"></i> PHARMA<span>CORE</span></h2>
          <p className="login-subtitle">Advanced Clinical Management Luxe</p>
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Usuario de red"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            required
            className="login-input"
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="login-input"
          />
        </div>

        {/* Muestra el mensaje de error si existe */}
        {error && <div className="login-error pulsate">{error}</div>}

        {/* Botón para enviar el formulario */}
        <button type="submit" className="login-button">
          Entrar al Ecosistema
        </button>

        <p className="login-footer">© 2026 PharmaCore Luxe v4.0 | Premium Ecosystem</p>
      </form>
    </div>
  );
};

// Creador: Cristian García CI:32.170.910
export default Login;