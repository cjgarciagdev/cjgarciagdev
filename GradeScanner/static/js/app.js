/**
 * GradeScanner - Main Application JavaScript
 */

// Configuración global
const API_BASE = '';

// Utilidades
const Utils = {
    // Mostrar notificación toast
    toast: (message, type = 'info') => {
        const container = document.querySelector('.toast-container') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast border-l-4 ${type === 'success' ? 'border-green-500' :
                type === 'error' ? 'border-red-500' :
                    type === 'warning' ? 'border-yellow-500' :
                        'border-indigo-500'
            }`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle text-green-500' :
                type === 'error' ? 'times-circle text-red-500' :
                    type === 'warning' ? 'exclamation-triangle text-yellow-500' :
                        'info-circle text-indigo-500'
            } mr-3"></i>
                <span>${message}</span>
            </div>
        `;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    },

    // Formatear fecha
    formatDate: (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Formatear fecha y hora
    formatDateTime: (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleString('es', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Validar email
    validateEmail: (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Request API
    api: async (endpoint, options = {}) => {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const response = await fetch(API_BASE + endpoint, { ...defaultOptions, ...options });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(error.error || 'Error en la solicitud');
        }

        return response.json();
    }
};

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// El menú móvil se maneja ahora directamente en base.html para evitar conflictos de carga

// Funciones globales para manejo de modales
window.openModal = function (modalId) {
    document.getElementById(modalId).classList.remove('hidden');
};

window.closeModal = function (modalId) {
    document.getElementById(modalId).classList.add('hidden');
};

// Exportar funciones globales
window.GradeScanner = {
    Utils,
    api: Utils.api,
    toast: Utils.toast
};
