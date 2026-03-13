import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Cliente } from '../types/Cliente';
import '../styles/clientelist.css';

// Define la interfaz para las propiedades del componente
interface ClientesListProps {
  clientes: Cliente[]; // Lista de clientes que se mostrarán en la tabla
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>; // Función para actualizar la lista de clientes
}

const ClientesList: React.FC<ClientesListProps> = ({ clientes, setClientes }) => {
  const [searchTerm, setSearchTerm] = useState(''); // Estado para manejar el término de búsqueda
  const [filterCondition] = useState(''); // Estado para manejar el filtro por condición
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null); // Estado para manejar el cliente seleccionado
  const [showLogin, setShowLogin] = useState(false); // Estado para mostrar el modal de login
  const [username, setUsername] = useState(''); // Estado para manejar el nombre de usuario
  const [password, setPassword] = useState(''); // Estado para manejar la contraseña

  // Función para abrir el modal con los detalles del cliente
  const abrirModal = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setClienteSeleccionado(null);
    setShowLogin(false);
  };

  // Función para guardar los cambios realizados en el cliente
  const guardarEdicion = (clienteActualizado: Cliente) => {
    setClienteSeleccionado(clienteActualizado);
    setShowLogin(true);
  };

  const confirmarGuardar = () => {
    if (username === 'admin' && password === '1234') {
      // Actualiza el cliente en la lista local
      setClientes((prev) =>
        prev.map((c) =>
          c.id === clienteSeleccionado?.id ? clienteSeleccionado : c
        )
      );
      cerrarModal();
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  // Filtrar clientes por término de búsqueda y condición
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.identificacion?.toString().includes(searchTerm) &&
    (filterCondition === '' || cliente.condicion?.toLowerCase() === filterCondition.toLowerCase())
  );

  // Función para exportar datos a Excel
  const exportarExcel = () => {
    const encabezados = [
      ['Nombre', 'Apellido', 'Edad', 'Teléfono', 'Identificación', 'Tratamiento', 'Fecha de ingreso', 'Próxima cita', 'Condición', 'Razón de visita', 'Departamento', 'Historial médico', 'Resultado de Revisión'],
    ];
    const filas = clientes.map(cliente => [
      cliente.nombre,
      cliente.apellido,
      cliente.edad,
      cliente.telefono,
      cliente.identificacion,
      cliente.tratamiento || '',
      cliente.fechaIngreso || '',
      cliente.proximaCita || '',
      cliente.condicion || '',
      cliente.razonVisita || '',
      cliente.departamento || '',
      cliente.historial || '',
      cliente.resultadoRevision || '',
    ]);
    const hoja = XLSX.utils.aoa_to_sheet([...encabezados, ...filas]);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Clientes');
    XLSX.writeFile(libro, 'clientes.xlsx');
  };

  // Función para importar datos desde Excel
  const importarExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = (e) => {
      const datos = new Uint8Array(e.target?.result as ArrayBuffer);
      const libro = XLSX.read(datos, { type: 'array' });
      const hoja = libro.Sheets[libro.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json(hoja, { header: 1 }) as string[][];
      const nuevosClientes = filas.slice(1).map(fila => ({
        nombre: fila[0],
        apellido: fila[1],
        edad: parseInt(fila[2], 10),
        telefono: parseInt(fila[3], 10),
        identificacion: parseInt(fila[4], 10),
        tratamiento: fila[5],
        fechaIngreso: fila[6],
        proximaCita: fila[7],
        condicion: fila[8],
        razonVisita: fila[9],
        departamento: fila[10],
        historial: fila[11],
        resultadoRevision: fila[12],
        id: Date.now() + Math.random(), // Genera un id único local
        numeroConsulta: 0, // Valor por defecto, ajusta si tienes el dato en el Excel
      }));
      setClientes(prev => [...prev, ...nuevosClientes]);
    };
    lector.readAsArrayBuffer(archivo);
  };

  // Función para guardar el resultado de la consulta
  const guardarResultado = () => {
    if (clienteSeleccionado) {
      guardarEdicion(clienteSeleccionado);
    }
  };

  return (
    <div className="clientes-list">
      <h2>Lista de Pacientes</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="actions-container">
        <button onClick={exportarExcel}>Exportar a Excel</button>
        <button
          type="button"
          onClick={() => document.getElementById('importar-excel-input')?.click()}
        >
          Importar desde Excel
        </button>
        <input
          id="importar-excel-input"
          type="file"
          accept=".xlsx"
          style={{ display: 'none' }}
          onChange={importarExcel}
        />
      </div>
      <div className="tabla-scroll">
        <table className="clientes-table mobile-card-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Edad</th>
              <th>Teléfono</th>
              <th>Identificación</th>
              <th>Numero de consulta</th>
              <th>Fecha de Ingreso</th>
              <th>Próxima Cita</th>
              <th>Departamento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cliente, index) => (
              <tr key={index} className="stagger-item" style={{ animationDelay: `${0.05 * index}s` }}>
                <td data-label="Nombre">{cliente.nombre}</td>
                <td data-label="Apellido">{cliente.apellido}</td>
                <td data-label="Edad">{cliente.edad}</td>
                <td data-label="Teléfono">{cliente.telefono}</td>
                <td data-label="Identificación">{cliente.identificacion}</td>
                <td data-label="N° Consulta" className="numero-consulta">{cliente.numeroConsulta}</td>
                <td data-label="Fecha Ingreso">{cliente.fechaIngreso}</td>
                <td data-label="Próxima Cita">{cliente.proximaCita}</td>
                <td data-label="Departamento">{cliente.departamento}</td>
                <td data-label="Acciones">
                  <button onClick={() => abrirModal(cliente)}>Ver detalles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {clienteSeleccionado && (
        <div className="modal">
          <div className="modal-content">
            <h3>Detalles del Paciente</h3>
            <div className="form-section">
              <label><b>Nombre:</b></label>
              <input
                type="text"
                value={clienteSeleccionado.nombre}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    nombre: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-section">
              <label><b>Apellido:</b></label>
              <input
                type="text"
                value={clienteSeleccionado.apellido}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    apellido: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-section">
              <label><b>Edad:</b></label>
              <input
                type="number"
                value={clienteSeleccionado.edad}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    edad: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div className="form-section">
              <label><b>Teléfono:</b></label>
              <input
                type="text"
                value={clienteSeleccionado.telefono}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    telefono: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div className="form-section">
              <label><b>Identificación:</b></label>
              <input
                type="text"
                value={clienteSeleccionado.identificacion}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    identificacion: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div className="form-section">
              <label><b>Número de Consulta</b></label>
              <input
                type="number"
                value={clienteSeleccionado.numeroConsulta}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    numeroConsulta: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div className="form-section">
              <label><b>Fecha de Ingreso:</b></label>
              <input
                type="date"
                value={clienteSeleccionado.fechaIngreso}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    fechaIngreso: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-section">
              <label><b>Próxima Cita:</b></label>
              <input
                type="date"
                value={clienteSeleccionado.proximaCita}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    proximaCita: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-section">
              <label><b>Condición:</b></label>
              <textarea
                value={clienteSeleccionado.condicion}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    condicion: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-section">
              <label><b>Razón de Visita:</b></label>
              <textarea
                value={clienteSeleccionado.razonVisita}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    razonVisita: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-section">
              <label><b>Departamento:</b></label>
              <input
                type="text"
                value={clienteSeleccionado.departamento}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    departamento: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-section">
              <label><b>Historial Médico:</b></label>
              <textarea
                value={clienteSeleccionado.historial}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    historial: e.target.value,
                  })
                }
              />
            </div>
            {/* Tratamiento debajo de Historial Médico */}
            <div className="form-section">
              <label><b>Tratamiento:</b></label>
              <textarea
                value={clienteSeleccionado.tratamiento || ''}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    tratamiento: e.target.value,
                  })
                }
                rows={3}
                placeholder="Agregar tratamiento aquí..."
              />
            </div>
            <div className="form-section">
              <label><b>Resultado de la Consulta:</b></label>
              <textarea
                value={clienteSeleccionado.resultadoRevision || ''}
                onChange={(e) =>
                  setClienteSeleccionado({
                    ...clienteSeleccionado,
                    resultadoRevision: e.target.value,
                  })
                }
              />
            </div>
            <button onClick={guardarResultado} className="modal-button">Guardar</button>
            <button onClick={cerrarModal} className="modal-button">Cerrar</button>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="modal-bg">
          <div className="login-form scale-in" style={{ padding: '2.5rem', width: '90%', maxWidth: '400px' }}>
            <div className="login-brand" style={{ marginBottom: '2rem' }}>
              <i className="fas fa-shield-alt" style={{ fontSize: '2.25rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
              <h2 className="login-title" style={{ fontSize: '1.75rem' }}>Autorización <span>Requerida</span></h2>
              <p className="login-subtitle">Confirme sus credenciales para guardar cambios</p>
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

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={confirmarGuardar} className="primary" style={{ flex: 1, padding: '0.875rem' }}>
                Confirmar
              </button>
              <button onClick={() => setShowLogin(false)} className="secondary" style={{ flex: 1, padding: '0.875rem' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesList;