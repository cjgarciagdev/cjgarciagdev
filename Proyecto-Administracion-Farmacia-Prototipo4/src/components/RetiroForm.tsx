import React, { useState } from "react";
import { Producto } from "../types/Producto";
import "../styles/productoform.css";
/**
 * RetiroForm: Formulario para registrar el retiro de un producto.
 * Props:
 * - productos: lista de productos disponibles para retirar.
 * - onRetiro: función que recibe los datos del retiro al enviar el formulario.
 */
interface RetiroFormProps {
    productos: Producto[];
    onRetiro: (data: {
        nombre: string;
        medida: string;
        lista: string;
        cantidad: number;
        fechaRetiro: string;
        persona: string;
        cargo: string;
    }) => void;
}

const RetiroForm: React.FC<RetiroFormProps> = ({ productos, onRetiro }) => {
    const [form, setForm] = useState({
        nombre: "",
        medida: "",
        lista: "",
        cantidad: 1,
        fechaRetiro: "",
        persona: "",
        cargo: "",
    });

    // Obtener todas las combinaciones únicas de medida/cantidad para el producto seleccionado
    const medidasDelProducto = form.nombre
        ? Array.from(
            new Set(
                productos
                    .filter(p => p.nombre === form.nombre)
                    .map(p =>
                        p.cantidad && p.unidadMedida
                            ? `${p.cantidad} ${p.unidadMedida}`
                            : p.unidadMedida || ""
                    )
            )
        ).filter(Boolean)
        : [];

    // Cuando se selecciona un producto, autocompleta medida y lista
    const handleProductoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nombre = e.target.value;
        // Buscar todas las medidas posibles para ese producto
        const medidas = productos
            .filter(p => p.nombre === nombre)
            .map(p =>
                p.cantidad && p.unidadMedida
                    ? `${p.cantidad} ${p.unidadMedida}`
                    : p.unidadMedida || ""
            )
            .filter(Boolean);

        // Si solo hay una medida, la selecciona automáticamente
        let medida = "";
        if (medidas.length === 1) {
            medida = medidas[0];
        }

        // Obtener la lista (tipo/lote) del primer producto encontrado
        const producto = productos.find(p => p.nombre === nombre);

        setForm({
            ...form,
            nombre,
            medida,
            lista: producto?.lote || "",
            cantidad: 1,
        });
    };

    // Cuando se selecciona una medida específica
    const handleMedidaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({
            ...form,
            medida: e.target.value,
            cantidad: 1,
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: name === "cantidad" ? Number(value) : value });
    };

    // Obtener el máximo disponible para el producto y medida seleccionados
    const productoSeleccionado = productos.find(p => {
        if (p.nombre !== form.nombre) return false;
        if (medidasDelProducto.length > 1 && form.medida) {
            // Comparar cantidad y unidad
            return `${p.cantidad} ${p.unidadMedida}` === form.medida;
        }
        return true;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRetiro(form);
        setForm({
            nombre: "",
            medida: "",
            lista: "",
            cantidad: 1,
            fechaRetiro: "",
            persona: "",
            cargo: "",
        });
    };

    return (
        <form onSubmit={handleSubmit} className="producto-form">
            <h2 className="form-title">Retiro de Producto</h2>
            <div className="form-group">
                <label><strong>Producto</strong></label>
                <select
                    name="nombre"
                    value={form.nombre}
                    onChange={handleProductoChange}
                    required
                    className="form-input"
                >
                    <option value="">Seleccione un producto</option>
                    {productos
                        .map(p => p.nombre)
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .map((nombre, idx) => (
                            <option key={idx} value={nombre}>
                                {nombre}
                            </option>
                        ))}
                </select>
            </div>
            <div className="form-group">
                <label><strong>Unidad de medida</strong></label>
                <select
                    name="medida"
                    value={form.medida}
                    onChange={handleMedidaChange}
                    required
                    disabled={!form.nombre}
                    className="form-input"
                >
                    <option value="">Seleccione medida</option>
                    {medidasDelProducto.map((medida, idx) => (
                        <option key={idx} value={medida}>{medida}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label><strong>Lista de origen</strong></label>
                <input
                    name="lista"
                    value={form.lista}
                    readOnly
                    placeholder="Lista"
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label><strong>Cantidad a retirar</strong></label>
                <input
                    type="number"
                    name="cantidad"
                    min={1}
                    max={productoSeleccionado?.cantidad || 1}
                    value={form.cantidad}
                    onChange={handleChange}
                    required
                    disabled={!form.nombre || (medidasDelProducto.length > 1 && !form.medida)}
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label><strong>Fecha de Retiro</strong></label>
                <input
                    type="date"
                    name="fechaRetiro"
                    value={form.fechaRetiro}
                    onChange={handleChange}
                    required
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label><strong>Persona que Retiró</strong></label>
                <input
                    name="persona"
                    value={form.persona}
                    onChange={handleChange}
                    required
                    placeholder="Nombre de la persona"
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label><strong>Cargo</strong></label>
                <input
                    name="cargo"
                    value={form.cargo}
                    onChange={handleChange}
                    required
                    placeholder="Cargo de la persona"
                    className="form-input"
                />
            </div>
            <button
                type="submit"
                className="form-button"
                disabled={!form.nombre || (medidasDelProducto.length > 1 && !form.medida)}
            >
                Registrar Retiro
            </button>
        </form>
    );
};

export default RetiroForm;