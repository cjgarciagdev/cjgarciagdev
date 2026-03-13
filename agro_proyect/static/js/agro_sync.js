/**
 * AGRO-SYNC: Módulo de Sincronización en Tiempo Real
 * Mantiene la interfaz actualizada sin necesidad de refrescar la página.
 */

const AgroSync = {
    currentVersion: null,
    pollingInterval: 3000, // 3 segundos (Más reactivo)
    isEnabled: true,
    lastSyncElement: null,

    init() {
        console.log('🚀 AgroSync iniciado');
        this.createSyncIndicator();
        this.startPolling();

        // Registrar visibilidad para ahorrar recursos cuando la pestaña no está activa
        document.addEventListener('visibilitychange', () => {
            this.isEnabled = !document.hidden;
            if (this.isEnabled) {
                this.checkVersion(); // Verificar inmediatamente al volver
            }
        });
    },

    async trigger() {
        /**
         * Dispara una sincronización manual inmediata.
         * Se usa tras realizar una acción local (guardar/editar/borrar) 
         * para que los cambios se noten al instante sin esperar al poller.
         */
        console.log('⚡ AgroSync Trigger Manual');
        try {
            // 1. Obtener la versión más reciente del servidor inmediatamente
            const response = await fetch('/api/sync/version');
            if (response.ok) {
                const data = await response.json();
                this.currentVersion = data.version;
            }
        } catch (e) { console.warn('No se pudo actualizar version en trigger:', e); }

        // 2. Refrescar toda la UI
        this.refreshUI();
    },

    createSyncIndicator() {
        const header = document.querySelector('header') || document.body;
        const indicator = document.createElement('div');
        indicator.id = 'agro-sync-status';
        indicator.className = 'fixed top-4 right-4 z-[60] flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-gray-100 rounded-full shadow-sm transition-all duration-500 opacity-0 transform translate-y-[-10px] pointer-events-none sm:pointer-events-auto';

        indicator.innerHTML = `
            <div class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Sincronizado</span>
        `;

        document.body.appendChild(indicator);
        this.lastSyncElement = indicator;

        // Mostrar brevemente al inicio
        setTimeout(() => this.showIndicator(), 1000);
    },

    showIndicator() {
        if (!this.lastSyncElement) return;
        this.lastSyncElement.classList.remove('opacity-0', 'translate-y-[-10px]');
        this.lastSyncElement.classList.add('opacity-100', 'translate-y-0');

        setTimeout(() => {
            this.lastSyncElement.classList.add('opacity-0', 'translate-y-[-10px]');
            this.lastSyncElement.classList.remove('opacity-100', 'translate-y-0');
        }, 3000);
    },

    async checkVersion() {
        if (!this.isEnabled) return;

        try {
            const response = await fetch('/api/sync/version');
            if (!response.ok) return;

            const data = await response.json();

            if (this.currentVersion === null) {
                this.currentVersion = data.version;
                return;
            }

            if (data.version > this.currentVersion) {
                console.log(`🔄 Nueva versión detectada: ${data.version}. Actualizando...`);
                this.currentVersion = data.version;
                this.refreshUI();
            }
        } catch (error) {
            console.error('Error en AgroSync:', error);
        }
    },

    refreshUI() {
        this.showIndicator();

        // Determinar qué recargar basado en la sección activa
        const activeSection = this.getActiveSection();

        // Recargar dashboard siempre si hay cambios (para contadores y gráficas)
        if (typeof loadDashboard === 'function') loadDashboard();
        if (typeof initCharts === 'function') initCharts();
        if (typeof loadNotifications === 'function') loadNotifications();

        // Recargar secciones específicas
        if (activeSection === 'ganado' && typeof loadAnimals === 'function') loadAnimals();
        if (activeSection === 'inventario' && typeof loadInventario === 'function') loadInventario();
        if (activeSection === 'salud' && typeof loadProtocols === 'function') loadProtocols();
        if (activeSection === 'usuarios' && typeof loadUsuarios === 'function') loadUsuarios();
        if (activeSection === 'maternidad' && typeof loadMaternityAnimals === 'function') loadMaternityAnimals();
        if (activeSection === 'auditoria' && typeof loadAuditoria === 'function') loadAuditoria();
        if (activeSection === 'nutricion' && typeof loadPlanesNutricionalesList === 'function') loadPlanesNutricionalesList();
        if (activeSection === 'avanzado' && typeof cargarListasAnimales === 'function') cargarListasAnimales();

        // Notificar al usuario sutilmente
        if (typeof agroToast === 'function') {
            agroToast('Datos actualizados automáticamente.', 'info');
        }
    },

    getActiveSection() {
        const sections = document.querySelectorAll('.content-section');
        for (const s of sections) {
            if (!s.classList.contains('hidden')) {
                return s.id.replace('sec-', '');
            }
        }
        return 'dashboard';
    },

    startPolling() {
        setInterval(() => this.checkVersion(), this.pollingInterval);
    }
};

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => AgroSync.init());
