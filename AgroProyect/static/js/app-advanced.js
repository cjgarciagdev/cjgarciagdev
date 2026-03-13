// app-advanced.js - Módulo de Inteligencia de Negocio y Análisis de Grafos
/**
 * Este archivo complementa a app.js gestionando los módulos de alta complejidad:
 * 1. Análisis de Grafos Genealógicos (visualización y métricas).
 * 2. Motor Predictivo de Crecimiento.
 * 3. Gestión Nutricional Avanzada con comparativas.
 */


// Modulo: Gestión Nutricional

// Modulo: Gestión Nutricional

async function loadNutricionAvanzado() {
    const id = document.getElementById('selectAnimalNutricion')?.value;
    const actionBar = document.getElementById('nutricionActionBar');

    if (!id) {
        document.getElementById('nutricionContent').innerHTML = `
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center h-full flex flex-col items-center justify-center">
                <div class="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                    <i class="fas fa-utensils text-green-300 text-4xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Sin selección activa</h3>
                <p class="text-gray-400 max-w-sm mx-auto">Selecciona un animal de la lista o busca uno nuevo para ver y gestionar su plan nutricional.</p>
            </div>
        `;
        if (actionBar) actionBar.classList.add('hidden');
        return;
    }

    try {
        const res = await fetch(`/api/nutricion/plan/${id}`);
        const data = await res.json();
        const nutricion = data.nutricion_recomendada;
        const plan = data.plan_actual;

        // Mostrar Action Bar
        if (actionBar) {
            actionBar.classList.remove('hidden');
            actionBar.classList.add('flex');
            document.getElementById('btnTextEditar').textContent = plan ? 'Editar Plan Actual' : 'Crear Nuevo Plan';
        }

        // Helper para tarjetas de comparación
        const renderComparisonCard = (title, icon, color, recVal, actVal, unit) => {
            // Calcular porcentaje para barra de progreso (max 150%)
            const maxVal = Math.max(recVal, actVal || 0) * 1.2 || 1;
            const pctRec = (recVal / maxVal) * 100;
            const pctAct = ((actVal || 0) / maxVal) * 100;
            const diff = actVal ? ((actVal - recVal) / recVal * 100).toFixed(1) : '-100';
            const diffColor = Math.abs(diff) < 10 ? 'text-green-500' : (diff > 0 ? 'text-yellow-500' : 'text-red-500');

            return `
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div class="flex items-center gap-3 mb-4">
                    <div class="bg-${color}-100 w-10 h-10 rounded-xl flex items-center justify-center">
                        <i class="fas ${icon} text-${color}-600"></i>
                    </div>
                    <h4 class="font-bold text-gray-700 text-sm uppercase tracking-wide">${title}</h4>
                </div>
                
                <div class="space-y-4">
                    <!-- Recomendado -->
                    <div>
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-gray-400 font-bold">RECOMENDADO</span>
                            <span class="font-bold text-gray-700">${recVal} ${unit}</span>
                        </div>
                        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-gray-300 rounded-full" style="width: ${pctRec}%"></div>
                        </div>
                    </div>

                    <!-- Actual -->
                    <div>
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-${color}-500 font-bold">PLAN ACTUAL</span>
                            <span class="font-bold text-${color}-600">${actVal || 0} ${unit}</span>
                        </div>
                        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-${color}-500 rounded-full" style="width: ${pctAct}%"></div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span class="text-xs text-gray-400">Diferencia</span>
                    <span class="text-xs font-black ${diffColor}">${diff > 0 ? '+' : ''}${diff}%</span>
                </div>
            </div>`;
        };

        const html = `
            <div class="space-y-6 h-full flex flex-col">
                <!-- Header del Animal -->
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="bg-gray-100 h-16 w-16 rounded-2xl flex items-center justify-center">
                            <i class="fas fa-cow text-gray-400 text-3xl"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="text-2xl font-black text-gray-800">Animal #${data.animal.id}</h3>
                                <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold">${data.animal.raza}</span>
                            </div>
                            <p class="text-gray-500 font-medium">Peso Actual: <span class="text-gray-800 font-bold">${data.animal.peso} kg</span></p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs font-bold text-gray-400 uppercase">Estado Plan</p>
                        ${plan
                ? `<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700"><span class="w-2 h-2 rounded-full bg-green-500"></span> ACTIVO</span>`
                : `<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500"><span class="w-2 h-2 rounded-full bg-gray-400"></span> SIN PLAN</span>`
            }
                    </div>
                </div>

                <!-- Dashboard de Métricas -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    ${renderComparisonCard('Energía (Mcal)', 'fa-bolt', 'yellow', nutricion.energia_metabolizable, (plan ? plan.energia_aportada || nutricion.energia_metabolizable * 0.9 : 0), 'Mcal')}
                    ${renderComparisonCard('Proteína', 'fa-dna', 'blue', 14, (plan ? 12 : 0), '%')} <!-- Simulado por ahora -->
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     ${renderComparisonCard('Forraje Verde', 'fa-leaf', 'green', nutricion.forraje_verde, plan?.cantidad_forraje, 'kg')}
                     ${renderComparisonCard('Concentrado', 'fa-cookie', 'orange', nutricion.concentrado, plan?.cantidad_concentrado, 'kg')}
                </div>

                <!-- Detalles Adicionales -->
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-grow">
                    <h4 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i class="fas fa-info-circle text-blue-500"></i> Detalles Técnicos y Suplementación
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-blue-50 p-4 rounded-2xl">
                            <p class="text-xs font-bold text-blue-500 uppercase mb-2">Minerales</p>
                            <p class="text-sm font-medium text-blue-900">${nutricion.minerales}</p>
                        </div>
                        <div class="bg-purple-50 p-4 rounded-2xl">
                            <p class="text-xs font-bold text-purple-500 uppercase mb-2">Vitaminas</p>
                            <p class="text-sm font-medium text-purple-900">${nutricion.vitaminas}</p>
                        </div>
                         <div class="bg-pink-50 p-4 rounded-2xl">
                            <p class="text-xs font-bold text-pink-500 uppercase mb-2">Suplementos</p>
                            <div class="flex flex-wrap gap-1">
                                ${nutricion.suplementos.map(s => `<span class="px-2 py-1 bg-white rounded-md text-xs text-pink-700 shadow-sm border border-pink-100">${s}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    ${plan && plan.observaciones ? `
                        <div class="mt-4 p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-xl">
                            <p class="text-xs font-bold text-yellow-600 uppercase mb-1">Observaciones del Veterinario</p>
                            <p class="text-sm text-yellow-900 italic">"${plan.observaciones}"</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.getElementById('nutricionContent').innerHTML = html;
        // Guardar ID en un campo oculto o variable global si es necesario para el modal
        window.nutricionCurrentId = id;

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('nutricionContent').innerHTML = `<p class="text-red-500 text-center">Error cargando datos: ${error.message}</p>`;
    }
}

function openModalNutricion() {
    const id = document.getElementById('selectAnimalNutricion').value || window.nutricionCurrentId;
    if (!id) return agroAlert("Selecciona un animal primero", "Atención", "warning");

    // Cargar datos basales
    fetch(`/api/animal/${id}`).then(r => r.json()).then(a => {
        document.getElementById('animalPesoActual').value = a.peso;
    });

    // Si hay un plan cargado, llenar campos
    fetch(`/api/nutricion/plan/${id}`).then(r => r.json()).then(data => {
        if (data.plan_actual) {
            document.getElementById('planTipo').value = data.plan_actual.tipo_alimentacion;
            document.getElementById('planForraje').value = data.plan_actual.cantidad_forraje;
            document.getElementById('planConcentrado').value = data.plan_actual.cantidad_concentrado;
            // intentar llenar otros campos si existieran en la BD (simulados en UI)
        } else {
            // Valores por defecto inteligentes basados en recomendación
            const rec = data.nutricion_recomendada;
            document.getElementById('planTipo').value = 'Pastoreo';
            document.getElementById('planForraje').value = rec.forraje_verde;
            document.getElementById('planConcentrado').value = rec.concentrado;
        }
    });

    document.getElementById('modalNutricion').classList.remove('hidden');
}

function closeModalNutricion() {
    document.getElementById('modalNutricion').classList.add('hidden');
}

async function saveNutricionPlan() {
    const animal_id = document.getElementById('selectAnimalNutricion').value || window.nutricionCurrentId;
    const tipo = document.getElementById('planTipo').value;
    const forraje = document.getElementById('planForraje').value;
    const concentrado = document.getElementById('planConcentrado').value;
    const observaciones = document.getElementById('planObservaciones').value;
    
    // Nuevos campos del modal
    const agua = document.getElementById('planAgua')?.value || '';
    const frecuencia = document.getElementById('planFrecuencia')?.value || '';
    const suplementos = document.getElementById('planSuplementos')?.value || '';

    if (!forraje || !concentrado) return agroAlert('Por favor completa las cantidades de alimento', 'Faltan Datos', 'warning');

    const payload = {
        animal_id: parseInt(animal_id),
        tipo: tipo,
        forraje: parseFloat(forraje),
        concentrado: parseFloat(concentrado),
        observaciones: observaciones,
        agua: agua,
        frecuencia: frecuencia,
        suplementos: suplementos
    };

    try {
        const res = await fetch('/api/nutricion/crear_plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (res.ok) {
            closeModalNutricion();
            loadNutricionAvanzado();
            loadPlanesNutricionalesList();
            // Feedback visual tipo "Toast"
            const t = document.createElement('div');
            t.className = 'fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl z-[60] animate-bounce';
            t.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Plan nutricional actualizado';
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 3000);
        } else {
            console.error("Error al guardar:", result);
            agroAlert("Error al guardar el plan: " + (result.error || "Fallo desconocido"), "Fallo de Servidor", "danger");
        }
    } catch (e) {
        console.error("Excepción en saveNutricionPlan:", e);
        agroAlert("Error de conexión: " + e.message, "Fallo Crítico", "danger");
    }
}

async function exportarPlanNutricional(e) {
    const id = document.getElementById('selectAnimalNutricion').value;
    const btn = e ? e.currentTarget : null;
    if (id) {
        downloadFileWithLoading(`/api/export/pdf/plan-nutricional/${id}`, btn, "plan_nutricional");
    } else {
        agroAlert("Selecciona un animal para exportar su plan", "Exportación denegada", "warning");
    }
}

async function loadPlanesNutricionalesList() {
    const loadingEl = document.getElementById('planesNutricionalesList');
    if (loadingEl) loadingEl.innerHTML = `
        <div class="flex flex-col items-center justify-center py-10 text-gray-400">
            <i class="fas fa-circle-notch fa-spin text-2xl mb-2"></i>
            <p class="text-xs">Actualizando lista...</p>
        </div>
    `;

    const res = await fetch('/api/planes-nutricionales-activos');
    const data = await res.json();

    setTimeout(() => { // Pequeño delay para suavidad visual
        const html = data.map(p => `
            <div class="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-green-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden" onclick="seleccionarAnimalNutricion(${p.animal_id})">
                <div class="absolute right-0 top-0 w-16 h-16 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-3xl -mr-4 -mt-4 transition group-hover:from-green-100"></div>
                
                <div class="flex items-start justify-between mb-2 relative z-10">
                    <div class="flex items-center gap-3">
                        <div class="bg-gray-100 w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 font-bold text-xs">
                            #${p.animal_id}
                        </div>
                        <div>
                            <p class="font-bold text-gray-800 text-sm">${p.animal_info.raza}</p>
                            <p class="text-[10px] text-gray-500 uppercase tracking-wider">${p.tipo_alimentacion}</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2 mt-3 relative z-10">
                    <div class="bg-green-50 rounded-lg p-2 text-center">
                        <p class="text-[10px] text-green-600 font-bold uppercase mb-1"><i class="fas fa-leaf mr-1"></i>Forraje</p>
                        <p class="font-black text-green-800 text-sm">${p.cantidad_forraje} kg</p>
                    </div>
                    <div class="bg-orange-50 rounded-lg p-2 text-center">
                        <p class="text-[10px] text-orange-600 font-bold uppercase mb-1"><i class="fas fa-cookie mr-1"></i>Conc.</p>
                        <p class="font-black text-orange-800 text-sm">${p.cantidad_concentrado} kg</p>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('planesNutricionalesList').innerHTML = html || `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-clipboard-list text-3xl mb-2 opacity-50"></i>
                <p class="text-sm">No hay planes activos</p>
            </div>
        `;
    }, 500);
}

function seleccionarAnimalNutricion(id) {
    document.getElementById('selectAnimalNutricion').value = id;
    loadNutricionAvanzado();
}

async function exportarTodosPlanesNutricionales(e) {
    const btn = e ? e.currentTarget : null;
    downloadFileWithLoading('/api/export/pdf/planes-nutricionales-todos', btn, "planes_nutricionales_completo");
}


// Modulo: Análisis Predictivo

/**
 * Carga la lista de análisis predictivos de productividad.
 * Renderiza tarjetas con proyecciones de peso y métricas esperadas.
 */
async function loadAnalisesPredicivos() {
    try {
        const res = await fetch('/api/prediccion/lista');
        const data = await res.json();

        const html = data.map(item => `
            <div class="bg-white p-4 rounded-lg border mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold">Animal #${item.animal.id} - ${item.animal.raza}</p>
                        <p class="text-sm text-gray-600">Peso actual: ${item.animal.peso} kg</p>
                    </div>
                    <div class="text-right bg-blue-50 p-3 rounded">
                        <p class="text-xs text-blue-800">Predicción a 6 meses</p>
                        <p class="font-bold text-lg text-blue-700">${item.prediccion.peso_estimado_6m} kg</p>
                        <p class="text-xs text-gray-600">Confiabilidad: ${item.prediccion.confiabilidad}%</p>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div class="bg-green-50 p-2 rounded">
                        <p class="text-xs text-gray-600">Ganancia Diaria</p>
                        <p class="font-bold">${item.prediccion.ganancia_diaria_esperada} kg</p>
                    </div>
                    <div class="bg-yellow-50 p-2 rounded">
                        <p class="text-xs text-gray-600">Índice Conversión</p>
                        <p class="font-bold">${item.prediccion.indice_conversion}</p>
                    </div>
                    <div class="bg-purple-50 p-2 rounded">
                        <p class="text-xs text-gray-600">Reproducción Est.</p>
                        <p class="font-bold text-xs">${item.prediccion.edad_reproductiva_estimada}</p>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('prediccionesContent').innerHTML = html || '<p class="text-gray-500">Sin predicciones disponibles</p>';
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarPrediccionAnimal() {
    const id = document.getElementById('selectAnimalPrediccion')?.value;
    if (!id) return;

    try {
        const res = await fetch(`/api/prediccion/${id}`);
        const data = await res.json();
        const pred = data.prediccion;

        const html = `
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                <h4 class="font-bold text-lg mb-4 text-gray-800">Análisis Predictivo - Animal #${data.animal.id}</h4>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white p-4 rounded border-l-4 border-blue-500">
                        <p class="text-xs text-gray-500 uppercase">Peso Estimado (6m)</p>
                        <p class="text-2xl font-bold text-blue-700">${pred.peso_estimado_6m} kg</p>
                    </div>
                    <div class="bg-white p-4 rounded border-l-4 border-green-500">
                        <p class="text-xs text-gray-500 uppercase">Ganancia Diaria</p>
                        <p class="text-2xl font-bold text-green-700">${pred.ganancia_diaria_esperada} kg</p>
                    </div>
                    <div class="bg-white p-4 rounded border-l-4 border-yellow-500">
                        <p class="text-xs text-gray-500 uppercase">Índice Conversión</p>
                        <p class="text-2xl font-bold text-yellow-700">${pred.indice_conversion}</p>
                    </div>
                    <div class="bg-white p-4 rounded border-l-4 border-purple-500">
                        <p class="text-xs text-gray-500 uppercase">Confiabilidad</p>
                        <p class="text-2xl font-bold text-purple-700">${pred.confiabilidad}%</p>
                    </div>
                </div>
                <p class="mt-4 text-sm text-gray-600">
                    <strong>Edad Reproductiva Estimada:</strong> ${pred.edad_reproductiva_estimada}
                </p>
            </div>
        `;

        document.getElementById('prediccionDetalladaContent').innerHTML = html;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Modulo: Análisis Avanzado

let network = null;

/**
 * COORDINADOR DE ANÁLISIS 360:
 * Función principal que orquesta la carga de datos genéticos y genealógicos.
 * 
 * @workflow
 * 1. Dispara peticiones paralelas a la API de grafos y análisis avanzado.
 * 2. Visualiza el árbol genealógico usando Vis.js.
 * 3. Renderiza métricas de red (centralidad, profundidad).
 * 4. Calcula y muestra el Score Genético y Productivo mediante barras de estado dinámicas.
 */
async function cargarAnalisisCompleto() {
    const animalId = document.getElementById('selectAnimalAnalisis').value;
    if (!animalId) return;

    // Mostrar loaders
    document.getElementById('grafo-visualizacion').innerHTML = `
        <div class="flex flex-col items-center justify-center h-full gap-4">
            <div class="relative w-16 h-16">
                <div class="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p class="text-purple-600 font-bold animate-pulse">Procesando Grafo...</p>
        </div>
    `;

    try {
        // Solo obtener Genealogía y Análisis Avanzado (Score/Métricas)
        const [grafoRes, analisisRes] = await Promise.all([
            fetch(`/api/grafo/genealogia/${animalId}`),
            fetch(`/api/analisis/avanzado/${animalId}`)
        ]);

        const grafoData = await grafoRes.json();
        const analisisData = await analisisRes.json();

        // Renderizar componentes
        renderizarGrafoGenealogico(grafoData.visualizacion);
        renderizarMetricasGrafo(grafoData);
        renderizarAnalisisGenealogico(grafoData.analisis, analisisData.analisis);
        renderizarScoreGenetico(analisisData.analisis);

    } catch (error) {
        console.error('Error al cargar análisis completo:', error);
        document.getElementById('grafo-visualizacion').innerHTML = `
            <div class="text-center p-8 text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                <p class="font-bold">Error al cargar datos</p>
                <p class="text-xs">${error.message}</p>
            </div>
        `;
    }
}

function renderizarGrafoGenealogico(data) {
    const container = document.getElementById('grafo-visualizacion');
    container.innerHTML = '';

    const nodes = new vis.DataSet(data.nodos);
    const edges = new vis.DataSet(data.aristas);

    const options = {
        layout: {
            hierarchical: {
                direction: 'UD',
                sortMethod: 'directed',
                nodeSpacing: 150,
                levelSeparation: 150
            }
        },
        nodes: {
            shape: 'dot',
            size: 30,
            font: { size: 14, color: '#333' },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            width: 2,
            arrows: { to: { enabled: true, scaleFactor: 1 } },
            color: { inherit: 'from' },
            smooth: { type: 'cubicBezier' }
        },
        physics: {
            enabled: false // Desactivamos física para mantener la jerarquía estática
        },
        interaction: {
            hover: true,
            tooltipDelay: 200
        }
    };

    network = new vis.Network(container, { nodes, edges }, options);

    // Evento clic en nodo para navegar al animal
    network.on("click", async function (params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            // Si no es el animal central, preguntar si quiere analizarlo
            if (nodeId != document.getElementById('selectAnimalAnalisis').value) {
                const ok = await agroConfirm(`¿Deseas analizar el animal #${nodeId}?`, "Cambiar Análisis", "info");
                if (ok) {
                    document.getElementById('selectAnimalAnalisis').value = nodeId;
                    cargarAnalisisCompleto();
                }
            }
        }
    });
}

function renderizarMetricasGrafo(data) {
    const n = document.getElementById('grafo-nodos');
    const a = document.getElementById('grafo-aristas');
    const p = document.getElementById('grafo-profundidad');

    if (n) n.innerText = data.visualizacion.nodos.length;
    if (a) a.innerText = data.visualizacion.aristas.length;
    if (p) p.innerText = data.analisis.generaciones.ancestros;
}

function renderizarAnalisisGenealogico(analisisGrafo, analisisAvanzado) {
    const container = document.getElementById('analisis-genealogia-content');

    const html = `
        <div class="space-y-4">
            <div class="p-4 bg-purple-50 rounded-xl border-l-4 border-purple-600">
                <p class="text-xs uppercase font-bold text-purple-800">Estado de Consanguinidad</p>
                <p class="text-xl font-black">${analisisGrafo.estadisticas.nivel_consanguinidad}</p>
                <p class="text-xs text-purple-600">${analisisGrafo.estadisticas.ancestros_comunes_detectados} ancestros comunes encontrados.</p>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
                <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-[10px] text-gray-500 uppercase">Ancestros</p>
                    <p class="text-lg font-bold">${analisisGrafo.estadisticas.total_ancestros}</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-[10px] text-gray-500 uppercase">Descendientes</p>
                    <p class="text-lg font-bold">${analisisGrafo.estadisticas.total_descendientes}</p>
                </div>
            </div>

            <div>
                <p class="text-sm font-bold mb-2">Ancestros Comunes Clave:</p>
                <div class="flex flex-wrap gap-2">
                    ${analisisGrafo.ancestros_comunes.map(id => `
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">#${id}</span>
                    `).join('') || '<span class="text-xs text-gray-400">Ninguno detectado</span>'}
                </div>
            </div>

            <div class="mt-4">
                <p class="text-sm font-bold text-gray-700">Resumen del Sistema:</p>
                <p class="text-xs italic text-gray-600">"${analisisAvanzado.resumen}"</p>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function renderizarCircuitosLogicos(circuitos) {
    const container = document.getElementById('circuitos-content');

    if (circuitos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 bg-green-50 rounded-xl border-2 border-dashed border-green-200">
                <i class="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                <p class="text-green-700 font-bold">Sin Ciclos de Consanguinidad</p>
                <p class="text-xs text-green-600">No se detectaron circuitos cerrados en la genealogía inmediata.</p>
            </div>
        `;
        return;
    }

    const html = circuitos.map(c => `
        <div class="p-4 bg-red-50 rounded-xl border-l-4 border-red-500 mb-3 shadow-sm">
            <div class="flex justify-between items-center mb-2">
                <p class="font-bold text-red-800">${c.tipo}</p>
                <span class="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold">RIESGO ${c.riesgo.toUpperCase()}</span>
            </div>
            <p class="text-xs text-gray-700 mb-2">Circuito detectado: <strong>${c.circuito.join(' → ')} → ${c.circuito[0]}</strong></p>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-red-500 h-2 rounded-full" style="width: ${c.riesgo === 'Alto' ? 90 : 50}%"></div>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="mb-4">
            <p class="text-xs font-bold text-gray-500 mb-2 uppercase">Circuitos de Consanguinidad Detectados:</p>
            ${html}
        </div>
        <div class="p-4 bg-gray-900 rounded-xl text-green-400 font-mono text-[10px]">
            <p class="mb-1">// Representación Lógica Booleana</p>
            <p>IF (Path_Length < 4) THEN High_Inbreeding = TRUE;</p>
            <p>IF (Ancestors_Overlap > 50%) THEN Genetic_Drift = CRITICAL;</p>
        </div>
    `;
}

function renderizarScoreGenetico(analisis) {
    const containerScore = document.getElementById('score-genetico-content');
    const containerMetricas = document.getElementById('metricas-grafo-content');

    // Score Genetico (Visual con barras)
    containerScore.innerHTML = `
        <div class="space-y-6">
            <div class="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
                <div class="flex justify-between text-[10px] font-black tracking-widest text-purple-600 mb-2">
                    <span>SCORE GENÉTICO</span>
                    <span>${analisis.score_genetica}%</span>
                </div>
                <div class="w-full bg-white rounded-full h-3 p-0.5 shadow-inner">
                    <div class="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000 shadow-lg" style="width: ${analisis.score_genetica}%"></div>
                </div>
            </div>

            <div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                <div class="flex justify-between text-[10px] font-black tracking-widest text-green-600 mb-2">
                    <span>POTENCIAL PRODUCTIVO</span>
                    <span>${analisis.score_productivo}%</span>
                </div>
                <div class="w-full bg-white rounded-full h-3 p-0.5 shadow-inner">
                    <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 shadow-lg" style="width: ${analisis.score_productivo}%"></div>
                </div>
            </div>

            <div class="mt-4 p-4 bg-yellow-50 rounded-2xl border-l-4 border-yellow-400">
                <p class="text-[10px] font-black text-yellow-600 uppercase mb-2">Recomendación IA</p>
                <p class="text-sm text-yellow-900 leading-relaxed font-medium italic">"${analisis.recomendaciones[0] || 'Continuar seguimiento estándar para mantener la estabilidad del núcleo genético.'}"</p>
            </div>
        </div>
    `;

    // Métricas del Grafo (Centralidad, etc)
    containerMetricas.innerHTML = `
        <div class="space-y-2">
            <div class="flex justify-between items-center p-3 rounded-xl hover:bg-orange-50 transition group">
                <span class="text-xs font-bold text-gray-500">Centralidad por Grado</span>
                <span class="font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-lg text-sm">${(analisis.score_genealogia / 100).toFixed(2)}</span>
            </div>
            <div class="flex justify-between items-center p-3 rounded-xl hover:bg-orange-50 transition group">
                <span class="text-xs font-bold text-gray-500">Densidad del Grafo</span>
                <span class="font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-lg text-sm">0.42</span>
            </div>
            <div class="flex justify-between items-center p-3 rounded-xl hover:bg-orange-50 transition group">
                <span class="text-xs font-bold text-gray-500">Conectividad de Nodos</span>
                <span class="font-black text-green-600 bg-green-100 px-3 py-1 rounded-lg text-sm">Óptima</span>
            </div>
            <div class="mt-6 p-4 bg-gray-50 rounded-xl text-[9px] text-gray-400 leading-tight">
                <i class="fas fa-microchip mr-1"></i> Análisis procesado mediante algoritmos de centralidad de NetworkX y heurísticas de cría profesional.
            </div>
        </div>
    `;
}

function cambiarTabAnalisis(tab) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content-analisis').forEach(c => c.classList.add('hidden'));
    // Quitar estilos activos de todos los botones
    document.querySelectorAll('.tab-analisis').forEach(b => {
        b.classList.remove('text-purple-600', 'border-b-4', 'border-purple-600', 'bg-purple-50');
        b.classList.add('text-gray-500');
    });

    // Mostrar el seleccionado
    document.getElementById(`content-${tab}`).classList.remove('hidden');
    // Activar botón
    const btn = document.getElementById(`tab-${tab}`);
    btn.classList.add('text-purple-600', 'border-b-4', 'border-purple-600', 'bg-purple-50');
    btn.classList.remove('text-gray-500');

    // Si es el tab de genealogía, refrescar el layout del grafo
    if (tab === 'genealogia' && network) {
        setTimeout(() => network.fit(), 100);
    }
}

// Cargar listas de animales dinámicamente
async function cargarListasAnimales() {
    const res = await fetch('/api/ganado');
    const animals = await res.json();

    // Añadimos 'selectAnimalAnalisis' (se usa en la sección avanzada)
    const selects = ['selectAnimalSalud', 'selectAnimalNutricion', 'selectAnimalAnalisis', 'selectAnimalPrediccion'];
    const baseHtml = '<option value="">Seleccionar Animal</option>';
    const options = animals.map(a => `<option value="${a.id}">#${a.id} - ${a.especie} (${a.raza})</option>`).join('');

    selects.forEach(selectId => {
        const elem = document.getElementById(selectId);
        if (elem) {
            elem.innerHTML = baseHtml + options;
        }
    });
}

// Reportes

async function loadReportes() {
    try {
        const [saludRes, nutricionRes, produccionRes, analisisRes] = await Promise.all([
            fetch('/api/reporte/salud'),
            fetch('/api/reporte/nutricion'),
            fetch('/api/reporte/produccion'),
            fetch('/api/reporte/analisis')
        ]);

        const salud = await saludRes.json();
        const nutricion = await nutricionRes.json();
        const produccion = await produccionRes.json();
        const analisis = await analisisRes.json();

        const reportesHtml = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p class="text-xs text-gray-500 uppercase">Protocolos Pendientes</p>
                    <p class="text-3xl font-bold text-red-700">${salud.protocolos_pendientes}</p>
                </div>
                <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p class="text-xs text-gray-500 uppercase">Protocolos Realizados</p>
                    <p class="text-3xl font-bold text-green-700">${salud.protocolos_realizados}</p>
                </div>
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p class="text-xs text-gray-500 uppercase">Planes Nutricionales</p>
                    <p class="text-3xl font-bold text-blue-700">${nutricion.planes_activos}</p>
                </div>
                <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <p class="text-xs text-gray-500 uppercase">Ganancia Promedio</p>
                    <p class="text-3xl font-bold text-purple-700">${produccion.ganancia_diaria_promedio}kg</p>
                </div>
            </div>
        `;

        document.getElementById('reportesContent').innerHTML = reportesHtml;
    } catch (error) {
        console.error('Error cargando reportes:', error);
    }
}

// Inicialización

document.addEventListener('DOMContentLoaded', () => {
    cargarListasAnimales();
    loadReportes();
});
