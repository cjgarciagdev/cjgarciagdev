import React, { useState } from 'react';
import '../styles/login.css'; // Importa el archivo CSS para los estilos

interface LoginProps {
  onLogin: (usuario: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario === 'admin' && password === '1234') {
      onLogin(usuario);
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2 className="login-title">Iniciar sesión</h2>
      <input
        type="text"
        placeholder="Usuario"
        value={usuario}
        onChange={e => setUsuario(e.target.value)}
        required
        className="login-input"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="login-input"
      />
      {error && <div className="login-error">{error}</div>}
      <button type="submit" className="login-button">Entrar</button>
    </form>
  );
};
export default Login;