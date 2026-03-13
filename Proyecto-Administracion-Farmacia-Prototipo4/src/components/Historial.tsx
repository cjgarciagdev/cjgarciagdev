import React from 'react';
import '../styles/productoslist.css';

// HistorialItem: Define la estructura de cada registro en el historial
export interface HistorialItem {
    nombre: string; // Nombre del producto retirado
    cantidadMedida?: number; // Cantidad numérica retirada
    unidadMedida?: string;   // Unidad seleccionada (ej: MG, ML)
    lista: string;           // Lista a la que pertenece (clínica, comercial, etc.)
    fechaRetiro: string;     // Fecha en que se retiró el producto
    persona: {
        nombre: string;      // Nombre de la persona que retiró
        apellido: string;    // Apellido de la persona que retiró
        cargo: string;       // Cargo de la persona que retiró
    };
}

// Props que recibe el componente Historial
interface HistorialProps {
    historial: HistorialItem[]; // Lista de registros de historial (solo retiros)
}

// Historial: Muestra la tabla con el historial de movimientos de insumos
const Historial: React.FC<HistorialProps> = ({ historial }) => (
    <div className="productos-list">
        <h2 className="productos-title">Historial de Mercancía</h2>
        <table className="productos-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Medida</th>
                    <th>Lista</th>
                    <th>Fecha de Retiro</th>
                    <th>Persona que Retiró</th>
                    <th>Cargo</th>
                </tr>
            </thead>
            <tbody>
                {/* Solo muestra los retiros registrados desde el formulario de retiro */}
                {historial.map((item, idx) => (
                    <tr key={idx}>
                        <td>{item.nombre}</td>
                        <td>
                            {/* Muestra cantidad y unidad si existen, si no solo la unidad */}
                            {item.cantidadMedida
                                ? `${item.cantidadMedida} ${item.unidadMedida}`
                                : item.unidadMedida}
                        </td>
                        <td>{item.lista}</td>
                        <td>{item.fechaRetiro}</td>
                        <td>{item.persona.nombre} {item.persona.apellido}</td>
                        <td>{item.persona.cargo}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default Historial;