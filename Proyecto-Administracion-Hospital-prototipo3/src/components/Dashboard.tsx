import React from 'react';
import { Cliente } from '../types/Cliente';
import { Producto } from '../types/Producto';
import { Personal } from '../types/Personal';
import '../styles/index.css';

interface DashboardProps {
    clientes: Cliente[];
    productos: Producto[];
    personal: Personal[];
}

const Dashboard: React.FC<DashboardProps> = ({ clientes, productos, personal }) => {
    // Calcular estadísticas reales
    const stockCritico = productos.filter(p => p.stock !== undefined && p.stock < 10).length;
    const productosTotal = productos.length;
    const pacientesTotal = clientes.length;
    const personalTotal = personal.length;

    // Pacientes recientes (últimos 3)
    const pacientesRecientes = clientes.slice(-3).reverse();

    // Productos con stock bajo
    const productosStockBajo = productos.filter(p => p.stock !== undefined && p.stock < 10).slice(0, 2);

    return (
        <div className="dashboard-container fade-in">
            <h1 className="dashboard-greet">Bienvenido, <span className="text-gradient">Farmacéutico</span></h1>
            <p className="dashboard-subtext">Resumen operativo de hoy</p>

            <div className="stats-grid">
                <div className="stat-card hover-lift">
                    <div className="stat-icon cyan"><i className="fas fa-users"></i></div>
                    <div className="stat-info">
                        <h3>Pacientes</h3>
                        <p className="stat-value">{pacientesTotal}</p>
                        <span className="stat-trend positive">Registros activos</span>
                    </div>
                </div>
                <div className="stat-card hover-lift">
                    <div className="stat-icon purple"><i className="fas fa-pills"></i></div>
                    <div className="stat-info">
                        <h3>Productos</h3>
                        <p className="stat-value">{productosTotal}</p>
                        <span className={stockCritico > 0 ? "stat-trend negative" : "stat-trend positive"}>
                            {stockCritico > 0 ? `${stockCritico} con stock bajo` : 'Stock óptimo'}
                        </span>
                    </div>
                </div>
                <div className="stat-card hover-lift">
                    <div className="stat-icon rose"><i className="fas fa-user-md"></i></div>
                    <div className="stat-info">
                        <h3>Personal</h3>
                        <p className="stat-value">{personalTotal}</p>
                        <span className="stat-trend positive">En servicio</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-main-grid">
                <div className="chart-section luxury-card hover-lift">
                    <div className="card-header">
                        <h2>Actividad Semanal</h2>
                        <button className="btn-small">Ver Reporte</button>
                    </div>
                    <div className="placeholder-chart">
                        {/* Gráfico placeholder con datos simulados */}
                        <div className="bar" style={{ height: '40%' }}></div>
                        <div className="bar" style={{ height: '65%' }}></div>
                        <div className="bar" style={{ height: '85%' }}></div>
                        <div className="bar" style={{ height: '45%' }}></div>
                        <div className="bar" style={{ height: '90%' }}></div>
                        <div className="bar" style={{ height: '60%' }}></div>
                        <div className="bar" style={{ height: '75%' }}></div>
                    </div>
                </div>

                <div className="recent-activity luxury-card hover-lift">
                    <div className="card-header">
                        <h2>Actividad Reciente</h2>
                    </div>
                    <ul className="activity-list custom-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {pacientesRecientes.length > 0 && pacientesRecientes.map((paciente, idx) => (
                            <li key={idx} className="stagger-item" style={{ animationDelay: `${0.1 * idx}s` }}>
                                <div className="activity-icon"><i className="fas fa-user-plus"></i></div>
                                <div className="activity-details">
                                    <p>Nuevo Paciente: {paciente.nombre} {paciente.apellido}</p>
                                    <span>Dept: {paciente.departamento}</span>
                                </div>
                            </li>
                        ))}
                        {productosStockBajo.length > 0 && productosStockBajo.map((producto, idx) => (
                            <li key={`prod-${idx}`} className="stagger-item" style={{ animationDelay: `${0.1 * (idx + pacientesRecientes.length)}s` }}>
                                <div className="activity-icon alert"><i className="fas fa-exclamation-triangle"></i></div>
                                <div className="activity-details">
                                    <p>Stock Bajo: {producto.nombre}</p>
                                    <span>Quedan: {producto.stock} unidades</span>
                                </div>
                            </li>
                        ))}
                        {pacientesRecientes.length === 0 && productosStockBajo.length === 0 && (
                            <li className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                                <i className="fas fa-check-circle" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                                <p>No hay actividad reciente</p>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
