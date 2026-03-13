// ==============================================================================
// CALENDARIO DE ACTIVIDADES
// ==============================================================================

class SimpleCalendar {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.currentDate = new Date();
        this.events = [];
        this.render();
    }

    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Header
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        document.getElementById('cal-mes-titulo').innerText = `${monthNames[month]} ${year}`;

        // Grid
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Ajuste Lunes=0 Domingo=6

        let html = '';

        // Espacios vacíos antes del primer día
        for (let i = 0; i < startDayOfWeek; i++) {
            html += `<div class="bg-gray-50 h-24 rounded-lg"></div>`;
        }

        // Días
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = this.events.filter(e => e.fecha_inicio.startsWith(dateStr));
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            html += `
                <div class="bg-white border ${isToday ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-100'} h-24 rounded-lg p-1 hover:shadow-md transition relative group overflow-hidden cursor-pointer" onclick="openEventsDay('${dateStr}')">
                    <span class="text-xs font-bold ${isToday ? 'text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full' : 'text-gray-500'} absolute top-1 left-1">${day}</span>
                    <div class="mt-5 space-y-1 overflow-y-auto max-h-[80%] custom-scrollbar">
                        ${dayEvents.map(e => `
                            <div class="text-[0.6rem] px-1 py-0.5 rounded truncate text-white" style="background-color: ${e.color}" title="${e.titulo}">
                                ${e.titulo}
                            </div>
                        `).join('')}
                    </div>
                    ${dayEvents.length > 2 ? `<span class="absolute bottom-0 right-1 text-[0.6rem] text-gray-400 font-bold">+${dayEvents.length - 2} más</span>` : ''}
                </div>
            `;
        }

        this.element.innerHTML = html;
        this.updateStats();
    }

    setEvents(events) {
        this.events = events;
        this.render();
    }

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.loadEvents(); // Recargar eventos para el nuevo mes
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.loadEvents();
    }

    async loadEvents() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth() + 1;
        const start = `${year}-${String(month).padStart(2, '0')}-01`;
        const end = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

        try {
            const res = await fetch(`/api/calendario?fecha_desde=${start}&fecha_hasta=${end}`);
            const events = await res.json();
            this.setEvents(events);
            loadProximosEventos(); // Side panel
        } catch (e) {
            console.error('Error loading events:', e);
        }
    }

    updateStats() {
        const total = this.events.length;
        const completados = this.events.filter(e => e.completado).length;
        const pendientes = total - completados;
        const vencidos = this.events.filter(e => !e.completado && new Date(e.fecha_fin || e.fecha_inicio) < new Date()).length;

        document.getElementById('cal-total-mes').innerText = total;
        document.getElementById('cal-completados').innerText = completados;
        document.getElementById('cal-pendientes').innerText = pendientes;
        document.getElementById('cal-vencidos').innerText = vencidos;
    }
}

let calendarInstance = null;

function loadCalendarioSection() {
    if (!calendarInstance) {
        calendarInstance = new SimpleCalendar('cal-grid');
    }
    calendarInstance.loadEvents();
}

function cambiarMesCalendario(dir) {
    if (calendarInstance) {
        if (dir === -1) calendarInstance.prevMonth();
        else calendarInstance.nextMonth();
    }
}

async function loadProximosEventos() {
    try {
        const res = await fetch('/api/calendario/proximos');
        const data = await res.json();
        const container = document.getElementById('proximos-eventos');

        // El backend devuelve 'eventos' con todo mezclado (protocolos, finanzas, etc.)
        const eventos = data.eventos || [];

        if (eventos.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-8 text-gray-400">
                    <i class="far fa-calendar-times text-3xl mb-2 opacity-50"></i>
                    <p class="text-sm">No hay actividades próximas</p>
                </div>`;
            return;
        }

        container.innerHTML = eventos.map(e => {
            // Formatear fechas de forma segura
            let fecha = new Date();
            if (e.fecha_inicio) {
                // Soportar formato ISO manual del backend o estándar
                fecha = new Date(e.fecha_inicio.includes('T') ? e.fecha_inicio : e.fecha_inicio.replace(' ', 'T'));
            }

            const diaStr = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
            const horaStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            // Detectar si es un evento nativo (ID numérico) para permitir completar
            const esNativo = typeof e.id === 'number' || (typeof e.id === 'string' && /^\d+$/.test(e.id));
            const idSeguro = esNativo ? e.id : `'${e.id}'`; // Comillas para strings

            // Icono según tipo
            let iconClass = 'fa-circle';
            if (e.tipo === 'Salud' || e.tipo === 'Protocolo') iconClass = 'fa-user-md';
            else if (e.tipo === 'Parto' || e.tipo === 'Maternidad') iconClass = 'fa-baby-carriage';
            else if (e.tipo === 'Finanzas' || e.tipo === 'Pago') iconClass = 'fa-hand-holding-usd';
            else if (e.tipo === 'Inventario') iconClass = 'fa-boxes';
            else if (e.tipo === 'Vacunación') iconClass = 'fa-syringe';

            return `
            <div class="group flex items-start gap-3 p-3 rounded-2xl hover:bg-indigo-50/50 transition border border-transparent hover:border-indigo-100 relative">
                <!-- Línea de color lateral -->
                <div class="absolute left-0 top-3 bottom-3 w-1 rounded-r-full" style="background-color: ${e.color}"></div>
                
                <!-- Icono -->
                <div class="mt-1 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100 text-xs shrink-0" style="color: ${e.color}">
                    <i class="fas ${iconClass}"></i>
                </div>

                <div class="flex-1 min-w-0 ml-1">
                    <div class="flex justify-between items-start">
                        <p class="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                            ${diaStr} <span class="text-gray-300 mx-1">•</span> ${horaStr}
                        </p>
                    </div>
                    <h4 class="font-bold text-gray-800 text-sm truncate pr-6" title="${e.titulo}">${e.titulo}</h4>
                    <p class="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">${e.descripcion || 'Evento programado'}</p>
                </div>

                <!-- Botón Completar (Solo nativos por ahora) -->
                ${!e.completado && esNativo ? `
                <button onclick="completarEvento(${e.id})" 
                    class="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-green-100 text-gray-300 hover:text-green-600" 
                    title="Marcar como completado">
                    <i class="fas fa-check"></i>
                </button>` : ''}
            </div>
            `;
        }).join('');

    } catch (e) {
        console.error("Error en loadProximosEventos:", e);
        document.getElementById('proximos-eventos').innerHTML = `
            <div class="text-center py-4 text-red-400 text-xs">
                Error al cargar: ${e.message}
            </div>`;
    }
}

// Modal handlers
function openModalEvento(dateStr = null) {
    document.getElementById('modalEvento').classList.remove('hidden');
    if (dateStr) {
        document.getElementById('evtFechaInicio').value = `${dateStr}T08:00`;
        document.getElementById('evtFechaFin').value = `${dateStr}T09:00`;
    } else {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('evtFechaInicio').value = now.toISOString().slice(0, 16);
    }
}

function closeModalEvento() {
    document.getElementById('modalEvento').classList.add('hidden');
    document.getElementById('evtTitulo').value = '';
    document.getElementById('evtDescripcion').value = '';
}

function toggleRecurrencia() {
    const check = document.getElementById('evtRecurrente');
    const fields = document.getElementById('campos-recurrencia');
    if (check.checked) fields.classList.remove('hidden');
    else fields.classList.add('hidden');
}

async function saveEvento() {
    const titulo = document.getElementById('evtTitulo').value;
    const inicio = document.getElementById('evtFechaInicio').value;
    const tipo = document.getElementById('evtTipo').value;

    if (!titulo || !inicio) {
        agroAlert('Título y Fecha Inicio obligatorios', 'Error', 'danger');
        return;
    }

    const data = {
        titulo,
        fecha_inicio: inicio,
        fecha_fin: document.getElementById('evtFechaFin').value,
        tipo,
        descripcion: document.getElementById('evtDescripcion').value,
        prioridad: document.getElementById('evtPrioridad').value,
        asignado: document.getElementById('evtAsignado').value,
        recordatorio_minutos: document.getElementById('evtRecordatorio').value,
        todo_el_dia: document.getElementById('evtTodoElDia').checked,
        recurrente: document.getElementById('evtRecurrente').checked,
        patron_recurrencia: document.getElementById('evtPatronRecurrencia').value
    };

    try {
        const res = await fetch('/api/calendario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();

        if (result.status === 'success') {
            closeModalEvento();
            loadCalendarioSection();
            agroAlert('Evento creado', 'Éxito', 'success');
        } else {
            agroAlert(result.error, 'Error', 'danger');
        }
    } catch (e) { console.error(e); }
}

async function completarEvento(id) {
    try {
        await fetch(`/api/calendario/${id}/completar`, { method: 'POST' });
        loadCalendarioSection();
    } catch (e) { console.error(e); }
}

/**
 * Muestra el listado de eventos de un día específico
 */
function openEventsDay(dateStr) {
    if (!calendarInstance) return;

    const dayEvents = calendarInstance.events.filter(e => e.fecha_inicio.startsWith(dateStr));
    if (dayEvents.length === 0) return;

    let content = `
        <div class="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar text-left">
            <p class="text-sm text-gray-500 mb-4 sticky top-0 bg-white py-2">Actividades para el día <strong>${new Date(dateStr).toLocaleDateString()}</strong>:</p>
            ${dayEvents.map(e => `
                <div class="p-4 rounded-2xl border-l-4 shadow-sm bg-gray-50 flex justify-between items-center mb-3" style="border-left-color: ${e.color}">
                    <div>
                        <h4 class="font-bold text-gray-800">${e.titulo}</h4>
                        <p class="text-xs text-gray-500">${e.descripcion || 'Sin descripción'}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    agroAlert(content, `Agenda: ${dateStr}`, 'info');
}

/**
 * Alias para compatibilidad si se llama desde el HTML
 */
window.openEventsDay = openEventsDay;
