/**
 * DB SERVICE - PHARMACORE LUXE (SQL CONNECTED)
 * Gestor de persistencia que conecta con la API SQL del backend.
 * Incluye fallback automático a localStorage para desarrollo.
 */

const API_URL = 'http://localhost:3001/api';

export const dbService = {
    // === MÉTODOS SQL (ASYNC) ===

    // Obtener todos los clientes
    getClientes: async () => {
        try {
            const resp = await fetch(`${API_URL}/clientes`);
            if (!resp.ok) throw new Error('API Error');
            return await resp.json();
        } catch (error) {
            console.warn('Backend SQL no disponible. Cargando desde localStorage...');
            const local = localStorage.getItem('pharma_clientes');
            return local ? JSON.parse(local) : null;
        }
    },

    // Guardar nuevo cliente en SQL
    addCliente: async (cliente: any) => {
        try {
            const resp = await fetch(`${API_URL}/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cliente)
            });
            return await resp.json();
        } catch (error) {
            console.error('Error guardando en SQL:', error);
            // Backup local
            const clientes = JSON.parse(localStorage.getItem('pharma_clientes') || '[]');
            clientes.push(cliente);
            localStorage.setItem('pharma_clientes', JSON.stringify(clientes));
        }
    },

    // Guardar nuevo producto en SQL
    saveProducto: async (producto: any) => {
        try {
            await fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(producto)
            });
        } catch (error) {
            const productos = JSON.parse(localStorage.getItem('pharma_productos') || '[]');
            productos.push(producto);
            localStorage.setItem('pharma_productos', JSON.stringify(productos));
        }
    },

    // Obtener productos

    getProductos: async () => {
        try {
            const resp = await fetch(`${API_URL}/productos`);
            if (!resp.ok) throw new Error('API Error');
            return await resp.json();
        } catch (error) {
            const local = localStorage.getItem('pharma_productos');
            return local ? JSON.parse(local) : null;
        }
    },

    // Obtener personal
    getPersonal: async () => {
        try {
            const resp = await fetch(`${API_URL}/personal`);
            if (!resp.ok) throw new Error('API Error');
            const data = await resp.json();

            // Mapear de SQLite (flat) a Interfaz Personal (nested)
            return data.map((p: any) => ({
                id: p.id,
                nombre: p.nombre,
                apellido: p.apellido,
                especializacion: p.especializacion,
                departamento: p.departamento,
                disponibilidad: {
                    dias: p.disponibilidad_dias ? p.disponibilidad_dias.split(',').map((d: string) => d.trim()) : [],
                    horario: p.disponibilidad_horario || ''
                }
            }));
        } catch (error) {
            const local = localStorage.getItem('pharma_personal');
            return local ? JSON.parse(local) : null;
        }
    },

    // Guardar nuevo personal en SQL
    savePersonal: async (persona: any) => {
        try {
            // Flatten for SQLite
            const flatPersona = {
                ...persona,
                disponibilidad_dias: persona.disponibilidad.dias.join(', '),
                disponibilidad_horario: persona.disponibilidad.horario
            };
            delete flatPersona.disponibilidad;

            await fetch(`${API_URL}/personal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flatPersona)
            });
        } catch (error) {
            const personal = JSON.parse(localStorage.getItem('pharma_personal') || '[]');
            personal.push(persona);
            localStorage.setItem('pharma_personal', JSON.stringify(personal));
        }
    },

    // === MÉTODOS LEGACY (Mantenidos para compatibilidad estructural) ===

    save: (key: string, data: any) => {
        localStorage.setItem(`pharma_${key}`, JSON.stringify(data));
    },

    load: (key: string, initialData: any) => {
        const data = localStorage.getItem(`pharma_${key}`);
        return data ? JSON.parse(data) : initialData;
    }
};
