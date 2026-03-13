// ==============================================================================
// GESTIÓN FINANCIERA (Ingresos y Gastos)
// ==============================================================================

/**
 * Carga estadísticas y gráficos de finanzas.
 */
async function loadFinanzasSection() {
    loadFinanzasStats();
    loadFinanzasRegistros();
}

/**
 * Carga estadísticas resumen.
 */
async function loadFinanzasStats() {
    try {
        const res = await fetch('/api/finanzas/resumen');
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        // Actualizar cards
        animateValue('fin-ingresos-mes', data.mes.ingresos);
        animateValue('fin-gastos-mes', data.mes.gastos);
        animateValue('fin-balance-mes', data.mes.balance);
        animateValue('fin-pendientes', data.pagos_pendientes);

        // Color dinámico para el balance
        const balanceEl = document.getElementById('fin-balance-mes');
        if (balanceEl) {
            if (data.mes.balance >= 0) {
                balanceEl.classList.remove('text-red-700');
                balanceEl.classList.add('text-green-700');
            } else {
                balanceEl.classList.remove('text-green-700');
                balanceEl.classList.add('text-red-700');
            }
        }

        // Actualizar Gráficas
        renderFlujoCajaChart(data.flujo_mensual);
        renderGastosPieChart(data.gastos_por_categoria);
    } catch (error) {
        console.error('Error cargando stats finanzas:', error);
    }
}

/**
 * Renderiza gráfico de Flujo de Caja.
 */
let chartFlujo = null;

function renderFlujoCajaChart(mensual) {
    const ctx = document.getElementById('chartFlujoCaja')?.getContext('2d');
    if (!ctx) return;
    if (chartFlujo) chartFlujo.destroy();

    const labels = mensual && mensual.length > 0 ? mensual.map(m => m.mes_nombre) : ['Sin Datos'];
    const ingresos = mensual && mensual.length > 0 ? mensual.map(m => m.ingresos) : [0];
    const gastos = mensual && mensual.length > 0 ? mensual.map(m => m.gastos) : [0];
    const balances = mensual && mensual.length > 0 ? mensual.map(m => m.balance) : [0];

    chartFlujo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ingresos',
                data: ingresos,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: '#10b981',
                borderWidth: 1,
                borderRadius: 6,
                order: 2
            }, {
                label: 'Gastos',
                data: gastos,
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: '#ef4444',
                borderWidth: 1,
                borderRadius: 6,
                order: 2
            }, {
                label: 'Balance Neto',
                data: balances,
                type: 'line',
                borderColor: '#3b82f6',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointRadius: 4,
                fill: false,
                tension: 0.4,
                order: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, font: { weight: 'bold' } } },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    padding: 12,
                    borderRadius: 8,
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: $${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [5, 5], color: 'rgba(0,0,0,0.05)' },
                    ticks: { callback: function (value) { return '$' + value.toLocaleString(); } }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

/**
 * Renderiza gráfico de distribución de gastos (Pie).
 */
let chartGastosPie = null;

function renderGastosPieChart(categorias) {
    const ctx = document.getElementById('chartGastos')?.getContext('2d');
    if (!ctx) return;
    if (chartGastosPie) chartGastosPie.destroy();

    const hasData = categorias && Object.keys(categorias).length > 0;
    const labels = hasData ? Object.keys(categorias) : ['Sin Gastos'];
    const data = hasData ? Object.values(categorias) : [1];
    const bgColors = hasData ? ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#6b7280'] : ['#f3f4f6'];

    chartGastosPie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 20, usePointStyle: true, font: { size: 11, weight: '600' } }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    padding: 12,
                    borderRadius: 8,
                    callbacks: {
                        label: function (context) {
                            if (!hasData) return 'No hay datos';
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const perc = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: $${context.parsed.toLocaleString()} (${perc}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Carga la tabla de movimientos.
 */
async function loadFinanzasRegistros() {
    const from = document.getElementById('fin-fecha-desde')?.value || '';
    const to = document.getElementById('fin-fecha-hasta')?.value || '';

    let url = `/api/finanzas?page=1&per_page=50`;
    if (from) url += `&fecha_desde=${from}`;
    if (to) url += `&fecha_hasta=${to}`;

    const res = await fetch(url);
    const data = await res.json();

    window.allMovimientos = data.movimientos; // Para filtro local por tipo
    renderFinanzasTable(data.movimientos);
}

function filterFinanzas(tipo) {
    // UI
    document.querySelectorAll('.filter-btn-fin').forEach(btn =>
        btn.classList.remove('bg-emerald-600', 'text-white', 'bg-white', 'text-gray-600')
    );
    const active = document.querySelector(`.filter-btn-fin[data-ftipo="${tipo}"]`);
    if (active && active.classList) active.classList.add('bg-emerald-600', 'text-white');

    // Filtro Lógico
    if (tipo === 'todos') {
        renderFinanzasTable(window.allMovimientos);
    } else {
        const filtered = window.allMovimientos.filter(m => m.tipo === tipo);
        renderFinanzasTable(filtered);
    }
}

/**
 * Renderiza la tabla de movimientos.
 */
function renderFinanzasTable(movimientos) {
    const tbody = document.getElementById('finanzasTableBody');
    if (!tbody) return;

    if (!movimientos || movimientos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-400">Sin movimientos registrados</td></tr>`;
        return;
    }

    tbody.innerHTML = movimientos.map(m => `
        <tr class="border-b border-gray-50 hover:bg-gray-50 transition">
            <td class="p-4 text-sm font-medium text-gray-600">${m.fecha}</td>
            <td class="p-4 text-sm">
                <span class="${m.tipo === 'Ingreso' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'} px-2 py-1 rounded-md text-xs font-bold uppercase">
                    ${m.tipo}
                </span>
            </td>
            <td class="p-4 text-sm text-gray-800 font-bold">${m.categoria}</td>
            <td class="p-4 text-sm font-black ${m.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'}">
                ${m.tipo === 'Gasto' ? '-' : '+'}${parseFloat(m.monto).toFixed(2)} ${m.moneda}
            </td>
            <td class="p-4 text-sm text-gray-600 truncate max-w-[200px]">${m.descripcion || '-'}</td>
            <td class="p-4 text-sm text-gray-600">
                <span class="text-xs font-bold ${m.estado === 'Completado' ? 'text-green-500' : (m.estado === 'Pendiente' ? 'text-yellow-500' : 'text-red-500')}">
                    ${m.estado}
                </span>
            </td>
            <td class="p-4 text-right">
                ${m.estado === 'Pendiente' ?
            `<button class="text-green-500 hover:text-green-700 mr-2" onclick="completarPago(${m.id})"><i class="fas fa-check"></i></button>` : ''
        }
                <button onclick="deleteMovimiento(${m.id})" class="text-gray-400 hover:text-red-500 transition ml-2">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal helper
function openModalFinanza() {
    const modal = document.getElementById('modalFinanza');
    if (modal) modal.classList.remove('hidden');

    // Set fecha
    const now = new Date();
    // Ajustar a local ISO string
    const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    const dateInput = document.getElementById('finFecha');
    if (dateInput) dateInput.value = localIso;

    // Resetear form
    document.getElementById('finMonto').value = '';
    document.getElementById('finDescripcion').value = '';

    updateFinCategorias();
}

function closeModalFinanza() {
    const modal = document.getElementById('modalFinanza');
    if (modal) modal.classList.add('hidden');
}

/**
 * Carga categorías dinámicamente según el tipo (Ingreso/Gasto)
 */
async function updateFinCategorias() {
    const tipo = document.getElementById('finTipo').value.toLowerCase() + 's'; // ingresos o gastos
    const select = document.getElementById('finCategoria');

    // Cambiar color del borde según tipo
    const tipoInput = document.getElementById('finTipo');
    if (tipo.includes('ingreso')) {
        tipoInput.className = "w-full bg-green-50 border-green-300 text-green-700 font-bold rounded-xl p-3 focus:ring-green-500 focus:border-green-500";
    } else {
        tipoInput.className = "w-full bg-red-50 border-red-300 text-red-700 font-bold rounded-xl p-3 focus:ring-red-500 focus:border-red-500";
    }

    try {
        const res = await fetch('/api/finanzas/categorias');
        const cats = await res.json();

        // Categorías hardcodeadas por si falla API o para asegurar básicas
        let options = cats[tipo] || [];
        if (options.length === 0) {
            options = tipo === 'ingresos' ? ['Venta Leche', 'Venta Carne', 'Venta Animal', 'Servicios'] : ['Alimentación', 'Medicinas', 'Mantenimiento', 'Sueldos', 'Impuestos', 'Otros'];
        }

        select.innerHTML = options.map(c => `<option value="${c}">${c}</option>`).join('');
    } catch (e) {
        console.error(e);
    }
}

// Alias para el onchange del HTML
function toggleFinanzaTipo(valor) {
    updateFinCategorias();
}

async function saveFinanza() {
    const monto = document.getElementById('finMonto').value;
    const cat = document.getElementById('finCategoria').value;
    const desc = document.getElementById('finDescripcion').value;

    if (!monto || !cat) {
        agroAlert('Monto y Categoría obligatorios', 'Error', 'danger');
        return;
    }

    const data = {
        tipo: document.getElementById('finTipo').value,
        categoria: cat,
        monto: parseFloat(monto),
        moneda: document.getElementById('finMoneda').value,
        descripcion: desc,
        proveedor_cliente: document.getElementById('finProveedorCliente').value,
        numero_factura: document.getElementById('finFactura').value,
        fecha: document.getElementById('finFecha').value,
        estado: document.getElementById('finEstado').value
    };

    try {
        const res = await fetch('/api/finanzas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();

        if (result.status === 'success') {
            closeModalFinanza();
            loadFinanzasSection();
            agroAlert('Movimiento registrado', 'Éxito', 'success');
        } else {
            agroAlert(result.error, 'Error', 'danger');
        }
    } catch (error) {
        console.error(error);
        agroAlert('Error de conexión', 'Error', 'danger');
    }
}

async function deleteMovimiento(id) {
    if (!await agroConfirm('¿Eliminar este movimiento financiero?')) return;

    try {
        await fetch(`/api/finanzas/${id}`, { method: 'DELETE' });
        loadFinanzasSection();
    } catch (e) { console.error(e); }
}

// ==========================================
// INTEGRACIÓN ENTRE MÓDULOS
// ==========================================

// Helper GLOBAL para integración
window.proponerTransaccionFinanciera = function (concepto, monto, tipo, categoria) {
    if (typeof openModalFinanza === 'function') {
        openModalFinanza();
        setTimeout(() => {
            const form = document.getElementById('formFinanza');
            if (form) {
                // Seleccionar Tipo
                document.getElementById('finTipo').value = tipo;
                updateFinCategorias(); // Actualizar lista y colores

                // Llenar datos
                document.getElementById('finDescripcion').value = concepto;
                if (monto > 0) document.getElementById('finMonto').value = monto;
                else document.getElementById('finMonto').value = '';

                // Seleccionar Categoría (intento de auto-match)
                setTimeout(() => {
                    const catSelect = document.getElementById('finCategoria');
                    if (catSelect && categoria) {
                        const opciones = Array.from(catSelect.options);
                        const match = opciones.find(opt => opt.text.toLowerCase().includes(categoria.toLowerCase()) || opt.text.toLowerCase().includes('venta'));
                        if (match) catSelect.value = match.value;
                    }
                }, 500); // Esperar a que updateFinCategorias termine
            }
        }, 300); // Esperar animación del modal
    } else {
        console.warn('Módulo de Finanzas: Modal no disponible');
    }
};
