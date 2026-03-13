// app.js - Lógica JavaScript central del proyecto Agro-Master
/**
 * ARQUITECTURA: Single Page Application (SPA).
 * Este archivo orquesta la interactividad de la interfaz sin recargas de página.
 * Utiliza fetch() para comunicación asíncrona con la API Flask y Chart.js 
 * para la visualización de datos de rendimiento ganadero.
 * 
 * PRODUCTOR: CRISTIAN J GARCIA
 */

/**
 * Cambia la sección visible en el SPA (Single Page Application).
 * Oculta todas las secciones y muestra la seleccionada.
 * @param {string} id - ID de la sección a mostrar.
 */
function showSection(id) {
    // 1. VALIDACIÓN DE PERMISOS (Seguridad Frontend)
    // Si existen permisos definidos, verificamos antes de navegar
    if (window.userPermissions) {
        const p = window.userPermissions;
        let allowed = true;

        switch (id) {
            case 'dashboard': allowed = p.ver_dashboard_completo || p.gestionar_inventario; break; // Inventario ve dashboard para stock bajo
            case 'salud': allowed = p.gestionar_salud; break;
            case 'nutricion': allowed = p.gestionar_nutricion || p.ver_analisis; break;
            case 'inventario': allowed = p.gestionar_inventario; break;
            case 'auditoria': allowed = p.ver_logs; break;
            case 'usuarios': allowed = p.gestionar_usuarios; break;
            case 'avanzado': allowed = p.ver_analisis; break;
            case 'maternidad': allowed = p.ver_dashboard_completo || p.gestionar_salud; break;
            case 'ganado': allowed = p.ver_dashboard_completo || p.crear_animales; break;
            case 'produccion': allowed = p.ver_dashboard_completo || p.gestionar_inventario; break;
            case 'finanzas': allowed = (p.rol === 'admin' || p.rol === 'gerente'); break; // RESTRICCION ESTRICTA
            case 'calendario': allowed = p.ver_dashboard_completo || p.gestionar_salud; break;

        }

        if (!allowed) {
            agroToast('🛑 Acceso restringido para tu perfil.', 'warning');
            return;
        }
    }

    const main = document.querySelector('main');
    const targetSection = document.getElementById(`sec-${id}`);

    if (id === window.currentSectionId) return;
    window.currentSectionId = id;

    // --- PREMIUM SECTION TRANSITION ---
    // 1. Start Phase: Dim and push down
    main.style.opacity = '0';
    main.style.transform = 'translateY(1.25rem) scale(0.98)';
    main.style.filter = 'blur(10px)';
    main.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

    setTimeout(() => {
        // 2. Mid Phase: Change content
        document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('fade-in'); // Trigger the new premium fade-in
        }

        // Update navigation links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active-link'));
        const activeLink = document.getElementById(`link-${id}`);
        if (activeLink) activeLink.classList.add('active-link');

        // Trigger data loading
        if (id === 'dashboard') {
            if (typeof loadDashboard === 'function') loadDashboard();
            if (typeof initCharts === 'function') initCharts();
            if (typeof loadNotifications === 'function') loadNotifications();
        }
        if (id === 'ganado') loadAnimals();
        if (id === 'nutricion') {
            loadAnimalSelect();
            if (typeof loadNutricionAvanzado === 'function') loadNutricionAvanzado();
            loadPlanesNutricionalesList();
        }
        if (id === 'avanzado') {
            if (typeof cargarListasAnimales === 'function') cargarListasAnimales();
        }
        if (id === 'maternidad') loadMaternityAnimals();
        if (id === 'inventario') loadInventario();
        if (id === 'salud') {
            if (typeof loadProtocols === 'function') loadProtocols();
        }
        if (id === 'auditoria') loadAuditoria();
        if (id === 'usuarios') loadUsuarios();

        // Carga de nuevos módulos
        if (id === 'produccion' && typeof loadProduccionSection === 'function') loadProduccionSection();
        if (id === 'finanzas' && typeof loadFinanzasSection === 'function') loadFinanzasSection();
        if (id === 'calendario' && typeof loadCalendarioSection === 'function') loadCalendarioSection();


        // Update mobile bottom nav
        document.querySelectorAll('.bottom-nav-item').forEach(l => l.classList.remove('active'));
        const activeBNav = document.getElementById(`bnav-${id}`);
        if (activeBNav) activeBNav.classList.add('active');

        // 3. End Phase: Bring up and clear
        requestAnimationFrame(() => {
            main.style.opacity = '1';
            main.style.transform = 'translateY(0) scale(1)';
            main.style.filter = 'blur(0)';
        });
    }, 400);
}

/**
 * Anima un valor numérico en un elemento DOM.
 * @param {string} id - ID del elemento.
 * @param {number} target - Valor final.
 * @param {number} duration - Duración en ms.
 */
function animateValue(id, target, duration = 1000) {
    const obj = document.getElementById(id);
    if (!obj) return;

    const isCurrency = obj.innerText.includes('$') || (typeof target === 'string' && target.toString().includes('$'));
    const cleanValue = (v) => parseFloat(v.toString().replace(/[^0-9.-]+/g, "")) || 0;

    const startValue = cleanValue(obj.innerText);
    const endValue = cleanValue(target);

    if (startValue === endValue) {
        if (isCurrency) {
            obj.innerText = `$${endValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            obj.innerText = endValue.toLocaleString();
        }
        return;
    }

    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const ease = progress * (2 - progress);
        const current = startValue + (endValue - startValue) * ease;

        if (isCurrency) {
            obj.innerText = `$${current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            obj.innerText = Math.floor(current).toLocaleString();
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if (isCurrency) {
                obj.innerText = `$${endValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            } else {
                obj.innerText = endValue.toLocaleString();
            }
        }
    }

    requestAnimationFrame(update);
}

/**
 * Abre el modal de registro/edición de animal.
 * Si se pasa un objeto animal, rellena los campos para editar.
 * @param {Object|null} a - Objeto animal (opcional).
 */
function openModal(a = null) {
    document.getElementById('in-id').value = a ? a.id : '';
    document.getElementById('in-especie').value = a ? a.especie : 'Bovino';
    updateRazas();
    setTimeout(() => {
        document.getElementById('in-raza').value = a ? a.raza : '';
    }, 100);
    document.getElementById('in-peso').value = a ? a.peso : '';
    document.getElementById('in-sexo').value = a ? a.sexo : 'Macho';

    // Validar estados disponibles según el sexo
    updateEstados();

    // Asegurarse de que el estado actual sea válido para el sexo (si es edición)
    // Si el animal es macho y tiene un estado de hembra (por error de db antigua), lo reseteamos a Saludable
    if (a && a.sexo === 'Macho' && ['Gestante', 'Lactancia', 'Parto Reciente', 'Secado'].includes(a.estado)) {
        document.getElementById('in-estado').value = 'Saludable';
    } else {
        document.getElementById('in-estado').value = a ? a.estado : 'Saludable';
    }

    document.getElementById('modalTitle').innerText = a ? 'Actualizar Datos' : 'Registrar Nuevo Animal';
    // Cambiar el texto del botón
    const saveButton = document.querySelector('#modalAnimal button[onclick="saveAnimal()"]');
    if (saveButton) {
        saveButton.innerText = a ? 'ACTUALIZAR' : 'GUARDAR';
    }
    document.getElementById('modalAnimal').classList.remove('hidden');
}

/**
 * Valida que la raza ingresada pertenezca a la lista de opciones.
 * Si no es válida, limpia el campo y notifica al usuario.
 */
function validateRaza() {
    const input = document.getElementById('in-raza');
    const valor = input.value;
    const datalist = document.getElementById('razas-list');
    const opciones = Array.from(datalist.options).map(opt => opt.value);

    if (valor && !opciones.includes(valor)) {
        agroToast('⚠️ Por favor seleccione una raza válida de la lista.', 'warning');
        input.value = ''; // Limpiar el valor inválido
        return false;
    }
    return true;
}

/**
 * Filtra los caracteres no numéricos en inputs de tipo number.
 * Permite: números, borrar (Backspace/Delete), tabulación, flechas y un solo punto decimal.
 */
function validateInputNumerico(evt) {
    const charCode = (evt.which) ? evt.which : evt.keyCode;
    // Permitir: w, a, s, d (si fuera juego), pero aquí:
    // 8: Backspace, 9: Tab, 13: Enter, 27: Esc, 46: Delete
    // 37-40: Flechas
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(charCode) !== -1 ||
        // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (evt.ctrlKey === true && [65, 67, 86, 88].indexOf(charCode) !== -1) ||
        // Permitir: home, end, left, right, down, up
        (charCode >= 35 && charCode <= 40)) {
        return;
    }
    // Asegurar que sea número
    if ((evt.shiftKey || (charCode < 48 || charCode > 57)) && (charCode < 96 || charCode > 105)) {
        evt.preventDefault();
    }
}

/**
 * Actualiza las opciones del estado (Status) basado en el sexo seleccionado.
 * Los machos no pueden tener estados relacionados con maternidad.
 */
function updateEstados() {
    const sexo = document.getElementById('in-sexo').value;
    const estadoSelect = document.getElementById('in-estado');
    const estadosHembra = ['Gestante', 'Lactancia', 'Parto Reciente', 'Secado'];

    Array.from(estadoSelect.options).forEach(opt => {
        if (sexo === 'Macho' && estadosHembra.includes(opt.value)) {
            opt.hidden = true;
            opt.disabled = true;
            opt.style.display = 'none'; // Para mayor compatibilidad
        } else {
            opt.hidden = false;
            opt.disabled = false;
            opt.style.display = 'block';
        }
    });

    // Si el valor actual seleccionado queda oculto, cambiar a "Saludable"
    if (sexo === 'Macho' && estadosHembra.includes(estadoSelect.value)) {
        estadoSelect.value = 'Saludable';
    }
}

function updateRazas() {
    const especie = document.getElementById('in-especie').value;
    const razas = {
        'Bovino': ['Holstein', 'Angus', 'Jersey', 'Brahman', 'Simmental', 'Pardo Suizo', 'Hereford', 'Limousin', 'Charolais', 'Brangus'],
        'Ovino': ['Merino', 'Suffolk', 'Dorper', 'Hampshire', 'Texel', 'Romney'],
        'Caprino': ['Saanen', 'Alpina', 'Nubiana', 'Boer', 'Angora'],
        'Porcino': ['Yorkshire', 'Duroc', 'Hampshire', 'Landrace', 'Berkshire'],
        'Equino': ['Pura Sangre', 'Cuarto de Milla', 'Andaluz', 'Lusitano', 'Hispano'],
        'Otro': ['Otro / No definido']
    };
    const datalist = document.getElementById('razas-list');
    datalist.innerHTML = '';
    (razas[especie] || []).forEach(raza => {
        const option = document.createElement('option');
        option.value = raza;
        datalist.appendChild(option);
    });

    // Limpiar campo raza al cambiar especie para evitar inconsistencias
    const inputRaza = document.getElementById('in-raza');
    // Solo limpiar si el valor actual no está en la nueva lista (opcional, pero estricto)
    const nuevasRazas = razas[especie] || [];
    if (inputRaza.value && !nuevasRazas.includes(inputRaza.value)) {
        inputRaza.value = '';
    }
}

function closeModal() { document.getElementById('modalAnimal').classList.add('hidden'); }

/**
 * Obtiene la lista de animales del backend y renderiza la tabla.
 */
/**
 * Obtiene la lista de animales del backend y renderiza la tabla.
 */
async function loadAnimals() {
    try {
        const res = await fetch('/api/ganado');
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
        }
        window.allAnimals = await res.json();
        filterAnimals(); // Renderiza con filtro actual
    } catch (e) {
        console.error(e);
        const safeError = window.escapeHtml ? window.escapeHtml(e.message) : e.message;
        document.getElementById('animalTableBody').innerHTML = `<tr><td colspan="7" class="text-center p-4 text-red-500">Error cargando datos: ${safeError}</td></tr>`;
    }
}

/**
 * Utility to prevent XSS
 */
window.escapeHtml = function (text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function filterAnimals() {
    const search = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase() : '';
    const species = document.getElementById('filterSpecies') ? document.getElementById('filterSpecies').value : 'all';
    const specialFilter = document.getElementById('filterHealth') ? document.getElementById('filterHealth').value : 'all';

    if (!window.allAnimals) return;

    const filtered = window.allAnimals.filter(a => {
        const matchesSearch = a.id.toString().includes(search) ||
            a.raza.toLowerCase().includes(search) ||
            a.especie.toLowerCase().includes(search);

        const matchesSpecies = species === 'all' || a.especie === species;

        let matchesSpecial = true;
        if (specialFilter === 'critical') matchesSpecial = a.salud_critica;
        else if (specialFilter === 'nutrition') matchesSpecial = a.tiene_plan_activo;

        return matchesSearch && matchesSpecies && matchesSpecial;
    });

    renderAnimals(filtered);
}

function renderAnimals(data) {
    const tbody = document.getElementById('animalTableBody');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center p-8 text-gray-400 italic">No se encontraron animales que coincidan con la búsqueda.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map((a, idx) => `
        <tr class="border-b border-gray-50 hover:bg-green-50/30 transition group stagger-item" style="animation-delay: ${0.05 * idx}s;">
            <td class="p-4 font-black text-gray-700" data-label="ID">
                #${a.id}
                ${a.salud_critica ? `<i class="fas fa-exclamation-triangle text-red-500 ml-1 animate-pulse" title="${escapeHtml(a.razon_critica)}"></i>` : ''}
                ${a.tiene_plan_activo ? `<i class="fas fa-leaf text-green-500 ml-1" title="Plan Nutricional Activo"></i>` : ''}
            </td>
            <td class="p-4 text-sm font-medium text-gray-600" data-label="Especie">${escapeHtml(a.especie)}</td>
            <td class="p-4 font-bold text-sm text-gray-800" data-label="Raza">${escapeHtml(a.raza)}</td>
            <td class="p-4 text-sm" data-label="Sexo">
                <span class="px-3 py-1 rounded-full text-xs font-bold ${a.sexo === 'Macho' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}">
                    ${a.sexo === 'Macho' ? '<i class="fas fa-mars mr-1"></i>' : '<i class="fas fa-venus mr-1"></i>'}${escapeHtml(a.sexo)}
                </span>
            </td>

            <td class="p-4 text-sm font-medium text-gray-600" data-label="Edad">${escapeHtml(a.edad)} meses</td>
            <td class="p-4 font-bold text-green-700 text-sm bg-green-50/50 rounded-lg" data-label="Peso">${escapeHtml(a.peso)} kg</td>
            <td class="p-4 text-right flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" data-label="Acciones">
                <button onclick='showDetails(${a.id})' class="bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition shadow-sm" title="Ver Detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick='deleteAnimal(${a.id})' class="bg-white border border-gray-200 text-red-600 hover:bg-red-50 p-2 rounded-lg transition shadow-sm" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>`).join('');
}

function prepareEditAnimal(id) {
    if (!window.allAnimals) return;
    const animal = window.allAnimals.find(a => a.id === id);
    if (animal) openModal(animal);
}

async function deleteAnimal(id) {
    const confirmacion = await agroConfirm(`ADVERTENCIA: ¿Estás seguro de eliminar permanentemente al animal #${id}?\n\nEsta acción borrará todos sus registros asociados.`, 'Eliminación Permanente', 'delete');
    if (!confirmacion) return;

    // DESAFÍO DE CREDENCIALES
    const autorizado = await verifyActionPermission('eliminar_ganado', `Confirmar eliminación permanente del Animal #${id}`);
    if (!autorizado) return;

    try {
        const res = await fetch(`/api/animal/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (res.ok) {
            // Notificación visual rápida
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce';
            toast.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> Animal eliminado correctamente';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

            if (typeof AgroSync !== 'undefined') AgroSync.trigger();
            else {
                loadAnimals(); // Recargar lista
                closeDetailsModal(); // Cerrar modal de detalles si estaba abierto
                loadDashboard(); // Actualizar contadores
            }
        } else {
            agroAlert('Error al eliminar: ' + data.error, 'Error', 'danger');
        }
    } catch (e) {
        console.error(e);
        agroAlert('Error de conexión al intentar eliminar.', 'Capa de Conexión', 'danger');
    }
}

async function saveAnimal() {
    const id = document.getElementById('in-id').value;
    const especie = document.getElementById('in-especie').value;
    const raza = document.getElementById('in-raza').value;
    const sexo = document.getElementById('in-sexo').value;
    const fecha_nacimiento = document.getElementById('in-fecha_nacimiento').value;
    const peso = document.getElementById('in-peso').value;
    const estado = document.getElementById('in-estado').value;
    if (!especie || !raza || !sexo || !fecha_nacimiento || !peso || !estado) return agroAlert('Todos los campos son requeridos', 'Validación', 'warning');

    // Validación cliente: fecha no puede ser mayor a hoy, peso positivo
    const hoy = new Date();
    const fecha = new Date(fecha_nacimiento);
    if (isNaN(fecha.getTime())) return agroAlert('Fecha de nacimiento inválida', 'Error de Fecha', 'danger');
    if (fecha > hoy) return agroAlert('La fecha de nacimiento no puede ser futura', 'Error de Fecha', 'warning');
    if (parseFloat(peso) <= 0) return agroAlert('El peso debe ser mayor a cero', 'Error de Peso', 'warning');

    // DESAFÍO DE CREDENCIALES (SOLO PARA GUARDAR)
    const accion = id ? 'Editar Animal' : 'Registrar Nuevo Animal';
    const autorizado = await verifyActionPermission('editar_ganado', `Autorizar ${accion}`);
    if (!autorizado) return;

    const pesoVal = parseFloat(peso);

    const res = await fetch('/api/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id ? parseInt(id) : null, especie, raza, sexo, fecha_nacimiento, peso: pesoVal, estado })
    });
    const result = await res.json();
    if (result.status === 'success') {
        closeModal();
        if (typeof AgroSync !== 'undefined') AgroSync.trigger();
        else {
            loadAnimals(); // Actualizar tabla sin reload
            initCharts(); // Actualizar gráfica con nuevos datos
            loadDashboard(); // Actualizar métricas del dashboard
        }
    } else {
        agroAlert(result.error, 'Error al Guardar', 'danger');
    }
}

/**
 * VISUALIZADOR DE EXPEDIENTE 360:
 * Esta función centraliza toda la información de un ejemplar en un solo panel.
 * 
 * @reason El usuario necesita ver el contexto completo (salud, peso, nutricion) para decidir.
 * @workflow
 * 1. Abre el modal de detalles y muestra un "skeleton screen" de carga.
 * 2. Consulta los endpoints de salud y animal en paralelo.
 * 3. Renderiza la curva de crecimiento histórica usando una instancia local de Chart.js.
 * 4. Calcula estados visuales (colorimetría) basados en la salud del animal.
 */
async function showDetails(id) {
    const res = await fetch(`/api/animal/${id}`);
    const animal = await res.json();
    if (animal.error) return agroAlert(animal.error, 'Animal no encontrado', 'danger');
    const nutricionRes = await fetch(`/api/nutricion/${id}`);
    const nutricion = await nutricionRes.json();
    document.getElementById('detailsContent').innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <h4 class="font-bold mb-4">Información General</h4>
                <p><strong>ID:</strong> ${animal.id}</p>
                <p><strong>Especie:</strong> ${animal.especie}</p>
                <p><strong>Raza:</strong> ${animal.raza}</p>
                <p><strong>Sexo:</strong> ${animal.sexo}</p>
                <p><strong>Fecha Nacimiento:</strong> ${animal.fecha_nacimiento}</p>
                <p><strong>Edad:</strong> ${animal.edad} meses</p>
                <p><strong>Peso:</strong> ${animal.peso} kg</p>
                <p><strong>Estado:</strong> ${animal.estado}</p>
                <div class="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div class="flex justify-between text-[10px] font-black text-blue-600 mb-1 uppercase tracking-widest">
                        <span>Calidad Genética</span>
                        <span>${animal.score_genetico}%</span>
                    </div>
                    <div class="w-full bg-white rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-1000" style="width: ${animal.score_genetico}%"></div>
                    </div>
                </div>
            </div>
            <div>
                <h4 class="font-bold mb-4">Nutrición</h4>
                <p><strong>Forraje Verde Diario:</strong> ${nutricion.forraje_verde} kg</p>
                <p><strong>Suplementos Recomendados:</strong> ${nutricion.suplementos.join(', ')}</p>
                <canvas id="individualChart" width="300" height="200"></canvas>
            </div>
        </div>
        <div>
            <h4 class="font-bold mb-4 text-gray-800">Historial Médico Reciente</h4>
            ${animal.historial_medico && animal.historial_medico.length > 0 ? `
                <div class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    ${animal.historial_medico.slice(0, 5).map(h => `
                        <div class="bg-gray-50 p-3 rounded-xl border-l-4 border-blue-500">
                            <p class="text-xs font-bold text-gray-700">${h.tipo}</p>
                            <p class="text-[11px] text-gray-600">${h.descripcion}</p>
                            <p class="text-[9px] text-gray-400 mt-1">${h.fecha}</p>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="text-gray-400 text-sm italic">No hay eventos médicos registrados.</p>'}
        </div>
    `;
    // Chart for individual: usar historial de pesos del animal
    try {
        const pesos = animal.historial_pesos;
        const labels = pesos.map(p => p.fecha.split(' ')[0]);
        const dataPesos = pesos.map(p => p.peso);
        if (dataPesos.length === 0) {
            labels.push('Actual');
            dataPesos.push(animal.peso);
        }
        const colors = { 'Bovino': '#ef4444', 'Ovino': '#f97316', 'Caprino': '#eab308', 'Porcino': '#22c55e', 'Equino': '#3b82f6', 'Otro': '#8b5cf6' };
        new Chart(document.getElementById('individualChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{ label: 'Peso (kg)', data: dataPesos, borderColor: colors[animal.especie] || '#1b4332', backgroundColor: 'rgba(27,67,50,0.1)', fill: true }]
            }
        });
    } catch (e) {
        console.error(e);
    }
    document.getElementById('modalDetails').classList.remove('hidden');
    window.currentAnimalId = id;
    window.currentSaludId = id; // Sincronizar contexto para exportaciones y formularios
    window.currentAnimalData = animal; // Guardar datos para poder editar
}

async function deleteAnimalFromDetails() {
    if (window.currentAnimalId) {
        const confirmacion = await agroConfirm('ADVERTENCIA: ¿Estás seguro de eliminar este animal y TODOS sus registros?\\nEsta acción no se puede deshacer.', 'Confirmación Crítica', 'delete');
        if (confirmacion) {
            // Reutilizamos la lógica de deleteAnimal pero ajustamos el UI despues
            fetch(`/api/animal/${window.currentAnimalId}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        if (typeof AgroSync !== 'undefined') AgroSync.trigger();
                        else {
                            closeDetailsModal();
                            loadAnimals();
                            loadDashboard();
                        }
                        agroAlert('Animal eliminado correctamente.', 'Proceso Completado', 'success');
                    } else {
                        agroAlert('Error: ' + data.error, 'Error', 'danger');
                    }
                })
                .catch(e => console.error(e));
        }
    }
}

function editAnimalFromDetails() {
    if (!window.currentAnimalData) return agroAlert('Error: No hay datos del animal', 'Error', 'danger');
    const animal = window.currentAnimalData;
    closeDetailsModal(); // Cerrar el modal de detalles primero
    setTimeout(() => {
        openModal(animal); // Abrir el modal de edición con los datos
    }, 300);
}

function closeDetailsModal() { document.getElementById('modalDetails').classList.add('hidden'); }

/**
 * Helper para descargar archivos con animación de carga en el botón
 */
async function downloadFileWithLoading(url, button, filenamePrefix = "archivo") {
    if (!button) return window.open(url, '_blank');

    const originalContent = button.innerHTML;
    const originalWidth = button.offsetWidth;

    // Estado de carga
    button.disabled = true;
    button.style.width = `${originalWidth}px`; // Mantener ancho estable
    button.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i>`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al generar el archivo');

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Obtener nombre del header si es posible, o usar default
        const disposition = response.headers.get('content-disposition');
        let filename = `${filenamePrefix}_${new Date().getTime()}`;
        if (disposition && disposition.includes('filename=')) {
            filename = disposition.split('filename=')[1].replace(/"/g, '');
        } else {
            const extension = url.includes('excel') ? '.xlsx' : '.pdf';
            filename += extension;
        }

        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();

        // Éxito: feedback visual rápido
        button.innerHTML = `<i class="fas fa-check"></i>`;
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
        }, 2000);

    } catch (error) {
        console.error(error);
        alert('Hubo un error al intentar exportar el documento.');
        button.innerHTML = originalContent;
        button.disabled = false;
    }
}

function exportPDF(e) {
    if (!window.currentAnimalId) return;
    const btn = e ? e.currentTarget : null;
    downloadFileWithLoading(`/api/export/pdf/ficha/${window.currentAnimalId}`, btn, "ficha_tecnica");
}

function exportExcel(e) {
    const btn = e ? e.currentTarget : null;
    downloadFileWithLoading('/api/export/excel', btn, "inventario");
}

function exportPDFInventario(e) {
    const btn = e ? e.currentTarget : null;
    downloadFileWithLoading('/api/export/pdf/inventario', btn, "inventario");
}

function exportSmartReport(e) {
    const btn = e ? e.currentTarget : null;
    agroAlert('Generando informe ejecutivo consolidado. Esto puede tardar unos segundos...', 'Procesando Smart Report', 'info');
    downloadFileWithLoading('/api/export/pdf/smart-report', btn, "reporte_inteligente");
}

function exportarPlanIndividual(e) {
    const id = document.getElementById('selectAnimalNutricion').value;
    if (!id) return agroAlert('Por favor seleccione un animal primero.', 'Atención', 'warning');
    const btn = e ? e.currentTarget : null;
    downloadFileWithLoading(`/api/export/pdf/plan-nutricional/${id}`, btn, "plan_nutricional");
}

async function loadNutricion() {
    const id = document.getElementById('selectAnimalNutricion').value;
    if (!id) return;
    const res = await fetch(`/api/nutricion/${id}`);
    const data = await res.json();
    document.getElementById('nutricionContent').innerHTML = `
        <p><strong>Forraje Verde Diario:</strong> ${data.forraje_verde} kg</p>
        <p><strong>Suplementos Recomendados:</strong> ${data.suplementos.join(', ')}</p>
    `;
}

/**
 * Inicializa las tablas y gráficos del Dashboard y la sección de Ganado.
 * Usa Chart.js para visualizar el crecimiento.
 */
async function initCharts() {
    const sel = document.getElementById('selectEspecieChart');
    if (!sel) return;

    // Redefinir para acceso global si es necesario
    window.loadDashboardChart = async (especie) => {
        const ctx = document.getElementById('growthChart');
        if (!ctx) return;

        try {
            const endpoint = especie === 'Todas' ? '/api/graficos' : `/api/graficos/especie/${encodeURIComponent(especie)}`;
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error('Error backend');
            const data = await res.json();

            if (window.growthChart instanceof Chart) {
                window.growthChart.destroy();
            }

            let datasets = [];
            if (especie === 'Todas') {
                const colors = { 'Bovino': '#ef4444', 'Ovino': '#f97316', 'Caprino': '#eab308', 'Porcino': '#22c55e', 'Equino': '#3b82f6', 'Otro': '#8b5cf6' };
                datasets = (data.datasets || []).map(ds => ({
                    ...ds,
                    borderColor: colors[ds.label] || '#10b981',
                    backgroundColor: (colors[ds.label] || '#10b981') + '44', // Más opacidad para puntos
                    fill: false,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 6, // Puntos más grandes y visibles
                    pointHoverRadius: 9,
                    pointStyle: 'circle',
                    pointBackgroundColor: colors[ds.label] || '#10b981'
                }));
            } else {
                datasets = [{
                    label: `Tendencia: ${especie}`,
                    data: data.data || [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 4,
                    pointRadius: 7, // Puntos muy visibles para registros individuales
                    pointHoverRadius: 10,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#10b981',
                    pointBorderWidth: 2
                }];
            }

            window.growthChart = new Chart(ctx, {
                type: 'line',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: {
                            display: datasets.length > 0,
                            position: 'top',
                            labels: { usePointStyle: true, font: { family: 'Inter', weight: '600' } }
                        },
                        tooltip: { backgroundColor: 'rgba(17, 24, 39, 0.9)', padding: 12, borderRadius: 8 }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            title: { display: true, text: 'Edad (Meses)', font: { weight: 'bold' } },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: false,
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            title: { display: true, text: 'Peso Promedio (kg)', font: { weight: 'bold' } }
                        }
                    }
                }
            });
        } catch (e) {
            console.error('Error Chart:', e);
        }
    };

    sel.onchange = (e) => window.loadDashboardChart(e.target.value);
    await window.loadDashboardChart(sel.value);
}






/**
 * Carga notificaciones de salud y alertas de peso.
 * Renderiza tarjetas de alerta en el Dashboard.
 */
async function loadNotifications() {
    try {
        const res = await fetch('/api/notificaciones');
        const data = await res.json();
        const container = document.getElementById('notifications');
        if (!container) return;

        let notifications = (data.notificaciones || []).filter(n => n.tipo !== 'pesaje_pendiente');

        // Agregar notificaciones adicionales basadas en estadísticas
        const statsRes = await fetch('/api/estadisticas');
        const stats = await statsRes.json();

        // Notificación de resumen diario
        if (stats.poblacion > 0) {
            notifications.unshift({
                tipo: 'resumen_diario',
                titulo: 'Resumen del día',
                mensaje: `Total de animales: ${stats.poblacion} | Peso promedio: ${stats.peso_avg} kg | Alertas: ${stats.alertas}`,
                prioridad: 'baja',
                accion: 'Ver dashboard completo'
            });
        }

        // Notificación pro-activa de sistema
        notifications.push({
            tipo: 'sistema',
            titulo: 'Estado del Sistema',
            mensaje: 'Motor de inteligencia genealógica y base de datos optimizada.',
            prioridad: 'baja'
        });

        // Si no hay notificaciones
        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="text-center py-6">
                    <i class="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                    <p class="text-gray-500">Todo en orden</p>
                    <p class="text-sm text-gray-400">No hay alertas activas</p>
                </div>
            `;
            return;
        }

        // Mapear tipos a colores e iconos
        const tipoConfig = {
            'bajo_peso': { icon: 'fa-exclamation-triangle', color: 'red' },
            'vacunacion': { icon: 'fa-syringe', color: 'yellow' },
            'parto': { icon: 'fa-baby', color: 'purple' },
            'critico': { icon: 'fa-alert-circle', color: 'red' },
            'resumen_diario': { icon: 'fa-chart-bar', color: 'green' },
            'sistema': { icon: 'fa-microchip', color: 'blue' }
        };

        // Renderizar notificaciones
        container.innerHTML = notifications.map((n, idx) => {
            const config = tipoConfig[n.tipo] || { icon: 'fa-info-circle', color: 'gray' };
            const prioridadClass = n.prioridad === 'alta' ? 'border-l-4' : n.prioridad === 'media' ? 'border-l-2' : '';

            return `
                <div class="notification-item flex gap-3 p-4 bg-${config.color}-50 rounded-lg ${prioridadClass} border-${config.color}-500 animate-slideIn transition-all duration-300 hover:bg-${config.color}-100 cursor-pointer" data-type="${n.tipo}" data-id="${idx}" onclick="handleNotificationClick('${n.tipo}', ${idx})">
                    <i class="fas ${config.icon} text-${config.color}-500 mt-1 flex-shrink-0"></i>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-${config.color}-800">${n.titulo.toUpperCase()}</p>
                        <p class="text-[11px] text-gray-600 mb-2">${n.mensaje}</p>
                        ${n.fecha ? `<p class="text-[9px] text-gray-400 mb-2 italic"><i class="far fa-clock mr-1"></i>${n.fecha}</p>` : ''}
                        ${n.accion ? `<p class="text-[10px] text-${config.color}-600 font-medium">${n.accion}</p>` : ''}
                        ${n.animales ? `<p class="text-[10px] text-gray-400 mt-1">Animales: ${n.animales.map(a => '#' + a.id).join(', ')}</p>` : ''}
                    </div>
                    <button class="text-gray-400 hover:text-gray-600 flex-shrink-0 font-bold text-lg" onclick="event.stopPropagation(); dismissNotification(${idx})">×</button>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Error loading notifications:', e);
    }
}

function handleNotificationClick(tipo, index) {
    switch (tipo) {
        case 'bajo_peso':
        case 'resumen_diario':
            showAlertas();
            break;
        case 'critico':
            showSaludCritica();
            break;
        case 'vacunacion':
            showSection('salud');
            break;
        case 'parto':
            showSection('ganado');
            break;
        case 'sistema':
            agroAlert('El sistema Agro-Master está funcionando al 100%. Todos los módulos de inteligencia y bases de datos están sincronizados.', 'Sincronización de Sistema', 'success');
            break;
        default:
            // No hacer nada
            break;
    }
}

async function dismissNotification(ref, persistent = false, id = null) {
    // Si no tenemos ref pero tenemos id (legacy support), lo buscamos por data-id
    const selector = ref ? `[data-ref="${ref}"]` : `[data-id="${id}"]`;
    const element = document.querySelector(selector);

    if (element) {
        element.style.animation = 'slideOut 0.3s ease-out forwards';

        if (persistent && ref) {
            try {
                await fetch('/api/notificaciones/descartar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ referencia: ref })
                });

                // Refrescar estadísticas del dashboard para que el contador cambie
                if (typeof loadDashboard === 'function') {
                    loadDashboard();
                }
            } catch (e) {
                console.error('Error al descartar:', e);
            }
        }

        setTimeout(() => {
            element.remove();

            // Si estmos en la vista de lista de alertas, recargar para consistencia si es persistente
            if (persistent && typeof alertasViewMode !== 'undefined' && alertasViewMode === 'list') {
                toggleAlertasDetail();
            }

            // Si no quedan notificaciones en el panel de actividad, mostrar mensaje
            const container = document.getElementById('notifications');
            if (container && container.children.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center text-sm py-6">✓ Todo en orden.</p>';
            }
        }, 300);
    }
}

async function loadAnimalSelect() {
    const res = await fetch('/api/ganado');
    const data = await res.json();
    const select = document.getElementById('selectAnimalNutricion');
    select.innerHTML = '<option value="">Seleccionar Animal</option>' + data.map(a => `<option value="${a.id}">#${a.id} - ${a.raza}</option>`).join('');

    // También para salud
    const selectSalud = document.getElementById('selectAnimalSalud');
    selectSalud.innerHTML = '<option value="">Seleccionar Animal</option>' + data.map(a => `<option value="${a.id}">#${a.id} - ${a.raza} (${a.especie})</option>`).join('');
}

async function showAlertas() {
    try {
        const res = await fetch('/api/estadisticas');
        const data = await res.json();

        // Obtener animales con bajo peso
        const peso_avg = data.peso_avg;
        const resAnimales = await fetch('/api/ganado');
        const animales = await resAnimales.json();

        const animalesBajoPeso = animales.filter(a => a.peso < peso_avg * 0.8);

        let content = '<h4 class="font-bold mb-4 text-yellow-600">Animales con Alertas de Peso</h4>';

        if (animalesBajoPeso.length > 0) {
            content += '<div class="space-y-3">';
            animalesBajoPeso.forEach(animal => {
                const porcentaje = ((animal.peso / peso_avg) * 100).toFixed(1);
                content += `
                    <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="font-bold text-gray-800">Animal #${animal.id} - ${animal.especie}</p>
                                <p class="text-sm text-gray-600">Raza: ${animal.raza} | Sexo: ${animal.sexo}</p>
                                <p class="text-sm text-gray-600">Edad: ${animal.edad} meses</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-yellow-600">${animal.peso} kg</p>
                                <p class="text-xs text-gray-500">${porcentaje}% del promedio</p>
                            </div>
                        </div>
                        <button onclick="closeModalAndShowDetails(${animal.id})" class="mt-2 text-blue-600 text-sm hover:underline">Ver detalles completos</button>
                    </div>
                `;
            });
            content += '</div>';
        } else {
            content += '<p class="text-gray-500 text-center py-4">No hay animales con alertas de peso en este momento.</p>';
        }

        // Mostrar en un modal o sección
        showCustomModal('Alertas de Peso', content);

    } catch (error) {
        console.error('Error loading alertas:', error);
    }
}

async function showSaludCritica() {
    try {
        const res = await fetch('/api/estadisticas');
        const data = await res.json();

        // Obtener animales en estado crítico
        const resAnimales = await fetch('/api/ganado');
        const animales = await resAnimales.json();

        // Simular animales críticos (aquellos con peso muy bajo o sin registros recientes)
        const animalesCriticos = animales.filter(a => a.peso < data.peso_avg * 0.6 || a.estado === 'Enfermo');

        let content = '<h4 class="font-bold mb-4 text-red-600">Animales en Estado Crítico</h4>';

        if (animalesCriticos.length > 0) {
            content += '<div class="space-y-3">';
            animalesCriticos.forEach(animal => {
                const estadoCritico = animal.peso < data.peso_avg * 0.6 ? 'Peso crítico' : 'Estado de salud';
                content += `
                    <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="font-bold text-gray-800">Animal #${animal.id} - ${animal.especie}</p>
                                <p class="text-sm text-gray-600">Raza: ${animal.raza} | Sexo: ${animal.sexo}</p>
                                <p class="text-sm text-red-600 font-medium">${estadoCritico}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-red-600">${animal.peso} kg</p>
                                <p class="text-xs text-gray-500">Estado: ${animal.estado}</p>
                            </div>
                        </div>
                        <div class="mt-3 flex gap-2">
                            <button onclick="closeModalAndShowDetails(${animal.id})" class="text-blue-600 text-sm hover:underline">Ver detalles</button>
                            <button onclick="closeModalAndUpdate(${JSON.stringify(animal).replace(/'/g, '\\\'')})" class="text-green-600 text-sm hover:underline">Actualizar</button>
                        </div>
                    </div>
                `;
            });
            content += '</div>';
        } else {
            content += '<p class="text-gray-500 text-center py-4">No hay animales en estado crítico en este momento.</p>';
        }

        // Mostrar en un modal o sección
        showCustomModal('Estado de Salud Crítico', content);

    } catch (error) {
        console.error('Error loading salud critica:', error);
    }
}

function showCustomModal(title, content) {
    // Crear modal personalizado
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-gray-800">${title}</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div>${content}</div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Variables para controlar el estado de las vistas en el dashboard
let poblacionViewMode = 'total';
let pesoViewMode = 'general';

/**
 * LÓGICA DE VISUALIZACIÓN DINÁMICA: Censo por Especie.
 * Cambia la tarjeta de "Población Total" entre un número simple y un desglose detallado.
 * 
 * @reason Permite al usuario ver la distribución del rebaño sin cambiar de pantalla.
 * @workflow
 * 1. Cambia el estado 'poblacionViewMode'.
 * 2. Si es 'species', solicita datos agrupados al backend.
 * 3. Renderiza barras de progreso (HTML dinámico) calculando porcentajes sobre el total.
 * 4. Aplica animaciones CSS (fadeIn) para una transición suave.
 */
async function togglePoblacionView() {
    const label = document.getElementById('poblacion-label');
    const value = document.getElementById('poblacion');
    const subtitle = document.getElementById('poblacion-subtitle');

    if (poblacionViewMode === 'total') {
        poblacionViewMode = 'species';
        label.innerHTML = '<i class="fas fa-list-ol mr-2 text-green-500"></i>Censo por Especie';
        subtitle.innerHTML = '<i class="fas fa-undo-alt mr-1"></i> Clic para contraer';

        try {
            const res = await fetch('/api/estadisticas/especies');
            const data = await res.json();
            if (!data.poblacion_por_especie || Object.keys(data.poblacion_por_especie).length === 0) {
                value.innerHTML = '<p class="text-xs text-gray-400 mt-4 italic">Sin datos disponibles por especie</p>';
                return;
            }

            const total = Object.values(data.poblacion_por_especie).reduce((a, b) => a + b, 0);
            let html = '<div class="space-y-2 mt-4 animate-fadeIn max-h-48 overflow-y-auto custom-scrollbar pr-2">';
            for (const [especie, count] of Object.entries(data.poblacion_por_especie)) {
                const pct = total > 0 ? (count / total * 100).toFixed(0) : 0;
                html += `
                    <div class="group/item">
                        <div class="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                            <span>${especie}</span>
                            <span>${count}</span>
                        </div>
                        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-green-500 rounded-full transition-all duration-700" style="width: ${pct}%"></div>
                        </div>
                    </div>`;
            }
            html += '</div>';
            value.innerHTML = html;
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        poblacionViewMode = 'total';
        label.textContent = 'Población Total';
        subtitle.innerHTML = '<i class="fas fa-paw text-green-500"></i> Total de animales';
        loadDashboard();
    }
}

async function togglePesoView() {
    const label = document.getElementById('peso-label');
    const value = document.getElementById('peso_avg');
    const subtitle = document.getElementById('peso-subtitle');

    if (pesoViewMode === 'general') {
        pesoViewMode = 'species';
        label.innerHTML = '<i class="fas fa-chart-pie mr-2 text-blue-500"></i>Promedio por Especie';
        subtitle.innerHTML = '<i class="fas fa-undo-alt mr-1"></i> Clic para contraer';

        try {
            const res = await fetch('/api/estadisticas/especies');
            const data = await res.json();
            const pesos = Object.values(data.peso_por_especie);
            if (pesos.length === 0) {
                value.innerHTML = '<p class="text-xs text-gray-400 mt-4 italic">Sin promedios disponibles</p>';
                return;
            }

            const maxPeso = Math.max(...pesos) || 1;

            let html = '<div class="space-y-2 mt-4 animate-fadeIn max-h-48 overflow-y-auto custom-scrollbar pr-2">';
            for (const [especie, avg] of Object.entries(data.peso_por_especie)) {
                const pct = (avg / maxPeso * 100).toFixed(0);
                html += `
                    <div class="group/item">
                        <div class="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                            <span>${especie}</span>
                            <span>${avg} <small>kg</small></span>
                        </div>
                        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-blue-500 rounded-full transition-all duration-700" style="width: ${pct}%"></div>
                        </div>
                    </div>`;
            }
            html += '</div>';
            value.innerHTML = html;
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        pesoViewMode = 'general';
        label.textContent = 'Peso Promedio';
        subtitle.innerHTML = '<i class="fas fa-balance-scale text-blue-400"></i> Promedio del Inventario';
        loadDashboard();
    }
}
function attendAnimal(id) {
    showSection('salud');
    setTimeout(() => {
        const sel = document.getElementById('selectAnimalSalud');
        if (sel) {
            sel.value = id;
            loadSaludAnimal();
        }
    }, 100);
}

let alertasViewMode = 'count';
async function toggleAlertasDetail() {
    const label = document.getElementById('alertas-label');
    const value = document.getElementById('alertas');
    const subtitle = document.getElementById('alertas-subtitle');

    if (alertasViewMode === 'count') {
        alertasViewMode = 'list';
        label.textContent = 'Detalle de Alertas';
        subtitle.textContent = 'Clic para resumen';

        try {
            const res = await fetch('/api/notificaciones');
            if (!res.ok) {
                const text = await res.text();
                console.error('API Error:', text);
                throw new Error(`Server returned ${res.status}`);
            }
            const data = await res.json();
            const notifications = data.notificaciones || [];

            if (notifications.length === 0) {
                value.innerHTML = '<span class="text-sm font-normal text-gray-500">Sin alertas pendientes</span>';
                return;
            }

            let html = '<div class="space-y-2 text-xs overflow-y-auto max-h-56 custom-scrollbar pr-1 mt-2">';
            notifications.forEach(n => {
                let actionBtn = '';
                if (n.entity_type === 'protocolo' && n.id) {
                    actionBtn = `
                        <button onclick="completeProtocolFromAlert(${n.id}, this)" class="ml-2 w-7 h-7 flex items-center justify-center bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition shadow-sm" title="Completar">
                            <i class="fas fa-check text-[10px]"></i>
                        </button>
                    `;
                } else if (n.ref) {
                    actionBtn = `
                        <button onclick="dismissNotification('${n.ref}', true)" class="ml-2 w-7 h-7 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition shadow-sm" title="Visto">
                            <i class="fas fa-eye text-[10px]"></i>
                        </button>
                    `;
                }

                html += `<div class="bg-yellow-50/80 p-3 rounded-xl border border-yellow-100 flex justify-between items-center group shadow-sm transition-all hover:bg-yellow-100" data-ref="${n.ref}">
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-1">
                            <strong class="text-[0.7rem] text-amber-900 font-black truncate pr-2">${n.titulo || 'Alerta'}</strong>
                            <span class="text-[8px] font-black px-1.5 py-0.5 bg-yellow-200/50 rounded-full text-amber-700 uppercase tracking-tighter">${n.prioridad || 'media'}</span>
                        </div>
                        <p class="text-[0.65rem] text-amber-800/80 leading-tight font-medium">${n.mensaje || ''}</p>
                    </div>
                    ${actionBtn}
                </div>`;
            });
            html += '</div>';
            value.innerHTML = html;
        } catch (e) {
            console.error(e);
            value.textContent = 'Error';
        }
    } else {
        alertasViewMode = 'count';
        label.textContent = 'Alertas Activas';
        subtitle.textContent = 'Insumos y tareas';
        const res = await fetch('/api/estadisticas');
        const data = await res.json();
        value.textContent = data.alertas;
    }
}

async function completeProtocolFromAlert(id, btn) {
    if (!confirm('¿Marcar este protocolo como realizado ahora?')) return;

    // Feedback visual inmediato
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch(`/api/salud/protocolo/completar/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();

        if (data.status === 'success') {
            agroToast('Protocolo completado correctamente', 'success');
            // Recargar alertas para quitar el elemento
            alertasViewMode = 'list'; // Asegurar que siga en modo lista
            toggleAlertasDetail(); // Esto recargará la lista
            loadDashboard(); // Actualizar contadores globales
        } else {
            agroToast(data.error || 'Error al completar', 'danger');
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.disabled = false;
        }
    } catch (e) {
        console.error(e);
        agroToast('Error de conexión', 'danger');
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.disabled = false;
    }
}

let criticosViewMode = 'count';
async function toggleCriticosDetail() {
    const label = document.getElementById('criticos-label');
    const value = document.getElementById('criticos');
    const subtitle = document.getElementById('criticos-subtitle');

    if (criticosViewMode === 'count') {
        criticosViewMode = 'list';
        label.textContent = 'Animales Críticos';
        subtitle.textContent = 'Clic para resumen';

        try {
            if (!window.allAnimals) {
                const r = await fetch('/api/ganado');
                window.allAnimals = await r.json();
            }

            // Filtrar animales en estado crítico o con desparasitación omitida
            const criticos = window.allAnimals.filter(a => a.salud_critica);

            if (criticos.length === 0) {
                value.innerHTML = '<span class="text-sm font-normal text-gray-500">Ningún caso crítico</span>';
                return;
            }

            let html = '<div class="space-y-2 text-xs overflow-y-auto max-h-48 custom-scrollbar">';
            criticos.forEach(a => {
                const colorClase = a.razon_critica && a.razon_critica.includes('Desparasitación') ? 'orange' : 'red';
                html += `<div class="flex justify-between items-center bg-${colorClase}-50 p-2.5 rounded-xl border border-${colorClase}-100 hover:shadow-sm transition-all shadow-sm shadow-${colorClase}-100/20" onclick="event.stopPropagation(); showDetails(${a.id})">
                    <div class="flex flex-col flex-1">
                        <div class="flex items-center gap-1.5 mb-0.5">
                            <span class="font-black text-${colorClase}-800">#${a.id}</span>
                            <span class="text-[9px] font-black text-${colorClase}-500 uppercase tracking-tighter">${a.raza}</span>
                        </div>
                        <span class="text-${colorClase}-600 font-bold text-[10px]"><i class="fas fa-exclamation-circle mr-1 text-[9px]"></i>${a.razon_critica || 'Estado Crítico'}</span>
                    </div>
                    <button onclick="event.stopPropagation(); attendAnimal(${a.id})" class="bg-${colorClase}-600 text-white font-black px-3 py-1.5 rounded-lg hover:shadow-lg transition-all text-[9px] transform active:scale-95">
                        ATENDER
                    </button>
                </div>`;
            });
            html += '</div>';
            value.innerHTML = html;
        } catch (e) {
            console.error(e);
            value.textContent = 'Error';
        }
    } else {
        criticosViewMode = 'count';
        label.textContent = 'Salud Crítica';
        subtitle.textContent = 'Requieren revisión';
        const res = await fetch('/api/estadisticas');
        const data = await res.json();
        value.textContent = data.criticos;
    }
}

let isActivityPanelExpanded = true;
function toggleActivityPanel() {
    const panel = document.getElementById('recentActivityPanel');
    const chevron = document.getElementById('activityChevron');
    const container = document.getElementById('notificationsContainer');
    const title = document.querySelector('#activityTitle span:last-child');

    if (isActivityPanelExpanded) {
        // Collapse
        panel.classList.remove('lg:w-1/3');
        panel.classList.add('lg:w-[80px]');

        container.classList.add('opacity-0', 'pointer-events-none');
        title.classList.add('opacity-0');

        chevron.classList.add('rotate-180');
    } else {
        // Expand
        panel.classList.remove('lg:w-[80px]');
        panel.classList.add('lg:w-1/3');

        container.classList.remove('opacity-0', 'pointer-events-none');
        title.classList.remove('opacity-0');

        chevron.classList.remove('rotate-180');
    }
    isActivityPanelExpanded = !isActivityPanelExpanded;

    // Resize chart after transition
    setTimeout(() => {
        if (window.growthChart) window.growthChart.resize();
    }, 550);
}

async function checkForChanges() {
    try {
        const res = await fetch('/api/last_change');
        const data = await res.json();
        if (!window.lastChange || window.lastChange !== data.timestamp) {
            window.lastChange = data.timestamp;
            initCharts();
        }
    } catch (e) {
        console.error('Error checking for changes:', e);
    }
}

// La función loadDashboard ha sido consolidada al final del archivo para evitar duplicidad.

// El punto de entrada principal ha sido consolidado al final del archivo.
async function initApp() {
    console.log('Iniciando Agro-Master Visual System...');

    // 1. Configuraciones iniciales de UI
    const today = new Date().toISOString().split('T')[0];
    const fechaInput = document.getElementById('in-fecha_nacimiento');
    if (fechaInput) fechaInput.max = today;

    // 2. Cargar Datos del Dashboard (Por defecto al entrar)
    await loadDashboard();
    await initCharts();
    loadNotifications();

    // 3. Inicializar componentes globales
    loadAnimalSelect();
    if (typeof requestAgroDesktopPermission === 'function') {
        requestAgroDesktopPermission();
    }

    // 4. Segundo plano: protocolos y cambios
    setTimeout(checkUpcomingProtocols, 2000);
    setInterval(checkForChanges, 10000); // Cada 10s es suficiente para cambios de datos
    setInterval(loadDashboard, 60000);  // Cada minuto actualizar contadores
}

async function loadGenealogiaOptions() {
    const res = await fetch('/api/ganado');
    const data = await res.json();
    const select = document.getElementById('selectGenealogia');
    select.innerHTML = '<option value="">Seleccionar Animal</option>' + data.map(a => `<option value="${a.id}">#${a.id} - ${a.raza}</option>`).join('');
    select.addEventListener('change', () => loadGenealogia(select.value));
}

/**
 * Carga la información de salud de un animal seleccionado.
 * Muestra protocolos pendientes y el historial médico pasado.
 */

// ============= SISTEMA DE PESTAÑAS EN SALUD =============

/**
 * Cambia entre las pestañas de Salud: Protocolos/Historial y Maternidad
 */
function switchSaludTab(tabName) {
    // Ocultar todos los contenidos de pestañas
    document.querySelectorAll('.tab-content-salud').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Resetear estilos de todos los botones de pestañas
    document.querySelectorAll('.tab-salud').forEach(btn => {
        btn.classList.remove('text-red-600', 'border-b-4', 'border-red-600', 'bg-red-50', 'text-pink-600', 'border-pink-600', 'bg-pink-50');
        btn.classList.add('text-gray-500', 'hover:bg-gray-50');
    });

    // Mostrar el contenido de la pestaña seleccionada
    if (tabName === 'protocolos') {
        document.getElementById('tabContent-protocolos').classList.remove('hidden');
        const btn = document.getElementById('tab-salud-protocolos');
        btn.classList.remove('text-gray-500', 'hover:bg-gray-50');
        btn.classList.add('text-red-600', 'border-b-4', 'border-red-600', 'bg-red-50');

        // Cargar TODOS los animales en el selector
        loadAnimalSelectForSalud('all');

    } else if (tabName === 'maternidad') {
        document.getElementById('tabContent-maternidad').classList.remove('hidden');
        const btn = document.getElementById('tab-salud-maternidad');
        btn.classList.remove('text-gray-500', 'hover:bg-gray-50');
        btn.classList.add('text-pink-600', 'border-b-4', 'border-pink-600', 'bg-pink-50');

        // Cargar SOLO HEMBRAS en el selector
        loadAnimalSelectForSalud('hembras');

        // Cargar datos de maternidad si aún no se han cargado
        loadMaternityAnimals();
        loadMaternityPlanesList();
    }
}

/**
 * Carga el selector de animales con filtro opcional para solo hembras
 */
async function loadAnimalSelectForSalud(filter = 'all') {
    try {
        const res = await fetch('/api/ganado');
        let data = await res.json();

        // Filtrar solo hembras si es necesario
        if (filter === 'hembras') {
            data = data.filter(a => a.sexo === 'Hembra');
        }

        const selectSalud = document.getElementById('selectAnimalSalud');
        if (selectSalud) {
            // Guardar el valor actual
            const currentValue = selectSalud.value;

            // Actualizar opciones
            const placeholder = filter === 'hembras'
                ? 'Seleccionar hembra del rebaño...'
                : 'Seleccionar del rebaño...';

            selectSalud.innerHTML = `<option value="">${placeholder}</option>` +
                data.map(a => `<option value="${a.id}">#${a.id} - ${a.raza} (${a.especie})</option>`).join('');

            // Restaurar valor si sigue siendo válido
            if (currentValue && data.some(a => a.id == currentValue)) {
                selectSalud.value = currentValue;
            } else {
                selectSalud.value = '';
            }
        }
    } catch (error) {
        console.error('Error loading animals for selector:', error);
    }
}

/**
 * Carga la información de salud de un animal seleccionado.
 * Muestra protocolos pendientes y el historial médico pasado con diseño premium.
 */
async function loadSaludAnimal() {
    const animalId = document.getElementById('selectAnimalSalud').value;

    if (!animalId) {
        // Ocultar contenido cuando no hay animal seleccionado
        const protocolosContent = document.getElementById('tabContent-protocolos');
        const emptyState = document.getElementById('saludEmptyState');

        if (protocolosContent) {
            const mainContent = protocolosContent.querySelector('.grid');
            if (mainContent) mainContent.style.display = 'none';
        }

        // Mostrar Empty State
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    // Detectar qué pestaña está activa
    const activeTab = document.querySelector('.tab-salud.text-red-600, .tab-salud.text-pink-600');
    const isMaternidadTab = activeTab && activeTab.id === 'tab-salud-maternidad';

    // Si estamos en la pestaña de maternidad, cargar datos de maternidad
    if (isMaternidadTab) {
        selectMaternityAnimal(parseInt(animalId));
        return;
    }

    // Si estamos en protocolos, cargar datos de salud
    const protocolosContent = document.getElementById('tabContent-protocolos');
    const mainContent = protocolosContent.querySelector('.grid');
    const emptyState = document.getElementById('saludEmptyState');

    if (mainContent) mainContent.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none'; // Ocultar Empty State al cargar

    try {

        // Mostrar loaders
        document.getElementById('healthSummaryCard').innerHTML = '<div class="animate-pulse flex space-x-4"><div class="rounded-full bg-gray-200 h-10 w-10"></div><div class="flex-1 space-y-6 py-1"><div class="h-2 bg-gray-200 rounded"></div><div class="space-y-3"><div class="grid grid-cols-3 gap-4"><div class="h-2 bg-gray-200 rounded col-span-2"></div><div class="h-2 bg-gray-200 rounded col-span-1"></div></div><div class="h-2 bg-gray-200 rounded"></div></div></div></div>';

        // Parallel Fetch
        const [resSalud, resAnimal] = await Promise.all([
            fetch(`/api/salud/${animalId}`),
            fetch(`/api/animal/${animalId}`)
        ]);

        // Verificar si las respuestas son exitosas
        if (!resSalud.ok) {
            console.error('API Salud error:', resSalud.status, resSalud.statusText);
            throw new Error('Error al cargar datos de salud.');
        }
        if (!resAnimal.ok) {
            console.error('API Animal error:', resAnimal.status, resAnimal.statusText);
            throw new Error('Error al cargar datos del animal.');
        }

        const data = await resSalud.json();
        const animal = await resAnimal.json();

        // 1. Renderizar Resumen Médico (Summary Card)
        const summaryCard = document.getElementById('healthSummaryCard');

        // Obtener datos del expediente médico
        const bloodType = (data.expediente && data.expediente.tipo_sangre) || 'Desconocido';
        const alertas = (data.expediente && data.expediente.alergias) || 'Sin alergias registradas';

        let estadoColor = 'green';
        let showDischarge = false;
        if (animal.estado === 'Enfermo') { estadoColor = 'red'; showDischarge = true; }
        if (animal.estado === 'Crítico') { estadoColor = 'red'; showDischarge = true; }
        if (animal.estado === 'Cuarentena') { estadoColor = 'orange'; showDischarge = true; }
        if (animal.estado === 'En Observación') { estadoColor = 'yellow'; showDischarge = true; }

        summaryCard.innerHTML = `
            <div class="flex items-center gap-4 mb-6">
                <div class="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <span class="font-black text-2xl text-gray-800">#${animal.id}</span>
                </div>
                <div>
                    <h4 class="font-bold text-gray-800 text-lg">${animal.raza} <span class="text-xs ml-2 px-2 py-1 rounded-full bg-${estadoColor}-100 text-${estadoColor}-700 font-bold uppercase">${animal.estado}</span></h4>
                    <p class="text-gray-500 text-xs">${animal.sexo} | ${animal.edad} meses | ${animal.peso} kg</p>
                </div>
            </div>
            
            <div class="space-y-4">
                <div class="flex items-start gap-3">
                    <i class="fas fa-notes-medical text-red-400 mt-1"></i>
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase">Alertas / Alergias</p>
                        <p class="text-sm font-medium text-gray-700">${alertas}</p>
                    </div>
                </div>
                <div class="flex items-start gap-3">
                    <i class="fas fa-tint text-red-500 mt-1"></i>
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase">Tipo Sangre</p>
                        <p class="text-sm font-medium text-gray-700">${bloodType}</p>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-100">
                <p class="text-[10px] text-gray-400 text-center uppercase tracking-widest mb-4">Expediente Médico Digital</p>
                ${showDischarge ? `
                <button onclick="dischargeAnimal(${animal.id})" class="w-full bg-green-50 hover:bg-green-600 text-green-600 hover:text-white font-black py-3 rounded-xl border border-green-200 transition-all flex items-center justify-center gap-2 group">
                    <i class="fas fa-hand-holding-heart group-hover:animate-bounce"></i> DAR DE ALTA (MÉDICA)
                </button>
                ` : ''}
            </div>
        `;


        // 2. Renderizar Plan de Maternidad (si existe) - INTEGRACIÓN
        const maternityContainer = document.getElementById('maternityPlanContainer');
        if (data.plan_maternidad && !data.plan_maternidad.error) {
            const plan = data.plan_maternidad;
            const tipoPlanColor = {
                'Gestación': 'purple',
                'Lactancia': 'blue',
                'Parto Reciente': 'red',
                'Secado': 'orange'
            }[plan.tipo_plan] || 'gray';

            maternityContainer.innerHTML = `
                <div class="bg-gradient-to-br from-${tipoPlanColor}-500 to-${tipoPlanColor}-600 p-6 rounded-2xl shadow-xl text-white mb-6 animate-fadeIn border-4 border-${tipoPlanColor}-400">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <i class="fas fa-heartbeat text-3xl"></i>
                        </div>
                        <div>
                            <h4 class="font-black text-xl">Plan de ${plan.tipo_plan}</h4>
                            <p class="text-xs opacity-90 font-bold uppercase tracking-widest">Maternidad Activa</p>
                        </div>
                        <button onclick="switchSaludTab('maternidad'); setTimeout(() => selectMaternityAnimal(${animal.id}), 300)" 
                                class="ml-auto bg-white/20 hover:bg-white/30 p-3 rounded-xl transition"
                                title="Ver detalles en Maternidad">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <div class="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                            <p class="text-[10px] font-black uppercase opacity-70 mb-1">Fecha Inicio</p>
                            <p class="font-bold text-sm">${plan.fecha_inicio || 'N/A'}</p>
                        </div>
                        ${plan.fecha_probable_parto ? `
                        <div class="bg-white/20 backdrop-blur-sm p-3 rounded-xl border-2 border-white/30">
                            <p class="text-[10px] font-black uppercase opacity-70 mb-1">Fecha Probable Parto</p>
                            <p class="font-bold text-sm">${plan.fecha_probable_parto}</p>
                        </div>` : ''}
                    </div>
                    
                    ${plan.recomendaciones_veterinarias ? `
                    <div class="bg-white/10 backdrop-blur-sm p-4 rounded-xl border-l-4 border-white/50">
                        <p class="text-[10px] font-black uppercase mb-2"><i class="fas fa-user-md mr-1"></i> Recomendaciones Veterinarias</p>
                        <p class="text-sm italic leading-relaxed">"${plan.recomendaciones_veterinarias}"</p>
                    </div>` : ''}
                    
                    <div class="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                        <span class="text-xs opacity-70">Integrado con Salud y Protocolos</span>
                        <span class="bg-white/20 px-3 py-1 rounded-full text-xs font-black">
                            <i class="fas fa-check-circle mr-1"></i> ACTIVO
                        </span>
                    </div>
                </div>
            `;
            maternityContainer.classList.remove('hidden');
        } else {
            maternityContainer.innerHTML = '';
            maternityContainer.classList.add('hidden');
        }

        // 3. Renderizar Protocolos Activos
        const activeGrid = document.getElementById('activeProtocolsGrid');
        const protocolosActivos = (data.protocolos || []).filter(p => p.estado !== 'Realizado');

        if (protocolosActivos.length > 0) {
            activeGrid.innerHTML = protocolosActivos.map(p => `
                <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div class="flex justify-between items-start mb-2">
                        <span class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-yellow-100 text-yellow-700">
                            ${p.estado}
                        </span>
                        <div class="flex gap-1">
                            <button onclick="editProtocolo(${p.id}, '${(p.tipo_protocolo || "").replace(/'/g, "\\'").replace(/"/g, "&quot;")}', '${(p.descripcion || "").replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\n/g, " ")}', '${p.fecha_programada}', '${(p.veterinario || "").replace(/'/g, "\\'").replace(/"/g, "&quot;")}', '${(p.medicamento || "").replace(/'/g, "\\'").replace(/"/g, "&quot;")}', '${(p.dosis || "").replace(/'/g, "\\'").replace(/"/g, "&quot;")}')" class="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition" title="Ver/Editar protocolo">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="eliminarProtocolo(${p.id})" class="text-red-400 hover:bg-red-50 p-1.5 rounded-lg transition" title="Eliminar protocolo">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <h4 class="font-bold text-gray-800 text-sm leading-tight mb-1">${p.descripcion}</h4>
                    <p class="text-[10px] text-gray-400 mb-2 italic">Programado: ${p.fecha_programada}</p>
                    <div onclick="completarProtocolo(${p.id})" class="flex items-center justify-center bg-green-50 p-3 rounded-xl border border-green-200 cursor-pointer hover:bg-green-600 transition-all group/med shadow-sm">
                        <div class="text-xs font-black text-green-600 group-hover/med:text-white flex items-center gap-2 transition-colors">
                            <i class="fas fa-check-circle"></i> Marcar como Completado
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            activeGrid.innerHTML = `
                <div class="col-span-full py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <i class="fas fa-check-circle text-green-300 text-3xl mb-2"></i>
                    <p class="text-gray-400 text-sm">No hay protocolos pendientes.</p>
                </div>
            `;
        }


        // 3. Renderizar Línea de Tiempo
        const timeline = document.getElementById('healthHistoryTimeline');
        if (data.historial && data.historial.length > 0) {
            timeline.innerHTML = data.historial.map((h, index) => {
                const isProtocol = h.descripcion.includes('[PROTOCOLO COMPLETADO]');
                const cleanDesc = h.descripcion.replace('[PROTOCOLO COMPLETADO]', '').trim();
                const icon = h.tipo === 'Vacunación' ? 'fa-syringe' :
                    h.tipo === 'Desparasitación' ? 'fa-capsules' :
                        'fa-stethoscope';
                const color = h.tipo === 'Vacunación' ? 'green' :
                    h.tipo === 'Desparasitación' ? 'purple' :
                        'blue';

                return `
                <div class="relative group">
                    <div class="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-${color}-500 ring-4 ring-white shadow-sm group-hover:scale-125 transition"></div>
                    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div class="flex justify-between items-start">
                            <div>
                                <h5 class="font-bold text-gray-800 flex items-center gap-2">
                                    <span class="text-${color}-500"><i class="fas ${icon}"></i></span>
                                    ${h.tipo}
                                </h5>
                                <p class="text-xs text-gray-500 mt-1">${h.fecha} • Veterinario: ${h.veterinario || 'N/A'}</p>
                            </div>
                            <!-- Botón editar pequeño -->
                             <button onclick="editSaludRegistro(${h.id}, '${(h.tipo || "").replace(/'/g, "\\'").replace(/"/g, "&quot;")}', '${(h.descripcion || "").replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\n/g, " ")}', '${(h.veterinario || "").replace(/'/g, "\\'").replace(/"/g, "&quot;")}')" class="text-gray-300 hover:text-blue-500 text-xs" title="Ver/Editar registro"><i class="fas fa-eye"></i></button>
                        </div>
                        <p class="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-xl italic border-l-2 border-${color}-200 ml-1">
                            "${cleanDesc}"
                        </p>
                    </div>
                </div>
            `;
            }).join('');
        } else {
            timeline.innerHTML = '<p class="text-gray-400 italic text-sm">Sin historial registrado.</p>';
        }

        // Guardar estado para modales
        window.currentSaludId = animalId;
        window.currentAnimalId = animalId; // Sincronizar contexto global
        window.currentExpediente = data.expediente;

    } catch (e) {
        console.error("Error loading health data:", e);
        mainContent.innerHTML = `<p class="text-red-500 p-4">Error cargando datos: ${e.message}</p>`;
    }
}

// ============= FUNCIONES GLOBALES DE SALUD =============

async function deleteProtocolo(id) {
    const confirmacion = await agroConfirm('¿Estás seguro de eliminar este protocolo?', 'Eliminar Protocolo', 'delete');
    if (!confirmacion) return;
    const res = await fetch(`/api/protocolos/${id}`, { method: 'DELETE' });
    if (res.ok) loadSaludAnimal();
}

async function marcarRealizado(id) {
    const confirmacion = await agroConfirm('¿Marcar este protocolo como realizado? Pasará al historial.', 'Completar Tarea', 'salud');
    if (!confirmacion) return;
    const res = await fetch(`/api/protocolos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Realizado' })
    });
    if (res.ok) loadSaludAnimal();
}

function openModalSalud() {
    const animalId = document.getElementById('selectAnimalSalud').value;
    if (!animalId) return agroAlert('Selecciona un animal primero', 'Atención', 'warning');

    document.getElementById('saludAnimalId').value = animalId;
    document.getElementById('saludRegistroId').value = '';
    document.getElementById('saludTipo').value = 'Vacunación';
    document.getElementById('saludDescripcion').value = '';
    document.getElementById('saludVeterinario').value = '';
    document.getElementById('saludMedicamento').value = '';
    document.getElementById('saludDosis').value = '';

    // Resetear fecha
    document.getElementById('saludFecha').value = '';

    document.querySelector('#modalSalud h3').innerText = 'Agregar Registro Salud';
    window.saludMode = 'historial_manual'; // Nuevo modo por defecto si entran por el botón grande
    document.getElementById('modalSalud').classList.remove('hidden');
}

function closeModalSalud() {
    document.getElementById('modalSalud').classList.add('hidden');
}

async function saveSaludRegistro() {
    const animalId = document.getElementById('saludAnimalId').value;
    const registroId = document.getElementById('saludRegistroId').value;
    const tipo = document.getElementById('saludTipo').value;
    const descripcion = document.getElementById('saludDescripcion').value;
    const veterinario = document.getElementById('saludVeterinario').value;
    const medicamento = document.getElementById('saludMedicamento').value;
    const dosis = document.getElementById('saludDosis').value;
    const fecha = document.getElementById('saludFecha') ? document.getElementById('saludFecha').value : '';

    if (!tipo || !descripcion) return agroAlert('Tipo y Descripción son requeridos', 'Validación', 'warning');
    if (!animalId) return agroAlert('Error: No hay animal seleccionado', 'Error', 'danger');

    // Determinar acción basada en el modo
    // Protocolo: explícitamente modo protocolo
    // Historial: modo historial o historial_manual
    // Si la fecha es futura y no hay modo definido, sugerir protocolo? Por ahora respetamos el modo.

    let url, method, body;
    const mode = window.saludMode || ((fecha !== '') ? 'protocolo' : 'historial_manual');
    const isProtocolo = (mode === 'protocolo');

    if (isProtocolo) {
        if (!fecha) return agroAlert('Para un protocolo programado se requiere una fecha.', 'Falta Información', 'warning');

        // DESAFÍO DE CREDENCIALES
        const autorizado = await verifyActionPermission('veterinario', `Autorizar registro de Protocolo de ${tipo}`);
        if (!autorizado) return;

        url = registroId ? `/api/protocolos/${registroId}` : '/api/protocolos/agregar';
        method = registroId ? 'PUT' : 'POST';
        body = {
            animal_id: parseInt(animalId),
            tipo: tipo,
            descripcion: descripcion,
            veterinario: veterinario,
            fecha_programada: fecha,
            estado: 'Pendiente',
            medicamento: medicamento,
            dosis: dosis
        };
    } else {
        // Historial (puede tener fecha personalizada anterior o dejar vacia para 'ahora')

        // DESAFÍO DE CREDENCIALES
        const autorizado = await verifyActionPermission('veterinario', `Autorizar registro en Historial Médico (${tipo})`);
        if (!autorizado) return;

        url = registroId ? `/api/salud/historial/${registroId}` : '/api/salud/agregar';
        method = registroId ? 'PUT' : 'POST';
        body = {
            animal_id: parseInt(animalId),
            tipo: tipo,
            descripcion: descripcion,
            veterinario: veterinario,
            fecha: fecha,
            medicamento: medicamento,
            dosis: dosis
        };
    }

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        // Verificar si la respuesta es JSON válido
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text();
            console.error('Respuesta no JSON recibida:', text.substring(0, 200));
            throw new Error('El servidor no devolvió una respuesta válida. Posiblemente la ruta no existe.');
        }

        const result = await res.json();
        if (result.status === 'success') {
            closeModalSalud();
            loadSaludAnimal(); // Recargar lista
            agroAlert('Guardado con éxito', 'Éxito', 'success');

            // Notificación de escritorio
            const msg = isProtocolo ? `Nuevo protocolo programado para hoy: ${tipo}` : `Registro de ${tipo} guardado en el historial`;
            agroDesktopNotify(msg, 'Registro de Salud Guardado');
        } else {
            agroAlert('Error: ' + (result.error || 'Desconocido'), 'Error', 'danger');
        }
    } catch (e) {
        console.error(e);
        agroAlert('Error de conexión: ' + e.message, 'Error de Conexión', 'danger');
    }
}

// La función ensureModalFields se ha eliminado ya que el campo está ahora en el HTML de forma estática.

function openModalProtocolo() {
    const animalId = document.getElementById('selectAnimalSalud').value;
    if (!animalId) return agroAlert('Selecciona un animal primero', 'Atención', 'warning');

    document.getElementById('saludAnimalId').value = animalId;
    document.getElementById('saludRegistroId').value = '';
    document.getElementById('saludTipo').value = 'Vacunación';
    document.getElementById('saludDescripcion').value = '';
    document.getElementById('saludDescripcion').value = '';
    document.getElementById('saludVeterinario').value = '';
    document.getElementById('saludMedicamento').value = '';
    document.getElementById('saludDosis').value = '';

    // Configurar para fecha futura por defecto
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('saludFecha').value = now.toISOString().slice(0, 16);

    document.querySelector('#modalSalud h3').innerText = 'Programar Protocolo';
    document.querySelector('#modalSalud p').innerText = 'Programa una tarea o evento médico futuro';
    window.saludMode = 'protocolo'; // Marcador de modo
    document.getElementById('modalSalud').classList.remove('hidden');
}

function editSaludRegistro(id, tipo, descripcion, veterinario) {
    console.log("Editando registro historial:", { id, tipo, descripcion, veterinario });

    document.getElementById('saludRegistroId').value = id || '';
    document.getElementById('saludAnimalId').value = window.currentSaludId || '';

    const selectTipo = document.getElementById('saludTipo');
    // Mapeo básico para tipos antiguos o generados
    if (tipo === 'Consulta' || tipo === 'Revision') {
        selectTipo.value = 'Otro';
    } else {
        selectTipo.value = tipo || 'Vacunación';
    }

    document.getElementById('saludDescripcion').value = descripcion || '';
    document.getElementById('saludVeterinario').value = (veterinario === 'null' || !veterinario || veterinario === 'N/A') ? '' : veterinario;

    // El historial generalmente concatena med/dosis en la descripción. 
    // Intentamos extraerlos si tienen el formato [Med: X] [Dosis: Y]
    const medMatch = descripcion.match(/\[Med: (.*?)\]/);
    const doseMatch = descripcion.match(/\[Dosis: (.*?)\]/);

    document.getElementById('saludMedicamento').value = medMatch ? medMatch[1] : '';
    document.getElementById('saludDosis').value = doseMatch ? doseMatch[1] : '';

    document.getElementById('saludFecha').value = '';

    document.querySelector('#modalSalud h3').innerText = 'Ver Detalles de Historial';
    document.querySelector('#modalSalud p').innerText = 'Consulta o modifica este registro médico pasado';
    window.saludMode = 'historial';
    document.getElementById('modalSalud').classList.remove('hidden');
}

function editProtocolo(id, tipo, descripcion, fecha, veterinario, medicamento, dosis) {
    console.log("Editando protocolo:", { id, tipo, descripcion, fecha, veterinario, medicamento, dosis });

    document.getElementById('saludRegistroId').value = id || '';
    document.getElementById('saludAnimalId').value = window.currentSaludId || '';

    const selectTipo = document.getElementById('saludTipo');
    // Asegurar que el tipo exista en el select, si no, usar 'Otro'
    const options = Array.from(selectTipo.options).map(o => o.value);
    if (options.includes(tipo)) {
        selectTipo.value = tipo;
    } else if (tipo === 'Revisión Veterinaria' || tipo === 'Revision') {
        selectTipo.value = 'Chequeo';
    } else {
        selectTipo.value = 'Otro';
    }

    document.getElementById('saludDescripcion').value = descripcion || '';
    document.getElementById('saludVeterinario').value = (veterinario === 'null' || !veterinario || veterinario === 'N/A') ? '' : veterinario;
    document.getElementById('saludMedicamento').value = (medicamento === 'null' || !medicamento || medicamento === 'undefined' || medicamento === 'N/A') ? '' : medicamento;
    document.getElementById('saludDosis').value = (dosis === 'null' || !dosis || dosis === 'undefined' || dosis === 'N/A') ? '' : dosis;

    // Formato para input type="date": YYYY-MM-DD
    if (fecha) {
        document.getElementById('saludFecha').value = fecha.split(' ')[0];
    } else {
        document.getElementById('saludFecha').value = '';
    }

    document.querySelector('#modalSalud h3').innerText = 'Ver Detalles de Protocolo';
    document.querySelector('#modalSalud p').innerText = 'Consulta o reprograma esta tarea pendiente';
    window.saludMode = 'protocolo';
    document.getElementById('modalSalud').classList.remove('hidden');
}

/**
 * Aplica una plantilla predefinida al formulario de protocolos.
 * @param {string} templateId - ID de la plantilla.
 */
function applyProtocolTemplate(templateId) {
    const animalId = document.getElementById('selectAnimalSalud').value;
    if (!animalId) return agroAlert('Selecciona un animal primero', 'Requerido', 'warning');

    const templates = {
        'vacunacion_anual': {
            tipo: 'Vacunación',
            desc: 'Refuerzo anual multiactiva según calendario oficial.',
            vete: 'Dr. Veterinario',
            med: 'Vacuna Combinada',
            dosis: '5ml SC/IM'
        },
        'desparasitacion_trimestral': {
            tipo: 'Desparasitación',
            desc: 'Control de parásitos internos y externos preventivo.',
            vete: 'Personal de Campo',
            med: 'Ivermectina 1%',
            dosis: '1ml / 50kg'
        },
        'chequeo_reproductivo': {
            tipo: 'Revisión Veterinaria',
            desc: 'Ecografía diagnóstica y evaluación de condición uterina.',
            vete: 'Especialista Repro',
            med: 'N/A',
            dosis: 'Ref. Clínica'
        },
        'suplementacion_crecimiento': {
            tipo: 'Tratamiento',
            desc: 'Aporte de vitaminas ADE y minerales quelatados.',
            vete: 'Encargado Nutrición',
            med: 'Complejo Vitamínico',
            dosis: '10ml IM'
        }
    };

    const t = templates[templateId];
    if (!t) return;

    // Abrir el modal en modo protocolo
    openModalProtocolo();

    // Rellenar campos
    document.getElementById('saludTipo').value = t.tipo;
    document.getElementById('saludDescripcion').value = t.desc;
    document.getElementById('saludVeterinario').value = t.vete;
    document.getElementById('saludMedicamento').value = t.med;
    document.getElementById('saludDosis').value = t.dosis;

    // Notificación visual de plantilla aplicada
    const notify = document.createElement('div');
    notify.className = 'absolute top-10 right-10 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-xl z-[70] animate-bounce';
    notify.innerText = 'Plantilla aplicada con éxito';
    document.getElementById('modalSalud').appendChild(notify);
    setTimeout(() => notify.remove(), 2000);
}

function updateExpedienteCard(expediente) {
    const container = document.getElementById('expediente-info');
    const btn = document.getElementById('btn-action-expediente');

    if (!expediente) {
        container.innerHTML = '<p class="text-gray-400 italic">No hay historial médico creado.</p>';
        btn.innerHTML = '<i class="fas fa-plus mr-2"></i> Crear Historial Médico';
        btn.className = 'mt-4 w-full bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 transition';
        return;
    }

    container.innerHTML = `
        <p><strong>Tipo Sangre:</strong> ${expediente.tipo_sangre || 'N/D'}</p>
        <p><strong>Alergias:</strong> ${expediente.alergias}</p>
        <p><strong>Condiciones:</strong> ${expediente.condiciones_cronicas}</p>
        <p class="text-xs text-gray-400 mt-2">Act: ${expediente.ultima_actualizacion}</p>
    `;

    btn.innerHTML = '<i class="fas fa-edit mr-2"></i> Editar Historial Médico';
    btn.className = 'mt-4 w-full bg-blue-100 text-blue-700 py-2 rounded-lg font-bold hover:bg-blue-200 transition';
}

/**
 * Abre el modal para editar/crear el expediente médico (datos estáticos).
 */
function openModalExpediente() {
    const animalId = document.getElementById('selectAnimalSalud').value;
    if (!animalId) return agroAlert('Selecciona un animal primero', 'Atención', 'warning');

    document.getElementById('modalExpediente').classList.remove('hidden');

    // Pre-llenar si existe
    const exp = window.currentExpediente;
    if (exp) {
        document.getElementById('expTipoSangre').value = exp.tipo_sangre || '';
        document.getElementById('expAlergias').value = exp.alergias || '';
        document.getElementById('expCronicas').value = exp.condiciones_cronicas || '';
        document.getElementById('expGeneticos').value = exp.antecedentes_geneticos || '';
        document.getElementById('expNotas').value = exp.notas_generales || '';
    } else {
        // Limpiar inputs
        document.getElementById('expTipoSangre').value = '';
        document.getElementById('expAlergias').value = '';
        document.getElementById('expCronicas').value = '';
        document.getElementById('expGeneticos').value = '';
        document.getElementById('expNotas').value = '';
    }
}

function closeModalExpediente() {
    document.getElementById('modalExpediente').classList.add('hidden');
}

async function saveExpediente() {
    // Obtener ID del animal activo (prioridad global > selector de salud)
    const animalId = window.currentAnimalId || document.getElementById('selectAnimalSalud')?.value;

    if (!animalId) return agroAlert('Error: No hay animal seleccionado', 'Error', 'danger');

    // DESAFÍO DE CREDENCIALES
    const autorizado = await verifyActionPermission('veterinario', 'Actualización de Expediente Médico Base');
    if (!autorizado) return;

    const datos = {
        animal_id: parseInt(animalId),
        tipo_sangre: document.getElementById('expTipoSangre').value,
        alergias: document.getElementById('expAlergias').value,
        condiciones_cronicas: document.getElementById('expCronicas').value,
        antecedentes_geneticos: document.getElementById('expGeneticos').value,
        notas_generales: document.getElementById('expNotas').value
    };

    try {
        const res = await fetch('/api/salud/expediente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const result = await res.json();

        if (result.status === 'success') {
            closeModalExpediente();
            // Actualizar vista
            if (typeof loadSaludAnimal === 'function') {
                await loadSaludAnimal();
            }
            agroAlert('Historial médico guardado correctamente', 'Éxito', 'success');
            agroDesktopNotify('El expediente médico base ha sido actualizado correctamente.', 'Expediente Actualizado');
        } else {
            agroAlert('Error al guardar historial: ' + (result.error || 'Desconocido'), 'Error', 'danger');
        }
    } catch (e) {
        console.error(e);
        agroAlert('Error de conexión: ' + e.message, 'Error de Conexión', 'danger');
    }
}

async function evaluarLogica() {
    const expresion = document.getElementById('logicaExpresion').value;
    const variables = {
        peso: parseFloat(document.getElementById('varPeso').value) || 0,
        edad: parseFloat(document.getElementById('varEdad').value) || 0
    };
    const res = await fetch('/api/circuitos/logicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expresion, variables })
    });
    const result = await res.json();
    document.getElementById('logicaResultado').textContent = result.resultado !== undefined ? `Resultado: ${result.resultado}` : `Error: ${result.error}`;
}

// Funciones para cerrar modal después de acciones
function closeModalAndShowDetails(animalId) {
    // Cerrar el modal actual
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    if (modal) modal.remove();

    // Mostrar detalles del animal (puedes implementar esto)
    showDetails(animalId);
}

function exportHistorial(e) {
    // Prioridad: Animal en modal de detalles > Animal en pantalla de Salud > Último animal visto
    const animalId = (document.getElementById('modalDetails') && !document.getElementById('modalDetails').classList.contains('hidden'))
        ? window.currentAnimalId
        : (document.getElementById('selectAnimalSalud')?.value || window.currentSaludId || window.currentAnimalId);

    if (!animalId) return agroAlert('No se pudo identificar el animal para la exportación.', 'Error', 'danger');
    const btn = e ? e.currentTarget : null;
    downloadFileWithLoading(`/api/export/pdf/historial/${animalId}`, btn, "historial_medico");
}

/**
 * Carga información nutricional avanzada para el panel de Nutrición.
 * Muestra el plan activo y las recomendaciones.
 */
async function loadNutricionAvanzado() {
    const id = document.getElementById('selectAnimalNutricion').value;
    const actionBar = document.getElementById('nutricionActionBar');

    if (!id) {
        document.getElementById('nutricionContent').innerHTML = `
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center h-full flex flex-col items-center justify-center">
                <div class="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                    <i class="fas fa-utensils text-green-300 text-4xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Sin selección activa</h3>
                <p class="text-gray-400 max-w-sm mx-auto">Selecciona un animal de la lista o busca uno nuevo para ver y gestionar su plan nutricional.</p>
            </div>`;
        if (actionBar) actionBar.classList.add('hidden');
        return;
    }

    try {
        const res = await fetch(`/api/nutricion/plan/${id}`);
        const data = await res.json();

        if (data.planes && data.planes.length > 0) {
            const plan = data.planes[0];
            window.currentPlan = plan;

            // Mostrar barra de acciones
            if (actionBar) {
                actionBar.classList.remove('hidden');
                const btnEditar = actionBar.querySelector('button[onclick*="openModalNutricion"]');
                const btnExportar = actionBar.querySelector('button[onclick*="exportarPlanIndividual"]');
                if (btnEditar) btnEditar.innerHTML = `<i class="fas fa-edit"></i> Editar Plan`;
                if (btnExportar) btnExportar.style.display = 'flex';
            }

            document.getElementById('nutricionContent').innerHTML = `
                <div class="animate-fadeIn">
                    <h4 class="font-bold text-green-700 mb-4">Plan Nutricional Actual</h4>
                    <div class="bg-green-50 p-4 rounded-lg mb-4">
                        <p class="text-sm"><strong>Tipo:</strong> ${plan.tipo_alimentacion}</p>
                        <p class="text-sm"><strong>Forraje:</strong> ${plan.cantidad_forraje} kg/día</p>
                        <p class="text-sm"><strong>Concentrado:</strong> ${plan.cantidad_concentrado} kg/día</p>
                        ${plan.agua ? `<p class="text-sm"><strong>Agua:</strong> ${plan.agua}</p>` : ''}
                        ${plan.frecuencia ? `<p class="text-sm"><strong>Frecuencia:</strong> ${plan.frecuencia}</p>` : ''}
                        ${plan.suplementos ? `<p class="text-sm"><strong>Suplementos:</strong> ${plan.suplementos}</p>` : ''}
                        <p class="text-sm"><strong>Fecha:</strong> ${plan.fecha_inicio}</p>
                        ${plan.observaciones ? `<p class="text-sm text-gray-600 italic mt-2"><strong>Notas:</strong> ${plan.observaciones}</p>` : ''}
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h5 class="font-bold text-sm text-blue-800 mb-2">Recomendaciones Calculadas</h5>
                        <p class="text-sm"><strong>Forraje:</strong> ${data.nutricion_recomendada.forraje_verde} kg/día</p>
                        <p class="text-sm"><strong>Concentrado:</strong> ${data.nutricion_recomendada.concentrado} kg/día</p>
                        <p class="text-sm"><strong>Agua:</strong> ${data.nutricion_recomendada.agua || 'N/A'}</p>
                        <p class="text-sm"><strong>Frecuencia:</strong> ${data.nutricion_recomendada.frecuencia || 'N/A'}</p>
                        <p class="text-sm"><strong>Suplementos:</strong> ${data.nutricion_recomendada.suplementos.join(', ')}</p>
                        <p class="text-sm"><strong>Minerales:</strong> ${data.nutricion_recomendada.minerales}</p>
                        <p class="text-sm"><strong>Vitaminas:</strong> ${data.nutricion_recomendada.vitaminas}</p>
                        <p class="text-sm"><strong>Energía:</strong> ${data.nutricion_recomendada.energia_metabolizable} Mcal/día</p>
                    </div>
                </div>
        `;
        } else {
            window.currentPlan = null;
            // Mostrar barra de acciones (solo botón crear)
            if (actionBar) {
                actionBar.classList.remove('hidden');
                const btnEditar = actionBar.querySelector('button[onclick*="openModalNutricion"]');
                const btnExportar = actionBar.querySelector('button[onclick*="exportarPlanIndividual"]');
                if (btnEditar) btnEditar.innerHTML = `<i class="fas fa-plus"></i> Crear Plan`;
                if (btnExportar) btnExportar.style.display = 'none';
            }

            // Mostrar solo recomendaciones
            document.getElementById('nutricionContent').innerHTML = `
                <div class="animate-fadeIn">
                    <h4 class="font-bold text-blue-700 mb-4">Recomendaciones Nutricionales</h4>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm"><strong>Forraje:</strong> ${data.nutricion_recomendada.forraje_verde} kg/día</p>
                        <p class="text-sm"><strong>Concentrado:</strong> ${data.nutricion_recomendada.concentrado} kg/día</p>
                        <p class="text-sm"><strong>Agua:</strong> ${data.nutricion_recomendada.agua || 'N/A'}</p>
                        <p class="text-sm"><strong>Frecuencia:</strong> ${data.nutricion_recomendada.frecuencia || 'N/A'}</p>
                        <p class="text-sm"><strong>Suplementos:</strong> ${data.nutricion_recomendada.suplementos.join(', ')}</p>
                        <p class="text-sm"><strong>Minerales:</strong> ${data.nutricion_recomendada.minerales}</p>
                        <p class="text-sm"><strong>Vitaminas:</strong> ${data.nutricion_recomendada.vitaminas}</p>
                        <p class="text-sm"><strong>Energía:</strong> ${data.nutricion_recomendada.energia_metabolizable} Mcal/día</p>
                    </div>
                    <p class="text-gray-600 text-sm mt-2">No hay plan nutricional creado para este animal hoy.</p>
                </div>
        `;
        }
    } catch (error) {
        console.error('Error loading nutricion:', error);
        document.getElementById('nutricionContent').innerHTML = '<p class="text-red-500">Error al cargar información nutricional.</p>';
        if (actionBar) actionBar.classList.add('hidden');
    }
}

function openModalNutricion() {
    const animalId = document.getElementById('selectAnimalNutricion').value;
    if (!animalId) return;

    // Set modal title based on whether we're creating or editing
    const modalTitle = window.currentPlan ? 'Editar Plan Nutricional' : 'Crear Plan Nutricional';
    document.querySelector('#modalNutricion h3').innerText = modalTitle;

    // Get animal data
    fetch(`/api/animal/${animalId}`)
        .then(res => res.json())
        .then(animal => {
            window.currentAnimal = animal;
            document.getElementById('animalPesoActual').value = animal.peso;
        });

    if (window.currentPlan) {
        document.getElementById('planTipo').value = window.currentPlan.tipo_alimentacion;
        document.getElementById('planForraje').value = window.currentPlan.cantidad_forraje;
        document.getElementById('planConcentrado').value = window.currentPlan.cantidad_concentrado;
    } else {
        // Reset fields if no plan
        document.getElementById('planTipo').value = 'Pastoreo';
        document.getElementById('planForraje').value = '';
        document.getElementById('planConcentrado').value = '';
    }
    document.getElementById('modalNutricion').classList.remove('hidden');
}

function closeModalNutricion() {
    document.getElementById('modalNutricion').classList.add('hidden');
}

async function saveNutricionPlan() {
    const animal_id = document.getElementById('selectAnimalNutricion').value;
    const tipo = document.getElementById('planTipo').value;
    const forraje = document.getElementById('planForraje').value;
    const concentrado = document.getElementById('planConcentrado').value;

    if (!animal_id || !tipo || !forraje || !concentrado) {
        agroAlert('Llenar campos requeridos', 'Validación', 'warning');
        return;
    }

    // DESAFÍO DE CREDENCIALES
    const autorizado = await verifyActionPermission('gestionar_nutricion', 'Guardar Plan Nutricional');
    if (!autorizado) return;

    const data = {
        animal_id: parseInt(animal_id),
        tipo_alimentacion: tipo,
        cantidad_forraje: parseFloat(forraje),
        cantidad_concentrado: parseFloat(concentrado),
        agua: document.getElementById('planAgua')?.value || '',
        frecuencia: document.getElementById('planFrecuencia')?.value || '',
        suplementos: document.getElementById('planSuplementos')?.value || '',
        observaciones: document.getElementById('planObservaciones')?.value || ''
    };

    if (window.currentPlan) {
        data.id = window.currentPlan.id;
    }

    try {
        const planRes = await fetch('/api/plan-nutricional', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await planRes.json();

        if (planRes.ok) {
            closeModalNutricion();
            loadNutricionAvanzado();
            loadPlanesNutricionalesList();
            agroAlert('Plan nutricional guardado correctamente', 'Éxito', 'success');
        } else {
            console.error("Error al guardar plan:", result);
            agroAlert('Error al guardar plan nutricional: ' + (result.error || 'Desconocido'), 'Fallo', 'danger');
        }
    } catch (e) {
        console.error("Excepción en saveNutricionPlan (app.js):", e);
        agroAlert('Error de conexión: ' + e.message, 'Fallo', 'danger');
    }
}

function exportarPlanNutricional(e) {
    if (window.currentPlan && window.currentPlan.id) {
        const btn = e ? e.currentTarget : null;
        downloadFileWithLoading(`/api/export/pdf/plan/${window.currentPlan.id}`, btn, "plan_nutricional");
    } else {
        agroAlert('No hay plan activo para exportar', 'Atención', 'warning');
    }
}

function exportarTodosPlanesNutricionales(e) {
    const btn = e ? e.currentTarget : null;
    downloadFileWithLoading('/api/export/pdf/planes-nutricionales-todos', btn, "planes_nutricionales_completo");
}



async function loadPlanesNutricionalesList() {
    try {
        const res = await fetch('/api/planes-nutricionales-activos');
        const data = await res.json();

        if (data.length === 0) {
            document.getElementById('planesNutricionalesList').innerHTML = '<p class="text-gray-500 text-center py-4">No hay planes nutricionales activos.</p>';
            return;
        }

        const html = data.map(plan => `
            <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-bold text-green-700">Animal #${plan.animal_id} - ${plan.animal_info.especie} ${plan.animal_info.raza}</h4>
                        <p class="text-sm text-gray-600">Peso: ${plan.animal_info.peso} kg | Tipo: ${plan.tipo_alimentacion}</p>
                        <p class="text-sm text-gray-600">Forraje: ${plan.cantidad_forraje} kg/día | Concentrado: ${plan.cantidad_concentrado} kg/día</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editarPlanDesdeLista(${plan.id})"
                            class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button onclick="exportarPlanIndividual_Custom(${plan.id}, event)"
                            class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition">
                            <i class="fas fa-file-pdf"></i> PDF
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('planesNutricionalesList').innerHTML = html;
    } catch (error) {
        console.error('Error loading planes list:', error);
        document.getElementById('planesNutricionalesList').innerHTML = '<p class="text-red-500 text-center py-4">Error al cargar la lista de planes.</p>';
    }
}

/**
 * Función auxiliar para exportación desde la lista de planes
 */
function exportarPlanIndividual_Custom(id, event) {
    const btn = event.currentTarget;
    downloadFileWithLoading(`/api/export/pdf/plan-nutricional/${id}`, btn, "plan_nutricional");
}

function editarPlanDesdeLista(planId) {
    // Buscar el plan en la lista y abrir el modal con los datos
    fetch('/api/planes-nutricionales-activos')
        .then(res => res.json())
        .then(data => {
            const plan = data.find(p => p.id === planId);
            if (plan) {
                window.currentPlan = plan;
                window.currentAnimal = plan.animal_info;
                document.getElementById('animalPesoActual').value = plan.animal_info.peso;
                document.getElementById('planTipo').value = plan.tipo_alimentacion;
                document.getElementById('planForraje').value = plan.cantidad_forraje;
                document.getElementById('planConcentrado').value = plan.cantidad_concentrado;
                // Fill new fields if they exist in the form
                if (document.getElementById('planAgua')) document.getElementById('planAgua').value = plan.agua || '';
                if (document.getElementById('planFrecuencia')) document.getElementById('planFrecuencia').value = plan.frecuencia || '';
                if (document.getElementById('planSuplementos')) document.getElementById('planSuplementos').value = plan.suplementos || '';
                if (document.getElementById('planObservaciones')) document.getElementById('planObservaciones').value = plan.observaciones || '';
                document.getElementById('modalNutricion').classList.remove('hidden');
            }
        });
}


// ============= INTERACCIONES DASHBOARD =============

function showAlertas() {
    // Redirigir a la sección de salud para ver protocolos pendientes
    showSection('salud');
    // Opcional: Podríamos filtrar automáticamente o mostrar un mensaje
    setTimeout(() => {
        document.getElementById('activeProtocolsGrid').scrollIntoView({ behavior: 'smooth' });
        // Simular filtro visual o notificación
        agroAlert('Mostrando protocolos pendientes y animales en observación', 'Vista Actualizada', 'info');
    }, 500);
}

function showSaludCritica() {
    showSection('salud');
    setTimeout(() => {
        // Opcional: Filtrar lista o scroll a sección relevante
        agroAlert('Mostrando animales con estado de salud crítico/enfermo', 'Vista Actualizada', 'info');
    }, 500);
}



/**
 * Recarga los contadores del dashboard llamando a la API
 */
async function loadDashboard() {
    try {
        const res = await fetch('/api/estadisticas');
        if (!res.ok) throw new Error('Error al cargar estadísticas');
        const stats = await res.json();

        const pEl = document.getElementById('poblacion');
        if (pEl && poblacionViewMode === 'total') {
            pEl.innerText = stats.poblacion;
        }

        const pwEl = document.getElementById('peso_avg');
        if (pwEl && pesoViewMode === 'general') {
            pwEl.innerHTML = `${stats.peso_avg} <span class="text-lg text-gray-400 font-bold">kg</span>`;
        }

        // Update Alertas
        const aEl = document.getElementById('alertas');
        if (aEl && alertasViewMode === 'count') {
            aEl.innerText = stats.alertas;
        } else if (aEl) {
            // Si está en modo lista, forzamos re-render para reflejar cambios en el detalle
            const currentMode = alertasViewMode;
            alertasViewMode = 'count'; // Reset temporal para que toggle detecte el cambio
            toggleAlertasDetail();
        }

        // Update Alertas Subtitle and Badge (Always update these)
        const aSubtitle = document.getElementById('alertas-subtitle');
        if (aSubtitle) {
            aSubtitle.textContent = stats.inv_critico > 0 ? 'Insumos y tareas pendientes' : 'Protocolos por realizar';
        }
        const aBadge = document.getElementById('badge-inventario');
        if (aBadge) {
            aBadge.innerHTML = stats.inv_critico > 0 ? `
                <div class="absolute right-0 top-0 bg-yellow-500 text-white text-[0.5625rem] font-black px-3 py-1 rounded-bl-xl shadow-sm animate-pulse whitespace-nowrap">
                    ${stats.inv_critico} INSUMOS BAJOS
                </div>` : '';
        }

        // Update Criticos
        const cEl = document.getElementById('criticos');
        if (cEl && criticosViewMode === 'count') {
            cEl.innerText = stats.criticos;
        } else if (cEl) {
            // Si está en modo lista, forzamos re-render para reflejar cambios en el detalle
            const currentMode = criticosViewMode;
            criticosViewMode = 'count'; // Reset temporal
            toggleCriticosDetail();
        }

        // Update Criticos Subtitle and Badge (Always update these)
        const cSubtitle = document.getElementById('criticos-subtitle');
        if (cSubtitle) {
            cSubtitle.innerHTML = stats.desparasitacion > 0 ?
                '<span class="text-red-700 font-bold"><i class="fas fa-exclamation-triangle mr-1"></i> Requieren desparasitación</span>' :
                'Requieren revisión médica';
        }
        const cBadge = document.getElementById('badge-tratamientos');
        if (cBadge) {
            cBadge.innerHTML = stats.desparasitacion > 0 ? `
                <div class="absolute -right-2 -top-2 bg-red-600 text-white text-[0.625rem] font-black px-4 py-3 rotate-12 shadow-lg animate-pulse whitespace-nowrap z-10">
                    ${stats.desparasitacion} TRATAMIENTOS
                </div>` : '';
        }

        // Manejo visual de alertas
        const alertasCard = document.getElementById('card-alertas');
        if (alertasCard && stats.alertas > 0) {
            alertasCard.classList.add('animate-pulse');
        } else if (alertasCard) {
            alertasCard.classList.remove('animate-pulse');
        }

    } catch (error) {
        console.error("Dashboard update failed:", error);
    }
}

// Iniciar carga al abrir
// Inicializador duplicado eliminado. Ver initApp() al final.

// ============= ZONA DE MATERNIDAD =============

/**
 * GESTIÓN DE MATERNIDAD Y REPRODUCCIÓN:
 * Filtra el rebaño para identificar ejemplares hembras y su estado reproductivo.
 * 
 * @reason El ciclo reproductivo es el motor económico de la finca; requiere seguimiento especializado.
 * @workflow
 * 1. Cruza datos de 'Ganado' con 'Planes de Maternidad' activos.
 * 2. Aplica filtros inteligentes (no es lo mismo "Saludable" que "Gestante").
 * 3. Renderiza una tabla con indicadores visuales (badges) sobre el tipo de plan activo.
 */
async function loadMaternityAnimals() {
    const estadoFiltro = document.getElementById('filterMaternidadEstado').value;

    // Optimizamos cargando solo hembras desde el servidor
    const res = await fetch('/api/ganado?sexo=Hembra');
    const animales = await res.json();

    // Iniciar con la lista de planes activos para cruzar datos
    const resPlanes = await fetch('/api/maternidad/planes-activos');
    const planesActivos = await resPlanes.json();

    let filtrados = animales;

    // Filtrar por estado si no es "todos"
    if (estadoFiltro !== 'todos') {
        if (estadoFiltro === 'Saludable') {
            filtrados = filtrados.filter(a => !['Gestante', 'Lactancia', 'Parto Reciente', 'Secado'].includes(a.estado));
        } else {
            filtrados = filtrados.filter(a => a.estado === estadoFiltro);
        }
    }

    const tbody = document.getElementById('maternidadTableBody');
    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-400 italic">No se encontraron animales que coincidan con el filtro.</td></tr>';
        return;
    }

    tbody.innerHTML = filtrados.map(a => {
        const plan = planesActivos.find(p => p.animal_id === a.id);
        const planBadge = plan ?
            `<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-[10px] font-black uppercase"><i class="fas fa-file-medical mr-1"></i> ${plan.tipo_plan}</span>` :
            '<span class="text-gray-300 text-[10px]">Sin plan activo</span>';

        return `
        <tr class="hover:bg-pink-50/50 transition cursor-pointer group" onclick="selectMaternityAnimal(${a.id})">
            <td class="p-4">
                <div class="font-black text-gray-800">#${a.id}</div>
                <div class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">${a.raza} (${a.especie})</div>
            </td>
            <td class="p-4">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getMaternityStatusColor(a.estado)}">
                    ${a.estado}
                </span>
            </td>
            <td class="p-4">
                ${planBadge}
            </td>
            <td class="p-4 text-right">
                <button class="bg-white border text-pink-500 hover:bg-pink-500 hover:text-white p-2 rounded-xl transition shadow-sm opacity-0 group-hover:opacity-100">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </td>
        </tr>
    `;
    }).join('');

    // Al cargar la lista, también cargamos el resumen de planes
    loadMaternityPlanesList();
}

/**
 * VISTA CONSOLIDADA DE PLANES:
 * Muestra tarjetas informativas de los procesos de maternidad en curso.
 * 
 * @reason Permite al administrador prever fechas de parto y necesidades de personal.
 * @logic Calcula fechas probables y muestra recomendaciones veterinarias críticas
 *        directamente en el panel principal de maternidad.
 */
async function loadMaternityPlanesList() {
    try {
        const res = await fetch('/api/maternidad/planes-activos');
        const planes = await res.json();
        const container = document.getElementById('maternityPlanesList');

        if (planes.length === 0) {
            container.innerHTML = '<div class="text-center py-10 opacity-40"><i class="fas fa-clipboard-list text-3xl mb-2"></i><p class="text-sm">No hay planes de seguimiento activos.</p></div>';
            return;
        }

        container.innerHTML = planes.map(p => `
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition border-l-4 border-purple-400">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-black text-gray-800 text-lg">Animal #${p.animal_id} <span class="text-sm font-normal text-gray-400 ml-2">${p.animal_info.raza}</span></h4>
                        <p class="text-xs font-bold text-purple-600 uppercase tracking-widest">${p.tipo_plan}</p>
                    </div>
                    <button onclick="selectMaternityAnimal(${p.animal_id})" class="text-gray-400 hover:text-purple-600 p-2"><i class="fas fa-external-link-alt"></i></button>
                </div>
                <div class="grid grid-cols-2 gap-4 text-[11px] mb-4">
                    <div class="bg-gray-50 p-2 rounded-lg">
                        <p class="text-gray-400 uppercase font-black mb-1">Inicio</p>
                        <p class="text-gray-700 font-bold">${p.fecha_inicio}</p>
                    </div>
                    ${p.fecha_probable_parto ? `
                    <div class="bg-pink-50 p-2 rounded-lg">
                        <p class="text-pink-400 uppercase font-black mb-1">P. Parto</p>
                        <p class="text-pink-700 font-bold">${p.fecha_probable_parto}</p>
                    </div>` : ''}
                </div>
                ${p.recomendaciones_veterinarias ? `
                <div class="bg-yellow-50/50 p-3 rounded-xl mb-2 border border-yellow-100">
                    <p class="text-[10px] font-black text-yellow-700 uppercase mb-1"><i class="fas fa-user-md mr-1"></i> Indicación Veterinaria</p>
                    <p class="text-xs text-gray-600 italic">"${p.recomendaciones_veterinarias}"</p>
                </div>` : ''}
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

function getMaternityStatusColor(estado) {
    switch (estado) {
        case 'Gestante': return 'bg-purple-100 text-purple-700';
        case 'Lactancia': return 'bg-blue-100 text-blue-700';
        case 'Parto Reciente': return 'bg-red-100 text-red-700';
        case 'Secado': return 'bg-orange-100 text-orange-700';
        case 'Saludable': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

/**
 * Muestra recomendaciones y prepara formulario de actualización al seleccionar un animal.
 */
async function selectMaternityAnimal(id) {
    const res = await fetch(`/api/animal/${id}`);
    const animal = await res.json();

    // Obtener plan si existe
    const resPlan = await fetch(`/api/maternidad/plan/${id}`);
    const plan = await resPlan.json();

    document.getElementById('selectedMaternityAnimalIdStatus').value = animal.id;
    window.currentMaternityAnimal = animal;

    // Sincronizar el selector principal si existe
    const mainSelector = document.getElementById('selectAnimalSalud');
    if (mainSelector && mainSelector.value != id) {
        mainSelector.value = id;
    }

    // Generar recomendaciones potenciadas
    renderMaternityRecommendations(animal, plan);

    // Mostrar panel de acciones rápidas
    document.getElementById('maternityQuickActions').classList.remove('hidden');

    // Scroll a las recomendaciones para feedback visual en móvil
    if (window.innerWidth < 1024) {
        document.getElementById('maternidadRecomendaciones').scrollIntoView({ behavior: 'smooth' });
    }
}

function renderMaternityRecommendations(animal, plan) {
    const recBox = document.getElementById('maternidadRecomendaciones');
    const recs = getMaternityRecommendations(animal);
    const isGestante = animal.estado === 'Gestante';

    // Agrupar recomendaciones por categoría para mayor orden visual
    const groups = recs.reduce((acc, r) => {
        if (!acc[r.category]) acc[r.category] = [];
        acc[r.category].push(r);
        return acc;
    }, {});

    const categoryConfig = {
        'nutricion': { label: 'Nutrición', icon: 'fa-apple-alt', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
        'salud': { label: 'Salud', icon: 'fa-heartbeat', color: 'rose', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
        'manejo': { label: 'Manejo', icon: 'fa-tasks', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
        'ambiente': { label: 'Ambiente', icon: 'fa-sun', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
        'alerta': { label: 'Atención Crítica', icon: 'fa-exclamation-triangle', color: 'red', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
    };

    let planHtml = '';
    if (plan && !plan.error) {
        planHtml = `
            <div class="mt-6 p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-purple-200 animate-fadeIn relative overflow-hidden">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <div class="flex items-center gap-3 mb-4 relative z-10">
                    <div class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                        <i class="fas fa-calendar-check text-lg"></i>
                    </div>
                    <div>
                        <span class="text-[10px] font-black uppercase opacity-80 tracking-widest leading-none">Seguimiento Activo</span>
                        <h5 class="font-bold text-base leading-none">Plan de ${plan.tipo_plan}</h5>
                    </div>
                </div>
                ${plan.fecha_probable_parto ? `
                <div class="flex justify-between items-end relative z-10">
                    <div>
                        <p class="text-[10px] font-black uppercase opacity-60">Fecha Probable Parto</p>
                        <p class="text-2xl font-black tracking-tight">${plan.fecha_probable_parto}</p>
                    </div>
                    <div class="text-right">
                         <p class="text-[10px] font-black uppercase opacity-60">Inicio</p>
                         <p class="text-xs font-bold">${plan.fecha_inicio}</p>
                    </div>
                </div>` : ''}
            </div>
        `;
    }

    let recsHtml = Object.entries(groups).map(([cat, items]) => {
        const config = categoryConfig[cat] || categoryConfig['manejo'];
        return `
            <div class="mb-8 last:mb-0">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 ${config.bg} ${config.text} rounded-xl flex items-center justify-center text-sm shadow-sm ring-4 ring-white">
                        <i class="fas ${config.icon}"></i>
                    </div>
                    <h5 class="font-black text-xs uppercase tracking-[0.2em] text-gray-400">${config.label}</h5>
                </div>
                <div class="grid grid-cols-1 gap-3">
                    ${items.map(r => `
                        <div class="flex items-start gap-4 p-4 ${config.bg} ${config.border} border-2 rounded-[1.25rem] transition hover:translate-x-1 duration-300 group">
                            <div class="mt-1 w-6 h-6 flex items-center justify-center rounded-lg bg-white/50">
                                <i class="fas ${r.icon} ${config.text} text-xs"></i>
                            </div>
                            <p class="text-[13px] ${config.text} font-semibold leading-relaxed">${r.text}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    recBox.innerHTML = `
        <div class="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 animate-slideIn">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200 ring-4 ring-rose-50">
                        <i class="fas ${animal.especie === 'Bovino' ? 'fa-cow' : 'fa-paw'} text-2xl"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h4 class="font-black text-gray-800 text-2xl tracking-tight">Animal #${animal.id}</h4>
                            <span class="px-3 py-1 bg-pink-50 text-pink-600 rounded-full font-black text-[10px] uppercase tracking-wider border border-pink-100">${animal.estado}</span>
                        </div>
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">${animal.raza} • ${animal.peso} kg • ${animal.edad}m</p>
                    </div>
                </div>
            </div>
            
            <div class="custom-scrollbar pr-2">
                ${recsHtml}
            </div>

            ${planHtml}
            
            ${isGestante && (!plan || plan.error) ? `
                <div class="mt-6 p-4 bg-red-50 border-2 border-dashed border-red-200 rounded-2xl flex items-center gap-3">
                    <div class="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div>
                        <p class="text-[10px] text-red-600 font-black uppercase leading-none mb-1">Requiere Seguimiento</p>
                        <p class="text-xs text-red-800 font-bold leading-tight">Gestación detectada sin plan activo. Inicie un protocolo ahora.</p>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Modales Maternidad
function openModalMaternityPlan() {
    const animal = window.currentMaternityAnimal;
    if (!animal) return;

    // Configurar fechas por defecto si es gestante
    if (animal.estado === 'Gestante') {
        document.getElementById('matPlanTipo').value = 'Gestación';
        // Calcular fecha probable (Simplificado - varía por especie)
        const dpp = new Date();
        const diasPorEspecie = { 'Bovino': 283, 'Ovino': 150, 'Caprino': 150, 'Porcino': 114, 'Equino': 336 };
        dpp.setDate(dpp.getDate() + (diasPorEspecie[animal.especie] || 0));
        document.getElementById('matPlanFechaParto').value = dpp.toISOString().slice(0, 10);
    } else if (animal.estado === 'Lactancia') {
        document.getElementById('matPlanTipo').value = 'Lactancia';
        document.getElementById('matPlanFechaParto').value = '';
    }

    document.getElementById('modalMaternityPlan').classList.remove('hidden');
}

function closeModalMaternityPlan() {
    document.getElementById('modalMaternityPlan').classList.add('hidden');
}

async function saveMaternityPlan() {
    const animal = window.currentMaternityAnimal;
    if (!animal) return;

    // DESAFÍO DE CREDENCIALES
    const autorizado = await verifyActionPermission('veterinario', `Autorizar Plan de ${document.getElementById('matPlanTipo').value}`);
    if (!autorizado) return;

    const body = {
        animal_id: animal.id,
        tipo_plan: document.getElementById('matPlanTipo').value,
        fecha_probable_parto: document.getElementById('matPlanFechaParto').value,
        recomendaciones: document.getElementById('matPlanRecomendaciones').value,
        observaciones: document.getElementById('matPlanObservaciones').value
    };

    try {
        const res = await fetch('/api/maternidad/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await res.json();

        if (res.ok) {
            closeModalMaternityPlan();
            agroAlert(`Plan de ${body.tipo_plan} para el animal #${animal.id} guardado con éxito. Se han generado protocolos automáticos de seguimiento.`, 'Plan Creado', 'success');

            // Recargar datos
            loadMaternityAnimals();
            // Pequeño delay para que el re-render de la tabla termine
            setTimeout(() => selectMaternityAnimal(animal.id), 300);
        } else {
            agroAlert(result.error || 'No se pudo guardar el plan.', 'Error', 'danger');
        }
    } catch (e) {
        console.error(e);
        agroAlert('Error de conexión al servidor.', 'Error', 'danger');
    }
}

function openModalUpdateStatus() {
    const animal = window.currentMaternityAnimal;
    if (!animal) return;
    document.getElementById('updateMaternityStatus').value = animal.estado;
    document.getElementById('modalUpdateMaternityStatus').classList.remove('hidden');
}

function closeModalUpdateStatus() {
    document.getElementById('modalUpdateMaternityStatus').classList.add('hidden');
}

async function updateMaternityState() {
    const animal = window.currentMaternityAnimal;
    if (!animal) return;
    const nuevoEstado = document.getElementById('updateMaternityStatus').value;

    const confirmacion = await agroConfirm(`¿Cambiar el estado del animal #${animal.id} a "${nuevoEstado}"? Esto refrescará las recomendaciones de IA.`, 'Confirmar Cambio', 'maternidad');
    if (!confirmacion) return;

    // DESAFÍO DE CREDENCIALES
    const autorizado = await verifyActionPermission('veterinario', `Autorizar cambio de estado a ${nuevoEstado}`);
    if (!autorizado) return;

    try {
        const res = await fetch('/api/animal/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: animal.id, status: nuevoEstado })
        });
        const result = await res.json();

        if (res.ok) {
            closeModalUpdateStatus();

            // Notificación visual rápida
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-8 right-8 bg-pink-600 text-white px-6 py-3 rounded-2xl shadow-2xl z-[70] animate-bounce';
            toast.innerHTML = `<i class="fas fa-sync mr-2"></i> Estado actualizado a "${nuevoEstado}"`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

            loadMaternityAnimals(); // Recargar lista
            // Refrescar animal actual en el objeto global
            animal.estado = nuevoEstado;
            selectMaternityAnimal(animal.id); // Recargar recomendaciones
        } else {
            agroAlert(result.error || 'Error al actualizar estado.', 'Error', 'danger');
        }
    } catch (e) {
        console.error(e);
        agroAlert('Error de conexión.', 'Error', 'danger');
    }
}

function getMaternityRecommendations(animal) {
    const { especie, estado, raza, edad, peso } = animal;
    const recs = [];
    const razaLower = (raza || '').toLowerCase();
    const edadMeses = parseInt(edad) || 0;
    const pesoKg = parseFloat(peso) || 0;

    // --- 1. BOVINOS (ESPECIFICIDAD DE ELITE) ---
    if (especie === 'Bovino') {
        if (razaLower.includes('holstein') || razaLower.includes('jersey')) {
            recs.push({ category: 'nutricion', icon: 'fa-vial', text: 'Dieta de transición: Suministrar sales aniónicas 21-15 días antes del parto para evitar hipocalcemia.' });
            recs.push({ category: 'salud', icon: 'fa-thermometer-half', text: 'Monitorear vacas lecheras post-parto: Riesgo de desplazamiento de abomaso en las primeras 48h.' });
            if (estado === 'Lactancia') recs.push({ category: 'nutricion', icon: 'fa-percentage', text: 'Balancear proteína degradable y bypass para optimizar el pico de lactancia sin perder masa muscular.' });
        }
        if (razaLower.includes('angus') || razaLower.includes('hereford')) {
            recs.push({ category: 'manejo', icon: 'fa-expand-arrows-alt', text: 'Zonas de parto limpias y secas: Estas razas suelen parir en praderas; asegurar refugios contra lluvia/viento.' });
            if (estado === 'Gestante') recs.push({ category: 'nutricion', icon: 'fa-leaf', text: 'Controlar ingestión de silaje en último tercio: Evitar sobrecrecimiento del feto para prevenir distocias.' });
        }
        if (razaLower.includes('brahman') || razaLower.includes('nelore')) {
            recs.push({ category: 'ambiente', icon: 'fa-wind', text: 'Ventilación y sombra: El estrés térmico en Bos Indicus gestantes reduce el peso al nacer de la cría.' });
            recs.push({ category: 'salud', icon: 'fa-eye', text: 'Vigilar retención de placenta: Mayor incidencia reportada en climas tropicales húmedos.' });
        }
    }

    // --- 2. PORCINOS (ALTA PRECISIÓN) ---
    else if (especie === 'Porcino') {
        recs.push({ category: 'ambiente', icon: 'fa-temperature-high', text: 'Microclima: Cerda a 20°C, Lechones a 32°C. Usar tapetes térmicos o lámparas infrarrojas.' });
        if (razaLower.includes('yorkshire') || razaLower.includes('phetrain')) {
            recs.push({ category: 'manejo', icon: 'fa-piggy-bank', text: 'Supervisión de camada: Razas hiperprolíficas requieren transferencias rápidas si la cerda no tiene pezones suficientes.' });
        }
        if (estado === 'Parto Reciente') recs.push({ category: 'nutricion', icon: 'fa-tint', text: 'Consumo de agua: La cerda lactante requiere mín. 40 litros/día; el flujo debe ser de 2 litros/min.' });
        recs.push({ category: 'salud', icon: 'fa-shield-virus', text: 'Desinfección umbilical: Curar con yodo al 10% para prevenir onfalitis y poliartritis neonatal.' });
    }

    // --- 3. EQUINOS (RECOMENDACIONES DE VALOR) ---
    else if (especie === 'Equino') {
        recs.push({ category: 'manejo', icon: 'fa-door-open', text: 'Habituación: Mover a la yegua al box de parto 4 semanas antes para que genere anticuerpos locales para el calostro.' });
        recs.push({ category: 'salud', icon: 'fa-microscope', text: 'Test de Calostro: Evaluar calidad del calostro (BRIX > 23%) antes de permitir que el potrillo amamante.' });
        if (estado === 'Gestante') recs.push({ category: 'nutricion', icon: 'fa-mortar-pestle', text: 'Suplementar con Vitamina E y Selenio: Crucial para la transferencia de inmunidad y salud muscular del potro.' });
    }

    // --- 4. OVINOS / CAPRINOS (PEQUEÑOS RUMIANTES) ---
    else if (especie === 'Ovino' || especie === 'Caprino') {
        recs.push({ category: 'nutricion', icon: 'fa-bolt', text: 'Toxemia de la gestación: Ofrecer concentrado energético 4 semanas pre-parto si se esperan crías múltiples.' });
        if (razaLower.includes('saanen') || razaLower.includes('alpina')) {
            recs.push({ category: 'salud', icon: 'fa-pump-medical', text: 'Mastitis caprina: En cabras lecheras, realizar el sellado de pezones es obligatorio tras cada amamantamiento.' });
        }
        recs.push({ category: 'ambiente', icon: 'fa-home', text: 'Laming/Kidding Pens: Separar madres con crías durante las primeras 72h para fortalecer el vínculo materno-filial.' });
    }

    // --- 5. LÓGICA POR EDAD Y PESO (CRITERIO TÉCNICO) ---
    if (edadMeses < 20) {
        recs.push({ category: 'alerta', icon: 'fa-baby-carriage', text: 'Primípara muy joven: El crecimiento fetal competirá con su desarrollo. Incrementar 20% el aporte proteico.' });
    } else if (edadMeses > 120) {
        recs.push({ category: 'alerta', icon: 'fa-hourglass-end', text: 'Multípara Senior: Riesgo elevado de prolapso uterino y debilidad ósea tras el parto.' });
    }

    if (pesoKg > (especie === 'Bovino' ? 750 : 250) && estado === 'Gestante') {
        recs.push({ category: 'alerta', icon: 'fa-weight-hanging', text: 'Sobrepeso crítico: La acumulación de grasa en el canal de parto dificulta la salida natural del producto.' });
    }

    return recs;
}

async function completarProtocolo(id) {
    const confirmacion = await agroConfirm('¿Marcar este protocolo como REALIZADO? Se añadirá automáticamente al historial clínico del animal.', 'Completar Protocolo', 'salud');
    if (!confirmacion) return;

    // DESAFÍO DE CREDENCIALES
    const autorizado = await verifyActionPermission('veterinario', 'Autorizar cierre de Protocolo Médico');
    if (!autorizado) return;

    try {
        const res = await fetch(`/api/salud/protocolo/completar/${id}`, { method: 'POST' });
        if (res.ok) {
            loadSaludAnimal(); // Recargar vista
            loadDashboard(); // Actualizar alertas
            agroDesktopNotify('El protocolo ha sido completado y movido al historial médico.', 'Protocolo Realizado');
        } else {
            agroAlert('Error al completar protocolo', 'Error', 'danger');
        }
    } catch (e) {
        console.error(e);
        agroAlert('Error de conexión', 'Error', 'danger');
    }
}

async function dischargeAnimal(id) {
    const confirmacion = await agroConfirm('¿Confirmar ALTA MÉDICA de este ejemplar? Su estado cambiará a "Saludable" y se registrará en el historial.', 'Dar de Alta', 'salud');
    if (!confirmacion) return;

    // DESAFÍO DE CREDENCIALES
    const autorizado = await verifyActionPermission('veterinario', 'Autorizar Alta Médica');
    if (!autorizado) return;

    try {
        const res = await fetch('/api/animal/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, status: 'Saludable' })
        });

        if (res.ok) {
            // Registrar en historial médico
            await fetch('/api/salud/agregar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    animal_id: id,
                    tipo: 'Chequeo General',
                    descripcion: 'ALTA MÉDICA: El animal ha superado su condición y se reincorpora al rebaño saludable.',
                    veterinario: 'Sistema'
                })
            });

            window.allAnimals = null;
            loadSaludAnimal(); // Recargar vista
            loadDashboard(); // Actualizar alertas
            agroAlert('El animal ha sido dado de alta correctamente.', 'Alta Exitosa', 'success');
        } else {
            agroAlert('Error al dar de alta', 'Error', 'danger');
        }
    } catch (e) {
        console.error(e);
        agroAlert('Error de conexión', 'Error', 'danger');
    }
}

async function eliminarProtocolo(id) {
    const confirmacion = await agroConfirm('¿Estás seguro de eliminar este protocolo programado?', 'Eliminar Protocolo', 'delete');
    if (!confirmacion) return;
    try {
        const res = await fetch(`/api/salud/protocolo/eliminar/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadSaludAnimal();
        } else {
            agroAlert('Error al eliminar', 'Error', 'danger');
        }
    } catch (e) {
        console.error(e);
        agroAlert('Error de conexión', 'Error', 'danger');
    }
}

async function checkUpcomingProtocols() {
    try {
        const res = await fetch('/api/protocolos/hoy');
        const protocols = await res.json();

        if (protocols && protocols.length > 0) {
            const count = protocols.length;
            const message = `Tienes ${count} protocolo(s) de salud programado(s) para hoy. Por favor, revisa la sección de salud.`;
            agroDesktopNotify(message, 'Recordatorio de Protocolos');
        }
    } catch (e) {
        console.error("Error al verificar protocolos pendientes:", e);
    }
}

/**
 * Sistema de Verificación de Credenciales para Acciones Críticas
 * @param {string} permiso - El permiso o rol requerido (ej: 'eliminar_ganado', 'veterinario')
 * @param {string} mensaje - Mensaje a mostrar en el desafío
 */
async function verifyActionPermission(permiso, mensaje) {
    // 1. Mostrar desafío de usuario/clave
    const credenciales = await agroChallenge(mensaje, 'Verificación Requerida', 'danger');
    if (!credenciales) return false;

    // 2. Validar con el servidor
    try {
        const res = await fetch('/api/auth/verify_action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...credenciales, permiso })
        });

        const result = await res.json();
        if (res.ok && result.status === 'success') {
            console.info(`Autorizado por: ${result.user}`);
            return true;
        } else {
            agroAlert(result.error || 'No tienes permiso para esta acción', 'Acceso Denegado', 'danger');
            return false;
        }
    } catch (e) {
        console.error(e);
        agroAlert('Error al conectar con la verificación de seguridad', 'Error Crítico', 'danger');
        return false;
    }
}

// Sistema de Cierre de Sesión con Confirmación
async function confirmLogout() {
    const confirmed = await agroConfirm('¿Estás seguro de que deseas cerrar la sesión? Se perderán los cambios no guardados.', 'Cerrar Sesión', 'danger');
    if (confirmed) {
        // Mostrar cortina de transición premium
        const curtain = document.getElementById('page-curtain');
        const curtainText = document.getElementById('curtain-text');

        if (curtain) {
            if (curtainText) curtainText.innerText = 'CERRANDO SESIÓN...';
            curtain.classList.remove('reveal'); // Vuelve a mostrar la cortina (index.html had 'reveal' class added on load)
            curtain.style.pointerEvents = 'all'; // Bloquear interacciones
        }

        // Simular un pequeño delay para que se vea la animación fluida antes de redirigir
        setTimeout(() => {
            window.location.href = '/logout';
        }, 800);
    }
}

// Inicialización de componentes globales al cargar el documento
// PUNTO DE ENTRADA ÚNICO
document.addEventListener('DOMContentLoaded', initApp);

window.auditCurrentPage = 1;
window.auditTotalPages = 1;
window.auditActiveTab = 'poblacion';

async function loadAuditoria(page = 1, tab = null) {
    if (tab) window.auditActiveTab = tab;
    window.auditCurrentPage = page;

    const currentTab = window.auditActiveTab;

    try {
        const fetchUrl = currentTab === 'errores'
            ? `/api/auditoria/errores?page=${page}&per_page=15`
            : `/api/auditoria/cambios?tab=${currentTab}&page=${page}&per_page=15`;

        const res = await fetch(fetchUrl);
        const data = await res.json();

        // Actualizar UI de paginación
        if (data.items) {
            window.auditTotalPages = data.pages;
            updateAuditPaginationUI(data);
        }

        if (currentTab === 'errores') {
            renderAuditErrors(data);
        } else if (currentTab === 'medicos') {
            renderAuditMedicos(data);
        } else if (currentTab === 'insumos') {
            renderAuditInsumos(data);
        } else if (currentTab === 'nutricionales') {
            renderAuditNutricion(data);
        } else {
            renderAuditPoblacion(data);
        }
    } catch (e) {
        console.error(e);
        agroToast('Error al cargar datos de auditoría', 'danger');
    }
}

function updateAuditPaginationUI(data) {
    const isError = window.auditActiveTab === 'errores';
    const prefix = isError ? 'auditErrores' : 'auditCambios';

    const info = document.getElementById(`${prefix}PaginationInfo`);
    const btnPrev = document.getElementById(isError ? 'btnPrevAuditError' : 'btnPrevAudit');
    const btnNext = document.getElementById(isError ? 'btnNextAuditError' : 'btnNextAudit');

    if (info) {
        info.innerText = `Página ${data.current_page} de ${data.pages} (Total: ${data.total} registros)`;
    }

    if (btnPrev) btnPrev.disabled = data.current_page <= 1;
    if (btnNext) btnNext.disabled = data.current_page >= data.pages;
}

function changeAuditPage(delta) {
    const newPage = window.auditCurrentPage + delta;
    if (newPage >= 1 && newPage <= window.auditTotalPages) {
        loadAuditoria(newPage);
    }
}

function renderAuditPoblacion(data) {
    const cambios = data.items || data;
    const tbody = document.getElementById('auditChangesTableBody');
    if (!tbody) return;
    if (!cambios || cambios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-12 text-center text-gray-400 italic">No hay registros de cambios recientes.</td></tr>';
        return;
    }
    tbody.innerHTML = cambios.map(c => {
        let actionColor = 'bg-gray-50 text-gray-600';
        let actionIcon = 'fa-pen';
        const accion = c.accion || 'EDIT'; // Default to EDIT for legacy records

        if (accion === 'ADD') {
            actionColor = 'bg-green-100 text-green-600';
            actionIcon = 'fa-plus';
        } else if (accion === 'DELETE') {
            actionColor = 'bg-red-100 text-red-600';
            actionIcon = 'fa-trash';
        }

        // Display logic for deleted animals
        let animalDisplay = c.animal_id ? 'ANIMAL #' + c.animal_id : 'SISTEMA/BORRADO';
        // Try to extract ID from previous value if deleted
        if (!c.animal_id && c.valor_anterior && c.valor_anterior.includes('#')) {
            const match = c.valor_anterior.match(/#(\d+)/);
            if (match) animalDisplay = 'EX-ANIMAL #' + match[1];
        }

        return `
        <tr class="border-b border-gray-50 hover:bg-blue-50/40 transition group">
            <td class="p-4">
                <div class="flex flex-col">
                    <span class="text-xs font-bold text-gray-700">${c.fecha_cambio.split(' ')[0]}</span>
                    <span class="text-[10px] text-gray-400 font-medium">${c.fecha_cambio.split(' ')[1]}</span>
                </div>
            </td>
            <td class="p-4">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px] border-2 border-white shadow-sm">
                        ${escapeHtml(c.usuario.charAt(0).toUpperCase())}
                    </div>
                    <span class="text-sm font-bold text-gray-700">@${escapeHtml(c.usuario)}</span>
                </div>
            </td>
            <td class="p-4">
                <div class="px-3 py-1 bg-gray-100 rounded-lg inline-block">
                    <span class="text-xs font-black text-gray-600 tracking-tight">${animalDisplay}</span>
                </div>
            </td>
            <td class="p-4">
               <span class="px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${actionColor} border border-transparent shadow-sm flex items-center gap-1 w-max">
                    <i class="fas ${actionIcon}"></i> ${accion}
               </span>
            </td>
            <td class="p-4">
                <span class="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black uppercase tracking-wider border border-indigo-100">
                    ${c.campo}
                </span>
            </td>
            <td class="p-4 text-xs">
                <span class="text-red-400/80 bg-red-50 px-2 py-0.5 rounded border border-red-50">${escapeHtml(c.valor_anterior || '-')}</span>
            </td>
            <td class="p-4 text-xs font-bold text-green-600">
                <span class="bg-green-50 px-2 py-0.5 rounded border border-green-100">${escapeHtml(c.valor_nuevo)}</span>
            </td>
        </tr>
    `}).join('');
}

function renderAuditMedicos(dataObj) {
    const data = dataObj.items || dataObj;
    const tbody = document.getElementById('auditMedicosTableBody');
    if (!tbody) return;
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-12 text-center text-gray-400 italic">Sin registros médicos históricos.</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(r => `
        <tr class="border-b border-gray-50 hover:bg-blue-50/40 transition">
            <td class="p-4 text-xs font-medium text-gray-700">${r.fecha}</td>
            <td class="p-4 font-black text-gray-800 text-xs">#${r.animal_id}</td>
            <td class="p-4"><span class="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase tracking-wider">${escapeHtml(r.tipo)}</span></td>
            <td class="p-4 text-xs text-gray-600 italic">"${escapeHtml(r.descripcion)}"</td>
            <td class="p-4 text-xs font-bold text-gray-700">${escapeHtml(r.veterinario)}</td>
        </tr>
    `).join('');
}

function renderAuditInsumos(dataObj) {
    const data = dataObj.items || dataObj;
    const tbody = document.getElementById('auditInsumosTableBody');
    if (!tbody) return;
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-12 text-center text-gray-400 italic">No hay historial de movimientos.</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(h => {
        let tmClass = 'bg-gray-100 text-gray-600';
        let icon = 'fa-info-circle';

        if (h.tipo_movimiento === 'ENTRADA' || h.tipo_movimiento === 'ALTA') {
            tmClass = 'bg-green-100 text-green-700';
            icon = 'fa-arrow-down';
        } else if (h.tipo_movimiento === 'SALIDA') {
            tmClass = 'bg-red-100 text-red-700';
            icon = 'fa-arrow-up';
        } else if (h.tipo_movimiento === 'EDICION') {
            tmClass = 'bg-blue-50 text-blue-600';
            icon = 'fa-pen';
        }

        return `
        <tr class="border-b border-gray-50 hover:bg-emerald-50/40 transition">
            <td class="p-4 text-xs font-bold text-gray-500">${h.fecha}</td>
            <td class="p-4 text-xs font-bold text-gray-700">@${escapeHtml(h.usuario)}</td>
            <td class="p-4 font-bold text-gray-800 text-xs">${escapeHtml(h.nombre_insumo)}</td>
            <td class="p-4">
                <span class="px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${tmClass} flex items-center gap-1 w-max">
                    <i class="fas ${icon}"></i> ${h.tipo_movimiento}
                </span>
            </td>
            <td class="p-4 text-xs font-medium text-gray-600">${h.cantidad_cambio}</td>
            <td class="p-4 text-xs font-black text-emerald-600">${h.stock_nuevo}</td>
        </tr>
    `}).join('');
}

function renderAuditNutricion(dataObj) {
    const data = dataObj.items || dataObj;
    const tbody = document.getElementById('auditNutricionTableBody');
    if (!tbody) return;
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-12 text-center text-gray-400 italic">Sin registros de planes nutricionales.</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(p => `
        <tr class="border-b border-gray-50 hover:bg-amber-50/40 transition">
            <td class="p-4 text-xs text-gray-500 font-bold">${p.fecha_inicio}</td>
            <td class="p-4 text-xs font-bold text-gray-700">@${escapeHtml(p.usuario || 'Sistema')}</td>
            <td class="p-4 font-black text-gray-800 text-xs">#${p.animal_id}</td>
            <td class="p-4"><span class="px-2 py-1 bg-amber-50 text-amber-600 rounded-md text-[9px] font-black uppercase tracking-wider border border-amber-100">${p.tipo_alimentacion}</span></td>
            <td class="p-4">
                <div class="flex flex-col gap-1">
                    <span class="text-[10px] text-gray-500 font-bold">🍃 ${p.cantidad_forraje}kg Forraje</span>
                    <span class="text-[10px] text-gray-500 font-bold">🌽 ${p.cantidad_concentrado}kg Conc.</span>
                </div>
            </td>
            <td class="p-4">
                <span class="px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${p.activo ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}">
                    ${p.activo ? 'Vigente' : 'Histórico'}
                </span>
            </td>
        </tr>
    `).join('');
}

function renderAuditErrors(dataObj) {
    const errores = dataObj.items || dataObj;
    const tbodyErrores = document.getElementById('auditErrorsTableBody');
    if (!tbodyErrores) return;
    if (!errores || errores.length === 0) {
        tbodyErrores.innerHTML = `
                <tr>
                    <td colspan="5" class="p-20 text-center">
                        <div class="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                            <i class="fas fa-check-circle text-green-400 text-2xl"></i>
                        </div>
                        <p class="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Sistema Limpio</p>
                        <p class="text-gray-400 text-xs mt-1">No se han detectado errores críticos.</p>
                    </td>
                </tr>`;
    } else {
        tbodyErrores.innerHTML = errores.map(e => `
            <tr class="border-b border-gray-50 hover:bg-red-50/30 transition">
                <td class="p-4 text-xs font-medium text-gray-400">${e.fecha}</td>
                <td class="p-4">
                    <span class="px-2 py-1 bg-red-50 text-red-600 rounded-md text-[9px] font-black uppercase tracking-wider border border-red-100">${e.zona}</span>
                </td>
                <td class="p-4 text-sm font-bold text-gray-700 leading-tight">${e.mensaje}</td>
                <td class="p-4 text-xs font-bold text-gray-500">@${e.usuario}</td>
                <td class="p-4 text-right">
                    <button onclick="agroAlert('${(e.stack_trace || e.detalles || 'Sin detalles').replace(/'/g, "\\'")}', 'Logs de Sistema', 'danger')" 
                        class="bg-white border border-gray-100 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition shadow-sm text-[10px] font-black uppercase tracking-widest">
                        Detalles
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function switchAuditTab(tab) {
    const changesCont = document.getElementById('audit-cambios-container');
    const errorsCont = document.getElementById('audit-errores-container');
    const pagCambios = document.getElementById('auditCambiosPagination');
    const pagErrores = document.getElementById('auditErroresPagination');

    // Transiciones suaves
    if (tab === 'cambios') {
        changesCont.classList.remove('hidden');
        changesCont.classList.add('animate-fadeIn');
        errorsCont.classList.add('hidden');
        if (pagCambios) pagCambios.classList.remove('hidden');
        if (pagErrores) pagErrores.classList.add('hidden');
        loadAuditoria(1, 'poblacion');
    } else {
        errorsCont.classList.remove('hidden');
        errorsCont.classList.add('animate-fadeIn');
        changesCont.classList.add('hidden');
        if (pagCambios) pagCambios.classList.add('hidden');
        if (pagErrores) pagErrores.classList.remove('hidden');
        loadAuditoria(1, 'errores');
    }

    const tCambios = document.getElementById('tab-audit-cambios');
    const tErrores = document.getElementById('tab-audit-errores');

    if (tCambios && tErrores) {
        if (tab === 'cambios') {
            tCambios.classList.add('border-b-4', 'text-blue-600');
            tCambios.classList.remove('border-b-0', 'text-gray-400');
            tErrores.classList.remove('border-b-4', 'text-blue-600');
            tErrores.classList.add('border-b-0', 'text-gray-400');
        } else {
            tErrores.classList.add('border-b-4', 'text-blue-600');
            tErrores.classList.remove('border-b-0', 'text-gray-400');
            tCambios.classList.remove('border-b-4', 'text-blue-600');
            tCambios.classList.add('border-b-0', 'text-gray-400');
        }
    }
}

/**
 * Cambia entre las sub-zonas de la auditoría de cambios.
 * @param {string} sub - ID de la sub-zona (medicos, poblacion, insumos, nutricionales)
 */
function switchAuditSubTab(sub) {
    const subs = ['medicos', 'poblacion', 'insumos', 'nutricionales'];

    subs.forEach(s => {
        const btn = document.getElementById(`subtab-audit-${s}`);
        const cont = document.getElementById(`audit-sub-${s}`);

        if (s === sub) {
            if (btn) {
                btn.classList.add('bg-white', 'text-blue-600', 'shadow-sm', 'ring-1', 'ring-gray-100');
                btn.classList.remove('text-gray-400', 'hover:bg-white', 'hover:text-gray-600');
            }
            if (cont) cont.classList.remove('hidden');

            // Cargar datos específicos del tab seleccionado (reiniciar a página 1)
            loadAuditoria(1, sub);
        } else {
            if (btn) {
                btn.classList.remove('bg-white', 'text-blue-600', 'shadow-sm', 'ring-1', 'ring-gray-100');
                btn.classList.add('text-gray-400', 'hover:bg-white', 'hover:text-gray-600');
            }
            if (cont) cont.classList.add('hidden');
        }
    });
}

/**
 * GESTIÓN DE PERSONAL:
 * Control de acceso y roles.
 */
async function loadUsuarios() {
    try {
        const res = await fetch('/api/auth/usuarios');
        const data = await res.json();
        window.allUsers = data;

        // Render Desktop Table
        const tbody = document.getElementById('userTableBody');
        if (tbody) {
            tbody.innerHTML = data.map(u => `
                <tr class="border-b border-gray-50 hover:bg-indigo-50/20 transition group">
                    <td class="p-4">
                        <div class="font-bold text-gray-800">${escapeHtml(u.nombre_completo)}</div>
                        <div class="text-[10px] text-gray-400 uppercase font-black tracking-widest">ID: #${u.id}</div>
                    </td>
                    <td class="p-4">
                        <div class="text-sm font-medium text-gray-700">@${escapeHtml(u.username)}</div>
                        <div class="text-xs text-gray-400">${escapeHtml(u.email)}</div>
                    </td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${getRolTheme(u.rol)} text-white">
                            ${u.rol}
                        </span>
                    </td>
                    <td class="p-4">
                        <span class="flex items-center gap-1.5 text-xs font-bold ${u.activo ? 'text-green-500' : 'text-red-400'}">
                            <span class="w-2 h-2 rounded-full ${u.activo ? 'bg-green-500' : 'bg-red-400'}"></span>
                            ${u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td class="p-4 text-xs text-gray-400 font-medium">
                        ${u.ultimo_acceso || 'Nunca'}
                    </td>
                    <td class="p-4 text-right">
                        <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button onclick="openUserModal(${u.id})" class="p-2 bg-white border border-gray-200 rounded-lg text-indigo-600 hover:bg-indigo-50 shadow-sm" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${u.username !== 'admin' ? (u.activo ? `
                                <button onclick="deleteUser(${u.id})" class="p-2 bg-white border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 shadow-sm" title="Desactivar">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            ` : `
                                <button onclick="reactivateUser(${u.id})" class="p-2 bg-white border border-gray-200 rounded-lg text-green-500 hover:bg-green-50 shadow-sm" title="Reactivar">
                                    <i class="fas fa-check-circle"></i>
                                </button>
                            `) : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // Render Mobile Cards
        const mobileContainer = document.getElementById('userMobileCards');
        if (mobileContainer) {
            mobileContainer.innerHTML = data.map(u => `
                <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm input-premium-transition">
                                ${escapeHtml(u.nombre_completo.charAt(0))}
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 leading-tight">${escapeHtml(u.nombre_completo)}</h4>
                                <p class="text-xs text-gray-400">@${escapeHtml(u.username)}</p>
                            </div>
                        </div>
                        <span class="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getRolTheme(u.rol)} text-white shadow-sm">
                            ${u.rol}
                        </span>
                    </div>
                    
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-400">Estado</span>
                            <span class="flex items-center gap-1.5 font-bold ${u.activo ? 'text-green-500' : 'text-red-400'}">
                                <span class="w-1.5 h-1.5 rounded-full ${u.activo ? 'bg-green-500' : 'bg-red-400'}"></span>
                                ${u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-400">Último Acceso</span>
                            <span class="font-medium text-gray-600 text-xs">${u.ultimo_acceso || 'Nunca'}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-400">Email</span>
                            <span class="font-medium text-gray-600 text-xs truncate max-w-[150px]">${escapeHtml(u.email)}</span>
                        </div>
                    </div>

                    <div class="flex gap-2 pt-3 border-t border-gray-50">
                        <button onclick="openUserModal(${u.id})" class="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100 transition flex items-center justify-center gap-2">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        ${u.username !== 'admin' ? (u.activo ? `
                            <button onclick="deleteUser(${u.id})" class="flex-1 py-2 bg-red-50 text-red-500 rounded-xl font-bold text-xs hover:bg-red-100 transition flex items-center justify-center gap-2">
                                <i class="fas fa-trash-alt"></i> Desactivar
                            </button>
                        ` : `
                            <button onclick="reactivateUser(${u.id})" class="flex-1 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-xs hover:bg-green-100 transition flex items-center justify-center gap-2">
                                <i class="fas fa-check-circle"></i> Reactivar
                            </button>
                        `) : ''}
                    </div>
                </div>
            `).join('');
        }

    } catch (e) {
        console.error(e);
        agroToast('Error al cargar usuarios', 'danger');
    }
}

async function reactivateUser(id) {
    if (!confirm('¿Estás seguro de reactivar este usuario? Podrá acceder al sistema nuevamente.')) return;
    try {
        const res = await fetch(`/api/auth/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: true })
        });
        const d = await res.json();
        if (d.status === 'success') {
            agroToast('Usuario reactivado con éxito', 'success');
            loadUsuarios();
        } else {
            agroToast(d.error || 'Error al reactivar usuario', 'danger');
        }
    } catch (e) {
        console.error(e);
        agroToast('Error de conexión', 'danger');
    }
}

function getRolTheme(rol) {
    const roles = {
        'admin': 'bg-red-500',
        'veterinario': 'bg-blue-500',
        'nutricionista': 'bg-emerald-500',
        'inventario': 'bg-teal-500',
        'gerente': 'bg-orange-500',
        'auditor': 'bg-gray-700',
        'operador': 'bg-gray-400'
    };
    return roles[rol] || 'bg-gray-400';
}

function openUserModal(id = null) {
    const u = id ? window.allUsers.find(x => x.id === id) : null;

    document.getElementById('usr-id').value = id || '';
    document.getElementById('usr-nombre').value = u ? u.nombre_completo : '';
    document.getElementById('usr-username').value = u ? u.username : '';
    document.getElementById('usr-email').value = u ? u.email : '';
    document.getElementById('usr-rol').value = u ? u.rol : 'operador';

    document.getElementById('modalUserTitle').innerText = id ? 'Editar Personal' : 'Nuevo Integrante';
    document.getElementById('password-field').classList.toggle('hidden', id !== null);

    if (id) {
        document.getElementById('usr-username').disabled = true;
        document.getElementById('usr-username').classList.add('bg-gray-100', 'opacity-50');
    } else {
        document.getElementById('usr-username').disabled = false;
        document.getElementById('usr-username').classList.remove('bg-gray-100', 'opacity-50');
        document.getElementById('usr-password').value = '';

        // LIMPIAR PREGUNTAS DE SEGURIDAD
        document.querySelectorAll('.usr-q').forEach(el => el.value = '');
        document.querySelectorAll('.usr-a').forEach(el => el.value = '');
    }

    document.getElementById('modalUser').classList.remove('hidden');
}

function closeUserModal() { document.getElementById('modalUser').classList.add('hidden'); }

async function saveUser() {
    const id = document.getElementById('usr-id').value;
    const nombre = document.getElementById('usr-nombre').value.trim();
    const username = document.getElementById('usr-username').value.trim();
    const email = document.getElementById('usr-email').value.trim();
    const rol = document.getElementById('usr-rol').value;

    // 1. VALIDACIÓN CAMPOS VACÍOS
    if (!nombre || !username || !email || !rol) {
        return agroAlert('Por favor, complete todos los campos obligatorios (Nombre, Usuario, Email, Rol).', 'Campos Incompletos', 'warning');
    }

    // 2. VALIDACIÓN FORMATO EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return agroAlert('El correo electrónico no tiene un formato válido.', 'Email Inválido', 'warning');
    }

    // 3. VALIDACIÓN USUARIO (SIN ESPACIOS)
    if (/\s/.test(username)) {
        return agroAlert('El nombre de usuario no debe contener espacios. Use puntos o guiones bajos.', 'Usuario Inválido', 'warning');
    }

    const data = {
        nombre_completo: nombre,
        username: username,
        email: email,
        rol: rol
    };

    if (!id) {
        data.password = document.getElementById('usr-password').value;

        // 4. VALIDACIÓN CONTRASENIA
        if (!data.password) return agroAlert('La contraseña es obligatoria para nuevos usuarios', 'Falta Contraseña', 'warning');
        if (data.password.length < 6) return agroAlert('La contraseña debe tener al menos 6 caracteres.', 'Contraseña Corta', 'warning');

        // RECOLECTAR PREGUNTAS DE SEGURIDAD
        const questions_els = document.querySelectorAll('.usr-q');
        const answers_els = document.querySelectorAll('.usr-a');
        data.questions = [];
        const seenQuestions = new Set();

        for (let i = 0; i < questions_els.length; i++) {
            const q = questions_els[i].value;
            const a = answers_els[i].value.trim();
            if (q && a) {
                // 5. VALIDACIÓN PREGUNTAS DUPLICADAS
                if (seenQuestions.has(q)) {
                    return agroAlert('No puede seleccionar la misma pregunta de seguridad más de una vez.', 'Pregunta Duplicada', 'warning');
                }
                seenQuestions.add(q);
                data.questions.push({ pregunta: q, respuesta: a });
            }
        }

        if (data.questions.length < 3) {
            return agroAlert('Se requieren al menos 3 preguntas de seguridad para crear el personal. Se recomiendan 5 para mayor seguridad.', 'Seguridad Requerida', 'warning');
        }
    }

    // DESAFÍO DE SEGURIDAD PARA ACCIONES DE PERSONAL
    const autorizado = await verifyActionPermission('admin', id ? `Autorizar edición de Usuario @${data.username}` : 'Autorizar creación de nuevo Usuario');
    if (!autorizado) return;

    try {
        const url = id ? `/api/auth/usuarios/${id}` : '/api/auth/usuarios';
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (res.ok) {
            closeUserModal();
            loadUsuarios();
            agroToast(id ? 'Usuario actualizado ✓' : 'Usuario creado ✓', 'success');
        } else {
            agroAlert(result.error, 'Error', 'danger');
        }
    } catch (e) {
        console.error(e);
        agroAlert('Error de red al procesar usuario', 'Error', 'danger');
    }
}

async function deleteUser(id) {
    const u = window.allUsers.find(x => x.id === id);
    if (!u) return;

    const confirm = await agroConfirm(`¿Estás seguro de desactivar al usuario @${u.username}?\nNo podrá volver a entrar hasta que sea reactivado por un administrador.`, 'Confirmar Desactivación', 'warning');
    if (!confirm) return;

    // DESAFÍO PARA DESACTIVAR
    const autorizado = await verifyActionPermission('admin', `Confirmar desactivación de @${u.username}`);
    if (!autorizado) return;

    try {
        const res = await fetch(`/api/auth/usuarios/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadUsuarios();
            agroToast('Usuario desactivado correctamente', 'info');
        } else {
            const data = await res.json();
            agroAlert(data.error, 'Error', 'danger');
        }
    } catch (e) {
        console.error(e);
    }
}
