/**
 * GlucoAmigo - Módulo de Modo Oscuro y Utilidades UI
 * ==================================================
 * Toggle de modo oscuro, paginación infinita, y otras utilidades
 */

// ═══════════════════════════════════════════════════════════════
// MODO OSCURO (Dark Mode)
// ═══════════════════════════════════════════════════════════════

const DarkMode = {
    KEY: 'glucoamigo_dark_mode',

    init() {
        // Verificar preferencia guardada o del sistema
        const saved = localStorage.getItem(this.KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (saved === 'true' || (!saved && prefersDark)) {
            document.body.classList.add('dark-mode');
        }

        this.crearToggle();
    },

    crearToggle() {
        // Evitar duplicar toggle
        if (document.querySelector('.dark-mode-toggle')) return;

        const btn = document.createElement('button');
        btn.className = 'dark-mode-toggle';
        btn.innerHTML = '<i class="fas fa-moon"></i>';
        btn.title = 'Alternar modo oscuro';

        btn.addEventListener('click', () => this.toggle());
        document.body.appendChild(btn);

        // Actualizar icono según estado
        this.actualizarIcono();
    },

    toggle() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem(this.KEY, isDark);
        this.actualizarIcono();
    },

    actualizarIcono() {
        const btn = document.querySelector('.dark-mode-toggle');
        if (!btn) return;

        const isDark = document.body.classList.contains('dark-mode');
        btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
};

// ═══════════════════════════════════════════════════════════════
// PAGINACIÓN INFINITA
// ═══════════════════════════════════════════════════════════════

const InfiniteScroll = {
    opciones: {
        threshold: 200,
        containerSelector: null,
        loadingSelector: '.loading-indicator',
        endpoint: null,
        renderItem: null
    },

    init(opciones = {}) {
        this.opciones = { ...this.opciones, ...opciones };

        if (!this.opciones.containerSelector) {
            console.error('InfiniteScroll: Falta especificar containerSelector');
            return;
        }

        window.addEventListener('scroll', () => this.verificarScroll());
    },

    verificarScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight - this.opciones.threshold) {
            this.cargarMas();
        }
    },

    async cargarMas() {
        const container = document.querySelector(this.opciones.containerSelector);
        const loading = document.querySelector(this.opciones.loadingSelector);

        if (this.cargando || !this.opciones.endpoint) return;

        this.cargando = true;
        if (loading) loading.style.display = 'block';

        try {
            const response = await fetch(this.opciones.endpoint + '&page=' + (this.paginaActual + 1));
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    const html = this.opciones.renderItem ?
                        this.opciones.renderItem(item) :
                        this.renderDefault(item);
                    container.insertAdjacentHTML('beforeend', html);
                });
                this.paginaActual++;
            } else {
                // No hay más datos
                if (loading) loading.textContent = 'No hay más registros';
            }
        } catch (error) {
            console.error('Error en paginación:', error);
        } finally {
            this.cargando = false;
            if (loading) loading.style.display = 'none';
        }
    },

    renderDefault(item) {
        return `<div class="item">${JSON.stringify(item)}</div>`;
    }
};

// ═══════════════════════════════════════════════════════════════
// CALCULADORA DE BOLOS (Módulo Clínico)
// ═══════════════════════════════════════════════════════════════

const CalculadoraBolos = {
    ratio: 15,      // g de carbs por unidad de insulina
    factorSensibilidad: 40,  // mg/dL que baja 1 unidad
    objetivo: 100,  // mg/dL objetivo

    configurar(ratio, factor, objetivo) {
        this.ratio = ratio;
        this.factorSensibilidad = factor;
        this.objetivo = objetivo;
    },

    // Calcular bolo para carbohidratos
    calcularBoloCarbohidratos(carbohidratos) {
        return Math.round((carbohidratos / this.ratio) * 10) / 10;
    },

    // Calcular bolo corrector (diferencia entre glucosa actual y objetivo)
    calcularBoloCorrector(glucosaActual) {
        if (glucosaActual <= this.objetivo) return 0;
        const diferencia = glucosaActual - this.objetivo;
        return Math.round((diferencia / this.factorSensibilidad) * 10) / 10;
    },

    // Calcular bolo total (comida + corrector)
    calcularBoloTotal(glucosaActual, carbohidratos) {
        const boloComida = this.calcularBoloCarbohidratos(carbohidratos);
        const boloCorrector = this.calcularBoloCorrector(glucosaActual);
        return {
            boloComida,
            boloCorrector,
            boloTotal: Math.round((boloComida + boloCorrector) * 10) / 10,
            unidad: 'u'
        };
    },

    // Obtener recomendaciones de sitio de inyección
    obtenerSitioInyeccion(ultimoSitio) {
        const sitios = ['abdomen', 'brazo', 'muslo', 'glúteo'];
        const ultimoIdx = sitios.indexOf(ultimoSitio);
        const siguienteIdx = (ultimoIdx + 1) % sitios.length;

        return {
            recomendado: sitios[siguienteIdx],
            rotacion: 'Recordatorio: Rota el sitio de inyección para evitar lipodistrofia'
        };
    }
};

// ═══════════════════════════════════════════════════════════════
// UTILIDADES DE BADGES Y LOGROS
// ═══════════════════════════════════════════════════════════════

const SistemaLogros = {
    logros: [
        { id: 'primer_registro', nombre: 'Primer Paso', descripcion: 'Registra tu primera glucemia', icono: 'fa-star', requerimiento: 1, tipo: 'lecturas' },
        { id: 'semana_completa', nombre: 'Semana de Oro', descripcion: '7 días de registros', icono: 'fa-calendar-week', requerimiento: 7, tipo: 'dias' },
        { id: 'mes_consistente', nombre: 'Mes Heroico', descripcion: '30 días de registros', icono: 'fa-calendar-alt', requerimiento: 30, tipo: 'dias' },
        { id: 'tiempo_rango', nombre: 'En el Blanco', descripcion: '70% tiempo en rango', icono: 'fa-bullseye', requerimiento: 70, tipo: 'tir' },
        { id: 'sin_hipoglucemias', nombre: 'Sin Caídas', descripcion: '7 días sin hipoglucemia', icono: 'fa-shield-alt', requerimiento: 7, tipo: 'dias_sin_hipo' },
        { id: 'juego_completado', nombre: 'Aprende Jugando', descripcion: 'Completa un juego educativo', icono: 'fa-gamepad', requerimiento: 1, tipo: 'juegos' },
    ],

    verificarLogro(tipo, valor) {
        const logro = this.logros.find(l => l.tipo === tipo);
        if (!logro) return null;

        if (valor >= logrowequerimiento) {
            return logro;
        }
        return null;
    },

    renderizarBadge(logro) {
        return `
            <div class="badge-unlocked" data-logro="${logro.id}">
                <div class="badge-icon"><i class="fas ${logro.icono}"></i></div>
                <div class="badge-info">
                    <strong>${logro.nombre}</strong>
                    <p>${logro.descripcion}</p>
                </div>
            </div>
        `;
    }
};

// ═══════════════════════════════════════════════════════════════
// INICIALIZAR TODO EN DOMContentLoaded
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    DarkMode.init();
    console.log('GlucoAmigo UI Utils cargado');
});

// Exportar para uso global
window.GlucoAmigoUtils = {
    DarkMode,
    InfiniteScroll,
    CalculadoraBolos,
    SistemaLogros
};
