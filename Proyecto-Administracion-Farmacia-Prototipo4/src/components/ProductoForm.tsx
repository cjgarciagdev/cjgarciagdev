import React, { useState } from "react";
import { Producto } from "../types/Producto";
import "../styles/productoform.css";

interface Props {
  onAgregarClinico: (producto: Producto) => void;
  onAgregarComercial: (producto: Producto) => void;
}

const ProductoForm: React.FC<Props> = ({ onAgregarClinico, onAgregarComercial }) => {
  const [producto, setProducto] = useState<Producto>({
    codigo: "", // valor inicial para codigo
    nombre: "",
    tipoPresentacion: "",
    cantidad: 0,
    unidadMedida: "",
    vencimiento: "",
    lote: "",
    ubicacion: "",
    proveedor: "",
    condicionesAlmacenamiento: "",
    stock: 0, // valor inicial para stock
    categoria: "", // valor inicial para categoria
  });

  const [tipoLista, setTipoLista] = useState<"clinica" | "comercial">("clinica");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProducto({
      ...producto,
      [name]: name === "cantidad" || name === "precioAdquisicion"
        ? Number(value)
        : value,
    });
  };

  const handleTipoListaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTipoLista(e.target.value as "clinica" | "comercial");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tipoLista === "clinica") {
      onAgregarClinico(producto);
    } else {
      onAgregarComercial(producto);
    }
    setProducto({
      codigo: "", // valor inicial para codigo
      nombre: "",
      tipoPresentacion: "",
      cantidad: 0,
      unidadMedida: "",
      vencimiento: "",
      lote: "",
      ubicacion: "",
      proveedor: "",
      condicionesAlmacenamiento: "",
      stock: 0,
      categoria: "",
    });
    setTipoLista("clinica");
  };

  return (
    <form onSubmit={handleSubmit} className="producto-form">
      <h2 className="form-title">Agregar Insumos</h2>
      <label><strong>Nombre del Producto</strong></label>
      <input name="nombre" placeholder="Nombre del producto" value={producto.nombre} onChange={handleChange} required className="form-input"
      />
      <div className="form-group">
        <label><strong>Tipo de Presentación</strong></label>
        <input
          name="tipoPresentacion"
          placeholder="Tipo y presentación (Tableta, Frasco, Ampolla, Inyección, Parche, etc.)"
          value={producto.tipoPresentacion}
          onChange={handleChange}
          required
        />
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="number"
            name="cantidad"
            placeholder="Cantidad (ej: 200)"
            value={producto.cantidad}
            onChange={handleChange}
            min={0}
            style={{ width: "6rem" }}
            required
          />
          <select
            name="unidadMedida"
            value={producto.unidadMedida}
            onChange={handleChange}
            required
          >
            {/* Opciones de unidad de medida */}
            <option value="" disabled>Medida</option>
            <option value="mg">mg</option>
            <option value="ml">ml</option>
            <option value="gr">gr</option>
          </select>
        </label>
      </div>
      <label><strong>Número de lote o serie</strong></label>
      <input
        name="lote"
        placeholder="PQRSTU123456789XYZ"
        value={producto.lote}
        onChange={handleChange}
        required
      />
      <div className="form-group">
        <label><strong>Ubicación de Almacén.</strong></label>
        <input
          name="ubicacion"
          placeholder="Clase A, B, C."
          value={producto.ubicacion}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label><strong>Condición de Almacenamiento</strong></label>
        <input
          name="condicionesAlmacenamiento"
          placeholder="Temperatura, humedad, entre otros."
          value={producto.condicionesAlmacenamiento}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label><strong>Fecha de Vencimiento</strong></label>
        <input
          name="vencimiento"
          type="date"
          placeholder="Fecha de vencimiento"
          value={producto.vencimiento}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label><strong>Cantidad</strong></label>
        <input
          type="number"
          name="cantidad"
          placeholder="Cantidad en inventario"
          value={producto.cantidad}
          onChange={handleChange}
          required
          min={0}
        />
      </div>
      <label>
        Enviar a lista:
        <select value={tipoLista} onChange={handleTipoListaChange}>
          <option value="clinica">Interno</option>
          <option value="comercial">Paciente</option>
        </select>
      </label>
      <button type="submit">Agregar producto</button>
    </form>
  );
};
export default ProductoForm;