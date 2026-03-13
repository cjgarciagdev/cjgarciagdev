
// ==========================================
// EDITOR DE GENEALOGÍA (Updated)
// ==========================================

let globalAnimals = []; // Cache de todos los animales para filtros
let currentGenealogyTarget = null; // El animal central que se está editando
let currentSelectorContext = null; // Contexto de la selección actual { childId, relationType, isChildAddition }

// Sobrescribimos cargarListasAnimales para guardar cache
// Sobrescribimos cargarListasAnimales para guardar cache
const originalCargarListas = cargarListasAnimales;

/**
 * Carga la lista de animales y almacena en caché para uso global.
 * Extiende la funcionalidad original para actualizar selectores específicos de este módulo.
 */
cargarListasAnimales = async function () {
    const res = await fetch('/api/ganado');
    globalAnimals = await res.json();

    // Llamar a la original para mantener funcionalidad
    const selects = ['selectAnimalNutricion', 'selectAnimalAnalisis', 'selectAnimalPrediccion'];
    const baseHtml = '<option value="">Seleccionar Animal</option>';
    const options = globalAnimals.map(a => `<option value="${a.id}">#${a.id} - ${a.especie} (${a.raza})</option>`).join('');

    selects.forEach(selectId => {
        const elem = document.getElementById(selectId);
        if (elem) elem.innerHTML = baseHtml + options;
    });

    // Actualizar selectores del buscador de rutas si la función está disponible
    if (typeof cargarSelectoresCamino === 'function') {
        cargarSelectoresCamino();
    }

    // Para selectAnimalSalud, usar la nueva función que considera el filtro
    // Por defecto (pestaña protocolos), carga todos los animales
    if (typeof loadAnimalSelectForSalud === 'function') {
        loadAnimalSelectForSalud('all');
    }
}

function getAnimalById(id) {
    return globalAnimals.find(a => a.id == id);
}

function getAnimalName(id) {
    const a = getAnimalById(id);
    return a ? `#${a.id} ${a.raza}` : 'Desconocido';
}

/**
 * Abre el modal de edición de genealogía para el animal seleccionado.
 * Inicializa la visualización del árbol con el animal central.
 */
async function openModalGenealogia() {
    const centralId = document.getElementById('selectAnimalAnalisis')?.value;
    if (!centralId) {
        agroAlert('Por favor, selecciona primero un animal en el panel "Seleccionar Animal para Análisis".', 'Selección Requerida', 'warning');
        return;
    }

    currentGenealogyTarget = getAnimalById(centralId);
    if (!currentGenealogyTarget) return;

    // Actualizar UI Central
    document.getElementById('gen-central-label').innerText = `#${currentGenealogyTarget.id} ${currentGenealogyTarget.raza}`;
    const idDisplay = document.getElementById('gen-central-id-display');
    if (idDisplay) idDisplay.innerText = currentGenealogyTarget.id;

    // Cargar visualización
    await refreshGenealogyTree();

    document.getElementById('modalGenealogia').classList.remove('hidden');
}

function closeModalGenealogia() {
    document.getElementById('modalGenealogia').classList.add('hidden');
}

/**
 * Refresca la vista del árbol genealógico.
 * Busca los datos de padres, abuelos y los actualiza en la interfaz.
 */
async function refreshGenealogyTree() {
    if (!currentGenealogyTarget) return;

    // Tenemos que buscar los datos frescos de los padres/abuelos
    await cargarListasAnimales(); // Refrescamos cache por si acaso
    currentGenealogyTarget = getAnimalById(currentGenealogyTarget.id);

    const padre = getAnimalById(currentGenealogyTarget.padre_id);
    const madre = getAnimalById(currentGenealogyTarget.madre_id);

    // Render Padre
    updateNodeDisplay('gen-padre-display', padre);

    // Render Madre
    updateNodeDisplay('gen-madre-display', madre);

    // Render Abuelos Paternos
    if (padre) {
        updateNodeDisplay('gen-abuelo-pat-display', getAnimalById(padre.padre_id));
        updateNodeDisplay('gen-abuela-pat-display', getAnimalById(padre.madre_id));
    } else {
        document.getElementById('gen-abuelo-pat-display').innerText = '--';
        document.getElementById('gen-abuela-pat-display').innerText = '--';
    }

    // Render Abuelos Maternos
    if (madre) {
        updateNodeDisplay('gen-abuelo-mat-display', getAnimalById(madre.padre_id));
        updateNodeDisplay('gen-abuela-mat-display', getAnimalById(madre.madre_id));
    } else {
        document.getElementById('gen-abuelo-mat-display').innerText = '--';
        document.getElementById('gen-abuela-mat-display').innerText = '--';
    }

    // Render Hijos
    renderHijos();
}

function renderHijos() {
    const hijos = globalAnimals.filter(a => a.padre_id == currentGenealogyTarget.id || a.madre_id == currentGenealogyTarget.id);
    const container = document.getElementById('gen-hijos-list');

    if (!container) return;

    if (hijos.length === 0) {
        container.innerHTML = '<p class="text-gray-400 italic col-span-full text-center py-4">No hay hijos registrados.</p>';
        return;
    }

    container.innerHTML = hijos.map(h => `
        <div class="bg-white p-3 rounded-lg shadow border border-green-100 flex justify-between items-center group hover:shadow-md transition">
             <div>
                <span class="font-bold text-green-800">#${h.id}</span>
                <span class="text-xs text-gray-500 ml-1">${h.raza}</span>
                <div class="text-[10px] text-gray-400">
                    <i class="fas fa-venus-mars"></i> ${h.sexo} | ${h.edad}m
                </div>
            </div>
             <div>
                <span class="text-[10px] bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">Descendiente</span>
             </div>
        </div>
    `).join('');
}

function updateNodeDisplay(elementId, animal) {
    const el = document.getElementById(elementId);
    if (animal) {
        el.innerHTML = `<span class="text-xs bg-gray-200 px-1 rounded">#${animal.id}</span> ${animal.raza}`;
        el.classList.add('text-black');
    } else {
        el.innerText = 'No asignado';
        el.classList.remove('text-black');
    }
}

// Lógica del Selector

/**
 * Abre el selector de animales para asignar un pariente.
 * Configura el contexto según el rol (padre, madre, hijo, abuelo).
 * @param {string} role - El rol a asignar (padre, madre, hijo, etc).
 */
function openSelector(role) {
    if (!currentGenealogyTarget) return;

    let child = null; // El animal que será MODIFICADO (para asignar su padre/madre)
    let requiredSex = '';
    let relationType = ''; // 'padre_id' o 'madre_id'
    let isChildAddition = false;

    // Definir contexto
    if (role === 'padre') {
        child = currentGenealogyTarget;
        requiredSex = 'Macho';
        relationType = 'padre_id';
    } else if (role === 'madre') {
        child = currentGenealogyTarget;
        requiredSex = 'Hembra';
        relationType = 'madre_id';
    } else if (role === 'abuelo_paterno') {
        child = getAnimalById(currentGenealogyTarget.padre_id);
        if (!child) {
            agroAlert('Debes asignar primero al Padre.', 'Validación', 'warning');
            return;
        }
        requiredSex = 'Macho';
        relationType = 'padre_id';
    } else if (role === 'abuela_paterna') {
        child = getAnimalById(currentGenealogyTarget.padre_id);
        if (!child) {
            agroAlert('Debes asignar primero al Padre.', 'Validación', 'warning');
            return;
        }
        requiredSex = 'Hembra';
        relationType = 'madre_id';
    } else if (role === 'abuelo_materno') {
        child = getAnimalById(currentGenealogyTarget.madre_id);
        if (!child) {
            agroAlert('Debes asignar primero a la Madre.', 'Validación', 'warning');
            return;
        }
        requiredSex = 'Macho';
        relationType = 'padre_id';
    } else if (role === 'abuela_materna') {
        child = getAnimalById(currentGenealogyTarget.madre_id);
        if (!child) {
            agroAlert('Debes asignar primero a la Madre.', 'Validación', 'warning');
            return;
        }
        requiredSex = 'Hembra';
        relationType = 'madre_id';
    } else if (role === 'hijo') {
        // En este caso, NO modificamos currentGenealogyTarget directamente
        // Modificaremos al CANDIDATO seleccionado para ponerle a current como padre/madre
        isChildAddition = true;
        requiredSex = ''; // Cualquier sexo
        // relationType dependerá del sexo de currentGenealogyTarget
        relationType = currentGenealogyTarget.sexo === 'Macho' ? 'padre_id' : 'madre_id';
    }

    currentSelectorContext = {
        childId: child ? child.id : null, // Null si es agregar hijo (target es dinamico)
        relationType,
        isChildAddition
    };

    // Filtrar Candidatos
    const candidates = globalAnimals.filter(a => {
        const targetRef = isChildAddition ? currentGenealogyTarget : child;

        // 1. Misma Especie
        if (a.especie !== targetRef.especie) return false;

        // 2. Sexo Correcto (si aplica)
        if (requiredSex && a.sexo !== requiredSex) return false;

        // 3. No puede ser él mismo
        if (a.id === targetRef.id) return false;

        // 4. Validar Edad
        if (isChildAddition) {
            // Candidato (Hijo) debe ser MENOR que Current (Padre)
            if (new Date(a.fecha_nacimiento) <= new Date(currentGenealogyTarget.fecha_nacimiento)) return false;

            // Validar que no sea ya un padre/abuelo para evitar ciclos obvios (simple check)
            if (a.id === currentGenealogyTarget.padre_id || a.id === currentGenealogyTarget.madre_id) return false;
        } else {
            // Candidato (Padre/Abuelo) debe ser MAYOR
            if (new Date(a.fecha_nacimiento) >= new Date(child.fecha_nacimiento)) return false;
        }

        return true;
    });

    renderCandidates(candidates);
    document.getElementById('modalSelectorGenealogia').classList.remove('hidden');

    const title = isChildAddition ?
        `Seleccionar Descendiente (Hijo/a) para #${currentGenealogyTarget.id}` :
        `Seleccionar ${role.replace('_', ' ')} para #${child.id}`;
    document.getElementById('selector-title').innerText = title;
}

function renderCandidates(list) {
    const container = document.getElementById('selector-list');
    if (list.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center p-4">No se encontraron candidatos válidos (Especie, Edad, Sexo).</p>';
        return;
    }

    container.innerHTML = list.map(a => `
        <div onclick="selectCandidate(${a.id})" class="p-3 border rounded hover:bg-green-50 cursor-pointer flex justify-between items-center group">
            <div>
                <span class="font-bold text-gray-800">#${a.id}</span>
                <span class="text-sm text-gray-600 ml-2">${a.raza}</span>
                <p class="text-xs text-gray-400">Edad: ${a.edad}m | Peso: ${a.peso}kg | ${a.sexo}</p>
            </div>
            <i class="fas fa-check-circle text-gray-200 group-hover:text-green-500 text-xl"></i>
        </div>
    `).join('');
}

function closeSelector() {
    document.getElementById('modalSelectorGenealogia').classList.add('hidden');
}

// Listener para búsqueda
document.getElementById('selector-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#selector-list > div');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? 'flex' : 'none';
    });
});

/**
 * Ejecuta la asignación del animal seleccionado.
 * Realiza una petición POST para actualizar el registro del animal.
 * @param {number} candidateId - ID del animal seleccionado.
 */
async function selectCandidate(candidateId) {
    if (!currentSelectorContext) return;

    const { childId, relationType, isChildAddition } = currentSelectorContext;

    let targetPayload = {};

    if (isChildAddition) {
        // Estamos asignando el candidato como HIJO de currentGenealogyTarget
        // Por tanto, editamos el candidato
        const candidate = getAnimalById(candidateId);
        targetPayload = { ...candidate };
        targetPayload[relationType] = currentGenealogyTarget.id; // relationType es padre_id o madre_id (según current)
    } else {
        // Estamos asignando el candidato como PADRE/MADRE de childId
        const child = getAnimalById(childId);
        targetPayload = { ...child };
        targetPayload[relationType] = candidateId;
    }

    // DESAFÍO DE CREDENCIALES
    const msg = isChildAddition
        ? `Autorizar asignación de descendencia`
        : `Autorizar asignación de ancestro`;
    const autorizado = await verifyActionPermission('editar_animal', msg);
    if (!autorizado) return;

    try {
        const res = await fetch('/api/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(targetPayload)
        });

        if (res.ok) {
            closeSelector();
            await refreshGenealogyTree();
            // Recargar grafo principal si está abierto
            if (document.getElementById('selectAnimalAnalisis').value == currentGenealogyTarget.id) {
                cargarAnalisisCompleto();
            }
        } else {
            const err = await res.json();
            agroAlert('Error al guardar: ' + (err.error || 'Desconocido'), 'Error', 'danger');
        }
    } catch (error) {
        console.error(error);
        agroAlert('Error de conexión', 'Error de Red', 'danger');
    }
}
