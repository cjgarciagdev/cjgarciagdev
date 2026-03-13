// ==============================================================================
// GESTIÓN DE PRODUCCIÓN (Leche, Carne, Lana, Huevos)
// ==============================================================================

/**
 * Carga estadísticas y tabla de producción.
 */
async function loadProduccionSection() {
    // Cargar especies dinámicamente según lo que hay en sistema
    try {
        const res = await fetch('/api/estadisticas/especies');
        const data = await res.json();
        const select = document.getElementById('filtro-especie-produccion');
        if (select && data.poblacion) {
            const currentVal = select.value;
            let options = '<option value="Todas">Todas las especies</option>';
            Object.keys(data.poblacion).forEach(esp => {
                options += `<option value="${esp}">${esp}</option>`;
            });
            select.innerHTML = options;
            if (currentVal && options.includes(`value="${currentVal}"`)) {
                select.value = currentVal;
            }
        }
    } catch (e) { console.error('Error cargando especies para filtro:', e); }

    loadProduccionStats();
    loadProduccionRegistros();
}

/**
 * Carga estadísticas resumen (hoy, semana, mes, top).
 */
async function loadProduccionStats() {
    try {
        const tipo = document.getElementById('filtro-tipo-produccion')?.value || 'Leche';
        const especie = document.getElementById('filtro-especie-produccion')?.value || 'Todas';
        const res = await fetch(`/api/produccion/resumen?tipo=${tipo}&especie=${especie}`);
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        // Actualizar unidades visuales
        const unidadSuffix = tipo === 'Leche' ? 'L' : 'kg';
        document.querySelectorAll('.prod-unidad-label').forEach(el => el.innerText = unidadSuffix);

        // Actualizar cards
        animateValue('prod-hoy', data.produccion_hoy);
        animateValue('prod-semana', data.produccion_semana);
        animateValue('prod-mes', data.produccion_mes);

        const calidadEl = document.getElementById('prod-calidad');
        if (data.calidad_promedio && (data.calidad_promedio.grasa || data.calidad_promedio.proteina)) {
            calidadEl.innerText = `${data.calidad_promedio.grasa || '-'}% / ${data.calidad_promedio.proteina || '-'}%`;
        } else {
            calidadEl.innerText = '--';
        }

        // Actualizar tabla Top Productores
        const topContainer = document.getElementById('top-productores');
        if (data.top_productores && data.top_productores.length > 0) {
            topContainer.innerHTML = data.top_productores.map((p, index) => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${['bg-yellow-500', 'bg-gray-400', 'bg-orange-400'][index] || 'bg-blue-400'}">
                            ${index + 1}
                        </div>
                        <div>
                            <p class="font-bold text-gray-800 text-sm">#${p.animal_id} - ${p.raza}</p>
                            <p class="text-xs text-gray-500">${p.especie}</p>
                        </div>
                    </div>
                    <span class="font-black text-amber-600 text-sm">${p.total} ${tipo === 'Leche' ? 'L' : 'kg'}</span>
                </div>
            `).join('');
        } else {
            topContainer.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">Sin datos registrados</p>';
        }

        // Actualizar Gráfico
        renderProduccionChart(data.historial_diario, tipo);

        // --- CALIDAD LECHE INTEGRACIÓN ---
        const sectionCalidad = document.getElementById('section-calidad-leche');
        if (tipo === 'Leche') {
            if (sectionCalidad) sectionCalidad.classList.remove('hidden');
            loadCalidadStats(especie);

            // Actualizar Mini Stats Qual
            if (data.calidad_promedio) {
                const g = data.calidad_promedio.grasa || 0;
                const p = data.calidad_promedio.proteina || 0;
                if (typeof animateValue === 'function') {
                    animateValue('avg-grasa-val', g, 1, '%');
                    animateValue('avg-proteina-val', p, 1, '%');
                } else {
                    document.getElementById('avg-grasa-val').innerText = `${g}%`;
                    document.getElementById('avg-proteina-val').innerText = `${p}%`;
                }

                const cardCalidad = document.getElementById('prod-calidad');
                if (cardCalidad) cardCalidad.innerText = `${g}% G / ${p}% P`;
            }
        } else {
            if (sectionCalidad) sectionCalidad.classList.add('hidden');
            const cardCalidad = document.getElementById('prod-calidad');
            if (cardCalidad) cardCalidad.innerText = '--';
        }

        // Asegurar coherencia en los filtros globales
        validateGlobalFiltersCoherence();

    } catch (error) {
        console.error('Error cargando stats producción:', error);
    }
}

/**
 * Asegura que el selector de tipo de producción sea coherente con la especie seleccionada
 * en la zona de filtros generales del tablero.
 */
function validateGlobalFiltersCoherence() {
    const selectEspecie = document.getElementById('filtro-especie-produccion');
    const selectTipo = document.getElementById('filtro-tipo-produccion');
    if (!selectEspecie || !selectTipo) return;

    const especie = selectEspecie.value;
    const currentTipo = selectTipo.value;

    const mapping = {
        'Bovino': ['Leche', 'Carne'],
        'Ovino': ['Leche', 'Carne', 'Lana'],
        'Caprino': ['Leche', 'Carne'],
        'Porcino': ['Carne'],
        'Equino': ['Carne'],
        'Todas': ['Leche', 'Carne', 'Lana'],
        'Default': ['Leche', 'Carne', 'Lana']
    };

    const tiposValidos = mapping[especie] || mapping['Default'];

    // Si el tipo actual ya no es válido para esta especie, resetearlo
    if (!tiposValidos.includes(currentTipo)) {
        // Reconstruimos opciones para el filtro global
        let options = '';
        tiposValidos.forEach(t => {
            options += `<option value="${t}">${t}</option>`;
        });
        selectTipo.innerHTML = options;

        // Disparamos recarga de stats con el primer tipo válido
        loadProduccionStats();
    } else {
        // Solo actualizamos las opciones visuales sin cambiar el valor
        let options = '';
        tiposValidos.forEach(t => {
            options += `<option value="${t}" ${t === currentTipo ? 'selected' : ''}>${t}</option>`;
        });
        selectTipo.innerHTML = options;
    }
}

/**
 * Renderiza el gráfico de producción.
 */
let chartProduccionInstance = null;

function renderProduccionChart(historial, tipo) {
    const ctx = document.getElementById('chartProduccion')?.getContext('2d');
    if (!ctx) return;

    if (chartProduccionInstance) {
        chartProduccionInstance.destroy();
    }

    // Preparar datos: si no hay historial, mostrar placeholders o vacíos
    const labels = (historial && historial.length > 0) ? historial.map(h => {
        // Formatear fecha de YYYY-MM-DD a DD Mes
        const d = new Date(h.fecha + 'T00:00:00');
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }) : ['Sin Datos'];

    const dataPoints = (historial && historial.length > 0) ? historial.map(h => h.cantidad) : [0];

    // Gradiente para el área de debajo de la línea
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

    chartProduccionInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Producción ${tipo}`,
                data: dataPoints,
                borderColor: '#f59e0b',
                backgroundColor: gradient,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#f59e0b',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    borderRadius: 8,
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} ${tipo === 'Leche' ? 'L' : 'kg'}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [5, 5], color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        callback: function (value) { return value + (tipo === 'Leche' ? ' L' : ' kg'); }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { maxTicksLimit: 10, font: { size: 10 } }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

/**
 * Carga la tabla de registros de producción.
 */
async function loadProduccionRegistros() {
    try {
        const url = `/api/produccion?page=1&per_page=100`;
        const res = await fetch(url);
        const data = await res.json();

        window.allProduccion = data.registros || []; // Para filtrado local
        renderProduccionTable(data.registros);
    } catch (error) {
        console.error('Error cargando registros:', error);
    }
}

/**
 * Renderiza la tabla de producción.
 */
function renderProduccionTable(registros) {
    const tbody = document.getElementById('produccionTableBody');
    if (!tbody) return;

    if (!registros || registros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-400">No hay registros de producción</td></tr>`;
        return;
    }

    tbody.innerHTML = registros.map(r => `
        <tr class="border-b border-gray-50 hover:bg-gray-50 transition">
            <td class="p-4 text-sm font-medium text-gray-600">${r.fecha}</td>
            <td class="p-4 text-sm font-bold text-gray-800">${r.animal_info}</td>
            <td class="p-4 text-sm text-gray-600"><span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold uppercase">${r.tipo_produccion}</span></td>
            <td class="p-4 text-sm font-black text-gray-800">${r.cantidad} <span class="text-gray-400 text-xs">${r.unidad}</span></td>
            <td class="p-4 text-sm text-gray-600">${r.turno}</td>
            <td class="p-4 text-sm text-gray-600">${r.calidad || '-'}</td>
            <td class="p-4 text-right">
                <button onclick="deleteProduccion(${r.id})" class="text-gray-400 hover:text-red-500 transition ml-2 tooltip" data-tip="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Filtra la tabla localmente.
 */
function filterProduccionTable() {
    const term = document.getElementById('searchProduccion')?.value.toLowerCase();
    if (!term || !window.allProduccion) return loadProduccionRegistros(); // Recargar si limpio

    const filtered = window.allProduccion.filter(r =>
        r.animal_info.toLowerCase().includes(term) ||
        r.tipo_produccion.toLowerCase().includes(term) ||
        r.observaciones?.toLowerCase().includes(term)
    );
    renderProduccionTable(filtered);
}

/**
 * Abre el modal de nuevo registro.
 */
function openModalProduccion() {
    document.getElementById('modalProduccion').classList.remove('hidden');
    loadAnimalesSelect('prodAnimalId');
    filterProduccionTypesByAnimal(); // Estado inicial (desactivado si no hay animal)
    // Set fecha actual default
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('prodFecha').value = now.toISOString().slice(0, 16);
}

function closeModalProduccion() {
    document.getElementById('modalProduccion').classList.add('hidden');
    // Limpiar campos
    document.getElementById('prodCantidad').value = '';
    document.getElementById('prodObservaciones').value = '';
}

/**
 * Ajusta los campos visibles según el tipo de producción seleccionado
 */
function handleProduccionTypeChange() {
    const tipo = document.getElementById('prodTipo').value;
    const camposLeche = document.getElementById('campos-calidad-leche');
    const unidadLabel = document.querySelector('label[for="prodUnidad"]') || { innerText: '' };

    if (tipo === 'Leche') {
        camposLeche.classList.remove('hidden');
    } else {
        camposLeche.classList.add('hidden');
    }
}

// Escuchar cambios en el tipo de producción
document.addEventListener('change', (e) => {
    if (e.target.id === 'prodTipo') handleProduccionTypeChange();
});

/**
 * Guarda un registro de producción.
 */
async function saveProduccion() {
    const animalId = document.getElementById('prodAnimalId').value;
    const tipo = document.getElementById('prodTipo').value;
    const cantidad = document.getElementById('prodCantidad').value;

    if (!animalId || !cantidad) {
        agroAlert('Animal y Cantidad son obligatorios', 'Validación', 'warning');
        return;
    }

    const data = {
        animal_id: animalId,
        tipo_produccion: tipo,
        cantidad: cantidad,
        unidad: tipo === 'Leche' ? 'litros' : 'kg',
        turno: document.getElementById('prodTurno').value,
        calidad: document.getElementById('prodCalidad').value,
        fecha: document.getElementById('prodFecha').value,
        observaciones: document.getElementById('prodObservaciones').value,
        // Campos leche
        grasa_porcentaje: tipo === 'Leche' ? document.getElementById('prodGrasa').value : null,
        proteina_porcentaje: tipo === 'Leche' ? document.getElementById('prodProteina').value : null,
        celulas_somaticas: tipo === 'Leche' ? document.getElementById('prodCelulas').value : null,
    };

    try {
        const res = await fetch('/api/produccion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();

        if (result.status === 'success') {
            closeModalProduccion();
            loadProduccionSection();
            const msg = 'Producción registrada correctamente';
            agroAlert(msg, 'Éxito', 'success');

            // INTEGRACIÓN FINANZAS: Sugerir ingreso por venta
            // Si es un volumen considerable o tipo comercializable
            setTimeout(() => {
                if (confirm(`¿Deseas registrar un INGRESO por la venta de esta producción (${cantidad} ${data.unidad})?`)) {
                    // Abrir modal de finanzas pre-llenado
                    if (window.proponerTransaccionFinanciera) {
                        window.proponerTransaccionFinanciera(
                            `Venta de Producción: ${tipo} (${cantidad} ${data.unidad})`,
                            0, // Monto desconocido
                            'Ingreso',
                            `Venta ${tipo}` // Categoría aproximada
                        );
                    } else {
                        alert("Módulo financiero no cargado");
                    }
                }
            }, 500);
        } else {
            agroAlert(result.error || 'Error al guardar', 'Error', 'danger');
        }
    } catch (error) {
        console.error(error);
        agroAlert('Error de conexión', 'Error', 'danger');
    }
}

async function deleteProduccion(id) {
    if (!await agroConfirm('¿Eliminar este registro de producción?')) return;

    try {
        const res = await fetch(`/api/produccion/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.status === 'success') {
            loadProduccionRegistros();
            loadProduccionStats(); // Actualizar gráficas
        } else {
            agroAlert(result.error, 'Error', 'danger');
        }
    } catch (e) {
        console.error(e);
    }
}

// Helper para cargar select de animales (usado en varios módulos)
async function loadAnimalesSelect(elementId) {
    const select = document.getElementById(elementId);
    if (!select || select.dataset.loaded) return;

    try {
        const res = await fetch('/api/ganado');
        const animales = await res.json();

        select.innerHTML = '<option value="">Seleccionar animal...</option>' +
            animales.map(a => `<option value="${a.id}" data-especie="${a.especie}">#${a.id} - ${a.especie} (${a.raza})</option>`).join('');
        select.dataset.loaded = 'true';

        // Agregar listener para filtrar tipos de producción
        if (elementId === 'prodAnimalId') {
            select.addEventListener('change', filterProduccionTypesByAnimal);
        }
    } catch (e) {
        console.error('Error cargando animales para select:', e);
    }
}

/**
 * Filtra las opciones de producción según la especie del animal seleccionado.
 */
function filterProduccionTypesByAnimal() {
    const selectAnimal = document.getElementById('prodAnimalId');
    const selectTipo = document.getElementById('prodTipo');
    if (!selectAnimal || !selectTipo) return;

    const selectedOption = selectAnimal.options[selectAnimal.selectedIndex];
    const especie = selectedOption ? selectedOption.dataset.especie : null;

    const mapping = {
        'Bovino': ['Leche', 'Carne'],
        'Ovino': ['Leche', 'Carne', 'Lana'],
        'Caprino': ['Leche', 'Carne'],
        'Porcino': ['Carne'],
        'Equino': ['Carne'],
        'Default': ['Leche', 'Carne', 'Lana']
    };

    const tiposValidos = mapping[especie] || (especie ? mapping['Default'] : []);

    // Guardar valor actual si es posible
    const currentVal = selectTipo.value;

    // Reconstruir opciones
    if (tiposValidos.length === 0) {
        selectTipo.innerHTML = '<option value="">Primero seleccione un animal</option>';
        selectTipo.disabled = true;
    } else {
        let options = '';
        tiposValidos.forEach(t => {
            options += `<option value="${t}">${t}</option>`;
        });
        selectTipo.innerHTML = options;
        selectTipo.disabled = false;
    }

    // Intentar restaurar valor o poner el primero
    if (tiposValidos.includes(currentVal)) {
        selectTipo.value = currentVal;
    }

    handleProduccionTypeChange(); // Actualizar visibilidad de campos de calidad
}

// Auto-init si la sección está activa
document.addEventListener('DOMContentLoaded', () => {
    // Se inicializa desde toggleSection en app.js o manualmente
});
/**
 * Carga datos históricos de calidad y renderiza sus gráficos.
 */
async function loadCalidadStats(especie) {
    try {
        const res = await fetch(`/api/produccion/calidad?tipo=Leche&especie=${especie}`);
        const data = await res.json();
        renderQualityCharts(data);
    } catch (e) {
        console.error('Error cargando historial calidad:', e);
    }
}

let chartGrasaInstance = null;
let chartProteinaInstance = null;

function renderQualityCharts(historial) {
    const ctxGrasa = document.getElementById('chartGrasa')?.getContext('2d');
    const ctxProt = document.getElementById('chartProteina')?.getContext('2d');

    if (!ctxGrasa || !ctxProt) return;

    if (chartGrasaInstance) chartGrasaInstance.destroy();
    if (chartProteinaInstance) chartProteinaInstance.destroy();

    const labels = (historial && historial.length > 0) ? historial.map(h => {
        const d = new Date(h.fecha + 'T00:00:00');
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }) : ['Sin Datos'];

    const dataGrasa = (historial && historial.length > 0) ? historial.map(h => h.grasa) : [0];
    const dataProt = (historial && historial.length > 0) ? historial.map(h => h.proteina) : [0];

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 10,
                callbacks: {
                    label: (context) => `Valor: ${context.parsed.y}%`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }
            }
        }
    };

    chartGrasaInstance = new Chart(ctxGrasa, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataGrasa,
                borderColor: '#fbbf24',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 2
            }]
        },
        options: commonOptions
    });

    chartProteinaInstance = new Chart(ctxProt, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataProt,
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 2
            }]
        },
        options: commonOptions
    });
}
