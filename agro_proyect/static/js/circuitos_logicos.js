
// ==========================================
// SIMULADOR DE CIRCUITOS LÓGICOS (SIMPLIFICADO)
// ==========================================

/**
 * Inicializa el simulador de circuitos lógicos.
 * Inyecta los tabs y contenedores necesarios en el DOM si no existen.
 */
async function initCircuitosLogicos() {
    // 1. Inyectar botón de tab si no existe
    const tabsContainer = document.querySelector('#sec-avanzado .flex.border-b-2');
    if (tabsContainer && !document.getElementById('tab-simulador-logico')) {
        const btn = document.createElement('button');
        btn.className = 'tab-analisis px-6 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-t-lg transition';
        btn.id = 'tab-simulador-logico';
        btn.innerHTML = '<i class="fas fa-microchip mr-2"></i>Simulador Lógico';
        btn.onclick = () => cambiarTabAnalisis('simulador-logico');
        tabsContainer.appendChild(btn);

        const btnGen = document.createElement('button');
        btnGen.className = 'tab-analisis px-6 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-t-lg transition';
        btnGen.id = 'tab-simulador-genetico';
        btnGen.innerHTML = '<i class="fas fa-dna mr-2"></i>Cruce Predictivo';
        btnGen.onclick = () => cambiarTabAnalisis('simulador-genetico');
        tabsContainer.appendChild(btnGen);
    }

    // 2. Inyectar contenido UI
    const contentArea = document.getElementById('sec-avanzado');
    if (contentArea && !document.getElementById('content-simulador-logico')) {
        const div = document.createElement('div');
        div.id = 'content-simulador-logico';
        div.className = 'tab-content-analisis hidden mt-6';

        div.innerHTML = `
            <div class="bg-white p-6 rounded-2xl shadow-lg border-2 border-indigo-200">
                <!-- Header -->
                <div class="text-center mb-8">
                    <h3 class="text-2xl font-bold text-indigo-900">Validación de Protocolos Operativos</h3>
                    <p class="text-gray-500">Motor de decisión lógica para validar estándares de calidad, salud y reproducción en el rebaño.</p>
                </div>

                <!-- Selector de Animal Real -->
                <div class="max-w-xl mx-auto mb-10">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        <i class="fas fa-cow mr-2"></i>1. Seleccionar Ejemplar
                    </label>
                    <div class="relative">
                        <select id="sim-animal-select" class="w-full p-4 border-2 border-indigo-100 rounded-xl bg-gray-50 font-bold text-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition appearance-none cursor-pointer">
                            <option value="">Sincronizando base de datos...</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-indigo-500">
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>
                </div>

                <!-- Grid de Circuitos (Tarjetas) -->
                <div class="mb-4 text-center">
                    <label class="block text-sm font-bold text-gray-700 mb-4">
                        <i class="fas fa-clipboard-check mr-2"></i>2. Ejecutar Protocolo de Validación
                    </label>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
                    <!-- Protocolo 1: Comercial -->
                    <div onclick="ejecutarCircuitoRapido('comercio')" 
                        class="bg-white border-2 border-emerald-100 rounded-xl p-5 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer group hover:border-emerald-400 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                        <div class="relative z-10">
                            <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition">
                                <i class="fas fa-tag"></i>
                            </div>
                            <h4 class="font-bold text-base text-gray-800 mb-1">Certificación Comercial</h4>
                            <p class="text-[11px] text-gray-500 leading-tight">Valida peso de faena, edad óptima y score genético base.</p>
                        </div>
                    </div>

                    <!-- Protocolo 2: Reproducción -->
                    <div onclick="ejecutarCircuitoRapido('reproduccion')" 
                        class="bg-white border-2 border-pink-100 rounded-xl p-5 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer group hover:border-pink-400 relative overflow-hidden">
                         <div class="absolute top-0 right-0 w-20 h-20 bg-pink-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                        <div class="relative z-10">
                            <div class="w-10 h-10 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition">
                                <i class="fas fa-venus-mars"></i>
                            </div>
                            <h4 class="font-bold text-base text-gray-800 mb-1">Aptitud Reproductiva</h4>
                            <p class="text-[11px] text-gray-500 leading-tight">Verifica madurez sexual, desarrollo ponderal y estado no gestante.</p>
                        </div>
                    </div>

                    <!-- Protocolo 3: Sanitario -->
                    <div onclick="ejecutarCircuitoRapido('sanitario')" 
                        class="bg-white border-2 border-red-100 rounded-xl p-5 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer group hover:border-red-400 relative overflow-hidden">
                         <div class="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                        <div class="relative z-10">
                            <div class="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition">
                                <i class="fas fa-user-md"></i>
                            </div>
                            <h4 class="font-bold text-base text-gray-800 mb-1">Triaje Sanitario</h4>
                            <p class="text-[11px] text-gray-500 leading-tight">Matriz de riesgo: Detecta bajo peso crítico o estatus patológico.</p>
                        </div>
                    </div>
                    
                    <!-- Protocolo 4: Genética Elite -->
                    <div onclick="ejecutarCircuitoRapido('elite')" 
                        class="bg-white border-2 border-violet-100 rounded-xl p-5 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer group hover:border-violet-400 relative overflow-hidden">
                         <div class="absolute top-0 right-0 w-20 h-20 bg-violet-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                        <div class="relative z-10">
                            <div class="w-10 h-10 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition">
                                <i class="fas fa-dna"></i>
                            </div>
                            <h4 class="font-bold text-base text-gray-800 mb-1">Padrón Genético Elite</h4>
                            <p class="text-[11px] text-gray-500 leading-tight">Identifica ejemplares de alto valor (Score > 80 y Salud Óptima).</p>
                        </div>
                    </div>
                </div>

                <!-- Área de Resultado -->
                <div id="sim-result-container" class="max-w-3xl mx-auto hidden">
                    <!-- Se llena dinámicamente -->
                </div>
            </div>
        `;
        contentArea.appendChild(div);

        // --- SIMULADOR GENETICO UI ---
        const divGen = document.createElement('div');
        divGen.id = 'content-simulador-genetico';
        divGen.className = 'tab-content-analisis hidden mt-6';
        divGen.innerHTML = `
            <div class="bg-slate-900 p-8 rounded-3xl shadow-2xl border-4 border-indigo-500/30 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                
                <div class="relative z-10 text-center mb-10">
                    <h3 class="text-3xl font-black text-white mb-2">Genetic Cross Simulator</h3>
                    <p class="text-indigo-300 font-medium">Predicción de compatibilidad genómica y riesgos de endogamia.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <!-- Parent 1 -->
                    <div class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                        <label class="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Progenitor 1 (Padre/Madre)</label>
                        <select id="sim-gen-p1" class="w-full bg-slate-800 text-white border-2 border-slate-700 p-3 rounded-xl focus:border-indigo-500 outline-none transition"></select>
                    </div>
                    <!-- Parent 2 -->
                    <div class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                        <label class="block text-xs font-black text-pink-400 uppercase tracking-widest mb-4">Progenitor 2 (Pareja)</label>
                        <select id="sim-gen-p2" class="w-full bg-slate-800 text-white border-2 border-slate-700 p-3 rounded-xl focus:border-pink-500 outline-none transition"></select>
                    </div>
                </div>

                <div class="flex justify-center mb-10">
                    <button onclick="ejecutarSimulacionGenetica()" 
                        class="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transform hover:-translate-y-1 transition flex items-center gap-3">
                        <i class="fas fa-atom animate-spin-slow"></i> ANALIZAR COMPATIBILIDAD
                    </button>
                </div>

                <div id="sim-gen-result" class="hidden animate-fade-in-up">
                    <!-- Se llena via JS -->
                </div>
            </div>
        `;
        contentArea.appendChild(divGen);

        // 3. Cargar Animales (Asegurando datos reales)
        await cargarAnimalesSimulador();
    }
}

async function cargarAnimalesSimulador() {
    const selector = document.getElementById('sim-animal-select');
    selector.innerHTML = '<option value="">Cargando datos...</option>';

    try {
        // Intentar usar cache global primero si existe y es válido
        if (typeof globalAnimals !== 'undefined' && globalAnimals.length > 0) {
            renderSimuladorOptions(globalAnimals);
        } else {
            // Fetch fresco si no hay cache
            const res = await fetch('/api/ganado');
            const data = await res.json();
            // Actualizar global si existe para otros componentes (genealogia.js)
            if (typeof globalAnimals !== 'undefined') globalAnimals = data;
            renderSimuladorOptions(data);
        }
    } catch (error) {
        console.error("Error cargando animales:", error);
        selector.innerHTML = '<option value="">Error de conexión</option>';
    }

    // Poblar también selects genéticos
    const s1 = document.getElementById('sim-gen-p1');
    const s2 = document.getElementById('sim-gen-p2');
    if (s1 && s2) {
        const options = '<option value="">-- Seleccionar --</option>' +
            globalAnimals.map(a => `<option value="${a.id}">#${a.id} - ${a.especie} (${a.raza})</option>`).join('');
        s1.innerHTML = options;
        s2.innerHTML = options;
    }
}

function renderSimuladorOptions(animales) {
    const selector = document.getElementById('sim-animal-select');
    if (!animales || animales.length === 0) {
        selector.innerHTML = '<option value="">No hay animales registrados</option>';
        return;
    }

    selector.innerHTML = `
        <option value="">-- Selecciona un Animal --</option>
        ${animales.map(a => `<option value="${a.id}">#${a.id} - ${a.especie} ${a.raza} (${a.edad} meses, ${a.peso}kg)</option>`).join('')}
    `;
}

/**
 * Ejecuta un circuito predefinido (plantilla) seleccionando la expresión lógica correspondiente.
 * Adapta los umbrales según la especie y raza del animal seleccionado.
 * @param {string} tipo - Identificador del tipo de circuito.
 */
function ejecutarCircuitoRapido(tipo) {
    const animalId = document.getElementById('sim-animal-select').value;
    if (!animalId) {
        agroAlert("¡Primero selecciona un ejemplar para el análisis!", "Referencia Faltante", "warning");
        return;
    }

    // Buscar datos del animal en cache global
    const animal = globalAnimals.find(a => a.id == animalId);
    if (!animal) return;

    let expresion = "";

    // Configuración de reglas zootécnicas
    // peso_venta: Peso objetivo para mercado
    // edad_repro: Meses mínimos para primer servicio
    // peso_repro: Porcentaje del peso adulto necesario para repro (aprox)
    const reglas = {
        'Bovino': { peso_venta: 450, edad_repro: 15, peso_repro: 320, alerta_min: 120, elite_score: 85 },
        'Porcino': { peso_venta: 105, edad_repro: 7, peso_repro: 100, alerta_min: 30, elite_score: 90 },
        'Ovino': { peso_venta: 40, edad_repro: 8, peso_repro: 35, alerta_min: 15, elite_score: 80 },
        'Caprino': { peso_venta: 35, edad_repro: 8, peso_repro: 30, alerta_min: 15, elite_score: 80 },
        'Equino': { peso_venta: 450, edad_repro: 36, peso_repro: 380, alerta_min: 150, elite_score: 90 },
        'default': { peso_venta: 100, edad_repro: 12, peso_repro: 50, alerta_min: 20, elite_score: 80 }
    };

    const r = reglas[animal.especie] || reglas['default'];

    // Ajustes raciales dinámicos
    if (animal.raza.includes('Angus') || animal.raza.includes('Holstein')) {
        r.peso_venta += 50;
        r.peso_repro += 30;
    }

    if (tipo === 'comercio') {
        // Criterio: Peso adecuado para la especie, salud óptima y edad productiva
        expresion = `peso >= ${r.peso_venta} and estado == 'Saludable' and edad >= 12`;
    }
    else if (tipo === 'reproduccion') {
        // Criterio: Madurez sexual, desarrollo corporal y estatus reproductivo actual
        if (animal.sexo === 'Hembra') {
            expresion = `sexo == 'Hembra' and edad >= ${r.edad_repro} and peso >= ${r.peso_repro} and (estado == 'Saludable' or estado == 'Secado')`;
        } else {
            // Machos: Requerimientos de peso superiores para monta activa
            expresion = `sexo == 'Macho' and edad >= ${r.edad_repro + 6} and peso >= ${r.peso_repro * 1.3} and estado == 'Saludable'`;
        }
    }
    else if (tipo === 'sanitario') {
        // Criterio: Detección proactiva de riesgos de salud o retraso en desarrollo
        expresion = `estado == 'Crítico' or estado == 'Enfermo' or estado == 'Cuarentena' or (peso < ${r.alerta_min} and edad > 5)`;
    }
    else if (tipo === 'elite') {
        // Criterio: Top de línea genética, salud perfecta y en plenitud de vida
        expresion = `score_genetico >= ${r.elite_score} and estado == 'Saludable' and edad > 12 and edad < 84`;
    }

    ejecutarSimulacionConExpresion(expresion);
}

/**
 * Envía la expresión lógica al backend para ser evaluada contra el animal seleccionado.
 * Muestra el resultado de la simulación.
 * @param {string} expresion - La expresión lógica a evaluar (sintaxis Python-like).
 */
async function ejecutarSimulacionConExpresion(expresion) {
    const animalId = document.getElementById('sim-animal-select').value;
    const container = document.getElementById('sim-result-container');

    if (!animalId) {
        agroAlert("¡Primero selecciona un animal del listado!", "Selección Requerida", "warning");
        document.getElementById('sim-animal-select').focus();
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = '<div class="text-center py-8"><i class="fas fa-circle-notch fa-spin text-3xl text-indigo-500"></i><p class="mt-2 text-indigo-800 font-bold">Procesando Lógica...</p></div>';

    try {
        const res = await fetch('/api/circuitos/simular', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                animal_id: parseInt(animalId),
                expresion: expresion
            })
        });

        const data = await res.json();

        if (data.error) {
            container.innerHTML = `<div class="bg-red-100 text-red-700 p-4 rounded text-center">Error: ${data.error}</div>`;
            return;
        }

        renderResultSimple(data);

    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="bg-red-100 text-red-700 p-4 rounded text-center">Error de conexión</div>';
    }
}


function renderResultSimple(data) {
    const container = document.getElementById('sim-result-container');
    const isTrue = data.evaluacion.resultado;

    // Variables usadas con estilo de "Chips"
    const varsHtml = Object.entries(data.variables_usadas).map(([k, v]) => `
        <div class="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-indigo-500 transition">
            <span class="text-xs text-indigo-300 font-mono uppercase tracking-wider">${k}</span>
            <span class="text-white font-bold font-mono bg-slate-900 px-2 py-1 rounded">${v}</span>
        </div>
    `).slice(0, 6).join('');

    // Icono y Color principal
    const statusColor = isTrue ? 'text-green-400' : 'text-red-500';
    const statusBg = isTrue ? 'bg-green-500/10' : 'bg-red-500/10';
    const statusBorder = isTrue ? 'border-green-500' : 'border-red-500';
    const statusIcon = isTrue ? 'fa-check-circle' : 'fa-times-circle';
    const statusText = isTrue ? 'VALIDACIÓN EXITOSA' : 'VALIDACIÓN FALLIDA';
    const glowClass = isTrue ? 'shadow-[0_0_50px_rgba(74,222,128,0.2)]' : 'shadow-[0_0_50px_rgba(239,68,68,0.2)]';

    container.innerHTML = `
        <div class="mt-8 relative overflow-hidden rounded-3xl border-4 ${statusBorder} ${glowClass} bg-slate-900 transition-all duration-500 transform scale-100 opacity-0 animate-fade-in-up">
            
            <!-- Scanline effect overlay -->
            <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,6px_100%]"></div>

            <!-- Layout Principal -->
            <div class="relative z-10 flex flex-col">
                
                <div class="grid grid-cols-1 lg:grid-cols-2 border-b border-slate-700">
                    <!-- Columna Izquierda: Resultado Visual -->
                    <div class="p-10 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-700 ${statusBg}">
                        <div class="mb-6 relative">
                             <div class="absolute inset-0 ${isTrue ? 'bg-green-500' : 'bg-red-500'} blur-2xl opacity-20 rounded-full"></div>
                             <i class="fas ${statusIcon} text-9xl ${statusColor} drop-shadow-2xl relative z-10 animate-pulse"></i>
                        </div>
                        
                        <h2 class="text-3xl font-black text-white tracking-widest text-center mb-2">${isTrue ? 'TRUE' : 'FALSE'}</h2>
                        <div class="px-4 py-1 rounded-full border border-white/20 text-xs font-mono text-white/70 uppercase tracking-widest bg-black/40">
                            ${statusText}
                        </div>
                    </div>

                    <!-- Columna Derecha: Datos del Circuito -->
                    <div class="p-8 bg-slate-900/90 backdrop-blur">
                        <div class="mb-6">
                            <h5 class="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase mb-4 pb-2 border-b border-indigo-500/30">
                                <i class="fas fa-microchip"></i> Entradas del Circuito
                            </h5>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                ${varsHtml}
                            </div>
                        </div>

                        <div>
                            <h5 class="flex items-center gap-2 text-yellow-400 font-bold text-sm uppercase mb-3 pb-2 border-b border-yellow-500/30">
                                <i class="fas fa-code"></i> Expresión Lógica
                            </h5>
                            <div class="bg-black p-4 rounded-xl border border-slate-700 font-mono text-xs text-yellow-300 break-all shadow-inner">
                                <span class="text-slate-500 select-none">> </span>${data.evaluacion.expresion}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Nueva Sección: Visualización del Proceso Lógico (Arbol de Decisión) -->
                <div class="p-6 bg-slate-800/50">
                    <h5 class="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase mb-4 pl-2 border-l-4 border-blue-500">
                        <i class="fas fa-project-diagram"></i> Visualización del Proceso de Decisión
                    </h5>
                    <div id="logic-graph-container" class="w-full h-[400px] bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden"></div>
                    <div class="flex justify-center gap-4 mt-2 text-[10px] text-gray-400">
                        <span class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-green-500"></div> Condición Cumplida</span>
                        <span class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-red-500"></div> Condición Fallida</span>
                        <span class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-blue-500"></div> Operador Lógico</span>
                    </div>
                </div>

            </div>
            
            <!-- Footer Informativo -->
            <div class="bg-black/50 p-3 text-center border-t border-white/5">
                <p class="text-xs text-slate-500 font-mono">
                    <i class="fas fa-info-circle mr-1"></i>
                    Evaluado en t=${new Date().toLocaleTimeString()} para Sujeto #${data.animal.id}
                </p>
            </div>
        </div>

        <style>
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
                animation: fadeInUp 0.6s ease-out forwards;
            }
        </style>
    `;

    // Renderizar grafco después de que el DOM se actualice
    setTimeout(() => {
        renderLogicGraph('logic-graph-container', data.evaluacion.expresion, data.variables_usadas);
    }, 100);
}

// ==========================================
// PARSER Y VISUALIZADOR DE LÓGICA
// ==========================================

/**
 * Visualiza la expresión lógica como un grafo (árbol de decisión).
 * Parsea la expresión y genera nodos para Vis.js.
 * @param {string} containerId - ID del contenedor DOM.
 * @param {string} expression - Expresión lógica.
 * @param {Object} variables - Variables usadas en la evaluación.
 */
function renderLogicGraph(containerId, expression, variables) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const nodes = [];
    const edges = [];
    let nodeIdCounter = 1;

    // Helper para evaluar condición atómica en JS (simular lo que hizo el backend)
    function evaluateAtom(atom, vars) {
        let cleanAtom = atom.trim();
        // Quitar parentesis externos si sobran
        while (cleanAtom.startsWith('(') && cleanAtom.endsWith(')')) {
            cleanAtom = cleanAtom.slice(1, -1).trim();
        }

        // Reemplazar vars
        let evalStr = cleanAtom;
        let originalLabel = cleanAtom;

        // Ordenar vars por longitud para evitar remplazos parciales
        const sortedKeys = Object.keys(vars).sort((a, b) => b.length - a.length);

        for (const k of sortedKeys) {
            const val = vars[k];
            // Regex para palabra completa
            const regex = new RegExp(`\\b${k}\\b`, 'g');
            // Si es string poner quotes
            const replacement = typeof val === 'string' ? `'${val}'` : val;
            evalStr = evalStr.replace(regex, replacement);
        }

        try {
            // Convertir = simple a == para JS si es necesario (aunque Python usa ==)
            // Python 'and'/'or' -> JS '&&'/'||'
            let jsEvalStr = evalStr
                .replace(/\band\b/gi, '&&')
                .replace(/\bor\b/gi, '||')
                .replace(/\bnot\b/gi, '!');

            const result = eval(jsEvalStr);
            return { result: !!result, label: cleanAtom, valueStr: evalStr };
        } catch (e) {
            console.warn("Error evaluando atomo visual:", e);
            return { result: false, label: atom, error: true };
        }
    }

    // Parser recursivo simple para construir árbol
    function parseNode(expr, parentId = null) {
        expr = expr.trim();

        // Quitar paréntesis envolventes
        while (expr.startsWith('(') && expr.endsWith(')')) {
            // Verificar si los paréntesis son realmente envolventes de TODO (balanceo)
            let depth = 0;
            let stripped = true;
            for (let i = 0; i < expr.length - 1; i++) {
                if (expr[i] === '(') depth++;
                if (expr[i] === ')') depth--;
                if (depth === 0) {
                    stripped = false;
                    break;
                }
            }
            if (stripped) expr = expr.slice(1, -1).trim();
            else break;
        }

        const currentId = nodeIdCounter++;

        // Buscar operador principal (OR tiene menos precedencia, so split by OR first)
        // Necesitamos split respetando paréntesis
        function findSplitIndex(str, separator) {
            let depth = 0;
            const sepLen = separator.length;
            for (let i = 0; i <= str.length - sepLen; i++) {
                if (str[i] === '(') depth++;
                else if (str[i] === ')') depth--;
                else if (depth === 0 && str.substr(i, sepLen).toLowerCase() === separator) {
                    return i;
                }
            }
            return -1;
        }

        let splitIdx = findSplitIndex(expr, ' or ');
        let operator = 'OR';

        if (splitIdx === -1) {
            splitIdx = findSplitIndex(expr, ' and ');
            operator = 'AND';
        }

        if (splitIdx !== -1) {
            // Es un nodo operador
            const leftExpr = expr.substring(0, splitIdx);
            const rightExpr = expr.substring(splitIdx + (operator === 'OR' ? 4 : 5)); // ' or ' is 4, ' and ' is 5 chars? ' or ' len 4. ' and ' len 5.

            // Evaluar operador (simplificado, asume hijos se evaluan bien)
            // Para el color del nodo operador, necesitamos el resultado combinado.
            // Lo hacemos post-procesado o calculamos aquí.

            nodes.push({
                id: currentId,
                label: operator,
                group: 'operator',
                shape: 'diamond',
                color: { background: '#3b82f6', border: '#2563eb' },
                font: { color: 'white', size: 16 }
            });

            if (parentId) edges.push({ from: parentId, to: currentId });

            const leftRes = parseNode(leftExpr, currentId);
            const rightRes = parseNode(rightExpr, currentId);

            // Determinar resultado de este nodo para colorear aristas si quisieramos
            // (Opcional, por ahora solo mostramos estructura)
            return;
        }

        // Es una hoja (Condición Atómica)
        const evaluation = evaluateAtom(expr, variables);
        const color = evaluation.result ? '#22c55e' : '#ef4444'; // Green / Red

        nodes.push({
            id: currentId,
            label: evaluation.label, // Texto corto
            title: `Valor evaluado: ${evaluation.valueStr}\nResultado: ${evaluation.result}`, // Tooltip
            group: 'condition',
            shape: 'box',
            color: {
                background: evaluation.result ? '#dcfce7' : '#fee2e2',
                border: color
            },
            font: { color: evaluation.result ? '#15803d' : '#b91c1c' },
            borderWidth: 2
        });

        if (parentId) edges.push({ from: parentId, to: currentId });

        return evaluation.result;
    }

    parseNode(expression);

    // Configurar Vis.js
    const dataVis = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    const options = {
        layout: {
            hierarchical: {
                direction: 'UD',
                sortMethod: 'directed',
                levelSeparation: 100,
                nodeSpacing: 200
            }
        },
        physics: false,
        edges: {
            smooth: {
                type: 'cubicBezier',
                forceDirection: 'vertical',
                roundness: 0.4
            },
            color: '#64748b',
            width: 2
        }
    };

    new vis.Network(container, dataVis, options);
}

/**
 * Lógica del Simulador Genético
 */
async function ejecutarSimulacionGenetica() {
    const p1 = document.getElementById('sim-gen-p1').value;
    const p2 = document.getElementById('sim-gen-p2').value;

    if (!p1 || !p2) {
        agroAlert("Selecciona ambos progenitores para la simulación", "Error de Selección", "error");
        return;
    }

    if (p1 === p2) {
        agroAlert("No se puede realizar un cruce con el mismo ejemplar", "Paradoja de Identidad", "warning");
        return;
    }

    const container = document.getElementById('sim-gen-result');
    container.classList.remove('hidden');
    container.innerHTML = `
        <div class="flex flex-col items-center py-10">
            <i class="fas fa-dna text-6xl text-indigo-500 animate-pulse mb-4"></i>
            <p class="text-white font-bold tracking-widest">SECUENCIANDO MATRIZ GENÉTICA...</p>
        </div>
    `;

    try {
        const res = await fetch('/api/analisis/comparativa-genetica', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ animal1_id: parseInt(p1), animal2_id: parseInt(p2) })
        });
        const data = await res.json();
        renderGeneticSimResult(data);
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-red-500">Error en la simulación</p>';
    }
}

function renderGeneticSimResult(data) {
    const container = document.getElementById('sim-gen-result');
    const matiz = data.matiz_genetico;

    // Colores según riesgo
    let riskColor = 'text-green-400';
    let riskBg = 'bg-green-500/20';
    let riskBorder = 'border-green-500/50';
    let riskLabel = 'RECOMENDADO';

    if (matiz > 25) {
        riskColor = 'text-yellow-400';
        riskBg = 'bg-yellow-500/20';
        riskBorder = 'border-yellow-500/50';
        riskLabel = 'PRECAUCIÓN';
    }
    if (data.riesgo_consanguinidad === 'Crítico' || matiz > 40) {
        riskColor = 'text-red-500';
        riskBg = 'bg-red-500/20';
        riskBorder = 'border-red-500/50';
        riskLabel = 'CRÍTICO - NO RECOMENDADO';
    }

    container.innerHTML = `
        <div class="bg-white/5 rounded-3xl p-8 border border-white/10 relative">
            <div class="flex flex-col lg:flex-row gap-10 items-center">
                <!-- Porcentaje / Gauge -->
                <div class="relative w-48 h-48 flex items-center justify-center">
                    <svg class="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="80" stroke="currentColor" stroke-width="12" fill="transparent" class="text-slate-800" />
                        <circle cx="96" cy="96" r="80" stroke="currentColor" stroke-width="12" fill="transparent" 
                            stroke-dasharray="${2 * Math.PI * 80}" 
                            stroke-dashoffset="${(2 * Math.PI * 80) * (1 - matiz / 100)}" 
                            class="${riskColor} transition-all duration-1000" />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-4xl font-black text-white">${matiz}%</span>
                        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Consanguinidad</span>
                    </div>
                </div>

                <!-- Info -->
                <div class="flex-1">
                    <div class="inline-block ${riskBg} ${riskColor} ${riskBorder} border px-4 py-1 rounded-full text-xs font-black mb-4 tracking-widest">
                        ESTATUS: ${riskLabel}
                    </div>
                    <h4 class="text-2xl font-bold text-white mb-4">Resultado del Análisis de Compatibilidad</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="bg-slate-800/50 p-4 rounded-2xl">
                            <span class="text-gray-400 text-xs block mb-1">Ancestros Compartidos</span>
                            <span class="text-white font-bold text-lg">${data.ancestros_comunes} ejemplares</span>
                        </div>
                        <div class="bg-slate-800/50 p-4 rounded-2xl">
                            <span class="text-gray-400 text-xs block mb-1">Compatibilidad</span>
                            <span class="${riskColor} font-bold text-lg">${data.compatibilidad}</span>
                        </div>
                    </div>
                    
                    <div class="mt-6 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <p class="text-sm text-indigo-200">
                            <i class="fas fa-info-circle mr-2"></i>
                            Este cálculo estima la probabilidad de alelos compartidos por descendencia. 
                            ${matiz > 20 ? 'Se detectan líneas de sangre redundantes que podrían expresar genes recesivos indeseados.' : 'La diversidad genética para este cruce es óptima para el vigor híbrido.'}
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="mt-10 pt-10 border-t border-white/5">
                 <h5 class="text-white font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-project-diagram text-indigo-400"></i> Árbol Genético Proyectado
                 </h5>
                 <div id="projected-tree-container" class="w-full h-[300px] bg-black/30 rounded-2xl overflow-hidden border border-white/5"></div>
            </div>
        </div>
    `;

    // Renderizar grafo proyectado (simplificado: mostrar ambos padres y sus ancestros)
    setTimeout(() => {
        renderProjectedTree('projected-tree-container', data);
    }, 100);
}

function renderProjectedTree(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Aquí simplemente mostraremos una conexión visual entre los dos padres hacia un nodo "Hijo Proyectado"
    const nodes = [
        { id: 'p1', label: `#${data.animales.a1.id}\n${data.animales.a1.raza}`, color: '#818cf8', shape: 'box', margin: 10, font: { color: 'white' } },
        { id: 'p2', label: `#${data.animales.a2.id}\n${data.animales.a2.raza}`, color: '#f472b6', shape: 'box', margin: 10, font: { color: 'white' } },
        { id: 'hijo', label: `Hijo(a) Proyectado\nEspecie: ${data.animales.a1.especie}`, color: '#10b981', shape: 'diamond', size: 40, font: { color: 'white', bold: true } }
    ];

    const edges = [
        { from: 'p1', to: 'hijo', arrows: 'to', color: '#818cf8', width: 2 },
        { from: 'p2', to: 'hijo', arrows: 'to', color: '#f472b6', width: 2 }
    ];

    const networkData = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    const options = {
        layout: {
            hierarchical: {
                direction: 'UD',
                sortMethod: 'directed',
                levelSeparation: 100,
                nodeSpacing: 150
            }
        },
        physics: false
    };

    new vis.Network(container, networkData, options);
}

function cambiarTabAnalisis(tab) {
    // Ocultar todos
    document.querySelectorAll('.tab-content-analisis').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-analisis').forEach(el => {
        el.classList.remove('bg-gray-50', 'bg-slate-800', 'text-indigo-600', 'text-white');
        el.classList.add('text-gray-500');
    });

    const activeContent = document.getElementById(`content-${tab}`);
    if (activeContent) activeContent.classList.remove('hidden');

    const activeTab = document.getElementById(`tab-${tab}`);
    if (activeTab) {
        if (tab.includes('genetico')) {
            activeTab.classList.add('bg-slate-800', 'text-white');
            activeTab.classList.remove('text-gray-500');
        } else {
            activeTab.classList.add('bg-gray-50', 'text-indigo-600');
            activeTab.classList.remove('text-gray-500');
        }
    }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño delay para asegurar que el DOM base existe
    setTimeout(initCircuitosLogicos, 500);
});
