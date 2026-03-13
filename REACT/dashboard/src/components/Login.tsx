import React, { useState } from "react";
import "../styles/Login.css";

const Login: React.FC<{ onLogin?: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-bg">
      <div className="login-content">
        <div className="login-left">
          <div className="login-quote">
            Aunque el mercado suba y baje como la bolsa de valores,<br />
            las personas mocha siguen invirtiendo en sí mismas,<br />
            porque saben que su valor nunca se deprecia
          </div>
          <svg width="320" height="220" viewBox="0 0 320 220" fill="none" className="login-graph">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1e90ff"/>
                <stop offset="1" stopColor="#e6cb54"/>
              </linearGradient>
            </defs>
            <polyline
              points="10,200 80,80 160,160 220,60 310,120"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="6"
            />
            <polygon points="300,110 320,120 300,130" fill="#e6cb54" />
          </svg>
        </div>
        <div className="login-right">
          <div className="login-title">Bienvenido</div>
          <div className="login-subtitle">Ingresa tu email y contraseña</div>
          <form className="login-form" onSubmit={e => { e.preventDefault(); onLogin?.(); }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Usuario@gmail.com"
              required
            />
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button className="login-btn" type="submit">SIGN IN</button>
          </form>
          <div className="login-links">
            <span>No tienes cuenta? <a href="#">Regístrate aquí</a></span><br />
            <span>¿No recuerda tu clave? <a href="#">Click aquí</a></span>
          </div>
        </div>
      </div>
      <footer className="login-footer">
        © 2025, Made with by 'to' Semestre "D1T" 2630 Ing En sistema
        <span className="login-footer-links">
          <a href="#">Marketplace</a> &nbsp; <a href="#">Blog</a> &nbsp; <a href="#">License</a>
        </span>
      </footer>
    </div>
  );
};

export default Login;