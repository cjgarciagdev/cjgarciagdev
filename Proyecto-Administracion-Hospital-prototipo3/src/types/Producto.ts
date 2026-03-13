/**
 * INTERFAZ PRODUCTO
 * Define la estructura de datos para los productos/insumos médicos
 */
export interface Producto {
    nombre: string;        // Nombre del producto médico
    codigo: string;        // Código único de identificación
    stock: number;         // Cantidad disponible en inventario
    precio: number;        // Precio unitario del producto
    vencimiento: string;   // Fecha de vencimiento del producto
    historial?: string;    // Historial de uso del producto (opcional)
}