import { ReactNode } from 'react';

export interface Producto {
    categoria: string;
    stock: ReactNode;
    codigo: string | number | null | undefined;
    nombre: string; // Nombre del producto (comercial y/o genérico)
    tipoPresentacion: string; // Tipo y presentación (medicamento, insumo, equipo; ej. 500 mg, frasco, etc.)
    unidadMedida: string; // Unidad de medida (ej. mg, ml, unidades)
    cantidad: number; // Cantidad en inventario
    vencimiento: string; // Fecha de vencimiento
    lote: string; // Número de lote o serie
    ubicacion: string; // Ubicación en almacén
    proveedor: string; // Proveedor principal
    condicionesAlmacenamiento: string; // Condiciones de almacenamiento
}