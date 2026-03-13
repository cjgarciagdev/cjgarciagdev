// ============= GESTIÓN DE INVENTARIO DE INSUMOS =============

/**
 * Carga todos los insumos desde el backend y los renderiza
 */
async function loadInventario() {
    try {
        const res = await fetch('/api/inventario');
        window.allInsumos = await res.json();

        // Actualizar contadores
        updateStockCounters();

        // Renderizar todos inicialmente
        filterInsumos('todos');
    } catch (error) {
        console.error('Error loading inventario:', error);
        document.getElementById('inventarioGrid').innerHTML = `
            <div class="col-span-full text-center py-10">
                <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-2"></i>
                <p class="text-red-500 font-bold">Error al cargar el inventario</p>
            </div>
        `;
    }
}

/**
 * Actualiza los contadores de stock por categoría
 */
function updateStockCounters() {
    if (!window.allInsumos) return;

    const medico = window.allInsumos.filter(i => i.categoria === 'Médico').length;
    const alimento = window.allInsumos.filter(i => i.categoria === 'Alimenticio').length;
    const operativo = window.allInsumos.filter(i => i.categoria === 'Operativo').length;
    const herramienta = window.allInsumos.filter(i => i.categoria === 'Herramienta').length;
    const limpieza = window.allInsumos.filter(i => i.categoria === 'Limpieza').length;

    document.getElementById('stock-medico').innerText = medico;
    document.getElementById('stock-alimento').innerText = alimento;
    document.getElementById('stock-operativo').innerText = operativo;
    if (document.getElementById('stock-herramienta')) document.getElementById('stock-herramienta').innerText = herramienta;
    if (document.getElementById('stock-limpieza')) document.getElementById('stock-limpieza').innerText = limpieza;
}

/**
 * Filtra y renderiza insumos por categoría
 */
function filterInsumos(categoria) {
    if (!window.allInsumos) return;

    // Actualizar botones activos
    document.querySelectorAll('.filter-btn-inv').forEach(btn => {
        btn.classList.remove('active-filter', 'bg-teal-600', 'text-white', 'border-teal-600');
        btn.classList.add('bg-white', 'text-gray-600', 'border-gray-200');
    });

    // Identificar botón activo (usando atributo data-category)
    const activeBtn = document.querySelector(`.filter-btn-inv[data-category="${categoria}"]`);

    if (activeBtn) {
        activeBtn.classList.add('active-filter', 'bg-teal-600', 'text-white', 'border-teal-600');
        activeBtn.classList.remove('bg-white', 'text-gray-600', 'border-gray-200');
    }

    // Filtrar
    let filtered = window.allInsumos;
    if (categoria !== 'todos') {
        filtered = window.allInsumos.filter(i => i.categoria === categoria);
    }

    // Aplicar búsqueda si existe
    const searchTerm = document.getElementById('searchInsumo')?.value.toLowerCase() || '';
    if (searchTerm) {
        filtered = filtered.filter(i =>
            i.nombre.toLowerCase().includes(searchTerm) ||
            i.categoria.toLowerCase().includes(searchTerm)
        );
    }

    renderInsumos(filtered);
}

/**
 * Busca insumos por nombre
 */
function searchInsumos() {
    if (!window.allInsumos) return;

    const searchTerm = document.getElementById('searchInsumo').value.toLowerCase();
    const filtered = window.allInsumos.filter(i =>
        i.nombre.toLowerCase().includes(searchTerm) ||
        i.categoria.toLowerCase().includes(searchTerm) ||
        i.unidad.toLowerCase().includes(searchTerm)
    );

    renderInsumos(filtered);
}

/**
 * Renderiza las cards de insumos
 */
function renderInsumos(insumos) {
    const grid = document.getElementById('inventarioGrid');

    if (!insumos || insumos.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <div class="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <i class="fas fa-box-open text-gray-300 text-4xl"></i>
                </div>
                <p class="text-gray-400 font-bold text-lg">No hay insumos registrados</p>
                <p class="text-gray-400 text-sm">Comienza agregando tu primer insumo</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = insumos.map(insumo => {
        const isLowStock = insumo.cantidad <= insumo.stock_minimo;
        const categoryColors = {
            'Médico': 'teal',
            'Alimenticio': 'orange',
            'Operativo': 'blue',
            'Herramienta': 'purple',
            'Limpieza': 'pink'
        };
        const color = categoryColors[insumo.categoria] || 'gray';

        // Estado de vencimiento
        let vencimientoHTML = '';
        if (insumo.estado_vencimiento === 'Vencido') {
            vencimientoHTML = `<span class="text-xs text-red-600 font-bold"><i class="fas fa-exclamation-circle"></i> VENCIDO</span>`;
        } else if (insumo.estado_vencimiento === 'Por Vencer') {
            vencimientoHTML = `<span class="text-xs text-yellow-600 font-bold"><i class="fas fa-exclamation-triangle"></i> Por vencer</span>`;
        }

        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                <div class="bg-${color}-500 p-4 flex justify-between items-center">
                    <div class="text-white">
                        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                            <i class="fas ${getCategoryIcon(insumo.categoria)} text-2xl"></i>
                        </div>
                        <p class="text-xs font-bold uppercase tracking-wider opacity-90">${insumo.categoria}</p>
                    </div>
                    ${isLowStock ? `<span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse"><i class="fas fa-exclamation"></i> BAJO</span>` : ''}
                </div>
                
                <div class="p-5">
                    <h3 class="font-black text-gray-800 text-lg mb-3 line-clamp-2 min-h-[56px]">${insumo.nombre}</h3>
                    
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-gray-500 uppercase font-bold">Stock Actual</span>
                            <span class="text-2xl font-black text-gray-800">${insumo.cantidad} <span class="text-sm text-gray-400">${insumo.unidad}</span></span>
                        </div>
                        
                        <div class="bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div class="h-full ${isLowStock ? 'bg-red-500' : 'bg-green-500'}" style="width: ${Math.min((insumo.cantidad / (insumo.stock_minimo * 2)) * 100, 100)}%"></div>
                        </div>
                        
                        <div class="flex justify-between text-xs text-gray-500">
                            <span>Mínimo: ${insumo.stock_minimo}</span>
                            <span class="font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}">${insumo.estado_stock}</span>
                        </div>
                        
                        ${insumo.fecha_vencimiento ? `
                            <div class="pt-2 border-t border-gray-100">
                                <span class="text-xs text-gray-500">Vence: ${insumo.fecha_vencimiento}</span>
                                ${vencimientoHTML}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="openEditInsumoModal(${insumo.id})" 
                            class="flex-1 bg-${color}-50 text-${color}-700 py-2 rounded-xl font-bold hover:bg-${color}-100 transition text-sm">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button onclick="ajustarStock(${insumo.id}, 'entrada')" 
                            class="flex-1 bg-green-50 text-green-700 py-2 rounded-xl font-bold hover:bg-green-100 transition text-sm">
                            <i class="fas fa-plus"></i> Entrada
                        </button>
                        <button onclick="ajustarStock(${insumo.id}, 'salida')" 
                            class="flex-1 bg-red-50 text-red-700 py-2 rounded-xl font-bold hover:bg-red-100 transition text-sm">
                            <i class="fas fa-minus"></i> Salida
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Obtiene el icono apropiado según la categoría
 */
function getCategoryIcon(categoria) {
    const icons = {
        'Médico': 'fa-pills',
        'Alimenticio': 'fa-carrot',
        'Operativo': 'fa-tools',
        'Herramienta': 'fa-wrench',
        'Limpieza': 'fa-broom'
    };
    return icons[categoria] || 'fa-box';
}

/**
 * Abre el modal para crear nuevo insumo
 */
function openModalInsumo() {
    // Limpiar campos
    document.getElementById('insNombre').value = '';
    document.getElementById('insCategoria').value = 'Médico';
    document.getElementById('insUnidad').value = 'unidad';
    document.getElementById('insCantidad').value = '';
    document.getElementById('insMinimo').value = '5';
    document.getElementById('insVencimiento').value = '';

    // Guardar que es nuevo (no edición)
    window.currentInsumoId = null;

    document.getElementById('modalInsumo').classList.remove('hidden');
}

/**
 * Cierra el modal de insumo
 */
function closeModalInsumo() {
    document.getElementById('modalInsumo').classList.add('hidden');
    window.currentInsumoId = null;
}

/**
 * Guarda un nuevo insumo
 */
async function saveInsumo() {
    const datos = {
        nombre: document.getElementById('insNombre').value,
        categoria: document.getElementById('insCategoria').value,
        unidad: document.getElementById('insUnidad').value,
        cantidad: parseFloat(document.getElementById('insCantidad').value) || 0,
        stock_minimo: parseFloat(document.getElementById('insMinimo').value) || 5,
        fecha_vencimiento: document.getElementById('insVencimiento').value || null
    };

    // Validación
    if (!datos.nombre || !datos.categoria) {
        agroAlert('Por favor completa los campos obligatorios', 'Validación', 'inventario');
        return;
    }

    // DESAFÍO DE CREDENCIALES
    const accion = window.currentInsumoId ? 'Editar Insumo' : 'Registrar Insumo';
    const autorizado = await verifyActionPermission('gestionar_inventario', `Autorizar ${accion}`);
    if (!autorizado) return;

    try {
        const url = window.currentInsumoId
            ? `/api/inventario/${window.currentInsumoId}`
            : '/api/inventario';

        const method = window.currentInsumoId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const result = await res.json();

        if (result.status === 'success' || res.ok) {
            closeModalInsumo();
            if (typeof AgroSync !== 'undefined') AgroSync.trigger();
            else loadInventario();

            const msg = window.currentInsumoId ? 'Insumo actualizado correctamente' : 'Insumo creado correctamente';
            agroAlert(msg, 'Éxito', 'success');

            // INTEGRACIÓN FINANZAS: Si es nuevo y tiene stock inicial, sugerir gasto
            if (!window.currentInsumoId && datos.cantidad > 0) {
                setTimeout(() => {
                    if (confirm("¿Deseas registrar este stock inicial como un Gasto en Finanzas?")) {
                        proponerGastoFinanzas('Compra Insumo Inicial: ' + datos.nombre, 0, 'Gasto', 'Alimentación'); // 0 porque no sabemos costo
                    }
                }, 500);
            }
        } else {
            agroAlert('Error: ' + (result.error || 'No se pudo guardar el insumo'), 'Error', 'danger');
        }
    } catch (error) {
        console.error('Error saving insumo:', error);
        agroAlert('Error al guardar el insumo', 'Error', 'danger');
    }
}

/**
 * Abre modal para editar un insumo existente
 */
async function openEditInsumoModal(id) {
    try {
        const insumo = window.allInsumos.find(i => i.id === id);
        if (!insumo) return;

        document.getElementById('insNombre').value = insumo.nombre;
        document.getElementById('insCategoria').value = insumo.categoria;
        document.getElementById('insUnidad').value = insumo.unidad;
        document.getElementById('insCantidad').value = insumo.cantidad;
        document.getElementById('insMinimo').value = insumo.stock_minimo;
        document.getElementById('insVencimiento').value = insumo.fecha_vencimiento || '';

        window.currentInsumoId = id;
        document.getElementById('modalInsumo').classList.remove('hidden');
    } catch (error) {
        console.error('Error opening edit modal:', error);
    }
}

/**
 * Ajusta el stock de un insumo (entrada o salida)
 */
async function ajustarStock(id, tipo) {
    const insumo = window.allInsumos.find(i => i.id === id);
    if (!insumo) return;

    const mensaje = tipo === 'entrada'
        ? `Ingresa la cantidad a AÑADIR al stock de "${insumo.nombre}":`
        : `Ingresa la cantidad a RETIRAR del stock de "${insumo.nombre}":`;

    const cantidad = await agroPrompt(mensaje, '', 'Ajuste de Stock', 'inventario');
    if (!cantidad || isNaN(cantidad)) return;

    // DESAFÍO DE CREDENCIALES
    const autorizado = await verifyActionPermission('gestionar_inventario', 'Autorizar ajuste de stock');
    if (!autorizado) return;

    const ajuste = tipo === 'entrada' ? parseFloat(cantidad) : -parseFloat(cantidad);

    try {
        const res = await fetch(`/api/inventario/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ajuste_stock: ajuste })
        });

        const result = await res.json();

        if (result.status === 'success') {
            if (typeof AgroSync !== 'undefined') AgroSync.trigger();
            else loadInventario();
            agroAlert(`Stock actualizado. Nuevo stock: ${result.nuevo_stock} ${insumo.unidad}`, 'Stock Actualizado', 'success');

            // INTEGRACIÓN FINANZAS: Si es entrada, sugerir gasto
            if (tipo === 'entrada') {
                setTimeout(() => {
                    const confirmar = confirm(`¿Deseas registrar la compra de ${ajuste} ${insumo.unidad} en Finanzas?`);
                    if (confirmar) {
                        proponerGastoFinanzas(`Compra Stock: ${insumo.nombre}`, 0, 'Gasto', 'Alimentación');
                    }
                }, 500);
            }
        } else {
            agroAlert('Error al ajustar stock: ' + (result.error || 'Desconocido'), 'Error', 'danger');
        }
    } catch (error) {
        console.error('Error adjusting stock:', error);
        agroAlert('Error al ajustar el stock', 'Error', 'danger');
    }
}

/**
 * Elimina un insumo
 */
async function deleteInsumo(id) {
    const insumo = window.allInsumos.find(i => i.id === id);
    if (!insumo) return;

    const confirmacion = await agroConfirm(`¿Estás seguro de eliminar permanentemente "${insumo.nombre}"?`, 'Confirmar Eliminación', 'delete');
    if (!confirmacion) return;

    // DESAFÍO DE CREDENCIALES
    const autorizado = await verifyActionPermission('gestionar_inventario', 'Confirmar eliminación de insumo');
    if (!autorizado) return;

    try {
        const res = await fetch(`/api/inventario/${id}`, {
            method: 'DELETE'
        });

        const result = await res.json();

        if (result.status === 'success') {
            if (typeof AgroSync !== 'undefined') AgroSync.trigger();
            else loadInventario();
            agroAlert('Insumo eliminado correctamente', 'Borrado', 'success');
        } else {
            agroAlert('Error al eliminar: ' + (result.error || 'Desconocido'), 'Error', 'danger');
        }
    } catch (error) {
        console.error('Error deleting insumo:', error);
        agroAlert('Error al eliminar el insumo', 'Error', 'danger');
    }
}

// Cargar inventario cuando se muestra la sección
document.addEventListener('DOMContentLoaded', () => {
    // Si la sección de inventario está visible, cargar los datos
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const inventarioSection = document.getElementById('sec-inventario');
            if (inventarioSection && !inventarioSection.classList.contains('hidden')) {
                loadInventario();
            }
        });
    });

    const inventarioSection = document.getElementById('sec-inventario');
    if (inventarioSection) {
        observer.observe(inventarioSection, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
});

/**
 * Helper para integración con Finanzas
 */
function proponerGastoFinanzas(concepto, monto, tipo, categoria) {
    if (typeof openModalFinanza === 'function') {
        openModalFinanza();
        // Esperar a que el modal se abra y llenar campos
        setTimeout(() => {
            const form = document.getElementById('formFinanza');
            if (form) {
                document.getElementById('finTipo').value = tipo;
                toggleFinanzaTipo(tipo); // Ajustar colures y categorias

                document.getElementById('finDescripcion').value = concepto;
                if (monto > 0) document.getElementById('finMonto').value = monto;

                // Intentar seleccionar categoría aproximada
                const catSelect = document.getElementById('finCategoria');
                if (catSelect && categoria) {
                    // Buscar si existe opción parecida
                    for (let i = 0; i < catSelect.options.length; i++) {
                        if (catSelect.options[i].text.includes(categoria) || catSelect.options[i].text.includes('Insumo')) {
                            catSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        }, 300);
    } else {
        console.warn('Módulo de Finanzas no disponible');
    }
}
