import React, { useState } from 'react';
import { Personal } from '../types/Personal';
import '../styles/personallist.css';

interface PersonalListProps {
  personal: Personal[];
  setPersonal: React.Dispatch<React.SetStateAction<Personal[]>>;
}

const PersonalList: React.FC<PersonalListProps> = ({ personal, setPersonal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nuevoPersonal, setNuevoPersonal] = useState<Personal>({
    id: '', // Valor temporal, se genera localmente
    nombre: '',
    apellido: '',
    especializacion: '',
    departamento: '',
    disponibilidad: {
      dias: [],
      horario: '',
    },
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Elimina la carga desde backend

  const handleAddPersonal = async () => {
    if (!nuevoPersonal.nombre || !nuevoPersonal.apellido || !nuevoPersonal.especializacion || !nuevoPersonal.departamento) {
      alert('Por favor, completa todos los campos antes de agregar.');
      return;
    }

    const id = Date.now().toString() + Math.random().toString().substring(2, 6);
    const personaParaGuardar = { ...nuevoPersonal, id };

    // Guardar en SQL
    import('../services/dbService').then(async ({ dbService }) => {
      await dbService.savePersonal(personaParaGuardar);
      setPersonal(prev => [...prev, personaParaGuardar]);
    });

    setNuevoPersonal({
      id: '',
      nombre: '',
      apellido: '',
      especializacion: '',
      departamento: '',
      disponibilidad: {
        dias: [],
        horario: '',
      },
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este personal?')) {
      setPersonal(prev => prev.filter(p => p.id !== id));
    }
  };

  const personalFiltrado = personal.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="login-container" style={{ minHeight: 'auto', padding: '2rem 0' }}>
        <div className="login-form fade-in" style={{ margin: '0 auto', maxWidth: '400px', padding: '2.5rem' }}>
          <div className="login-brand" style={{ marginBottom: '2rem' }}>
            <i className="fas fa-lock" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
            <h2 className="login-title" style={{ fontSize: '1.75rem' }}>Verificación <span>Requerida</span></h2>
            <p className="login-subtitle">Confirme sus credenciales para acceder</p>
          </div>

          <input
            type="text"
            placeholder="Usuario Administrador"
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
            Acceder a Personal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="personal-list fade-in">
      <h2 className="list-title">Gestión de Personal 🩺</h2>

      {/* Buscador */}
      <div className="search-container luxury-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, apellido o especialidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="dashboard-main-grid">
        {/* Formulario de Registro (Izquierda) */}
        <div className="luxury-card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Registrar Nuevo Personal</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Nombre"
                value={nuevoPersonal.nombre}
                onChange={(e) => setNuevoPersonal({ ...nuevoPersonal, nombre: e.target.value })}
              />
              <input
                type="text"
                placeholder="Apellido"
                value={nuevoPersonal.apellido}
                onChange={(e) => setNuevoPersonal({ ...nuevoPersonal, apellido: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="Especialización (ej: Cardiología)"
              value={nuevoPersonal.especializacion}
              onChange={(e) => setNuevoPersonal({ ...nuevoPersonal, especializacion: e.target.value })}
            />
            <input
              type="text"
              placeholder="Departamento"
              value={nuevoPersonal.departamento}
              onChange={(e) => setNuevoPersonal({ ...nuevoPersonal, departamento: e.target.value })}
            />
            <div className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>DISPONIBILIDAD</label>
              <input
                type="text"
                placeholder="Días (ej: Lunes, Martes)"
                value={nuevoPersonal.disponibilidad.dias.join(', ')}
                onChange={(e) =>
                  setNuevoPersonal({
                    ...nuevoPersonal,
                    disponibilidad: { ...nuevoPersonal.disponibilidad, dias: e.target.value.split(',').map(d => d.trim()) },
                  })
                }
                style={{ marginBottom: '0.5rem' }}
              />
              <input
                type="text"
                placeholder="Horario (ej: 08:00 - 16:00)"
                value={nuevoPersonal.disponibilidad.horario}
                onChange={(e) =>
                  setNuevoPersonal({
                    ...nuevoPersonal,
                    disponibilidad: { ...nuevoPersonal.disponibilidad, horario: e.target.value },
                  })
                }
              />
            </div>
            <button onClick={handleAddPersonal} className="primary" style={{ width: '100%' }}>
              <i className="fas fa-user-plus"></i> Registrar en Sistema
            </button>
          </div>
        </div>

        {/* Tabla de Personal (Derecha) */}
        <div className="luxury-card" style={{ overflow: 'hidden', padding: 0 }}>
          <div className="tabla-scroll">
            <table className="personal-table mobile-card-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Especialización</th>
                  <th>Departamento</th>
                  <th>Disponibilidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {personalFiltrado.length > 0 ? (
                  personalFiltrado.map((p, idx) => (
                    <tr key={p.id} className="stagger-item" style={{ animationDelay: `${0.05 * idx}s` }}>
                      <td data-label="Nombre">
                        <div style={{ fontWeight: 700 }}>{p.nombre} {p.apellido}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {p.id.substring(0, 8)}</div>
                      </td>
                      <td data-label="Especialidad">
                        <span style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700 }}>
                          {p.especializacion}
                        </span>
                      </td>
                      <td data-label="Departamento">{p.departamento}</td>
                      <td data-label="Disponibilidad">
                        <div style={{ fontSize: '0.85rem' }}>
                          <i className="fas fa-calendar-alt" style={{ color: 'var(--text-muted)', marginRight: '0.4rem' }}></i> {p.disponibilidad?.dias?.join(', ')}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <i className="fas fa-clock" style={{ color: 'var(--text-muted)', marginRight: '0.4rem' }}></i> {p.disponibilidad?.horario}
                        </div>
                      </td>
                      <td data-label="Acciones">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="delete-button"
                          style={{ padding: '0.5rem', background: 'transparent', color: '#ef4444', border: '1px solid #fee2e2' }}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No se encontró personal que coincida con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
// Creador Cristian García CI:32.170.910
export default PersonalList;