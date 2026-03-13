import React from "react";
import "../styles/Account.css";

const Account: React.FC = () => (
  <main className="main-content account-layout">
    <div className="account-header-row">
      <div className="account-header-card">
        <div className="account-avatar" />
        <div>
          <div className="account-username">@Usuario</div>
          <div className="account-role">Usuario</div>
        </div>
      </div>
      <div className="account-balance-card">
        <div className="account-balance-label">TOTAL BALANCE</div>
        <div className="account-balance-value">$***,**</div>
      </div>
    </div>
    <div className="account-content-row">
      <div className="account-profile-card">
        <div className="account-profile-title">Profile Informations</div>
        <div className="account-profile-list">
          <div className="account-profile-item">
            <span>
              Hi, I'm Mark Johnson. Decisions: If you can't decide, the answer is no. If two equally difficult paths, choose the one more painful in the short term (gain avoidance is creating an illusion of equality).
            </span>
            <span className="account-dot dot-blue"></span>
          </div>
          <div className="account-profile-item">
            <span>
              Hi, I'm Mark Johnson. Decisions: If you can't decide, the answer is no. If two equally difficult paths, choose the one more painful in the short term (gain avoidance is creating an illusion of equality).
            </span>
            <span className="account-dot dot-pink"></span>
          </div>
          <div className="account-profile-item">
            <span>
              Hi, I'm Mark Johnson. Decisions: If you can't decide, the answer is no. If two equally difficult paths, choose the one more painful in the short term (gain avoidance is creating an illusion of equality).
            </span>
            <span className="account-dot dot-green"></span>
          </div>
          <div className="account-profile-item">
            <span>
              Hi, I'm Mark Johnson. Decisions: If you can't decide, the answer is no. If two equally difficult paths, choose the one more painful in the short term (gain avoidance is creating an illusion of equality).
            </span>
            <span className="account-dot dot-yellow"></span>
          </div>
        </div>
      </div>
      <div className="account-side-info">
        <div className="account-side-card">
          <div className="account-profile-title">Profile Informations</div>
          <div className="account-side-details">
            <div>Lorem ipsum sit at dictum sed ullamcorper accumsan at rutrum.</div>
            <div>Nombre completo: Usuario</div>
            <div>Teléfono: (+58) ---</div>
            <div>Email: Usuario@gmail.com</div>
            <div>Location: Venezuela</div>
          </div>
        </div>
        <div className="miniCir-chart">
          <div className="account-donut-card">
            {/* Puedes reemplazar este SVG por una librería de gráficos si lo deseas */}
            {/* Donut chart interactivo y más grande */}
            <svg
              width="220"
              height="220"
              viewBox="0 0 44 44"
              style={{ cursor: "pointer" }}
              onMouseMove={e => {
                // Puedes agregar lógica interactiva aquí, por ejemplo, mostrar tooltip
              }}
              onClick={e => {
                // Puedes agregar lógica de click aquí
              }}
            >
              <circle r="22" cx="22" cy="22" fill="#222" />
              <circle r="11" cx="22" cy="22" fill="#191919" />
              <circle
                r="18"
                cx="22"
                cy="22"
                fill="transparent"
                stroke="#ffea2b"
                strokeWidth="8"
                strokeDasharray="27 73"
                strokeDashoffset="0"
                style={{ transition: "stroke-width 0.2s" }}
              />
              <circle
                r="18"
                cx="22"
                cy="22"
                fill="transparent"
                stroke="#5dff2b"
                strokeWidth="8"
                strokeDasharray="23 77"
                strokeDashoffset="-27"
                style={{ transition: "stroke-width 0.2s" }}
              />
              <circle
                r="18"
                cx="22"
                cy="22"
                fill="transparent"
                stroke="#ff97a8"
                strokeWidth="8"
                strokeDasharray="18 82"
                strokeDashoffset="-50"
                style={{ transition: "stroke-width 0.2s" }}
              />
              <circle
                r="18"
                cx="22"
                cy="22"
                fill="transparent"
                stroke="#0fb7ff"
                strokeWidth="8"
                strokeDasharray="32 68"
                strokeDashoffset="-68"
                style={{ transition: "stroke-width 0.2s" }}
              />
            </svg>
            <div className="account-donut-labels">
              <span style={{ color: "#0fb7ff" }}>27%</span>
              <span style={{ color: "#ff97a8" }}>23%</span>
              <span style={{ color: "#5dff2b" }}>18%</span>
              <span style={{ color: "#ffea2b" }}>32%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
);

export default Account;