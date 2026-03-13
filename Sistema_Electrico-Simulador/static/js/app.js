// ==================== VARIABLES DE ESTADO GLOBAL ====================
// Estas variables mantienen los datos en memoria del navegador para evitar peticiones redundantes
let network = null;  // Instancia del grafo de vis.js
let nodos = [];    // Lista local de transformadores/nodos
let aristas = [];  // Lista local de conexiones/cables
let fallas = [];   // Lista de incidencias activas y pasadas
let reportes = []; // Historial de reparaciones técnicas
let isPhysicsEnabled = true; // Estado global de la física del grafo
let currentPendingEdge = null; // Almacena datos de arista mientras se elige el tipo
let currentEdgeCallback = null; // Almacena el callback de vis.js

/**
 * Punto de entrada principal al cargar el documento. 
 * Configura la lógica dependiendo de en qué página se encuentre el usuario.
 */
document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;

    // Si estamos en el Dashboard principal
    if (path === '/' || path === '/index.html') {
        initGraph();               // Inicializar el lienzo del grafo
        await loadMonitoringData(); // Cargar datos iniciales de la DB
        setupSimulationModal();    // Configurar formularios de falla
        setupGraphEdition();       // Configurar formularios de edición de red
        setupNodeSearch();         // Habilitar buscador de nodos
        setupDemandCycle();        // Habilitar simulación de consumo
        // Refresco automático de seguridad cada 10 segundos
        setInterval(loadMonitoringData, 10000);
    }
    // Si estamos en la Página de Trabajo (Técnicos)
    else if (path === '/reparaciones') {
        await loadWorkData();      // Cargar cola de fallas pendientes
        setupRepairForm();         // Configurar formulario de resolución
    }
});

// ==================== LÓGICA DE MONITOREO (GRAFO VIS.JS) ====================

/**
 * Configura el contenedor y las opciones técnicas del grafo.
 */
function initGraph() {
    const container = document.getElementById('network-monitoring');
    if (!container) return;

    // Opciones estéticas y físicas del grafo
    const options = {
        nodes: {
            shape: 'dot',
            size: 30,
            font: { size: 14, color: '#0f172a', face: 'Outfit' },
            borderWidth: 2,
            shadow: true,
            icon: {
                face: "'Font Awesome 6 Free'",
                weight: "900",
                size: 35
            }
        },
        edges: {
            width: 2,
            shadow: true,
            font: { align: 'top', size: 10, face: 'Outfit' },
            smooth: { type: 'dynamic' }, // Evita el solapamiento de aristas paralelas
            selectionWidth: 5,
            arrows: {
                to: { enabled: true, scaleFactor: 0.5 }
            }
        },
        interaction: {
            hover: true,
            selectConnectedEdges: false,
            multiselect: true,
            tooltipDelay: 100
        },
        physics: {
            enabled: true,
            barnesHut: {
                gravitationalConstant: -2000,
                centralGravity: 0.3,
                springLength: 150,
                springConstant: 0.04,
                damping: 0.09,
                avoidOverlap: 0.1
            },
            stabilization: { iterations: 150 }
        },
        manipulation: {
            enabled: false, // Se activa mediante botón
            initiallyActive: false,
            addEdge: (edgeData, callback) => {
                if (edgeData.from === edgeData.to) {
                    alert("No se permiten bucles.");
                    callback(null);
                    return;
                }
                // Guardar estado para el modal
                currentPendingEdge = edgeData;
                currentEdgeCallback = callback;

                // Mostrar el modal de selección de cable
                showModal('modalTipoCable');
            }
        }
    };

    // Inicializa el motor de dibujo sobre el div seleccionado
    network = new vis.Network(container, { nodes: [], edges: [] }, options);

    // Personalizar el estilo del panel de manipulación (se inyecta dinámicamente)
    network.on('showManipulationToolbar', () => {
        const toolbar = container.getElementsByClassName('vis-manipulation')[0];
        if (toolbar) {
            toolbar.style.background = 'var(--white)';
            toolbar.style.borderBottom = '1px solid var(--border)';
            toolbar.style.borderRadius = 'var(--radius) var(--radius) 0 0';
        }
    });

    // Listener para detectar selecciones: controla el botón de "Eliminar"
    network.on('select', (params) => {
        const btnDelete = document.getElementById('btnDelete');
        if (btnDelete) {
            btnDelete.disabled = (params.nodes.length === 0 && params.edges.length === 0);
        }
    });
}

/**
 * Consulta la API y sincroniza los datos locales con la base de datos.
 */
async function loadMonitoringData() {
    try {
        const [resN, resA, resF] = await Promise.all([
            fetch('/api/nodos'),
            fetch('/api/aristas'),
            fetch('/api/fallas')
        ]);

        const oldFallasCount = fallas.filter(f => f.estado !== 'resuelta').length;
        nodos = await resN.json();
        aristas = await resA.json();
        fallas = await resF.json();
        const newFallasCount = fallas.filter(f => f.estado !== 'resuelta').length;

        // Si hay nuevas fallas (por tormenta o simulación), avisar
        if (newFallasCount > oldFallasCount) {
            const lastFalla = fallas[fallas.length - 1];
            if (lastFalla.tipo.includes('voltaje')) {
                showNotification(`ANOMALÍA DETECTADA: Error de Voltaje en ${lastFalla.localizacion}`);
            } else if (lastFalla.tipo === 'apagon_total') {
                showNotification(`FALLA CRÍTICA: Interrupción de servicio en ${lastFalla.localizacion}`);
            } else if (lastFalla.tipo === 'caida_gualla') {
                showNotification(`ALERTA: Caída de cable en ${lastFalla.localizacion}`);
            }
        }

        // Actualiza todos los componentes de la UI
        updateGraphVisualization();
        updateAlertsTable();
        updateGraphStats();
        populateSimOptions();
    } catch (e) {
        console.error("Error cargando monitoreo", e);
    }
}

/**
 * Transforma los datos crudos en objetos visuales para vis.js (Iconos, Colores, Tooltips).
 */
function updateGraphVisualization() {
    if (!network) return;

    // Mapeo de Nodos
    const visNodes = nodos.map(n => {
        let color = '#10b981'; // Verde por defecto
        let iconCode = '\uf2db'; // Microchip (Transformer) por defecto
        let size = 25;
        let shadowColor = 'rgba(16,185,129,0.3)';

        // Estética según jerarquía eléctrica
        if (n.tipo === 'plant') {
            iconCode = '\uf0e7'; // Bolt
            size = 45;
            color = '#3b82f6';
            shadowColor = 'rgba(59,130,246,0.4)';
        }
        else if (n.tipo === 'substation') {
            iconCode = '\uf519'; // Tower Broadcast
            size = 35;
            color = '#6366f1';
            shadowColor = 'rgba(99,102,241,0.4)';
        }
        else if (n.tipo === 'transformer') {
            iconCode = '\uf2db'; // Microchip
            size = 30;
            color = '#10b981';
            shadowColor = 'rgba(16,185,129,0.4)';
        }
        else if (n.tipo === 'house') {
            iconCode = '\uf015'; // House
            size = 25;
            color = '#94a3b8';
            shadowColor = 'rgba(148,163,184,0.3)';
        }

        // Lógica de Alertas Visuales y Estrés de Demanda
        const nodeFault = fallas.find(f => f.nodo_id === n.id && f.estado !== 'resuelta');

        if (nodeFault) {
            color = getFaultColor(nodeFault.tipo); // Rojo/Naranja/Amarillo
            shadowColor = color;
        } else if (n.estado === 'falla_cascada') {
            color = '#ff4b2b'; // Rojo oscuro para apagones inducidos
            shadowColor = 'rgba(255,75,43,0.6)';
        } else {
            // Cambio de color dinámico según el Ciclo de Demanda (Estrés)
            if (n.estres > 130) {
                color = '#ef4444'; // Rojo (Carga Crítica)
                shadowColor = '#ef4444';
            } else if (n.estres > 110) {
                color = '#f59e0b'; // Ámbar (Carga Elevada)
                shadowColor = '#f59e0b';
            } else if (n.estres > 90) {
                color = '#facc15'; // Amarillo (Carga Alta)
                shadowColor = '#facc15';
            }
        }

        // Borde dinámico según estrés operativo
        const borders = n.estres > 80 ? '#ef4444' : '#1e293b';
        const borderWidth = n.estres > 90 ? 6 : (n.estres > 80 ? 4 : 2);

        // Mapeo de estados técnicos a nombres legibles
        const estadoLabels = {
            'normal': 'Operativo',
            'falla_cascada': 'Falla en Cascada',
            'bajo_voltaje': 'Bajo Voltaje',
            'alto_voltaje': 'Alto Voltaje',
            'caida_gualla': 'Cable Roto',
            'apagon_total': 'Sin Servicio'
        };
        const estadoActual = estadoLabels[n.estado] || n.estado.toUpperCase();

        // Creamos un elemento DOM para el tooltip para asegurar que vis.js lo renderice como HTML
        const tooltipContainer = document.createElement('div');
        tooltipContainer.innerHTML = `
            <div style="padding:15px; font-family:'Outfit', sans-serif; min-width:240px; background: white; border-radius: 12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                    <b style="font-size:1.1rem; color:var(--dark);">${n.title}</b>
                    <span class="badge" style="background:${color}22; color:${color}; border:1px solid ${color}44; white-space:nowrap;">${n.label}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--secondary); margin-bottom: 10px; display:flex; align-items:center; gap:5px;">
                    <i class="fas fa-map-marker-alt"></i> ${n.ubicacion || 'Sin ubicación registrada'}
                </div>
                <div style="margin:10px 0; height:1px; background:linear-gradient(90deg, transparent, var(--border), transparent)"></div>
                <div style="display:grid; grid-template-columns: auto 1fr; gap: 8px 15px; font-size:0.85rem; line-height: 1.6;">
                    <span style="color:var(--secondary)">Estado:</span> <span style="color:${color}; font-weight: 700;">${estadoActual}</span>
                    <span style="color:var(--secondary)">Voltaje:</span> <span style="font-weight:600;">${n.voltaje} kV</span>
                    <span style="color:var(--secondary)">Carga Actual:</span> <span style="font-weight:600;">${n.carga.toFixed(2)} MW</span>
                    <span style="color:var(--secondary)">Nivel Estrés:</span> <span style="color:${n.estres > 80 ? '#ef4444' : '#10b981'}; font-weight:700;">${n.estres.toFixed(1)}%</span>
                </div>
                <div style="margin-top:12px; height:6px; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                    <div style="width:${Math.min(n.estres, 100)}%; height:100%; background:${color}; border-radius:10px;"></div>
                </div>
            </div>
        `;

        return {
            id: n.id,
            label: n.label,
            title: tooltipContainer,
            color: { background: color, border: borders, highlight: { background: color, border: '#2563eb' } },
            shape: 'icon',
            icon: {
                face: "'Font Awesome 6 Free'",
                code: iconCode,
                size: size,
                color: color
            },
            shadow: { enabled: true, color: shadowColor, size: 10, x: 0, y: 0 },
            borderWidth: borderWidth
        };
    });

    // Mapeo de Aristas (Cables)
    const visEdges = aristas.map(a => {
        let color = '#94a3b8';
        let width = 2;
        let dashes = false;
        let fontColor = '#64748b';

        // Estilo según nivel de tensión
        if (a.tipo.includes('400kV')) {
            width = 6;
            color = '#f59e0b';
            fontColor = '#d97706';
        }
        else if (a.tipo.includes('115kV')) {
            width = 4;
            color = '#3b82f6';
        }
        else if (a.tipo.includes('13.8kV')) {
            width = 2.5;
            color = '#10b981';
        }

        // Cable roto
        const edgeFault = fallas.find(f => f.arista_id === a.id && f.estado !== 'resuelta');
        if (edgeFault) {
            color = '#ef4444';
            width = 5;
            dashes = [5, 5];
        }

        return {
            from: a.from,
            to: a.to,
            label: a.tipo,
            color: { color: color, highlight: '#2563eb', hover: color },
            width: width,
            dashes: dashes,
            font: { color: fontColor, strokeWidth: 0, size: 9, face: 'Outfit' },
            arrows: {
                to: { enabled: true, scaleFactor: 0.5, type: 'arrow' }
            }
        };
    });

    // Actualiza el motor de dibujo sin recargar la página
    // Si la física está desactivada, debemos FORZAR las posiciones guardadas en cada refresco
    if (!isPhysicsEnabled) {
        const currentPositions = network.getPositions();
        visNodes.forEach(vn => {
            if (currentPositions[vn.id]) {
                vn.x = currentPositions[vn.id].x;
                vn.y = currentPositions[vn.id].y;
            }
        });
    }

    network.setData({
        nodes: new vis.DataSet(visNodes),
        edges: new vis.DataSet(visEdges)
    });

    // Forzamos el estado de la física después de cargar datos
    network.setOptions({ physics: { enabled: isPhysicsEnabled } });
}

/**
 * Helper para asignar colores según el tipo de falla reportada. */
function getFaultColor(tipo) {
    switch (tipo) {
        case 'bajo_voltaje': return '#facc15';
        case 'alto_voltaje': return '#f87171';
        case 'caida_gualla': return '#fb923c';
        case 'apagon_total': return '#ff4b2b';
        default: return '#ef4444';
    }
}

/**
 * Actualiza la tabla lateral de incidencias en tiempo real.
 */
function updateAlertsTable() {
    const table = document.querySelector('#alertsTable tbody');
    const noAlerts = document.getElementById('noAlerts');
    if (!table) return;

    const activeFallas = fallas.filter(f => f.estado !== 'resuelta');

    if (activeFallas.length > 0) {
        noAlerts.classList.add('hidden');
        table.parentElement.parentElement.classList.remove('hidden');
        table.innerHTML = activeFallas.map(f => `
            <tr>
                <td><span class="badge badge-${f.tipo.split('_')[0]}">${f.tipo.replace('_', ' ')}</span></td>
                <td style="font-size: 0.75rem;">${f.localizacion}</td>
                <td>${f.fecha}</td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '';
        noAlerts.classList.remove('hidden');
    }
}

/**
 * Calcula y renderiza las métricas del sistema (Carga total, pérdidas, eficiencia). */
function updateGraphStats() {
    const statsDiv = document.getElementById('real-time-stats');
    if (!statsDiv) return;

    let totalCarga = 0;
    let totalCapacidad = 0;
    let perdidas = 0;

    nodos.forEach(n => {
        totalCarga += n.carga || 0;
        totalCapacidad += n.carga_max || 0;
    });

    // Algoritmo predictivo de pérdidas técnicas (estimación por longitud)
    aristas.forEach(a => {
        if (a.estado === 'normal') {
            perdidas += (totalCarga * 0.0005) * (a.longitud || 1);
        }
    });

    const eficienciaReal = totalCarga > 0 ? (100 - (perdidas / totalCarga * 100)) : 100;
    const fallasActivas = fallas.filter(f => f.estado !== 'resuelta').length;

    statsDiv.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-bolt"></i> Carga Sistema</div>
                <div class="stat-value">${totalCarga.toFixed(2)} MW</div>
            </div>
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-chart-line"></i> Pérdida Técnica</div>
                <div class="stat-value text-red">${perdidas.toFixed(3)} MW</div>
            </div>
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-microchip"></i> Eficiencia Real</div>
                <div class="stat-value text-green">${eficienciaReal.toFixed(1)}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-bell"></i> Fallas Activas</div>
                <div class="stat-value ${fallasActivas > 0 ? 'text-red' : 'text-green'}">${fallasActivas}</div>
            </div>
        </div>
    `;

    // Actualización del panel de Análisis de Grafo (Sidebar)
    const gStats = document.getElementById('graphStats');
    if (gStats) {
        const trxs = nodos.filter(n => n.tipo === 'transformer').length;
        const sub = nodos.filter(n => n.tipo === 'substation').length;
        const gen = nodos.filter(n => n.tipo === 'plant').length;
        const users = nodos.filter(n => n.tipo === 'house').length;

        gStats.innerHTML = `
            <div class="flex-col" style="gap: 8px;">
                <p><strong>Infraestructura Total:</strong> ${nodos.length} Nodos</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.8rem; background: var(--bg); padding: 8px; border-radius: 8px;">
                    <span><i class="fas fa-bolt" style="color:var(--primary)"></i> Gen: ${gen}</span>
                    <span><i class="fas fa-broadcast-tower" style="color:#6366f1"></i> S/E: ${sub}</span>
                    <span><i class="fas fa-microchip" style="color:#10b981"></i> Dist: ${trxs}</span>
                    <span><i class="fas fa-home" style="color:#94a3b8"></i> Casa: ${users}</span>
                </div>
                <p><strong>Interconexiones:</strong> ${aristas.length} Cables</p>
                <p><strong>Densidad de Red:</strong> ${(aristas.length / (nodos.length || 1)).toFixed(2)} Aristas/Nodo</p>
            </div>
        `;
    }
}

/**
 * Función de Análisis Estructural: Calcula la redundancia de la red. */
function analyzeRedundancy() {
    if (nodos.length === 0) return;

    // Contamos conexiones por cada ID de nodo
    const nodeDegrees = {};
    aristas.forEach(a => {
        nodeDegrees[a.from] = (nodeDegrees[a.from] || 0) + 1;
        nodeDegrees[a.to] = (nodeDegrees[a.to] || 0) + 1;
    });

    let redundantNodes = 0;
    nodos.forEach(n => {
        if ((nodeDegrees[n.id] || 0) > 1) redundantNodes++;
    });

    const percent = ((redundantNodes / nodos.length) * 100).toFixed(1);

    alert(`📊 DIAGNÓSTICO ESTRUCTURAL\n\n` +
        `• Nodos con respaldo (Mallas): ${redundantNodes}\n` +
        `• Nodos vulnerables (Radiales): ${nodos.length - redundantNodes}\n` +
        `• Índice de Redundancia: ${percent}%\n\n` +
        `Este sistema cuenta con una topología de tipo ${nodos.length > aristas.length ? 'Radial' : 'Malla'}. ` +
        `Una mayor densidad de conexiones mejora la estabilidad del servicio ante fallas locales.`);
}

// ==================== LÓGICA DE SIMULACIÓN Y FORMULARIOS ====================

/**
 * Gestiona el modal de reporte de fallas manuales.
 */
/**
 * Muestra el modal con la lista de todas las aristas para su eliminación.
 */
function showGestionAristas() {
    const tbody = document.querySelector('#tableGestionAristas tbody');
    if (!tbody) return;

    if (aristas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay conexiones registradas</td></tr>';
    } else {
        tbody.innerHTML = aristas.map(a => {
            const fromN = nodos.find(n => n.id === a.from);
            const toN = nodos.find(n => n.id === a.to);
            return `
                <tr>
                    <td><span class="badge badge-apagon">${fromN ? fromN.label : 'ID:' + a.from}</span></td>
                    <td><span class="badge badge-apagon">${toN ? toN.label : 'ID:' + a.to}</span></td>
                    <td><small>${a.tipo}</small></td>
                    <td style="text-align: center;">
                        <button class="btn btn-danger btn-sm" onclick="deleteAristaDirect(${a.id})" title="Eliminar Conexión">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    showModal('modalGestionAristas');
}

/**
 * Elimina una arista directamente por su ID desde el listado.
 */
async function deleteAristaDirect(id) {
    if (!confirm(`¿Está seguro de eliminar esta conexión eléctrica? Esta acción es irreversible.`)) return;

    try {
        const res = await fetch(`/api/aristas/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
            showNotification("Conexión eliminada correctamente");
            await loadMonitoringData();
            showGestionAristas(); // Refrescar tabla
        } else {
            alert(data.message || "No se pudo eliminar la conexión. Verifique sus permisos de administrador.");
        }
    } catch (e) {
        console.error("Error al borrar arista", e);
    }
}

/**
 * Registro automático de ubicación para el técnico
 */
function setupSimulationModal() {
    const faultType = document.getElementById('faultTypeSelection');
    if (!faultType) return;

    // Cambia campos dinámicamente si es falla de cable o de nodo
    faultType.addEventListener('change', (e) => {
        const nodeGrp = document.getElementById('nodeSelectionGroup');
        const edgeGrp = document.getElementById('edgeSelectionGroup');

        if (e.target.value === 'caida_gualla') {
            nodeGrp.classList.add('hidden');
            edgeGrp.classList.remove('hidden');
        } else {
            nodeGrp.classList.remove('hidden');
            edgeGrp.classList.add('hidden');
        }
    });

    const form = document.getElementById('formSimFalla');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const type = document.getElementById('faultTypeSelection').value;
            const desc = document.getElementById('faultDescription').value;
            const isEdge = (type === 'caida_gualla');

            const targetId = isEdge ?
                document.getElementById('edgeSelectDropdown').value :
                document.getElementById('nodeSelectDropdown').value;

            // Registro automático de ubicación para el técnico
            let loc = "Desconocida";
            if (isEdge) {
                const edge = aristas.find(a => a.id == targetId);
                loc = `Segmento de Cable ID:${edge.id}`;
            } else {
                const node = nodos.find(n => n.id == targetId);
                loc = `${node.title} (${node.ubicacion})`;
            }

            const data = { type: type, description: desc, localizacion: loc, node_id: isEdge ? null : targetId, arista_id: isEdge ? targetId : null };

            const res = await fetch('/api/fallas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                hideModal('modalFalla');
                loadMonitoringData();
                showNotification("Falla simulada y propagada en el grafo");
            }
        };
    }
}

/**
 * Gestiona la creación de nuevos elementos de infraestructura (Nodos/Cables).
 */
function setupGraphEdition() {
    const formNodo = document.getElementById('formNuevoNodo');
    const formArista = document.getElementById('formNuevaArista');

    if (formNodo) {
        updateNodeDefaults();
        formNodo.onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                codigo: document.getElementById('newNodeCode').value,
                nombre: document.getElementById('newNodeName').value,
                tipo: document.getElementById('newNodeType').value,
                voltaje: parseFloat(document.getElementById('newNodeVolt').value),
                carga_max: parseFloat(document.getElementById('newNodeCap').value),
                ubicacion: document.getElementById('newNodeLoc').value
            };
            const res = await fetch('/api/nodos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                hideModal('modalNuevoNodo');
                formNodo.reset();
                await loadMonitoringData();
                showNotification("Nuevo nodo incorporado a la red");
            }
        };
    }

    if (formArista) {
        formArista.onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                from_id: parseInt(document.getElementById('edgeFromSelect').value),
                to_id: parseInt(document.getElementById('edgeToSelect').value),
                tipo: document.getElementById('edgeCableType').value
            };
            const res = await fetch('/api/aristas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (res.ok) {
                hideModal('modalNuevaArista');
                formArista.reset();
                await loadMonitoringData();
                showNotification("Vínculo eléctrico establecido");
            }
        };
    }
}

/**
 * Llena los menús desplegables con los datos dinámicos de la red actual. */
function populateSimOptions() {
    const selects = {
        nSelect: document.getElementById('nodeSelectDropdown'),
        eSelect: document.getElementById('edgeSelectDropdown'),
        fromSelect: document.getElementById('edgeFromSelect'),
        toSelect: document.getElementById('edgeToSelect')
    };

    if (selects.nSelect) selects.nSelect.innerHTML = nodos.map(n => `<option value="${n.id}">${n.label} - ${n.title}</option>`).join('');
    if (selects.eSelect) selects.eSelect.innerHTML = aristas.map(a => `<option value="${a.id}">Cable ID:${a.id} (${a.tipo})</option>`).join('');
    if (selects.fromSelect) selects.fromSelect.innerHTML = nodos.map(n => `<option value="${n.id}">${n.label}</option>`).join('');
    if (selects.toSelect) selects.toSelect.innerHTML = nodos.map(n => `<option value="${n.id}">${n.label}</option>`).join('');
}

// ==================== LÓGICA DE TRABAJO (TÉCNICOS) ====================

/**
 * Carga la información para la página de gestión de reparaciones. */
async function loadWorkData() {
    try {
        const [resF, resR, resT] = await Promise.all([
            fetch('/api/fallas'),
            fetch('/api/reportes'),
            fetch('/api/tecnicos')
        ]);
        fallas = await resF.json();
        reportes = await resR.json();
        const tecnicos = await resT.json();

        updateWorkStatistics();
        renderWorkQueue();
        renderReportHistory();
        populateTecnicos(tecnicos);
        setupReportSearch();
    } catch (e) {
        console.error("Error cargando cola de trabajo", e);
    }
}

/**
 * Actualiza las estadísticas del panel superior. */
function updateWorkStatistics() {
    const activeFaults = fallas.filter(f => f.estado !== 'resuelta').length;
    const completedRepairs = reportes.length;

    // Calcular tiempo promedio de trabajo
    const avgTime = reportes.length > 0
        ? (reportes.reduce((sum, r) => sum + (r.tiempo_trabajo || 0), 0) / reportes.length).toFixed(1)
        : '--';

    document.getElementById('statActiveFaults').textContent = activeFaults;
    document.getElementById('statCompletedRepairs').textContent = completedRepairs;
    document.getElementById('statAvgTime').textContent = avgTime !== '--' ? avgTime + ' hrs' : '--';
    document.getElementById('statPendingWork').textContent = activeFaults;
}

/**
 * Llena el selector de técnicos en el formulario de reparación. */
function populateTecnicos(tecnicos) {
    const select = document.getElementById('selectTecnicoReparacion');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione personal técnico...</option>' +
        tecnicos.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
}

/**
 * Renderiza la lista de averías pendientes de atención.
 */
function renderWorkQueue() {
    const tbody = document.getElementById('workQueueTable');
    if (!tbody) return;

    const activas = fallas.filter(f => f.estado !== 'resuelta');
    if (activas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding: 2rem; color: var(--slate);"><i class="fas fa-check-circle fa-2x text-green"></i><p class="mt-1">Sistema Operativo - No hay trabajos pendientes</p></td></tr>';
        return;
    }

    tbody.innerHTML = activas.map(f => {
        const prioridad = getPriorityBadge(f.tipo);
        const tiempoTranscurrido = getTimeElapsed(f.fecha);

        return `
        <tr>
            <td><strong>#${f.id}</strong></td>
            <td>${prioridad}</td>
            <td><span class="badge badge-normal">${f.tipo_label}</span></td>
            <td><code style="font-size: 0.85rem;">${f.localizacion}</code></td>
            <td>${f.fecha}</td>
            <td>${tiempoTranscurrido}</td>
            <td><span class="badge badge-apagon">${f.estado.toUpperCase()}</span></td>
            <td><button class="btn btn-primary btn-sm" onclick="startRepair(${f.id})"><i class="fas fa-wrench"></i> Atender</button></td>
        </tr>
    `;
    }).join('');
}

/**
 * Obtiene el badge de prioridad según el tipo de falla. */
function getPriorityBadge(tipo) {
    const priorities = {
        'apagon_total': '<span class="badge badge-apagon" style="background: #dc2626;"><i class="fas fa-exclamation-triangle"></i> CRÍTICA</span>',
        'caida_gualla': '<span class="badge badge-alto" style="background: #ea580c;"><i class="fas fa-bolt"></i> ALTA</span>',
        'alto_voltaje': '<span class="badge badge-bajo" style="background: #f59e0b;"><i class="fas fa-arrow-up"></i> MEDIA</span>',
        'bajo_voltaje': '<span class="badge badge-normal" style="background: #3b82f6;"><i class="fas fa-arrow-down"></i> BAJA</span>'
    };
    return priorities[tipo] || '<span class="badge">NORMAL</span>';
}

/**
 * Calcula el tiempo transcurrido desde la fecha de reporte.
 */
function getTimeElapsed(fechaStr) {
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHrs > 24) {
        const days = Math.floor(diffHrs / 24);
        return `<span style="color: #dc2626; font-weight: 600;">${days}d ${diffHrs % 24}h</span>`;
    } else if (diffHrs > 0) {
        return `<span style="color: ${diffHrs > 4 ? '#ea580c' : '#3b82f6'};">${diffHrs}h ${diffMins}m</span>`;
    } else {
        return `<span style="color: #10b981;">${diffMins}m</span>`;
    }
}

/**
 * Activa el panel de reporte para una falla específica.
 */
function startRepair(id) {
    const falla = fallas.find(f => f.id === id);
    const panel = document.getElementById('repairPanel');
    const info = document.getElementById('activeFallaInfo');

    panel.classList.remove('hidden');
    document.getElementById('activeFallaId').value = id;

    info.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div>
                <p style="margin-bottom: 1rem;"><small style="color:var(--slate); font-weight:700; text-transform:uppercase; font-size:0.65rem;">Orden de Servicio</small><br>
                   <strong style="color:var(--dark); font-size:1rem;">#OT-${falla.id}</strong></p>
                <p style="margin-bottom: 1rem;"><small style="color:var(--slate); font-weight:700; text-transform:uppercase; font-size:0.65rem;">Prioridad</small><br>
                   ${prioridad}</p>
                <p style="margin-bottom: 1rem;"><small style="color:var(--slate); font-weight:700; text-transform:uppercase; font-size:0.65rem;">Tipo de Avería</small><br>
                   <span class="badge badge-normal">${falla.tipo_label}</span></p>
            </div>
            <div style="border-left: 1px solid var(--border); padding-left: 1.5rem;">
                <p style="margin-bottom: 1rem;"><small style="color:var(--slate); font-weight:700; text-transform:uppercase; font-size:0.65rem;">Ubicación Técnica</small><br>
                   <code style="color:var(--primary-dark); font-weight:700;">${falla.localizacion}</code></p>
                <p style="margin-bottom: 1rem;"><small style="color:var(--slate); font-weight:700; text-transform:uppercase; font-size:0.65rem;">Fecha Reporte</small><br>
                   <span style="color:var(--dark);">${falla.fecha}</span></p>
                <p style="margin-bottom: 1rem;"><small style="color:var(--slate); font-weight:700; text-transform:uppercase; font-size:0.65rem;">Detalles del Reporte</small><br>
                   <em style="color:var(--slate); font-size:0.8rem;">"${falla.descripcion || 'Sin observaciones iniciales'}"</em></p>
            </div>
        </div>
    `;
    panel.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Envía el reporte técnico de reparación a la base de datos. */
function setupRepairForm() {
    const form = document.getElementById('formReparacion');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const tecnicoId = document.getElementById('selectTecnicoReparacion').value;

        if (!tecnicoId) {
            alert('Por favor seleccione el técnico que realizó el trabajo');
            return;
        }

        const data = {
            falla_id: parseInt(document.getElementById('activeFallaId').value),
            tecnico_id: parseInt(tecnicoId),
            diagnostico: document.getElementById('diagnosticoReparacion').value,
            materiales: document.getElementById('materialesUsados').value,
            tiempo_trabajo: parseFloat(document.getElementById('tiempoTrabajo').value)
        };

        const res = await fetch('/api/reparar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showNotification("Reparación documentada exitosamente");
            form.closest('.card').classList.add('hidden');
            form.reset();
            await loadWorkData();
        }
    };
}

/**
 * Renderiza el historial completo de reparaciones.
 */
function renderReportHistory() {
    const tbody = document.querySelector('#reportHistoryTable tbody');
    if (!tbody) return;
    tbody.innerHTML = reportes.map(r => `
        <tr class="report-row" data-search="${r.fecha} ${r.falla_tipo} ${r.localizacion} ${r.tecnico}">
            <td><strong>OT-${r.id}</strong></td>
            <td>${r.fecha}</td>
            <td><span class="badge badge-normal">${r.falla_tipo}</span></td>
            <td><code style="font-size: 0.85rem;">${r.localizacion}</code></td>
            <td>${r.tecnico}</td>
            <td><strong>${r.tiempo_trabajo || 0} hrs</strong></td>
            <td style="display: flex; gap: 5px;">
                <button class="btn btn-secondary btn-sm" onclick='viewFullReport(${JSON.stringify(r)})' title="Ver Online"><i class="fas fa-eye"></i></button>
                <a href="/api/reportes/pdf/${r.id}" class="btn btn-primary btn-sm" title="Descargar PDF"><i class="fas fa-file-pdf"></i> PDF</a>
            </td>
        </tr>
    `).join('');
}

/**
 * Configura el buscador de reportes.
 */
function setupReportSearch() {
    const searchInput = document.getElementById('searchReports');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const rows = document.querySelectorAll('.report-row');

        rows.forEach(row => {
            const searchText = row.getAttribute('data-search').toLowerCase();
            row.style.display = searchText.includes(query) ? '' : 'none';
        });
    });
}


/**
 * Muestra el detalle completo de un reporte en el modal de visor.
 */
function viewFullReport(r) {
    const modal = document.getElementById('modalReporteFinal');
    const content = document.getElementById('reportContentArea');

    content.innerHTML = `
        <div style="margin-top:1.5rem">
            <p><strong>REPORTE #OT-${r.id}</strong></p>
            <p><strong>FECHA:</strong> ${r.fecha}</p>
            <p><strong>TÉCNICO:</strong> ${r.tecnico}</p>
            <hr>
            <h4>DIAGNÓSTICO:</h4>
            <p class="report-box">${r.diagnostico}</p>
            <h4>MATERIALES:</h4>
            <p class="report-box">${r.materiales}</p>
        </div>
    `;

    // Actualizar el botón de descarga del modal
    const downloadBtn = modal.querySelector('.btn-primary');
    if (downloadBtn) {
        downloadBtn.onclick = () => window.location.href = `/api/reportes/pdf/${r.id}`;
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Descargar PDF';
    }

    modal.classList.remove('hidden');
}

// ==================== UTILIDADES DE INTERFAZ ====================

function showModal(id) {
    document.getElementById(id).classList.remove('hidden');
    if (id === 'modalNuevoNodo') updateNodeDefaults();
}
function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function showNotification(msg) {
    const div = document.createElement('div');
    div.className = "notification-toast";

    // Añadimos un icono por defecto según el contenido
    let icon = '<i class="fas fa-info-circle"></i>';
    if (msg.toLowerCase().includes('falla') || msg.toLowerCase().includes('servicio')) icon = '<i class="fas fa-bolt text-red"></i>';
    if (msg.toLowerCase().includes('clima') || msg.toLowerCase().includes('tormenta')) icon = '<i class="fas fa-cloud-showers-heavy"></i>';
    if (msg.toLowerCase().includes('fijado') || msg.toLowerCase().includes('posicion')) icon = '<i class="fas fa-thumbtack"></i>';

    div.innerHTML = `${icon} <span>${msg}</span>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}

/**
 * Dispara un efecto visual de relámpago en el contenedor del grafo.
 */
function triggerLightningFlash() {
    const container = document.getElementById('network-monitoring');
    if (!container) return;

    container.classList.remove('storm-flash');
    void container.offsetWidth; // Forzar reflujo para reiniciar animación
    container.classList.add('storm-flash');
}


/**
 * Habilita la búsqueda y enfoque de nodos en el grafo mediante texto.
 */
function setupNodeSearch() {
    const searchInput = document.getElementById('searchNodes');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length === 0) { network.fit(); return; }

        const found = nodos.find(n => n.label.toLowerCase().includes(query) || n.title.toLowerCase().includes(query));
        if (found) {
            network.selectNodes([found.id]);
            network.focus(found.id, { scale: 1.8, animation: { duration: 500 } });
        }
    });
}


/**
 * Elimina el elemento actualmente seleccionado en el grafo vis.js.
 */
async function deleteSelection() {
    const selection = network.getSelection();
    if (selection.nodes.length === 0 && selection.edges.length === 0) return;

    // Si hay nodos seleccionados, priorizamos borrar el nodo
    if (selection.nodes.length > 0) {
        const id = selection.nodes[0];
        const node = nodos.find(n => n.id === id);
        if (!confirm(`¿Confirmar eliminación permanente del nodo ${node.label} (${node.title})?`)) return;

        const res = await fetch(`/api/nodos/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
            showNotification("Nodo eliminado de la red");
            loadMonitoringData();
        } else {
            alert(data.message || "Error al eliminar nodo. Verifique permisos.");
        }
    }
    // Si solo hay aristas seleccionadas, borramos la arista
    else if (selection.edges.length > 0) {
        const id = selection.edges[0];
        if (!confirm(`¿Confirmar eliminación de la conexión seleccionada?`)) return;

        const res = await fetch(`/api/aristas/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
            showNotification("Conexión eliminada de la red");
            loadMonitoringData();
        } else {
            alert(data.message || "Error al eliminar conexión. Verifique permisos.");
        }
    }
}

/**
 * Autocompleta valores técnicos según el tipo de transformador seleccionado.
 */
function updateNodeDefaults() {
    const type = document.getElementById('newNodeType').value;
    const defaults = {
        'plant': { volt: 400.0, cap: 1000.0, prefix: 'GEN-' },
        'substation': { volt: 115.0, cap: 250.0, prefix: 'SE-' },
        'transformer': { volt: 13.8, cap: 15.0, prefix: 'TRX-' },
        'house': { volt: 0.22, cap: 0.05, prefix: 'USER-' }
    };
    const d = defaults[type];
    document.getElementById('newNodeVolt').value = d.volt;
    document.getElementById('newNodeCap').value = d.cap;
    const codeInput = document.getElementById('newNodeCode');
    if (!codeInput.value || codeInput.value.includes('-')) codeInput.value = d.prefix + Math.floor(Math.random() * 900 + 100);
}

// ==================== SIMULADORES DINÁMICOS ====================

let stormInterval = null;

/**
 * Activa o desactiva la simulación de clima adverso que genera fallas aleatorias.
 */
function setWeather(type) {
    const alertDiv = document.getElementById('storm-alert');
    const btnClear = document.getElementById('weather-clear');
    const btnStorm = document.getElementById('weather-storm');

    // Actualizar estados visuales de los botones
    if (btnClear) btnClear.classList.toggle('active', type === 'clear');
    if (btnStorm) btnStorm.classList.toggle('active', type === 'storm');

    if (type === 'storm') {
        alertDiv.classList.remove('hidden');
        showNotification("Alerta Climática: Tormenta en curso");
        if (!stormInterval) {
            stormInterval = setInterval(async () => {
                if (Math.random() < 0.20) {
                    const failEdge = Math.random() < 0.4; // 40% de probabilidad de que sea un cable

                    if (failEdge && aristas.length > 0) {
                        const randomEdge = aristas[Math.floor(Math.random() * aristas.length)];
                        await fetch('/api/fallas', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'caida_gualla',
                                arista_id: randomEdge.id,
                                localizacion: `Tramo ID:${randomEdge.id} (${randomEdge.tipo})`
                            })
                        });
                    } else if (nodos.length > 0) {
                        const randomNode = nodos[Math.floor(Math.random() * nodos.length)];
                        await fetch('/api/fallas', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'apagon_total',
                                node_id: randomNode.id,
                                localizacion: `${randomNode.title} (${randomNode.label})`
                            })
                        });
                    }
                    triggerLightningFlash();
                    loadMonitoringData();
                }
            }, 6000);
        }
    } else {
        alertDiv.classList.add('hidden');
        if (stormInterval) { clearInterval(stormInterval); stormInterval = null; }
    }
}

/**
 * Activa o desactiva la física del grafo para fijar los nodos en su posición actual.
 */
function togglePhysics() {
    if (!network) return;
    const btn = document.querySelector('.btn-toggle-physics');

    isPhysicsEnabled = !isPhysicsEnabled;

    network.setOptions({ physics: { enabled: isPhysicsEnabled } });

    if (btn) {
        btn.classList.toggle('active', !isPhysicsEnabled);
        if (!isPhysicsEnabled) {
            btn.innerHTML = '<i class="fas fa-thumbtack"></i> Posición Fija';
            showNotification("Física desactivada: Nodos fijados");
        } else {
            btn.innerHTML = '<i class="fas fa-thumbtack"></i> Fijar Posición';
            showNotification("Física activada: Movimiento dinámico");
        }
    }
}

/**
 * Vincula el slider de demanda con el estrés visual del grafo.
 */
function setupDemandCycle() {
    const slider = document.getElementById('loadMultiplier');
    const dayTime = document.getElementById('dayTime');
    const loadLabel = document.getElementById('loadLabel');
    const demandCard = document.querySelector('.card-demand');

    if (!slider) return;

    slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);

        // 1. Actualizar Datos de Nodos (Estrés del Sistema)
        nodos = nodos.map(n => {
            const base = n.base_carga || n.carga;
            if (!n.base_carga) n.base_carga = n.carga;
            const cur = base * (val / 100);
            return { ...n, carga: cur, estres: (cur / n.carga_max * 100) };
        });

        // 2. Calcular Hora Simulada (Mapeo de rango 50-150 a ciclo horario)
        // 50% = 3:00 AM, 100% = 12:00 PM, 150% = 9:00 PM
        const totalHoursRange = 18; // de 3am a 9pm
        const hour = 3 + ((val - 50) / 100) * totalHoursRange;
        const wholeHour = Math.floor(hour);
        const ampm = wholeHour >= 12 ? 'PM' : 'AM';
        const displayHour = wholeHour > 12 ? wholeHour - 12 : (wholeHour === 0 ? 12 : wholeHour);

        if (dayTime) dayTime.textContent = `${displayHour}:00 ${ampm}`;
        if (loadLabel) loadLabel.textContent = `Carga: ${val}%`;

        // 3. Actualizar estética visual de la zona de control según la carga
        if (demandCard) {
            if (val > 130) {
                demandCard.style.background = '#fff1f2'; // Rojo Crítico
                demandCard.style.borderTopColor = '#ef4444';
                if (loadLabel) loadLabel.className = 'badge badge-alto';
            } else if (val > 110) {
                demandCard.style.background = '#fffbeb'; // Ámbar/Aviso
                demandCard.style.borderTopColor = '#f59e0b';
                if (loadLabel) loadLabel.className = 'badge badge-bajo';
            } else {
                demandCard.style.background = '#f0fdf4'; // Verde Óptimo
                demandCard.style.borderTopColor = '#10b981';
                if (loadLabel) loadLabel.className = 'badge badge-normal';
            }
        }

        updateGraphVisualization();
        updateGraphStats();
    });
}

/**
 * Activa el modo interactivo para dibujar conexiones directamente en el grafo.
 */
function toggleEdgeMode() {
    if (!network) return;

    network.addEdgeMode();
    showNotification("Modo Conexión: Haga clic en un nodo y arrastre hacia otro");

    // Cambiar estilo del botón temporalmente si es posible
    const btn = document.getElementById('btnNewEdge');
    if (btn) {
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 3000);
    }
}


/**
 * Cierra la sesión activa del usuario.
 */
async function logout() {
    try {
        const res = await fetch('/logout');
        const data = await res.json();
        if (data.success) {
            window.location.href = '/login';
        }
    } catch (e) {
        console.error("Error al cerrar sesión", e);
        // Fallback en caso de error de red
        window.location.href = '/login';
    }
}

/**
 * Procesa la creación de la arista después de elegir el tipo en el modal.
 */
async function confirmEdgeCreation() {
    if (!currentPendingEdge || !currentEdgeCallback) return;

    const tipo = document.getElementById('edgeCableTypeQuick').value;
    const data = {
        from_id: parseInt(currentPendingEdge.from),
        to_id: parseInt(currentPendingEdge.to),
        tipo: tipo
    };

    try {
        const res = await fetch('/api/aristas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showNotification("Vínculo eléctrico establecido");
            await loadMonitoringData();
        }
    } catch (e) {
        console.error("Error al crear arista", e);
    } finally {
        currentEdgeCallback(null);
        currentPendingEdge = null;
        currentEdgeCallback = null;
        hideModal('modalTipoCable');
    }
}

/**
 * Cancela la creación de la arista.
 */
function cancelEdgeCreation() {
    if (currentEdgeCallback) currentEdgeCallback(null);
    currentPendingEdge = null;
    currentEdgeCallback = null;
    hideModal('modalTipoCable');
}


