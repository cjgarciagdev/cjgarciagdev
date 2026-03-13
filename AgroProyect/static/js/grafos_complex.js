
// ==========================================
// VISUALIZACIÓN AVANZADA DE GRAFOS
// (Extensión para modos complejos)
// ==========================================

let fullNetwork = null;
let networkData = { nodos: [], aristas: [] };
let networkInstance = null;
let breedColors = {}; // Cache de colores por raza

// Función para generar colores consistentes para las razas
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + "00000".substring(0, 6 - c.length) + c;
}

// Extender la función cambiarTabAnalisis para soportar nuevos modos
if (typeof window.originalCambiarTab === 'undefined') {
    window.originalCambiarTab = cambiarTabAnalisis;
}

cambiarTabAnalisis = function (tab) {
    if (window.originalCambiarTab) window.originalCambiarTab(tab);

    // Lógica adicional para los nuevos tabs
    if (tab === 'red-completa') {
        cargarRedCompleta();
    } else if (tab === 'rutas') {
        cargarSelectoresCamino();
    }
}

// Función principal de carga de red
/**
 * Módulo: Red del Rebaño (Herd Network)
 * Carga y renderiza el grafo global de conexiones genealógicas del rebaño.
 * 
 * Funcionalidades:
 * - Filtro dinámico por Especie (Bovino, Ovino, etc).
 * - Visualización cromática por Raza (Clustering visual).
 * - Renderizado acelerado mediante WebGL (Vis.js).
 */
async function cargarRedCompleta() {
    const container = document.getElementById('grafo-red-full');
    const filterSpecies = document.getElementById('red-filter-species')?.value || 'all';
    const colorByBreed = document.getElementById('chk-color-breed')?.checked;

    try {
        // Cargar datos solo si es la primera vez o forzado
        if (!networkData.nodos || networkData.nodos.length === 0) {
            const res = await fetch('/api/grafo/red-completa');
            const data = await res.json();
            networkData = data;
        }

        // 1. Filtrar Nodos por Especie
        let filteredNodes = networkData.nodos;
        if (filterSpecies !== 'all') {
            filteredNodes = networkData.nodos.filter(n => n.group === filterSpecies);
        }

        // 2. Procesar Apariencia (Colores por Raza)
        const processedNodes = filteredNodes.map(node => {
            const parts = node.title.split(' - ');
            const raza = parts.length > 1 ? parts[1] : 'Desconocida';

            // Base config
            let nodeConfig = { ...node };

            // Opcional: Colorear por Raza
            if (colorByBreed) {
                if (!breedColors[raza]) {
                    breedColors[raza] = stringToColor(raza);
                }
                nodeConfig.color = {
                    background: breedColors[raza],
                    border: '#ffffff'
                };
                // Tooltip raza con color
                nodeConfig.title = `<div class="p-2"><strong>#${node.id}</strong><br>Especie: ${node.group}<br>Raza: <span style="color:${breedColors[raza]}">■</span> ${raza}</div>`;
            } else {
                // Default: Tooltip simple. 
                // Borramos color explícito para que tome el del grupo
                delete nodeConfig.color;
            }

            return nodeConfig;
        });

        // 3. Filtrar Aristas (Solo las que conectan nodos visibles)
        const visibleNodeIds = new Set(processedNodes.map(n => n.id));
        const filteredEdges = networkData.aristas.filter(e =>
            visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)
        );

        const nodes = new vis.DataSet(processedNodes);
        const edges = new vis.DataSet(filteredEdges);

        const options = {
            nodes: {
                shape: 'dot',
                size: 25,
                font: { size: 14, color: '#333', face: 'Inter', strokeWidth: 2, strokeColor: '#fff' },
                borderWidth: 2,
                shadow: true
            },
            edges: {
                color: { color: '#cbd5e1', highlight: '#3b82f6', opacity: 0.6 },
                width: 2,
                smooth: { type: 'continuous', roundness: 0.5 }
            },
            groups: {
                'Bovino': { color: { background: '#fca5a5', border: '#dc2626' } }, // Red
                'Ovino': { color: { background: '#fdba74', border: '#ea580c' } }, // Orange
                'Caprino': { color: { background: '#fde047', border: '#ca8a04' } }, // Yellow
                'Porcino': { color: { background: '#86efac', border: '#16a34a' } }, // Green
                'Equino': { color: { background: '#93c5fd', border: '#2563eb' } }, // Blue
                'Otro': { color: { background: '#c4b5fd', border: '#7c3aed' } }   // Purple
            },
            physics: {
                enabled: true,
                barnesHut: {
                    gravitationalConstant: -4000,
                    centralGravity: 0.3,
                    springLength: 120,
                    damping: 0.09
                },
                stabilization: {
                    enabled: true,
                    iterations: 1000
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 50,
                zoomView: true,
                navigationButtons: true
            }
        };

        if (networkInstance) networkInstance.destroy();
        networkInstance = new vis.Network(container, { nodes, edges }, options);
        fullNetwork = networkInstance;

    } catch (error) {
        console.error("Error cargando red completa:", error);
        container.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-red-500"><i class="fas fa-exclamation-triangle text-3xl mb-2"></i><p>Error de conexión</p></div>';
    }
}

// Función auxiliar para el evento onchange
function actualizarVisualizacionRed() {
    cargarRedCompleta();
}

/**
 * Módulo: Buscador de Rutas (Pathfinding)
 * (Keep the fixed/improved logic from previous turn)
 */
function cargarSelectoresCamino() {
    if (typeof globalAnimals !== 'undefined' && globalAnimals.length > 0) {
        const options = globalAnimals.map(a => `<option value="${a.id}">#${a.id} - ${a.especie} (${a.raza})</option>`).join('');
        const base = '<option value="">Seleccionar del rebaño...</option>';

        const selOrigen = document.getElementById('camino-origen');
        const selDestino = document.getElementById('camino-destino');

        if (selOrigen && selOrigen.options.length <= 1) selOrigen.innerHTML = base + options;
        if (selDestino && selDestino.options.length <= 1) selDestino.innerHTML = base + options;
    }
}

/**
 * Módulo: Buscador de Rutas (Pathfinding)
 * Implementa algoritmos de trayectoria sobre el grafo genealógico no dirigido.
 * Encuentra el vínculo de parentesco más corto entre dos individuos.
 * 
 * Lógica:
 * 1. Envía IDs origen/destino al backend (/api/grafo/camino).
 * 2. Recibe lista de 'pasos' con la relación semántica (padre de, hijo de).
 * 3. Renderiza una línea de tiempo jerárquica con los grados de separación.
 */
async function buscarCamino() {
    const origen = document.getElementById('camino-origen').value;
    const destino = document.getElementById('camino-destino').value;
    const resultContainer = document.getElementById('camino-resultado');

    if (!origen || !destino) {
        agroAlert("Por favor, selecciona ambos animales para el análisis.", "Selección Incompleta", "warning");
        return;
    }
    if (origen == destino) {
        agroAlert("Debes seleccionar animales diferentes.", "Mismo Animal", "warning");
        return;
    }

    resultContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12">
            <div class="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mb-4"></div>
            <p class="text-teal-700 font-bold animate-pulse uppercase tracking-widest text-xs">Calculando trayectoria genética...</p>
        </div>
    `;

    try {
        const res = await fetch('/api/grafo/camino', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origen: parseInt(origen), destino: parseInt(destino) })
        });
        const data = await res.json();

        if (data.existe) {
            renderizarResultadoCamino(data);
        } else {
            resultContainer.innerHTML = `
                <div class="bg-red-50 p-8 rounded-[2rem] border-2 border-dashed border-red-200 text-center animate-shake">
                    <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <i class="fas fa-unlink text-red-300 text-3xl"></i>
                    </div>
                    <h5 class="text-xl font-black text-red-800 mb-2">Sin Conexión Detectada</h5>
                    <p class="text-red-600 text-sm max-w-xs mx-auto">No se ha encontrado un camino genealógico en la base de datos que conecte a estos dos individuos.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error en Pathfinding:", error);
        resultContainer.innerHTML = `<div class="p-6 bg-red-100 text-red-700 rounded-2xl font-bold text-center">Error crítico en el cálculo de ruta</div>`;
    }
}

function renderizarResultadoCamino(data) {
    const container = document.getElementById('camino-resultado');

    const stepsHtml = data.pasos.map((paso, index) => {
        const isLast = index === data.pasos.length - 1;
        return `
            <div class="flex items-center gap-4">
                <div class="flex flex-col items-center">
                    <div class="w-14 h-14 bg-white rounded-2xl shadow-sm border-2 border-teal-500 flex items-center justify-center z-10">
                        <span class="font-black text-gray-800">#${paso.desde}</span>
                    </div>
                    <div class="w-1 h-12 bg-gradient-to-b from-teal-500 to-blue-500 -my-1 ${isLast ? 'hidden' : ''}"></div>
                </div>
                <div class="flex-grow bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-teal-200 transition mb-4">
                    <p class="text-[10px] font-black text-teal-600 uppercase mb-1">Paso ${index + 1}</p>
                    <p class="text-sm font-bold text-gray-700">Es <span class="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-lg border border-teal-100">${paso.relacion}</span></p>
                    <div class="mt-2 flex items-center gap-2">
                         <i class="fas fa-arrow-down text-gray-300 transform -rotate-45"></i>
                         <span class="text-xs font-bold text-gray-400">Hacia #${paso.hacia}</span>
                    </div>
                </div>
            </div>
            ${isLast ? `
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg flex items-center justify-center text-white ring-4 ring-indigo-100">
                        <span class="font-black">#${paso.hacia}</span>
                    </div>
                    <div class="bg-indigo-50 px-4 py-2 rounded-xl">
                        <p class="text-xs font-black text-indigo-700">DESTINO FINAL</p>
                    </div>
                </div>
            ` : ''}
        `;
    }).join('');

    container.innerHTML = `
        <div class="bg-gradient-to-br from-teal-50/50 to-blue-50/50 p-8 rounded-[2.5rem] border border-teal-100">
            <div class="flex justify-between items-center mb-10">
                <h5 class="font-black text-teal-900 text-xl flex items-center gap-2">
                    <i class="fas fa-check-circle text-teal-500"></i> Trayectoria Encontrada
                </h5>
                <span class="bg-white px-4 py-2 rounded-2xl shadow-sm text-xs font-black text-teal-600 border border-teal-100">
                    DISTANCIA: ${data.distancia} GRADOS
                </span>
            </div>
            
            <div class="space-y-0 ml-4">
                ${stepsHtml}
            </div>

            <div class="mt-8 pt-8 border-t border-teal-100 flex items-center gap-4 text-teal-800">
                <div class="bg-white p-3 rounded-xl shadow-sm">
                    <i class="fas fa-info-circle text-xl"></i>
                </div>
                <p class="text-xs font-medium leading-relaxed italic">
                    Este análisis utiliza algoritmos de Dijkstra sobre una representación no dirigida de la genealogía para encontrar el vínculo más cercano posible entre ambos sujetos.
                </p>
            </div>
        </div>
    `;
}

// Inyectar nuevos botones y tabs en el DOM al cargar
document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.querySelector('#sec-avanzado .flex.border-b-2');

    // Inyectar botón de Red si no está ya presente
    if (tabsContainer && !document.getElementById('tab-red-completa')) {
        const btnRed = document.createElement('button');
        btnRed.className = 'tab-analisis px-6 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-t-lg transition';
        btnRed.id = 'tab-red-completa';
        btnRed.innerHTML = '<i class="fas fa-globe mr-2"></i>Red del Rebaño';
        btnRed.onclick = () => cambiarTabAnalisis('red-completa');
        tabsContainer.appendChild(btnRed);
    }

    const contentArea = document.getElementById('sec-avanzado');
    if (!contentArea) return;

    // Contenedor Red Completa (Inyección dinámica original)
    if (!document.getElementById('content-red-completa')) {
        const divRed = document.createElement('div');
        divRed.id = 'content-red-completa';
        divRed.className = 'tab-content-analisis hidden mt-6';
        divRed.innerHTML = `
            <div class="bg-white p-6 rounded-2xl shadow-lg border-2 border-indigo-200 h-[700px] flex flex-col">
                 <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <h4 class="font-bold text-lg flex items-center gap-2 text-indigo-800">
                        <i class="fas fa-globe"></i> Red del Rebaño
                    </h4>
                    
                    <div class="flex items-center gap-4 bg-indigo-50 p-2 rounded-lg border border-indigo-100 flex-wrap justify-center">
                        <!-- Filtro Especie -->
                        <div class="flex items-center gap-2">
                             <span class="text-xs font-bold text-indigo-600">Especie:</span>
                             <select id="red-filter-species" onchange="actualizarVisualizacionRed()" class="bg-white border-0 text-xs font-bold text-gray-700 rounded-md py-1 pl-2 pr-8 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm">
                                <option value="all">Ver Todas</option>
                                <option value="Bovino">🐂 Bovinos</option>
                                <option value="Ovino">🐑 Ovinos</option>
                                <option value="Caprino">🐐 Caprinos</option>
                                <option value="Porcino">🐖 Porcinos</option>
                                <option value="Equino">🐎 Equinos</option>
                             </select>
                        </div>

                        <div class="w-px h-4 bg-indigo-200 hidden md:block"></div>

                        <!-- Toggle Razas -->
                         <label class="inline-flex items-center cursor-pointer relative select-none">
                            <input type="checkbox" id="chk-color-breed" class="sr-only peer" onchange="actualizarVisualizacionRed()">
                            <div class="w-9 h-5 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                            <span class="ml-2 text-xs font-bold text-purple-700">Colorear Razas</span>
                        </label>
                    </div>
                 </div>

                <div id="grafo-red-full" class="w-full flex-grow border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 relative"></div>
                
                <div class="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 justify-center">
                    <div class="flex items-center gap-1"><i class="fas fa-circle text-red-400"></i> Bovino</div>
                    <div class="flex items-center gap-1"><i class="fas fa-circle text-orange-400"></i> Ovino</div>
                    <div class="flex items-center gap-1"><i class="fas fa-circle text-yellow-400"></i> Caprino</div>
                    <div class="flex items-center gap-1"><i class="fas fa-circle text-green-400"></i> Porcino</div>
                    <span class="text-gray-300">|</span>
                    <div class="flex items-center gap-1 text-purple-600 font-bold"><i class="fas fa-palette"></i> Activa "Colorear Razas" para ver detalle</div>
                </div>
            </div>
        `;
        contentArea.appendChild(divRed);
    }

    // Inicializar selectores de rutas
    setTimeout(cargarSelectoresCamino, 500);
});
