// ═══════════════════════════════════════════════════════════════
//  GlucoAmigo v2.0 · app.js — Sistema mHealth Pediátrico
//  Módulos 1–5 + Nutrición + Crecimiento + Recordatorios
// ═══════════════════════════════════════════════════════════════

const STATE = {
    heroes: [],
    heroe: null,
    rol: document.body.dataset.rol || 'padre',
    cdiPreguntas: [], cdiRespuestas: [], cdiIndex: 0,
    scirPreguntas: [], scirRespuestas: [],
    xpPoints: 0, level: 1,
    puntos_juego: 0,
    charts: {},
};

// ── Sidebar Groups — Agro-Master pattern ───────────────────────
function toggleSidebarGroup(groupId, btn) {
    const group = document.getElementById(groupId);
    if (!group) return;

    // Find the arrow icon in the button (first <i> child)
    const arrow = btn ? btn.querySelector('i') : document.getElementById('arrow-' + groupId);

    const isOpen = group.style.maxHeight && group.style.maxHeight !== '0px';

    if (isOpen) {
        group.style.maxHeight = '0px';
        group.style.overflow = 'hidden';
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    } else {
        group.style.overflow = 'hidden';
        group.style.maxHeight = group.scrollHeight + 'px';
        // Allow growth after animation
        setTimeout(() => { if (group.style.maxHeight !== '0px') group.style.overflow = 'visible'; }, 320);
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    }
}

// Auto-init: open all non-user groups on load
document.addEventListener('DOMContentLoaded', () => {
    ['group-clinica', 'group-diadia', 'group-bienestar', 'group-consultas'].forEach(id => {
        const g = document.getElementById(id);
        if (g) {
            g.style.maxHeight = g.scrollHeight + 'px';
            g.style.overflow = 'visible';
            const arrow = document.getElementById('arrow-' + id);
            if (arrow) arrow.style.transform = 'rotate(180deg)';
        }
    });
    // User group: starts closed
    const ug = document.getElementById('group-user');
    if (ug) { ug.style.maxHeight = '0px'; ug.style.overflow = 'hidden'; }
});

// ── Juegos e Interactividad (Módulo Héroe) ──────────────────────
function abrirJuego(id) {
    if (!STATE.heroe) { mostrarToast('Primero crea tu perfil de Héroe 🦸', 'warning'); return; }

    const gameNames = { 1: 'Rompecabezas', 2: 'Memoria de Alimentos', 3: 'Semáforo de Glucosa', 4: 'Burbujas', 5: 'Raspa y Gana', 6: 'Laberinto', 7: 'Tu Escudo', 8: 'Sana vs Chatarra' };
    const gameIcons = { 1: 'fa-puzzle-piece', 2: 'fa-brain', 3: 'fa-traffic-light', 4: 'fa-circle', 5: 'fa-ticket-alt', 6: 'fa-route', 7: 'fa-shield-alt', 8: 'fa-apple-alt' };
    const gameName = gameNames[id] || 'Juego';
    const gameIcon = gameIcons[id] || 'fa-gamepad';

    // Crear el overlay del modal
    const overlay = document.createElement('div');
    overlay.id = 'modal-juego-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.75);backdrop-filter:blur(10px);z-index:3000;padding:16px;';

    overlay.innerHTML = `
        <div style="background:white;border-radius:2rem;max-width:520px;width:100%;box-shadow:0 40px 80px rgba(0,0,0,0.45);overflow:hidden;animation:gameModalIn 0.4s cubic-bezier(0.34,1.56,0.64,1);">
            <div style="background:linear-gradient(135deg,#0d9488 0%,#0891b2 100%);padding:20px 24px;display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:12px;display:flex;align-items:center;justify-content:center;">
                        <i class="fas ${gameIcon}" style="color:white;font-size:0.9rem;"></i>
                    </div>
                    <div>
                        <p style="color:white;font-weight:900;font-size:1rem;font-family:inherit;line-height:1.2;">${gameName}</p>
                        <p style="color:rgba(255,255,255,0.65);font-size:0.68rem;font-weight:700;font-family:inherit;">⭐ +10 Puntos de Poder al completar</p>
                    </div>
                </div>
                <button onclick="document.getElementById('modal-juego-overlay').remove()"
                    style="width:36px;height:36px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:10px;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.9rem;transition:all 0.2s;"
                    onmouseover="this.style.background='rgba(255,255,255,0.28)'"
                    onmouseout="this.style.background='rgba(255,255,255,0.15)'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="juego-content" style="padding:28px;max-height:60vh;overflow-y:auto;">
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 0;gap:14px;">
                    <div style="width:52px;height:52px;border:4px solid transparent;border-top-color:#0d9488;border-right-color:rgba(14,165,233,0.3);border-radius:50%;animation:gameSpinLoad 0.9s linear infinite;"></div>
                    <p style="color:#64748b;font-weight:700;font-size:0.85rem;font-family:inherit;">Preparando la misión...</p>
                </div>
            </div>
        </div>
        <style>
            @keyframes gameModalIn { from { opacity:0;transform:scale(0.85) translateY(24px); } to { opacity:1;transform:scale(1) translateY(0); } }
            @keyframes gameSpinLoad { to { transform:rotate(360deg); } }
        </style>
    `;

    document.body.appendChild(overlay);

    // Cargar el contenido del juego
    fetch(`/api/juego/template/${id}`)
        .then(r => r.text())
        .then(html => {
            document.getElementById('juego-content').innerHTML = html;
        })
        .catch(() => {
            document.getElementById('juego-content').innerHTML = `
                <div class="text-center py-8">
                    <p class="text-5xl mb-4">🧩</p>
                    <h3 class="text-xl font-bold text-slate-800">¡Juego no encontrado!</h3>
                    <p class="text-slate-700 text-sm">Próximamente estaremos añadiendo más retos.</p>
                </div>
            `;
        });
}

async function registrarPuntuacion(juegoId, puntos) {
    try {
        const res = await apiPost(`/api/juego/${juegoId}`, { puntos, heroe_id: STATE.heroe.id });
        if (res.ok) {
            STATE.heroe.puntos_juego = res.total;
            actualizarBarraPuntos();
            mostrarToast(`¡Ganaste ${puntos} puntos de poder! ✨`, 'success');

            // Efecto de confeti si ganó puntos
            if (puntos > 0) lanzarConfeti();
        }
    } catch (e) {
        console.error('Error al registrar puntos:', e);
    }
}

function actualizarBarraPuntos() {
    const barra = $('barra-puntos');
    const texto = $('texto-puntos');
    if (barra && STATE.heroe) {
        const p = STATE.heroe.puntos_juego || 0;
        const pct = Math.min(100, (p / 70) * 100);
        barra.style.width = `${pct}%`;
        if (texto) texto.textContent = `${p} / 70 Puntos de Poder`;
    }
}


// ── Utilidades ───────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function showSection(name) {
    const sections = $$('.content-section');
    sections.forEach(s => {
        s.classList.remove('active');
        s.style.opacity = '0';
        s.style.transform = 'translateY(10px)';
        s.style.transition = 'all 0.4s ease-out';
    });

    $$('.nav-item').forEach(n => n.classList.remove('active'));

    const sec = $(`sec-${name}`);
    const nav = $(`nav-${name}`);

    if (sec) {
        sec.classList.add('active');
        requestAnimationFrame(() => {
            sec.style.opacity = '1';
            sec.style.transform = 'translateY(0)';
        });
    }
    if (nav) nav.classList.add('active');

    // FAB Visibility logic
    const fab = document.querySelector('.fab-main');
    if (fab) {
        if (['dashboard', 'pacientes', 'alertas', 'exportar'].includes(name)) {
            fab.style.display = 'none';
        } else {
            fab.style.display = 'flex';
        }
    }

    const titles = {
        dashboard: ['📊 Dashboard Clínico', 'Módulo 5 · Triangulación Clínica'],
        pacientes: ['👶 Pacientes', 'Grupo de estudio registrado'],
        usuarios: ['👥 Gestión de Usuarios', 'Administración de accesos y roles'],
        graficos: ['📈 Tendencias Clínicas', 'CDI vs Control Glucémico'],
        alertas: ['🚨 Centro de Alertas', 'Protocolo GlucoAmigo'],
        exportar: ['📥 Exportar Tesis', 'Formato Excel / PDF'],
        auditoria: ['📜 Registro de Auditoría', 'Trazabilidad y Ética de Investigación'],
        'home-parent': ['🏠 Panel del Representante', 'Gestión Multi-Héroe'],
        'perfil-parent': ['👤 Mi Perfil', 'Datos del Representante'],
        'config-especialista': ['⚙️ Panel de Configuración', 'Perfil y parámetros de acceso'],
        'gestion-personal': ['👥 Gestión de Personal', 'Representantes y cuidadores registrados'],
        miHeroe: ['🦸 Gestión de Héroes', 'Módulo 1 · Gestión de Identidad'],
        heroe: ['🎮 Zona de Misiones', 'Gamificación y aprendizaje'],
        tienda: ['🛒 Tienda de Recompensas', 'Personaliza a tu Héroe'],
        glucosa: ['💉 Registrar Glucosa', 'Módulo 2 · Motor de Inferencia Médica'],
        comidas: ['🍽️ Diario Nutricional', 'Registro de comidas y carbos'],
        bienestar: ['🧠 Bienestar Emocional', 'Módulo 3 · Escala CDI con Emojis'],
        adherencia: ['📋 Cuestionario SCI-R', 'Adherencia Terapéutica'],
        crecimiento: ['📏 Curva de Crecimiento', 'Peso, Estatura e IMC'],
        recordatorios: ['⏰ Recordatorios', 'Insulina, Glucosa y Citas'],
        historial: ['📅 Historial de Dosificación', 'Adherencia Farmacológica'],
    };

    if (!STATE.heroe && !['home-parent', 'perfil-parent', 'config-especialista', 'gestion-personal', 'miHeroe', 'dashboard', 'pacientes', 'usuarios', 'graficos', 'alertas', 'exportar', 'auditoria'].includes(name)) {
        mostrarToast('Primero selecciona un Héroe para entrar en su mundo 🦸', 'info');
        showSection('home-parent');
        return;
    }

    if (titles[name]) {
        const t = $('page-title'), s = $('page-sub');
        if (t) t.textContent = titles[name][0];
        if (s) s.textContent = titles[name][1];
    }

    // Lazy load sections
    if (name === 'home-parent') cargarDashboardParent();
    if (name === 'perfil-parent' || name === 'config-especialista') cargarPerfil();
    if (name === 'dashboard') cargarDashboardEspecialista();
    if (name === 'pacientes') cargarDashboardEspecialista(); // Reuses same view logic for patients table
    if (name === 'usuarios') cargarUsuarios();
    if (name === 'alertas') cargarAlertas();
    if (name === 'auditoria') cargarAuditoria();
    if (name === 'gestion-personal') cargarRepresentantes();
    if (name === 'config-especialista') { cargarPerfil(); cargarRepresentantesParaSelect(); }
    if (name === 'comidas' && STATE.heroe) { cargarComidas(); cargarResumenNutricional(); }
    if (name === 'crecimiento' && STATE.heroe) cargarCrecimiento();
    if (name === 'recordatorios' && STATE.heroe) cargarRecordatorios();
    if (name === 'bienestar' && STATE.heroe && !STATE.cdiPreguntas.length) iniciarCDI();
    if (name === 'tienda' && STATE.heroe && document.getElementById('tienda-puntos-disp')) {
        document.getElementById('tienda-puntos-disp').textContent = STATE.heroe.puntos_juego || 0;
    }

    // Visibilidad del sidebar de seguimiento
    const track = $('sidebar-hero-tracking');
    if (track) {
        track.style.display = STATE.heroe ? 'block' : 'none';
        track.style.opacity = STATE.heroe ? '1' : '0.5';
    }
}

function toggleSidebar() {
    const sb = $('sidebar');
    if (sb) sb.classList.toggle('open');
}

// ── PWA ──────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js').catch(() => { });
    });
}

// ── IndexedDB (Módulo 4: Resiliencia Offline) ───────────────────
function initIndexedDB() {
    if (!window.indexedDB) return;
    const req = window.indexedDB.open('GlucoAmigoDB', 1);
    req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('registros_offline'))
            db.createObjectStore('registros_offline', { keyPath: 'id', autoIncrement: true });
    };
}
initIndexedDB();

window.addEventListener('offline', () => mostrarToast('⚠️ Sin conexión. Datos guardados localmente.', 'warning'));
window.addEventListener('online', () => mostrarToast('🌐 Conexión recuperada.', 'success'));

function filtrarPacientes() {
    const q = $('busqueda-pacientes')?.value?.toLowerCase() || '';
    const estadoStr = $('filtro-estado')?.value;
    const f = estadoStr ? estadoStr.toLowerCase() : 'todos';

    const rows = document.querySelectorAll('#tabla-pacientes-body tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        let prioRaw = row.querySelector('.estado-badge')?.textContent || '';
        prioRaw = prioRaw.toLowerCase();

        const matchQ = text.includes(q);
        const matchF = f === 'todos' || prioRaw.includes(f);

        row.style.display = (matchQ && matchF) ? '' : 'none';
    });
}
// ── Toast Notifications ─────────────────────────────────────────
function mostrarToast(msg, tipo = 'success') {
    const config = {
        success: { icon: '✅', gradient: 'from-emerald-600 to-teal-600' },
        warning: { icon: '⚠️', gradient: 'from-amber-500 to-orange-500' },
        error: { icon: '🚨', gradient: 'from-rose-600 to-red-600' },
        info: { icon: '💡', gradient: 'from-teal-500 to-cyan-500' },
    };
    const c = config[tipo] || config.info;
    const t = document.createElement('div');
    t.className = `fixed top-5 right-5 z-[200] bg-gradient-to-r ${c.gradient} text-white px-6 py-4 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.35)] border border-white/20 flex items-center gap-3 max-w-sm`;
    t.innerHTML = `<span class="text-2xl flex-shrink-0">${c.icon}</span><p class="font-bold text-sm">${msg}</p>`;
    t.style.transform = 'translateX(120%)';
    t.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    document.body.appendChild(t);
    requestAnimationFrame(() => t.style.transform = 'translateX(0)');
    setTimeout(() => {
        t.style.transform = 'translateX(120%)';
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 500);
    }, 4500);
}

// ── API helpers ──────────────────────────────────────────────────
async function apiGet(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Error ${r.status}`);
    return r.json();
}
async function apiPost(url, body) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
}
async function apiPut(url, body) {
    const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
}
async function apiDelete(url) {
    const r = await fetch(url, { method: 'DELETE' });
    return r.json();
}

// ══════════════════════════════════════════════════════════
//  MÓDULO 1: PERFIL DEL HÉROE
// ══════════════════════════════════════════════════════════
async function cargarPerfilHeroe() {
    const cont = $('heroe-container');
    if (!cont) return;
    try {
        const data = await apiGet('/api/heroe');
        // Si data es un array (múltiples héroes)
        if (Array.isArray(data)) {
            STATE.heroes = data;
            if (data.length === 0) {
                cont.innerHTML = renderFormHeroe(null);
                return;
            }
            // Si no hay héroe seleccionado, seleccionamos el primero
            if (!STATE.heroe) {
                STATE.heroe = data[0];
            } else {
                // Actualizar el objeto heroe en STATE por si hubo cambios
                const current = data.find(h => h.id === STATE.heroe.id);
                if (current) STATE.heroe = current;
            }
        } else if (data.error === 'no_heroe') {
            cont.innerHTML = renderFormHeroe(null);
            return;
        } else {
            // Caso de un solo héroe (compatible con versión anterior)
            STATE.heroe = data;
            STATE.heroes = [data];
        }

        const h = STATE.heroe;
        const tema = h.edad < 12 ? '🌈 Infantil' : '🎮 Juvenil';
        const emoji = h.foto_emoji || '🦸';

        // Renderizar encabezado con selector si hay varios
        let selectorHTML = '';
        if (STATE.heroes.length > 1) {
            selectorHTML = `
            <div class="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Cambiar de Héroe</label>
                <div class="flex gap-2 overflow-x-auto pb-2">
                    ${STATE.heroes.map(hero => `
                        <button onclick="seleccionarHeroe(${hero.id})" 
                            class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${hero.id === h.id ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200'}">
                            <span class="text-xl">${hero.foto_emoji}</span>
                            <span class="font-bold text-xs">${hero.nombre}</span>
                        </button>
                    `).join('')}
                    <button onclick="mostrarNuevoHeroeForm()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-teal-600 border border-teal-200 border-dashed hover:bg-teal-50">
                        <span class="text-xl">+</span>
                        <span class="font-bold text-xs">Nuevo</span>
                    </button>
                </div>
            </div>`;
        } else {
            selectorHTML = `
            <div class="mb-6 flex justify-end">
                <button onclick="mostrarNuevoHeroeForm()" class="text-[10px] font-black uppercase text-teal-600 tracking-widest hover:underline flex items-center gap-1">
                    <i class="fas fa-plus-circle"></i> Registrar otro hijo/a
                </button>
            </div>`;
        }

        cont.innerHTML = `
        ${selectorHTML}
        <div class="glass-card rounded-2xl p-8 max-w-2xl mx-auto border border-teal-500/10">
            <div class="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div class="w-28 h-28 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-3xl flex items-center justify-center border-2 border-teal-500/30">
                    <span class="text-6xl">${emoji}</span>
                </div>
                <div class="text-center md:text-left flex-1">
                    <h2 class="text-3xl font-black mb-1">${h.nombre}</h2>
                    <p class="text-teal-600 text-sm font-semibold">${h.codigo} · ${h.edad} años · ${h.genero === 'F' ? '♀' : '♂'}</p>
                    <p class="text-slate-400 text-xs mt-1">${h.tipo_diabetes} · Dx: ${h.diagnostico_fecha || '—'} · Tema: ${tema}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div class="metric-mini bg-slate-50/50">
                    <div class="metric-emoji">⚖️</div>
                    <div class="metric-value text-slate-800">${h.peso}</div>
                    <div class="metric-label text-slate-400">kg</div>
                </div>
                <div class="metric-mini bg-slate-50/50">
                    <div class="metric-emoji">📏</div>
                    <div class="metric-value text-slate-800">${h.estatura || '—'}</div>
                    <div class="metric-label text-slate-400">cm</div>
                </div>
                <div class="metric-mini bg-slate-50/50">
                    <div class="metric-emoji">📊</div>
                    <div class="metric-value text-slate-800">${h.imc || '—'}</div>
                    <div class="metric-label text-slate-400">IMC</div>
                </div>
                <div class="metric-mini bg-slate-50/50">
                    <div class="metric-emoji">🩸</div>
                    <div class="metric-value text-slate-800">${h.hba1c_ultimo || '—'}</div>
                    <div class="metric-label text-slate-400">HbA1c %</div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm mb-6">
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Ratio Carbos</p>
                    <p class="font-bold text-slate-700">${h.ratio_carbohidratos} g/UI</p>
                </div>
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Factor Sensibilidad</p>
                    <p class="font-bold text-slate-700">${h.factor_sensibilidad} mg/dL/UI</p>
                </div>
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Glucemia Objetivo</p>
                    <p class="font-bold text-slate-700">${h.glucemia_objetivo} mg/dL</p>
                </div>
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Insulina</p>
                    <p class="font-bold text-slate-700 text-xs">${h.tipo_insulina || '—'}</p>
                </div>
            </div>

            <div class="flex flex-wrap gap-3">
                <button onclick="editarHeroe()" class="bg-teal-600 hover:bg-teal-500 text-white font-bold px-5 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2">
                    <i class="fas fa-user-edit"></i> Editar Perfil
                </button>
                <button onclick="actualizarPeso()" class="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-5 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2">
                    ⚖️ Actualizar Peso
                </button>
            </div>
        </div>
        <div id="form-editar-heroe" class="hidden glass-card rounded-2xl p-6 max-w-lg mx-auto mt-6">
            ${renderFormHeroe(h)}
        </div>
        <div id="form-nuevo-heroe" class="hidden glass-card rounded-2xl p-6 max-w-lg mx-auto mt-6 border-2 border-dashed border-teal-200">
            ${renderFormHeroe(null)}
        </div>`;

        // Sincronizar UI del niño si el perfil cambió
        actualizarBarraPuntos();
        const hn = $('heroe-nombre-span');
        if (hn) hn.textContent = h.nombre;
        // Assuming actualizarMascotaDinamica exists elsewhere
        // actualizarMascotaDinamica(100); // Reset a happy
    } catch (e) {
        console.error("Error al cargar perfiles:", e);
        cont.innerHTML = renderFormHeroe(null);
    }
}

function seleccionarHeroe(hid) {
    const hero = STATE.heroes.find(h => h.id === hid);
    if (hero) {
        STATE.heroe = hero;
        localStorage.setItem('last_hero_id', hid);
        mostrarToast(`Cambiando a perfil de ${hero.nombre} 🦸`, 'info');

        // Actualizar UI Sidebar
        const hs = $('active-hero-name-sidebar');
        if (hs) hs.textContent = `Héroe: ${hero.nombre}`;

        cargarPerfilHeroe();
        cargarRecomendaciones(hero.id);
        // Recargar datos de la sección actual si aplica
        const activeSec = document.querySelector('.content-section.active');
        if (activeSec) {
            let name = activeSec.id.replace('sec-', '');
            if (name === 'home-parent' || name === 'miHeroe') {
                if (document.getElementById('nav-heroe')) {
                    name = 'heroe';
                } else {
                    name = 'miHeroe';
                }
            }
            showSection(name);
        }
    }
}

function desmarcarHeroe() {
    STATE.heroe = null;
    const hs = $('active-hero-name-sidebar');
    if (hs) hs.textContent = 'Selecciona un héroe';
    mostrarToast('Modo Representante (General)', 'info');
    showSection('home-parent');
}

function mostrarNuevoHeroeForm() {
    const f = $('form-nuevo-heroe');
    if (f) {
        f.classList.remove('hidden');
        f.scrollIntoView({ behavior: 'smooth' });
    }
}

function renderFormHeroe(h) {
    const idPrefix = h ? 'form-' : 'form-nuevo-';

    return `
    <h4 class="font-bold text-lg mb-4 text-teal-600 text-center">${h ? 'Actualizar Perfil' : '¡Registra a tu Héroe!'}</h4>
    <div class="space-y-4">
        <div>
            <label class="block text-slate-800 text-[10px] font-black uppercase mb-1 tracking-widest">Nombre del Niño/a</label>
            <input type="text" id="${idPrefix}nombre" value="${h ? h.nombre : ''}" placeholder="Nombre completo" class="med-input bg-slate-50 border-slate-200 text-slate-800">
        </div>
        <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-slate-800 text-[10px] font-black uppercase mb-1 tracking-widest">Género</label>
                <select id="${idPrefix}genero" class="med-input bg-slate-50 border-slate-200 text-slate-800">
                    <option value="M" ${h && h.genero === 'M' ? 'selected' : ''}>♂ Masculino</option>
                    <option value="F" ${h && h.genero === 'F' ? 'selected' : ''}>♀ Femenino</option>
                </select>
            </div>
            <div>
                <label class="block text-slate-800 text-[10px] font-black uppercase mb-1 tracking-widest">Edad</label>
                <input type="number" id="${idPrefix}edad" value="${h ? h.edad : ''}" placeholder="Ej: 8" class="med-input bg-slate-50 border-slate-200 text-slate-800">
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-slate-800 text-[10px] font-black uppercase mb-1 tracking-widest">Peso (kg)</label>
                <input type="number" step="0.1" id="${idPrefix}peso" value="${h ? h.peso : ''}" class="med-input bg-slate-50 border-slate-200 text-slate-800">
            </div>
            <div>
                <label class="block text-slate-800 text-[10px] font-black uppercase mb-1 tracking-widest">Estatura (cm)</label>
                <input type="number" step="0.1" id="${idPrefix}estatura" value="${h ? (h.estatura || '') : ''}" class="med-input bg-slate-50 border-slate-200 text-slate-800">
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-slate-800 text-[10px] font-black uppercase mb-1 tracking-widest">Fecha Nacimiento</label>
                <input type="date" id="${idPrefix}fecha-nac" value="${h ? h.fecha_nac : ''}" class="med-input bg-slate-50 border-slate-200 text-slate-800 text-xs">
            </div>
            <div>
                <label class="block text-slate-800 text-[10px] font-black uppercase mb-1 tracking-widest">Fecha Diagnóstico</label>
                <input type="date" id="${idPrefix}fecha-diag" value="${h ? h.diagnostico_fecha : ''}" class="med-input bg-slate-50 border-slate-200 text-slate-800 text-xs">
            </div>
        </div>
        <div>
            <label class="block text-slate-800 text-[10px] font-black uppercase mb-2 tracking-widest text-center">Avatar del Héroe</label>
            <div class="flex gap-2 flex-wrap justify-center bg-slate-50 p-4 rounded-3xl border border-dashed border-slate-200">
                ${['🦸', '🧸', '🐉', '⚽', '🎮', '🦊', '🌟', '🦋', '🐱', '🎨'].map(e => `
                <button onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('ring-4','ring-teal-400','scale-110','bg-teal-100'));this.classList.add('ring-4','ring-teal-400','scale-110','bg-teal-100');document.getElementById('${idPrefix}emoji').value='${e}'"
                    class="text-2xl p-2 rounded-2xl hover:bg-teal-50 transition-all ${h && h.foto_emoji === e ? 'ring-4 ring-teal-400 scale-110 bg-teal-100' : ''}">${e}</button>`).join('')}
            </div>
            <input type="hidden" id="${idPrefix}emoji" value="${h ? h.foto_emoji : '🦸'}">
        </div>
        <button onclick="guardarHeroe()" class="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-black py-4 rounded-[2rem] hover:shadow-2xl hover:shadow-teal-500/40 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3">
            <i class="fas fa-check-circle text-xl"></i>
            <span>${h ? 'Actualizar Héroe' : 'Registrar Mi Héroe'}</span>
        </button>
    </div>`;
}

function editarHeroe() {
    const form = $('form-editar-heroe');
    if (form) form.classList.toggle('hidden');
}

async function guardarHeroe() {
    const editForm = $('form-editar-heroe');
    const newForm = $('form-nuevo-heroe');

    const isEditVisible = editForm && !editForm.classList.contains('hidden');
    const isNewVisible = newForm && !newForm.classList.contains('hidden');

    let prefix = 'form-';
    let isEdit = false;

    // Detectar prefijo basado en lo que hay en el DOM actualmente
    if (isNewVisible || $('form-nuevo-nombre')) {
        prefix = 'form-nuevo-';
        isEdit = false;
    } else if (isEditVisible || $('form-nombre')) {
        prefix = 'form-';
        isEdit = !!STATE.heroe;
    }

    const body = {
        nombre: $(prefix + 'nombre')?.value?.trim() || '',
        edad: parseInt($(prefix + 'edad')?.value || 0),
        peso: parseFloat($(prefix + 'peso')?.value || 0),
        estatura: parseFloat($(prefix + 'estatura')?.value || 0),
        genero: $(prefix + 'genero')?.value || 'M',
        fecha_nac: $(prefix + 'fecha-nac')?.value || null,
        fecha_diagnostico: $(prefix + 'fecha-diag')?.value || null,
        foto_emoji: $(prefix + 'emoji')?.value || '🦸',
    };

    console.log("Intentando guardar héroe con prefijo:", prefix, body);

    if (!body.nombre || isNaN(body.edad) || body.edad <= 0 || isNaN(body.peso) || body.peso <= 0) {
        console.warn("Validación fallida:", body);
        mostrarToast('Completa todos los campos obligatorios correctamente', 'warning');
        return;
    }

    let res;
    if (isEdit && STATE.heroe) {
        res = await apiPut(`/api/heroe/${STATE.heroe.id}`, body);
    } else {
        res = await apiPost('/api/heroe', body);
    }

    if (res.status === 'success') {
        STATE.heroe = res.heroe;
        mostrarToast(isEdit ? '¡Perfil actualizado! 🦸' : '¡Héroe registrado con éxito! 🦸', 'success');
        await cargarPerfilHeroe();
        sumarXP(50);
        // Ocultar forms
        $('form-editar-heroe')?.classList.add('hidden');
        $('form-nuevo-heroe')?.classList.add('hidden');
    } else {
        mostrarToast('Error al guardar', 'error');
    }
}

async function actualizarPeso() {
    const nuevo = prompt('⚖️ Recordatorio Mensual\n\nIngresa el peso actualizado (kg):');
    if (!nuevo || isNaN(nuevo)) return;
    const res = await apiPut(`/api/heroe/${STATE.heroe.id}/peso`, { peso: parseFloat(nuevo) });
    if (res.status === 'success') {
        mostrarToast(`Peso actualizado a ${res.peso} kg ⚖️`, 'success');
        STATE.heroe.peso = res.peso;
        await cargarPerfilHeroe();
    }
}

// ══════════════════════════════════════════════════════════
//  MÓDULO 2: DOSIFICACIÓN
// ══════════════════════════════════════════════════════════
async function calcularDosis() {
    if (!STATE.heroe) { mostrarToast('Primero selecciona un Héroe 🦸', 'warning'); return; }
    const glucemia = parseFloat($('input-glucemia')?.value || 0);
    const carbos = parseFloat($('input-carbos')?.value || 0);
    const momento = $('input-momento')?.value || 'libre';
    if (!glucemia) { mostrarToast('Ingresa la glucemia actual', 'warning'); return; }

    try {
        const res = await apiPost('/api/dosificacion/calcular', {
            heroe_id: STATE.heroe.id, glucemia, carbohidratos: carbos, momento
        });

        const box = $('resultado-dosis-box');
        const cont = $('resultado-dosis-content');
        box.classList.remove('hidden');

        let html = '';
        if (res.alerta_glucemia === 'hipo') {
            html += `<div class="bg-rose-50 border-2 border-rose-200 rounded-[2rem] p-8 mb-4 text-center">
                <p class="text-6xl mb-4 animate-bounce">🚨</p>
                <p class="font-black text-rose-600 text-xl uppercase tracking-tight">¡ALERTA HIPOGLUCEMIA!</p>
                <p class="text-slate-700 text-sm mt-3 leading-relaxed">La glucosa de <b>${STATE.heroe.nombre}</b> es muy baja: <b class="text-rose-600">${glucemia} mg/dL</b></p>
                <div class="bg-white/60 p-4 rounded-2xl mt-4 border border-rose-100 text-left">
                    <p class="text-rose-700 font-bold text-xs">🩺 PROTOCOLO 15/15:</p>
                    <p class="text-slate-600 text-[11px] mt-1">1. Dar 15g de azúcar rápida (jugo, 3 caramelos).<br>2. Esperar 15 min y volver a medir.<br>3. <b>No inyectar insulina ahora.</b></p>
                </div>
            </div>`;
        } else {
            const esHiper = res.alerta_glucemia === 'hiper';
            html += `<div class="text-center p-4">
                <div class="${esHiper ? 'bg-amber-100' : 'bg-emerald-100'} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-4xl">${esHiper ? '⚠️' : '💉'}</span>
                </div>
                <p class="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-1">Dosis Sugerida</p>
                <h3 class="text-6xl font-black text-slate-800">${res.dosis} <span class="text-xl text-slate-400">UI</span></h3>
                
                ${esHiper ? `
                <div class="mt-4 p-4 bg-amber-50 text-amber-700 rounded-2xl text-[11px] font-bold border border-amber-200 text-left">
                    <i class="fas fa-exclamation-triangle mr-1"></i> GLUCOSA ALTA: Asegurar hidratación y revisar cuerpos cetónicos si supera 250 mg/dL.
                </div>` : ''}

                <div class="mt-8 space-y-3">
                    <button onclick="guardarAplicacionDosis(${res.registro_id}, ${res.dosis})" class="w-full bg-slate-800 text-white font-black py-4 rounded-2xl hover:bg-teal-600 transition-all shadow-lg active:scale-95">
                        Registrar Aplicación
                    </button>
                    ${res.alerta_seguridad ? `
                        <p class="text-rose-500 text-[10px] font-bold">⚠️ Esta dosis supera el límite de seguridad habitual.</p>
                    ` : ''}
                </div>
            </div>`;
        }

        cont.innerHTML = html;
        if (window.innerWidth < 768) box.scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
        console.error("Error dosis:", e);
        mostrarToast('Error al calcular dosis', 'error');
    }
}

async function guardarAplicacionDosis(regId, dosis) {
    const res = await apiPut(`/api/dosificacion/confirmar/${regId}`, { dosis_aplicada: dosis });
    if (res.status === 'success') {
        mostrarToast('¡Dosis registrada con éxito! 💉', 'success');
        celebrarMision(30);
        $('resultado-dosis-box').classList.add('hidden');
        cargarHistorial();
    }
}

async function confirmarDosis(regId, dosis) {
    const res = await apiPut(`/api/dosificacion/confirmar/${regId}`, { dosis_aplicada: dosis });
    if (res.status === 'success') mostrarToast('Dosis confirmada ✅', 'success');
}

// ══════════════════════════════════════════════════════════
//  MÓDULO 3: CDI
// ══════════════════════════════════════════════════════════
async function iniciarCDI() {
    if (!STATE.heroe) return;
    const data = await apiGet('/api/psico/preguntas/CDI');
    STATE.cdiPreguntas = data.preguntas;
    STATE.cdiRespuestas = [];
    STATE.cdiIndex = 0;
    const prog = $('cdi-progreso');
    if (prog) prog.classList.remove('hidden');
    mostrarPreguntaCDI();
}

function mostrarPreguntaCDI() {
    const idx = STATE.cdiIndex;
    const total = STATE.cdiPreguntas.length;
    if (idx >= total) { enviarCDI(); return; }
    $('cdi-prog-text').textContent = `Pregunta ${idx + 1} de ${total}`;
    $('cdi-prog-bar').style.width = `${((idx) / total) * 100}%`;
    $('cdi-puntaje-parcial').textContent = `${STATE.cdiRespuestas.reduce((a, b) => a + b, 0)} pts`;
    $('cdi-pregunta-texto').textContent = STATE.cdiPreguntas[idx];
}

function responderCDI(valor) {
    STATE.cdiRespuestas.push(valor);
    STATE.cdiIndex++;
    mostrarPreguntaCDI();
}

async function enviarCDI() {
    const res = await apiPost('/api/psico/guardar', {
        heroe_id: STATE.heroe.id, tipo: 'CDI', respuestas: STATE.cdiRespuestas
    });
    $('cdi-progreso').classList.add('hidden');
    const resDiv = $('cdi-resultado');
    resDiv.classList.remove('hidden');

    let html = '';
    if (res.estado === 'Riesgo') {
        html = `<div class="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6">
            <p class="text-5xl mb-3">⚠️</p>
            <p class="font-black text-rose-600 text-xl">Riesgo de Sintomatología Depresiva</p>
            <p class="text-slate-600 text-sm mt-2">Puntaje CDI: <b class="text-slate-800">${res.puntaje} pts</b> (umbral: 19)</p>
            <p class="text-slate-700 text-sm mt-1">Se recomienda evaluación psicológica y sesión de TCC.</p>
            <p class="text-teal-600 text-sm mt-2 font-bold">✅ Alerta enviada al especialista automáticamente.</p>
        </div>`;
        inyectarApoyoPsicologico();
    } else {
        html = `<div class="text-center">
            <p class="text-7xl mb-3">😊</p>
            <p class="font-black text-emerald-600 text-xl">¡Estado Emocional Estable!</p>
            <p class="text-slate-700 text-sm mt-2">CDI: <b class="text-slate-800">${res.puntaje} pts</b> · Rango normal</p>
        </div>`;
        sumarXP(40);
    }
    resDiv.innerHTML = html + `<button onclick="resetCDI()" class="mt-5 bg-white/10 hover:bg-white/15 text-white font-bold px-5 py-3 rounded-xl transition-all active:scale-95">Realizar otra evaluación</button>`;
}

function inyectarApoyoPsicologico() {
    const parent = $('cdi-resultado');
    const apoyo = document.createElement('div');
    apoyo.className = 'mt-6 p-8 glass-card rounded-[2rem] border-2 border-teal-500/30 animate-pulse-slow';
    apoyo.innerHTML = `
        <h4 class="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
            <span class="text-3xl">🧘‍♂️</span> Módulo de Apoyo (TCC Pediátrica)
        </h4>
        <div class="space-y-4">
            <div class="bg-teal-500/10 p-4 rounded-2xl border border-teal-500/20">
                <p class="text-slate-700 font-bold mb-1">Paso 1: Identificar la emoción</p>
                <p class="text-xs text-slate-700">Dibuja cómo se siente tu corazón hoy. Ponerle forma a la tristeza ayuda a que sea más pequeña.</p>
            </div>
            <div class="bg-sky-500/10 p-4 rounded-2xl border border-sky-500/20">
                <p class="text-slate-700 font-bold mb-1">Paso 2: La técnica del globo</p>
                <p class="text-xs text-slate-700">Imagina que inflas un globo muy grande con tus preocupaciones y luego lo dejas ir volando muy lejos.</p>
            </div>
            <div class="flex justify-between items-center mt-6">
                <p class="text-[10px] text-slate-600 font-black uppercase tracking-widest">Protocolo moo.md §3</p>
                <button class="bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-black">Agenda una cita</button>
            </div>
        </div>
    `;
    parent.appendChild(apoyo);
}

function resetCDI() {
    $('cdi-resultado').classList.add('hidden');
    STATE.cdiRespuestas = []; STATE.cdiIndex = 0;
    iniciarCDI();
}

// ══════════════════════════════════════════════════════════
//  MÓDULO 3: SCI-R
// ══════════════════════════════════════════════════════════
async function cargarSCIR() {
    const cont = $('scir-form-container');
    if (!cont) return;
    const data = await apiGet('/api/psico/preguntas/SCIR');
    STATE.scirPreguntas = data.preguntas;
    STATE.scirRespuestas = new Array(data.preguntas.length).fill(2);

    let html = `<h4 class="font-black text-slate-800 text-lg mb-6 flex items-center gap-3">
        <span class="bg-sky-100 text-sky-600 p-2 rounded-xl"><i class="fas fa-list-check"></i></span>
        Frecuencia de actividades de cuidado
    </h4>
    <div class="space-y-4" id="scir-preguntas">`;
    data.preguntas.forEach((p, i) => {
        html += `<div class="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover-lift stagger-item" style="animation-delay: ${i * 0.05}s">
            <p class="text-sm font-bold mb-4 text-slate-700">${i + 1}. ${p}</p>
            <div class="flex gap-2 justify-between items-center bg-white/50 p-3 rounded-xl border border-dashed border-slate-200">
                <span class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Nunca</span>
                <div class="flex gap-2">
                    ${['😞', '😐', '🙂', '😊'].map((e, v) => `
                    <button class="scir-btn text-2xl p-2 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-all ${v === 2 ? 'ring-2 ring-sky-500 shadow-lg' : ''}" 
                        onclick="selScir(${i},${v},this)">${e}</button>`).join('')}
                </div>
                <span class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Siempre</span>
            </div>
        </div>`;
    });
    html += `</div>
    <button onclick="enviarSCIR()" class="w-full mt-10 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-black py-5 rounded-2xl hover:shadow-xl transition-all active:scale-[0.98]">
        <i class="fas fa-paper-plane mr-2"></i>Finalizar Evaluación
    </button>`;
    cont.innerHTML = html;
}

function selScir(idx, val, btn) {
    STATE.scirRespuestas[idx] = val;
    // Selector más robusto: busca el contenedor de la pregunta (padre común)
    const container = btn.closest('div.flex.gap-2.justify-between');
    if (container) {
        container.querySelectorAll('.scir-btn').forEach(b => {
            b.classList.remove('ring-2', 'ring-sky-500', 'shadow-lg');
        });
    }
    btn.classList.add('ring-2', 'ring-sky-500', 'shadow-lg');
}

async function enviarSCIR() {
    if (!STATE.heroe) { mostrarToast('Primero crea el perfil del Héroe', 'warning'); return; }
    const res = await apiPost('/api/psico/guardar', {
        heroe_id: STATE.heroe.id, tipo: 'SCIR', respuestas: STATE.scirRespuestas
    });
    const resDiv = $('scir-resultado');
    resDiv.classList.remove('hidden');
    $('scir-form-container').classList.add('hidden');

    let html = '';
    if (res.estado === 'Baja') {
        const tips = $('tips-autocuidado');
        if (tips) tips.classList.remove('hidden');
        html = `<div class="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
        <p class="text-5xl mb-3">📋</p>
        <p class="font-black text-amber-600 text-xl">Baja Adherencia Detectada</p>
        <p class="text-slate-600 text-sm mt-2">Porcentaje: <b class="text-slate-800">${res.puntaje}%</b> (umbral: 70%)</p>
        <p class="text-teal-700 text-sm mt-2 font-bold">💡 Tips de Autocuidado desbloqueados abajo.</p>
    </div>`;
    } else {
        html = `<div class="text-center">
        <p class="text-7xl mb-3">🏆</p>
        <p class="font-black text-emerald-600 text-xl">¡Alta Adherencia!</p>
        <p class="text-slate-600 text-sm mt-2">Porcentaje: <b class="text-slate-800">${res.puntaje}%</b> · Excelente.</p>
    </div>`;
        sumarXP(50);
    }
    resDiv.innerHTML = html + `<button onclick="location.reload()" class="mt-5 bg-white/10 hover:bg-white/15 text-white font-bold px-5 py-3 rounded-xl transition-all active:scale-95">Nueva evaluación</button>`;
}

// ══════════════════════════════════════════════════════════
//  DIARIO NUTRICIONAL
// ══════════════════════════════════════════════════════════
async function cargarResumenNutricional() {
    if (!STATE.heroe) return;
    try {
        const r = await apiGet(`/api/comidas/resumen/${STATE.heroe.id}`);
        if ($('nut-carbos')) $('nut-carbos').textContent = r.total_carbos + 'g';
        if ($('nut-calorias')) $('nut-calorias').textContent = r.total_calorias;
        if ($('nut-proteinas')) $('nut-proteinas').textContent = r.total_proteinas + 'g';
        if ($('nut-grasas')) $('nut-grasas').textContent = r.total_grasas + 'g';
        if ($('nut-comidas')) $('nut-comidas').textContent = r.num_comidas;
    } catch (e) { }
}

async function cargarComidas() {
    if (!STATE.heroe) return;
    const cont = $('lista-comidas');
    if (!cont) return;
    try {
        const comidas = await apiGet(`/api/comidas/${STATE.heroe.id}?limit=15`);
        if (!comidas.length) { cont.innerHTML = '<div class="text-center text-slate-700 py-4">Sin registros hoy</div>'; return; }
        cont.innerHTML = comidas.map(c => `
    <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
        <div class="text-3xl">${c.foto_emoji}</div>
        <div class="flex-1 min-w-0">
            <p class="font-bold text-sm text-slate-800">${c.descripcion || c.tipo_comida}</p>
            <p class="text-slate-600 text-xs">${c.tipo_comida} · ${c.fecha}</p>
        </div>
        <div class="text-right flex-shrink-0">
            <p class="text-orange-600 font-black text-sm">${c.carbohidratos}g</p>
            <p class="text-slate-600 text-xs">${c.calorias} kcal</p>
        </div>
    </div>`).join('');
    } catch (e) { cont.innerHTML = '<div class="text-red-400 text-center py-4">Error</div>'; }
}

async function registrarComida() {
    if (!STATE.heroe) { mostrarToast('Primero crea el perfil del Héroe', 'warning'); return; }
    const body = {
        heroe_id: STATE.heroe.id,
        tipo_comida: $('comida-tipo')?.value || 'merienda',
        descripcion: $('comida-desc')?.value || '',
        carbohidratos: parseFloat($('comida-carbos')?.value || 0),
        calorias: parseFloat($('comida-cal')?.value || 0),
        proteinas: parseFloat($('comida-prot')?.value || 0),
        grasas: parseFloat($('comida-grasas')?.value || 0),
    };
    if (!body.descripcion) { mostrarToast('Describe qué comió el niño', 'warning'); return; }
    const res = await apiPost('/api/comidas', body);
    if (res.status === 'success') {
        mostrarToast('¡Comida registrada! 🍽️', 'success');
        sumarXP(20);
        $('comida-desc').value = '';
        $('comida-carbos').value = '';
        $('comida-cal').value = '';
        $('comida-prot').value = '';
        $('comida-grasas').value = '';
        cargarComidas();
        cargarResumenNutricional();
    }
}

// ══════════════════════════════════════════════════════════
//  CRECIMIENTO
// ══════════════════════════════════════════════════════════
async function cargarCrecimiento() {
    if (!STATE.heroe) return;
    if ($('gm-peso')) $('gm-peso').textContent = STATE.heroe.peso;
    if ($('gm-estatura')) $('gm-estatura').textContent = STATE.heroe.estatura || '—';
    if ($('gm-imc')) $('gm-imc').textContent = STATE.heroe.imc || '—';

    try {
        const data = await apiGet(`/api/crecimiento/${STATE.heroe.id}`);
        if (STATE.charts.growth) STATE.charts.growth.destroy();
        const ctx = $('chart-crecimiento');
        if (!ctx || !data.length) return;

        STATE.charts.growth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.fecha),
                datasets: [
                    { label: 'Peso (kg)', data: data.map(d => d.peso), borderColor: '#0d9488', backgroundColor: 'rgba(13,148,136,.1)', fill: true, tension: 0.4, pointRadius: 5 },
                    { label: 'IMC', data: data.map(d => d.imc), borderColor: '#d97706', backgroundColor: 'rgba(217,119,6,.1)', fill: true, tension: 0.4, pointRadius: 5, yAxisID: 'y1' },
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#475569', font: { weight: 'bold' } } } },
                scales: {
                    x: { ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } },
                    y: { ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' }, position: 'left' },
                    y1: { ticks: { color: '#64748b' }, grid: { display: false }, position: 'right' },
                }
            }
        });
    } catch (e) { }
}

async function registrarCrecimiento() {
    if (!STATE.heroe) { mostrarToast('Primero crea el perfil del Héroe', 'warning'); return; }
    const peso = parseFloat($('growth-peso')?.value || 0);
    const estatura = parseFloat($('growth-estatura')?.value || 0);
    if (!peso || !estatura) { mostrarToast('Ingresa peso y estatura', 'warning'); return; }
    const res = await apiPost('/api/crecimiento', { heroe_id: STATE.heroe.id, peso, estatura });
    if (res.status === 'success') {
        mostrarToast(`Registrado. IMC: ${res.imc} 📏`, 'success');
        STATE.heroe.peso = peso;
        STATE.heroe.estatura = estatura;
        STATE.heroe.imc = res.imc;
        sumarXP(25);
        cargarCrecimiento();
    }
}

// ══════════════════════════════════════════════════════════
//  RECORDATORIOS
// ══════════════════════════════════════════════════════════
async function cargarRecordatorios() {
    if (!STATE.heroe) return;
    const cont = $('lista-recordatorios');
    if (!cont) return;
    try {
        const recs = await apiGet(`/api/recordatorios/${STATE.heroe.id}`);
        if (!recs.length) {
            cont.innerHTML = '<div class="text-center text-slate-700 py-12 col-span-2"><div class="text-4xl mb-4">⏰</div>No hay alarmas activas. ¡Configura una!</div>';
            return;
        }
        const iconMap = { insulina: '💉', glucosa: '🩸', cita: '🏥', peso: '⚖️', comida: '🍽️' };
        const colorMap = { insulina: 'rose', glucosa: 'teal', cita: 'sky', peso: 'lime', comida: 'orange' };

        cont.innerHTML = recs.map(r => `
    <div class="reminder-card group">
        <div class="reminder-icon text-3xl bg-${colorMap[r.tipo] || 'slate'}-50 p-3 rounded-2xl">${iconMap[r.tipo] || '🔔'}</div>
        <div class="reminder-content">
            <p class="reminder-title">${r.mensaje || r.tipo}</p>
            <div class="flex items-center gap-2 mt-1">
                <span class="reminder-time font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">${r.hora}</span>
                <span class="text-[10px] text-slate-600 font-bold uppercase">${r.dias || 'Diario'}</span>
            </div>
        </div>
        <button onclick="eliminarRecordatorio(${r.id})" class="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95">
            <i class="fas fa-trash-alt"></i>
        </button>
    </div>`).join('');
    } catch (e) { }
}

async function crearRecordatorio() {
    if (!STATE.heroe) { mostrarToast('Primero crea el perfil', 'warning'); return; }
    const body = {
        heroe_id: STATE.heroe.id,
        tipo: $('rec-tipo')?.value || 'glucosa',
        mensaje: $('rec-mensaje')?.value || '',
        hora: $('rec-hora')?.value || '08:00',
    };
    if (!body.mensaje) { mostrarToast('Escribe un mensaje para la alarma', 'warning'); return; }
    const res = await apiPost('/api/recordatorios', body);
    if (res.status === 'success') {
        mostrarToast('¡Alarma configurada con éxito! ⏰', 'success');
        $('rec-mensaje').value = '';
        cargarRecordatorios();
    }
}

async function eliminarRecordatorio(id) {
    if (!confirm('¿Eliminar esta alarma?')) return;
    await apiDelete(`/api/recordatorios/${id}`);
    mostrarToast('Alarma eliminada', 'success');
    cargarRecordatorios();
}

// ══════════════════════════════════════════════════════════
//  MÓDULO 5: DASHBOARD ESPECIALISTA
// ══════════════════════════════════════════════════════════
async function cargarDashboardEspecialista() {
    try {
        const [panel, stats] = await Promise.all([
            apiGet('/api/panel/resumen'),
            apiGet('/api/panel/estadisticas')
        ]);

        if ($('kpi-total')) $('kpi-total').textContent = panel.total_pacientes;
        if ($('kpi-riesgo')) $('kpi-riesgo').textContent = panel.en_riesgo;
        if ($('kpi-alertas')) $('kpi-alertas').textContent = stats.alertas_pendientes;
        if ($('kpi-registros')) $('kpi-registros').textContent = stats.promedio_tir + '%';

        // Actualizar título dinámico con el número real de pacientes de la BD
        const n = panel.total_pacientes || panel.total || 0;
        const pgTitle = $('page-title');
        const pgSub = $('page-sub');
        if (pgTitle && pgTitle.textContent.includes('Pacientes')) {
            pgTitle.textContent = `👶 Pacientes (N=${n})`;
        }
        if (pgSub && pgSub.textContent.includes('Grupo')) {
            pgSub.textContent = `${n} pacientes registrados en el Hospital Dr. Jesús García Coello`;
        }

        // Global Charts
        const globalStatsBox = $('dashboard-global-stats');
        if (globalStatsBox) {
            globalStatsBox.classList.remove('hidden');

            // TIR Distribution Chart
            if (stats.distribucion_tir) {
                const ctxTir = $('chart-global-tir').getContext('2d');
                if (STATE.charts.globalTir) STATE.charts.globalTir.destroy();
                STATE.charts.globalTir = new Chart(ctxTir, {
                    type: 'doughnut',
                    data: {
                        labels: ['< 50% (Bajo)', '50-70% (Medio)', '> 70% (Objetivo)'],
                        datasets: [{
                            data: [stats.distribucion_tir.bajo, stats.distribucion_tir.medio, stats.distribucion_tir.objetivo],
                            backgroundColor: ['#f43f5e', '#f59e0b', '#10b981'],
                            borderWidth: 0,
                            hoverOffset: 10
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'right', labels: { font: { weight: 'bold', size: 10 }, color: '#64748b' } }
                        }
                    }
                });
            }

            // CDI Aggregate Chart
            if (stats.distribucion_cdi) {
                const ctxCdi = $('chart-global-cdi').getContext('2d');
                if (STATE.charts.globalCdi) STATE.charts.globalCdi.destroy();
                STATE.charts.globalCdi = new Chart(ctxCdi, {
                    type: 'doughnut',
                    data: {
                        labels: ['Estable', 'Riesgo'],
                        datasets: [{
                            data: [stats.distribucion_cdi.estable, stats.distribucion_cdi.riesgo],
                            backgroundColor: ['#0d9488', '#f43f5e'],
                            hoverOffset: 10,
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '75%',
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    usePointStyle: true,
                                    font: { weight: 'bold', size: 10 },
                                    color: '#64748b'
                                }
                            }
                        }
                    }
                });
            }
        }

        // Cambiar etiquetas dinámicamente
        const regKPI = $('kpi-registros')?.parentElement;
        if (regKPI) {
            regKPI.querySelector('p').textContent = 'TIR Promedio Grupo';
            regKPI.querySelector('.text-gray-500').innerHTML = `<i class="fas fa-bullseye text-teal-400"></i> Meta: >70%`;
        }

        if (panel.total_alertas > 0) {
            const b1 = $('header-badge'), b2 = $('badge-alertas');
            if (b1) { b1.classList.remove('hidden'); b1.textContent = panel.total_alertas; }
            if (b2) { b2.classList.remove('hidden'); b2.textContent = panel.total_alertas; }
        }

        const tbody = $('tabla-pacientes-body'); // Changed to target tbody directly
        if (!tbody) return;
        if (!panel.pacientes.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="px-5 py-8 text-center text-slate-700">Sin pacientes.</td></tr>';
            return;
        }
        tbody.innerHTML = panel.pacientes.map(p => {
            let cls = '';
            let badge = '';
            const isCritical = p.estado === 'Crítico';
            const isAlert = p.estado === 'Alerta';

            if (isCritical) {
                cls = 'border-l-4 border-rose-500 bg-rose-50';
                badge = '<span class="estado-badge bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold animate-pulse-med">🚨 Crítico</span>';
            } else if (isAlert) {
                cls = 'border-l-4 border-amber-500 bg-amber-50';
                badge = '<span class="estado-badge bg-amber-100 text-amber-600 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">⚠️ Alerta</span>';
            } else {
                cls = 'border-l-4 border-emerald-500';
                badge = '<span class="estado-badge bg-emerald-100 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">✅ Estable</span>';
            }

            return `<tr class="${cls} hover:bg-slate-50 transition-all">
            <td class="px-5 py-4 font-mono font-bold text-teal-700">${p.id}</td>
            <td class="px-5 py-4 text-slate-600">${p.edad}a / ${p.peso}kg</td>
            <td class="px-5 py-4 text-slate-800 font-semibold">${p.ultima_glucemia ? p.ultima_glucemia + ' mg/dL' : '—'} <span class="text-slate-600 text-[10px] block opacity-60">${p.fecha_glucemia}</span></td>
            <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                    <div class="w-12 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full ${p.tir < 70 ? 'bg-amber-400' : 'bg-emerald-500'}" style="width: ${p.tir}%"></div>
                    </div>
                    <span class="text-[11px] font-black ${p.tir < 70 ? 'text-amber-600' : 'text-emerald-600'}">${p.tir}%</span>
                </div>
            </td>
            <td class="px-5 py-4"><span class="${p.adherencia_estado === 'Baja' ? 'text-amber-600' : 'text-emerald-600'} font-bold">${p.adherencia_pct !== null ? p.adherencia_pct + '% (' + p.adherencia_estado + ')' : '—'}</span></td>
            <td class="px-5 py-4"><span class="${p.cdi_estado === 'Riesgo' ? 'text-red-600' : 'text-emerald-600'} font-bold">${p.cdi_puntaje !== null ? p.cdi_puntaje + 'pts' : '—'}</span></td>
            <td class="px-5 py-4">${badge}</td>
            <td class="px-5 py-4 text-center">
                <button onclick="abrirFichaPaciente(${p.heroe_id})" class="text-xs bg-teal-600 hover:bg-teal-500 text-white font-black px-4 py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-teal-500/20">
                    <i class="fas fa-file-medical-alt mr-1"></i> Ficha
                </button>
            </td>
        </tr>`;
        }).join('');

        const sel = $('select-heroe-grafico');
        if (sel && panel.pacientes.length) {
            sel.innerHTML = '<option value="">— Seleccionar —</option>' +
                panel.pacientes.map(p => `<option value="${p.heroe_id}">${p.id} · ${p.nombre}</option>`).join('');
        }

        const cardsCont = $('cards-pacientes');
        if (cardsCont) {
            cardsCont.innerHTML = panel.pacientes.map(p => {
                const r = p.estado === 'Riesgo';
                return `<div class="glass-card rounded-3xl p-5 ${r ? 'border-l-4 border-red-500' : 'border-l-4 border-emerald-500'}">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <p class="font-mono font-black text-teal-700 text-lg">${p.id}</p>
                        <p class="font-bold text-slate-800">${p.nombre}</p>
                        <p class="text-slate-600 text-xs">${p.edad}a · ${p.peso}kg</p>
                    </div>
                    <span class="${r ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'} px-2 py-1 rounded-full text-[10px] font-bold">
                        ${r ? '⚠️ Crítico' : '✅ Estable'}
                    </span>
                </div>
                <div class="space-y-1 text-sm">
                    <p class="text-slate-700">Glucemia: <span class="text-slate-800 font-semibold">${p.ultima_glucemia ? p.ultima_glucemia + ' mg/dL' : '—'}</span></p>
                    <p class="text-slate-700">CDI: <span class="${p.cdi_estado === 'Riesgo' ? 'text-red-600' : 'text-emerald-600'} font-semibold">${p.cdi_puntaje !== null ? p.cdi_puntaje + ' pts' : '—'}</span></p>
                    <p class="text-slate-700">SCI-R: <span class="${p.adherencia_estado === 'Baja' ? 'text-amber-600' : 'text-emerald-600'} font-semibold">${p.adherencia_pct !== null ? p.adherencia_pct + '%' : '—'}</span></p>
                </div>
                ${p.alertas_pendientes > 0 ? `<div class="mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-600 font-bold flex items-center gap-2 animate-pulse"><i class="fas fa-bell"></i> ${p.alertas_pendientes} alerta(s)</div>` : ''}
                <button onclick="abrirFichaPaciente(${p.heroe_id})" class="mt-4 w-full text-xs bg-slate-800 hover:bg-teal-600 text-white font-black py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                    <i class="fas fa-user-md"></i> Abrir Ficha Clínica
                </button>
            </div>`;
            }).join('');
        }
    } catch (e) { console.error('Dashboard error:', e); }
}

// ── Ficha Clínica Expandida (Especialista) ───────────────────────
let fichaChartGlucemia = null;
let currentHidFicha = null;

async function abrirFichaPaciente(hid) {
    currentHidFicha = hid;
    const modal = $('modal-ficha-paciente');
    if (!modal) return;

    modal.classList.remove('hidden');
    mostrarToast('Cargando ficha clínica... 📂', 'info');

    try {
        const data = await apiGet(`/api/panel/paciente/${hid}`);
        const h = data.heroe;

        // Llenar cabecera
        $('ficha-nombre').textContent = h.nombre;
        $('ficha-sub').textContent = `Código: ${h.codigo} · ${h.edad} años · ${h.peso} kg`;
        $('ficha-avatar').textContent = h.foto_emoji || '🦸';

        // Llenar parámetros médicos
        $('edit-ratio').value = h.ratio_carbohidratos;
        $('edit-sensibilidad').value = h.factor_sensibilidad;
        $('edit-glucemia-obj').value = h.glucemia_objetivo;
        $('edit-dosis-max').value = h.dosis_max_kg;

        // Llenar métricas
        $('ficha-val-cdi').textContent = data.psicometria.cdi ? `${data.psicometria.cdi.puntaje} pts` : '—';
        $('ficha-val-cdi').className = `text-lg font-black ${data.psicometria.cdi?.estado === 'Riesgo' ? 'text-rose-600' : 'text-emerald-600'}`;

        $('ficha-val-scir').textContent = data.psicometria.scir ? `${data.psicometria.scir.puntaje}%` : '—';
        $('ficha-val-scir').className = `text-lg font-black ${data.psicometria.scir?.estado === 'Baja' ? 'text-amber-600' : 'text-emerald-600'}`;

        $('ficha-val-peso').textContent = `${h.peso} kg`;
        $('ficha-val-imc').textContent = h.imc || '—';

        // Alertas
        const alertaList = $('ficha-lista-alertas');
        const alertaBox = $('ficha-alertas-box');
        if (data.alertas.length > 0) {
            alertaBox.classList.remove('hidden');
            alertaList.innerHTML = data.alertas.map(a => `<li>• ${a}</li>`).join('');
        } else {
            alertaBox.classList.add('hidden');
        }

        // Tabla historial
        const tbody = $('ficha-tabla-historial');
        tbody.innerHTML = data.historial_corto.map(r => `
            <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td class="p-3 font-bold text-slate-500">${r.fecha}</td>
                <td class="p-3 font-black text-slate-800">${r.valor} <span class="text-[9px] opacity-50">mg/dL</span></td>
                <td class="p-3 font-black text-teal-600">${r.dosis} <span class="text-[9px] opacity-50">UI</span></td>
            </tr>
        `).join('');

        // Gráfico
        renderGraficoFicha(data.historial_corto);

    } catch (e) {
        console.error("Error abriendo ficha:", e);
        mostrarToast('Error al cargar datos del paciente', 'error');
    }
}

function renderGraficoFicha(historial) {
    if (fichaChartGlucemia) fichaChartGlucemia.destroy();
    const ctx = $('chart-ficha-glucemia').getContext('2d');

    // Invertir para que sea cronológico (asc)
    const reversedLabels = historial.map(r => r.fecha.split(' ')[0]).reverse();
    const reversedData = historial.map(r => r.valor).reverse();

    fichaChartGlucemia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: reversedLabels,
            datasets: [{
                label: 'Glucemia',
                data: reversedData,
                borderColor: '#0d9488',
                backgroundColor: 'rgba(13,148,136,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: 40, max: 400, grid: { color: '#f1f5f9' }, ticks: { font: { size: 9 } } },
                x: { grid: { display: false }, ticks: { font: { size: 9 } } }
            }
        }
    });
}

function cerrarFichaPaciente() {
    $('modal-ficha-paciente').classList.add('hidden');
}

async function guardarConfigPaciente() {
    if (!currentHidFicha) return;
    const body = {
        ratio: parseFloat($('edit-ratio').value),
        sensibilidad: parseFloat($('edit-sensibilidad').value),
        glucemia_obj: parseFloat($('edit-glucemia-obj').value),
        dosis_max: parseFloat($('edit-dosis-max').value),
    };

    try {
        const res = await apiPut(`/api/heroe/${currentHidFicha}/config`, body);
        if (res.status === 'success') {
            mostrarToast('Configuración médica actualizada con éxito 🩺', 'success');
            cargarDashboardEspecialista(); // Refrescar tabla si cambió estatus
        }
    } catch (e) {
        mostrarToast('Error al actualizar configuración', 'error');
    }
}

async function cargarGraficos() {
    const sel = $('select-heroe-grafico');
    if (sel && sel.value) {
        await renderGraficos(sel.value);
    }
}

async function verGrafico(hid) {
    showSection('graficos');
    const sel = $('select-heroe-grafico');
    if (sel) sel.value = hid;
    await renderGraficos(hid);
}

async function renderGraficos(hid) {
    const data = await apiGet(`/api/panel/graficos/${hid}`);
    if (STATE.charts.glucemia) STATE.charts.glucemia.destroy();
    if (STATE.charts.cdi) STATE.charts.cdi.destroy();

    const ctxG = $('chart-glucemia').getContext('2d');
    const gradientG = ctxG.createLinearGradient(0, 0, 0, 300);
    gradientG.addColorStop(0, 'rgba(13, 148, 136, 0.4)');
    gradientG.addColorStop(1, 'rgba(13, 148, 136, 0.0)');

    const chartOpts = (min, max) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                titleFont: { size: 14, weight: 'bold' },
                padding: 12,
                cornerRadius: 12,
                displayColors: false
            }
        },
        scales: {
            x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(241, 245, 249, 0.5)' }, min, max }
        },
        interaction: { intersect: false, mode: 'index' }
    });

    STATE.charts.glucemia = new Chart(ctxG, {
        type: 'line',
        data: {
            labels: data.glucemia.map(d => d.fecha.split(' ')[0]),
            datasets: [{
                label: 'Glucemia', data: data.glucemia.map(d => d.valor),
                borderColor: '#0d9488',
                borderWidth: 3,
                backgroundColor: gradientG,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 8,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#0d9488',
                pointBorderWidth: 2
            }]
        },
        options: {
            ...chartOpts(40, 350),
            plugins: {
                ...chartOpts(40, 350).plugins,
                annotation: {
                    annotations: {
                        box1: {
                            type: 'box',
                            yMin: 70,
                            yMax: 180,
                            backgroundColor: 'rgba(16, 185, 129, 0.05)',
                            borderColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 1,
                        }
                    }
                }
            }
        }
    });

    const ctxC = $('chart-cdi').getContext('2d');
    const gradientC = ctxC.createLinearGradient(0, 0, 0, 250);
    gradientC.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradientC.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    STATE.charts.cdi = new Chart(ctxC, {
        type: 'line',
        data: {
            labels: data.cdi.map(d => d.fecha.split(' ')[0]),
            datasets: [{
                label: 'Puntaje CDI',
                data: data.cdi.map(d => d.puntaje),
                borderColor: '#6366f1',
                borderWidth: 3,
                backgroundColor: gradientC,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2
            }]
        },
        options: {
            ...chartOpts(0, 30),
            plugins: {
                ...chartOpts(0, 30).plugins,
                annotation: {
                    annotations: {
                        threshold: {
                            type: 'line',
                            yMin: 19,
                            yMax: 19,
                            borderColor: 'rgba(244, 63, 94, 0.8)',
                            borderWidth: 2,
                            borderDash: [6, 4],
                            label: {
                                display: true,
                                content: 'Umbral Riesgo (19)',
                                position: 'end',
                                backgroundColor: '#f43f5e',
                                color: '#fff',
                                font: { size: 9, weight: 'bold' },
                                padding: 4,
                                borderRadius: 4
                            }
                        }
                    }
                }
            }
        }
    });
}

// ── Alertas ──────────────────────────────────────────────
async function cargarAlertas(hid) {
    const cont = $('lista-alertas');
    if (!cont) return;
    try {
        const url = hid ? `/api/alertas/${hid}` : '/api/alertas/todas';
        const datos = await apiGet(url);
        if (!datos.length) {
            cont.innerHTML = '<div class="text-center py-10 text-slate-600 font-bold">Sin alertas activas ✅</div>';
            return;
        }
        const colores = { roja: 'border-rose-500 bg-rose-50/50', amarilla: 'border-amber-500 bg-amber-50/50', verde: 'border-emerald-500 bg-emerald-50/50' };
        const iconos = { roja: '🚨', amarilla: '⚠️', verde: '✅' };
        cont.innerHTML = datos.map(a => `
    <div class="glass-card rounded-2xl p-5 border-l-4 ${colores[a.severidad] || 'border-slate-300'} flex items-start gap-4 animate-slide-up">
        <div class="text-3xl flex-shrink-0">${iconos[a.severidad] || '📌'}</div>
        <div class="flex-1 min-w-0">
            <p class="font-black text-slate-800 text-sm uppercase tracking-wide">${a.tipo}</p>
            <p class="text-slate-600 text-sm mt-1 leading-relaxed">${a.mensaje}</p>
            <p class="text-slate-600 text-[10px] font-bold mt-2 uppercase flex items-center gap-1"><i class="far fa-clock"></i> ${a.fecha}</p>
        </div>
        ${!a.resuelta ? `
        <button onclick="resolverAlerta(${a.id}, this)"
            class="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
            Resuelto
        </button>` : '<span class="text-emerald-600 text-xs font-bold flex-shrink-0">✅</span>'}
    </div>`).join('');
    } catch (e) { cont.innerHTML = '<div class="text-center text-red-400 py-8">Error cargando alertas</div>'; }
}

async function resolverAlerta(id, btn) {
    const res = await apiPut(`/api/alertas/${id}/resolver`, { notas: 'Resuelta desde panel mejorado' });
    if (res.status === 'success') {
        const card = btn.closest('.glass-card');
        card.classList.add('opacity-50', 'grayscale');
        btn.innerHTML = '✅';
        btn.disabled = true;
        mostrarToast('Alerta resuelta con éxito', 'success');
        if (STATE.rol === 'especialista') cargarDashboardEspecialista();
    }
}

// ── Auditoría (Trazabilidad de Tesis) ────────────────────────
async function cargarAuditoria() {
    const tbody = $('tabla-auditoria-body');
    if (!tbody) return;
    try {
        const logs = await apiGet('/api/panel/audit-logs');
        if (!logs.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="p-12 text-center text-slate-500 font-bold uppercase tracking-widest">No hay registros de cambios todavía.</td></tr>';
            return;
        }
        tbody.innerHTML = logs.map(l => `
            <tr class="hover:bg-slate-50 transition-all">
                <td class="p-4 font-mono text-[11px] text-slate-400">${l.fecha}</td>
                <td class="p-4 font-bold text-slate-700">${l.especialista}</td>
                <td class="p-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${l.accion === 'CREATE' ? 'bg-emerald-100 text-emerald-600' : l.accion === 'DELETE' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}">
                        ${l.accion}
                    </span>
                </td>
                <td class="p-4 text-slate-600 font-medium">${l.tipo}</td>
                <td class="p-4 text-slate-800 font-black">${l.campo || '—'}</td>
                <td class="p-4 text-slate-400 font-mono text-[10px] truncate max-w-[120px]">${l.anterior || '—'}</td>
                <td class="p-4 text-teal-600 font-mono text-[10px] truncate max-w-[120px] font-bold">${l.nuevo || '—'}</td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-12 text-center text-rose-500 font-bold">Error cargando auditoría</td></tr>';
    }
}

// ── Gestión de Personal (Representantes) ───────────────────────────────────
let _representantesCache = [];

async function cargarRepresentantes() {
    const tbody = $('tabla-representantes-body');
    if (!tbody) return;
    try {
        const users = await apiGet('/api/panel/usuarios');
        const reps = users.filter(u => u.rol === 'padre');
        _representantesCache = reps;

        // Update stats
        const statTotal = $('stat-total-reps');
        const statActivos = $('stat-activos-reps');
        const statHeroes = $('stat-con-heroes');
        if (statTotal) statTotal.textContent = reps.length;
        if (statActivos) statActivos.textContent = reps.filter(u => u.activo).length;
        if (statHeroes) statHeroes.textContent = reps.filter(u => u.tiene_heroes).length;

        if (!reps.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="p-12 text-center">
                <div class="flex flex-col items-center gap-3">
                    <i class="fas fa-users text-emerald-200 text-4xl"></i>
                    <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay representantes registrados</p>
                    <button onclick="mostrarModalNuevoRepresentante()" class="text-emerald-600 font-black text-xs hover:underline">
                        + Agregar el primero
                    </button>
                </div>
            </td></tr>`;
            return;
        }

        renderTablaRepresentantes(reps);
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-12 text-center text-rose-500 font-bold">Error cargando representantes</td></tr>';
    }
}

function renderTablaRepresentantes(reps) {
    const tbody = $('tabla-representantes-body');
    if (!tbody) return;
    tbody.innerHTML = reps.map(u => `
        <tr class="hover:bg-slate-50/80 transition-all group">
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm">
                        ${(u.nombre_completo || u.username)[0].toUpperCase()}
                    </div>
                    <div>
                        <p class="font-black text-slate-800 text-sm">${u.nombre_completo || u.username}</p>
                        <p class="text-slate-400 text-[10px] font-bold">@${u.username}</p>
                    </div>
                </div>
            </td>
            <td class="p-4 font-mono text-xs text-slate-500">${u.cedula || '<span class="text-slate-300">—</span>'}</td>
            <td class="p-4 text-xs text-slate-500">${u.email || '<span class="text-slate-300">—</span>'}</td>
            <td class="p-4">
                <span class="inline-flex items-center gap-1.5 ${u.telefono ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-slate-400 bg-slate-50 border border-slate-100'} text-[10px] font-black px-2.5 py-1 rounded-lg">
                    <i class="fas fa-phone-alt text-[8px]"></i> ${u.telefono || 'Sin registrar'}
                </span>
            </td>
            <td class="p-4 text-[11px] text-slate-400 font-mono">${u.ultimo_acceso || '<span class="text-slate-300">Nunca</span>'}</td>
            <td class="p-4">
                <span class="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${u.activo ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}">
                    <i class="fas fa-circle text-[6px]"></i> ${u.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
            </td>
            <td class="p-4 text-center">
                <button onclick="editarUsuarioCompleto(${JSON.stringify(u).replace(/"/g, '&quot;')})"
                    class="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wide transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                    title="Editar datos completos">
                    <i class="fas fa-edit text-[9px]"></i> Editar
                </button>
            </td>
        </tr>
    `).join('');
}

function filtrarRepresentantes() {
    const q = ($('buscar-representante')?.value || '').toLowerCase();
    const filtrados = q ? _representantesCache.filter(u =>
        (u.nombre_completo || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.cedula || '').toLowerCase().includes(q)
    ) : _representantesCache;
    renderTablaRepresentantes(filtrados);
}

function mostrarModalNuevoRepresentante() {
    const m = $('modal-nuevo-representante');
    if (m) { m.classList.remove('hidden'); m.classList.add('flex'); }
}

function cerrarModalNuevoRepresentante() {
    const m = $('modal-nuevo-representante');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
    ['rep-username', 'rep-password', 'rep-nombre', 'rep-cedula', 'rep-email', 'rep-telefono'].forEach(id => {
        const el = $(id);
        if (el) el.value = '';
    });
}

async function guardarNuevoRepresentante() {
    const data = {
        username: $('rep-username')?.value?.trim() || '',
        nombre_completo: $('rep-nombre')?.value?.trim() || '',
        rol: 'padre',
        cedula: $('rep-cedula')?.value?.trim() || '',
        email: $('rep-email')?.value?.trim() || '',
        telefono: $('rep-telefono')?.value?.trim() || '',
        password: $('rep-password')?.value || ''
    };

    if (!data.username || !data.nombre_completo || !data.password) {
        return mostrarToast('Completa los campos obligatorios (usuario, nombre y contraseña)', 'warning');
    }
    if (data.password.length < 8) {
        return mostrarToast('La contraseña debe tener al menos 8 caracteres', 'warning');
    }

    try {
        const res = await apiPost('/api/panel/usuarios', data);
        if (res.status === 'success') {
            mostrarToast('¡Representante creado con éxito! 👨‍👩‍👧', 'success');
            cerrarModalNuevoRepresentante();
            cargarRepresentantes();
            cargarRepresentantesParaSelect();
        } else {
            mostrarToast(res.error || 'Error al crear representante', 'error');
        }
    } catch (e) {
        mostrarToast('Error de conexión', 'error');
    }
}

async function cargarRepresentantesParaSelect() {
    const sel = $('select-rep-emergencia');
    if (!sel) return;
    try {
        const users = await apiGet('/api/panel/usuarios');
        const reps = users.filter(u => u.rol === 'padre');
        sel.innerHTML = '<option value="">— Elige un representante —</option>' +
            reps.map(u => `<option value="${u.id}" data-tel="${u.telefono || ''}">${u.nombre_completo || u.username}</option>`).join('');

        // Auto-fill telefono when selected
        sel.onchange = () => {
            const opt = sel.options[sel.selectedIndex];
            const tel = opt?.dataset?.tel || '';
            const inputTel = $('emergencia-telefono');
            if (inputTel) inputTel.value = tel;
        };
    } catch (e) {
        console.error('Error cargando representantes para select:', e);
    }
}

async function actualizarEmergenciaRepresentante() {
    const sel = $('select-rep-emergencia');
    const tel = $('emergencia-telefono');
    if (!sel || !tel) return;

    const userId = sel.value;
    const telefono = tel.value.trim();

    if (!userId) return mostrarToast('Selecciona un representante primero', 'warning');
    if (!telefono) return mostrarToast('Ingresa un número de teléfono', 'warning');

    try {
        const res = await apiPut(`/api/panel/usuarios/${userId}/emergencia`, { telefono });
        if (res.status === 'success') {
            mostrarToast(`¡Número de emergencia actualizado! 📞`, 'success');
            // Update cache
            const rep = _representantesCache.find(u => u.id == userId);
            if (rep) rep.telefono = telefono;
        } else {
            mostrarToast(res.error || 'Error al actualizar', 'error');
        }
    } catch (e) {
        mostrarToast('Error de conexión', 'error');
    }
}

// ── Modal de Edición Completa de Representante ──────────────────────────────
let _usuarioEditandoId = null;

function editarUsuarioCompleto(usuario) {
    _usuarioEditandoId = usuario.id;
    // Poblar modal
    const set = (id, val) => { const el = $(id); if (el) el.value = val || ''; };
    set('edit-rep-nombre', usuario.nombre_completo);
    set('edit-rep-cedula', usuario.cedula);
    set('edit-rep-email', usuario.email);
    set('edit-rep-telefono', usuario.telefono);
    set('edit-rep-password', '');
    const chk = $('edit-rep-activo');
    if (chk) chk.checked = usuario.activo !== false;
    const titulo = $('edit-rep-titulo');
    if (titulo) titulo.textContent = `Editar: ${usuario.nombre_completo || usuario.username}`;
    const modal = $('modal-editar-representante');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function cerrarModalEditarRepresentante() {
    const modal = $('modal-editar-representante');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    _usuarioEditandoId = null;
}

async function guardarEdicionUsuario() {
    if (!_usuarioEditandoId) return;
    const data = {
        nombre_completo: $('edit-rep-nombre')?.value?.trim() || '',
        cedula: $('edit-rep-cedula')?.value?.trim() || '',
        email: $('edit-rep-email')?.value?.trim() || '',
        telefono: $('edit-rep-telefono')?.value?.trim() || '',
        activo: $('edit-rep-activo')?.checked ?? true,
    };
    const pwd = $('edit-rep-password')?.value?.trim();
    if (pwd) data.nueva_password = pwd;

    if (!data.nombre_completo) return mostrarToast('El nombre es obligatorio', 'warning');
    const btn = $('btn-guardar-edicion-rep');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Guardando...'; }

    try {
        const res = await apiPut(`/api/panel/usuarios/${_usuarioEditandoId}`, data);
        if (res.status === 'success') {
            mostrarToast('✅ Datos actualizados con éxito', 'success');
            // Actualizar caché local
            const idx = _representantesCache.findIndex(u => u.id == _usuarioEditandoId);
            if (idx >= 0) Object.assign(_representantesCache[idx], res.usuario || data);
            cerrarModalEditarRepresentante();
            cargarRepresentantes();
        } else {
            mostrarToast(res.error || 'Error al guardar', 'error');
        }
    } catch (e) { mostrarToast('Error de conexión', 'error'); }
    finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Cambios'; }
    }
}

// Alias de compatibilidad
function editarEmergenciaRapida(userId, nombre, telActual) {
    const rep = _representantesCache.find(u => u.id == userId) || { id: userId, nombre_completo: nombre, telefono: telActual };
    editarUsuarioCompleto(rep);
}

// ── Gestión de Usuarios (Agro-Master pattern) ──────────────────
const ROL_BADGE = {
    'admin': 'bg-rose-100 text-rose-600 border border-rose-200',
    'especialista': 'bg-indigo-100 text-indigo-600 border border-indigo-200',
    'padre': 'bg-emerald-100 text-emerald-600 border border-emerald-200',
    'nutricionista': 'bg-cyan-100 text-cyan-600 border border-cyan-200',
    'auditor': 'bg-amber-100 text-amber-700 border border-amber-200',
    'gerente': 'bg-violet-100 text-violet-600 border border-violet-200',
};

async function cargarUsuarios() {
    const tbody = $('tabla-usuarios-body');
    if (!tbody) return;
    try {
        const users = await apiGet('/api/panel/usuarios');
        if (!users.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="p-12 text-center text-slate-500 font-bold uppercase tracking-widest">No hay otros usuarios registrados.</td></tr>';
            return;
        }
        tbody.innerHTML = users.map(u => `
            <tr class="hover:bg-slate-50/80 transition-all group border-b border-slate-50">
                <td class="p-4">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                            ${(u.nombre_completo || u.username)[0].toUpperCase()}
                        </div>
                        <span class="font-black text-slate-800">${u.username}</span>
                    </div>
                </td>
                <td class="p-4 text-slate-600 text-sm">${u.nombre_completo || '<span class="text-slate-300">—</span>'}</td>
                <td class="p-4">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${ROL_BADGE[u.rol] || 'bg-slate-100 text-slate-500'}">
                        ${u.rol}
                    </span>
                </td>
                <td class="p-4 text-slate-500 text-xs">${u.email || '<span class="text-slate-300">—</span>'}</td>
                <td class="p-4 text-slate-400 font-mono text-[10px]">${u.ultimo_acceso || '<span class="text-slate-300">Nunca</span>'}</td>
                <td class="p-4">
                    <span class="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${u.activo ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}">
                        <i class="fas fa-circle text-[6px]"></i> ${u.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                </td>
                <td class="p-4 text-center">
                    <button onclick="editarUsuarioCompleto(${JSON.stringify(u).replace(/"/g, '&quot;')})"
                        class="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wide transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                        title="Editar datos completos">
                        <i class="fas fa-edit text-[9px]"></i> Editar
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-12 text-center text-rose-500 font-bold">Error cargando usuarios</td></tr>';
    }
}

function mostrarModalNuevoUsuario() {
    const m = $('modal-nuevo-usuario');
    if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
    }
}

function cerrarModalNuevoUsuario() {
    const m = $('modal-nuevo-usuario');
    if (m) {
        m.classList.add('hidden');
        m.classList.remove('flex');
    }
}

async function guardarNuevoUsuario() {
    const data = {
        username: $('user-username').value.trim(),
        nombre_completo: $('user-nombre').value.trim(),
        rol: $('user-rol').value,
        cedula: $('user-cedula').value.trim(),
        email: $('user-email').value.trim(),
        telefono: $('user-telefono').value.trim(),
        password: $('user-password').value
    };

    if (!data.username || !data.nombre_completo || !data.password) {
        return mostrarToast('Faltan campos obligatorios', 'error');
    }
    if (data.password.length < 8) {
        return mostrarToast('La contraseña debe tener al menos 8 caracteres', 'warning');
    }

    try {
        const res = await apiPost('/api/panel/usuarios', data);
        if (res.status === 'success') {
            mostrarToast('Usuario creado con éxito', 'success');
            cerrarModalNuevoUsuario();
            cargarUsuarios();
            // Reset fields
            $('user-username').value = '';
            $('user-nombre').value = '';
            $('user-cedula').value = '';
            $('user-email').value = '';
        } else {
            mostrarToast(res.error || 'Error al crear usuario', 'error');
        }
    } catch (e) {
        mostrarToast('Error de conexión', 'error');
    }
}

// ── Historial con Tendencias ──────────────────────────────
async function cargarHistorial() {
    if (!STATE.heroe) return;
    const tbody = $('historial-body');
    if (!tbody) return;
    const data = await apiGet(`/api/dosificacion/historial/${STATE.heroe.id}`);

    // Actualizar Mascota Dinámica basada en última lectura
    if (data.length > 0) {
        actualizarMascotaDinamica(data[0].glucemia_actual);
        actualizarTendencia(data);
    }

    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-12 text-center text-slate-600 italic">No hay registros aún. Empieza midiendo hoy.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map((r, i) => {
        let tendencia = '';
        if (i < data.length - 1) {
            const diff = r.glucemia_actual - data[i + 1].glucemia_actual;
            if (diff > 20) tendencia = '<span class="text-rose-500">↑</span>';
            else if (diff < -20) tendencia = '<span class="text-sky-500">↓</span>';
            else tendencia = '<span class="text-slate-300">→</span>';
        }

        return `
<tr class="border-b border-slate-50 hover:bg-slate-50/80 transition-all">
    <td class="px-4 py-4 text-slate-600 text-xs font-bold">${r.fecha}</td>
    <td class="px-4 py-4">
        <div class="flex items-center gap-2">
            <span class="font-black text-slate-800 text-lg">${r.glucemia_actual}</span>
            <span class="text-slate-600 text-[10px] font-bold">mg/dL</span>
            ${tendencia}
        </div>
    </td>
    <td class="px-4 py-4"><span class="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg font-bold text-xs">${r.carbohidratos}g Carbs</span></td>
    <td class="px-4 py-4 font-black text-teal-600">${r.dosis_sugerida ?? '—'} <span class="text-[10px] opacity-60">UI</span></td>
    <td class="px-4 py-4 text-slate-700 text-xs font-bold capitalize"><span class="bg-slate-100 px-2 py-1 rounded-lg">${r.momento_dia || 'libre'}</span></td>
    <td class="px-4 py-4 text-center">${r.alerta_disparada ? '<span class="bg-rose-100 text-rose-600 text-[10px] px-2 py-1 rounded-full font-black border border-rose-200">ALERTA</span>' : '<span class="text-emerald-500 text-lg">●</span>'}</td>
</tr>`}).join('');
}

function actualizarMascotaDinamica(glucemia) {
    const heroeImg = $('heroe-img-main');
    if (!heroeImg) return;

    let emoji = 'emoji7.svg'; // Default happy
    if (glucemia < 70) emoji = 'emoji2.svg'; // Dizzy/Bubbles
    else if (glucemia > 250) emoji = 'emoji3.svg'; // Hot/Alert
    else if (glucemia > 180) emoji = 'emoji5.svg'; // Thoughtful

    // Evolución basada en puntos (Gamificación Premium)
    const pts = STATE.heroe?.puntos_juego || 0;
    const level = Math.floor(pts / 50) + 1;
    STATE.level = level;

    const lvlBadge = document.getElementById('hero-level-badge');
    if (lvlBadge) lvlBadge.textContent = `LVL ${level}`;

    heroeImg.src = `/static/img/emoji/${emoji}`;
    heroeImg.classList.add('animate-bounce');

    // Aura de poder Dinámica
    if (level >= 5) {
        heroeImg.style.filter = `drop-shadow(0 0 15px rgba(255, 215, 0, ${0.4 + (level * 0.1)}))`;
    }

    setTimeout(() => heroeImg.classList.remove('animate-bounce'), 2000);
}

function actualizarTendencia(data) {
    // Lógica para mostrar resumen en el header o perfil
    const tit = $('page-sub');
    if (tit && data.length >= 2) {
        const d = data[0].glucemia_actual - data[1].glucemia_actual;
        const msg = d > 0 ? 'Tendencia alcista' : 'Tendencia estable/baja';
        tit.innerHTML = `Módulo 2 · ${msg} <span class="ml-2">${d > 0 ? '📈' : '📉'}</span>`;
    }
}

// ── Gamificación Premium ─────────────────────────────────────────
function sumarXP(pts) {
    STATE.xpPoints += pts;
    const oldLvl = STATE.level;
    STATE.level = Math.floor(STATE.xpPoints / 250) + 1; // Más difícil subir de nivel

    const el = $('xp-points');
    if (el) {
        el.textContent = STATE.xpPoints + ' pts';
        el.classList.add('scale-125', 'text-amber-500');
        setTimeout(() => el.classList.remove('scale-125', 'text-amber-500'), 1000);
    }

    const lvl = $('hero-level');
    if (lvl) lvl.textContent = 'Héroe Nivel ' + STATE.level;

    if (STATE.level > oldLvl) {
        mostrarToast(`🎉 ¡SUBISTE DE NIVEL! Ahora eres Nivel ${STATE.level} 🏆`, 'success');
        lanzarConfeti();
    }

    const xpc = $('xp-container');
    if (xpc) xpc.classList.remove('hidden');

    // Si hay barra de progreso de nivel, actualizarla
    const bar = $('xp-progress-bar');
    if (bar) {
        const progress = ((STATE.xpPoints % 250) / 250) * 100;
        bar.style.width = `${progress}%`;
    }
}

function playSuccessSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.type = 'sine';
        const now = ctx.currentTime;
        [440, 554.37, 659.25, 880].forEach((freq, i) => osc.frequency.setValueAtTime(freq, now + i * 0.1));
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gainNode.gain.setValueAtTime(0.3, now + 0.35);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    } catch (e) { }
}

function lanzarConfeti() {
    console.log('🎊 ¡Celebración Premium! 🎊');
    playSuccessSound();
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'fixed pointer-events-none z-[10000] animate-confetti';
        particle.style.left = (Math.random() * 100) + 'vw';
        particle.style.top = '-20px';
        particle.style.width = (Math.random() * 10 + 5) + 'px';
        particle.style.height = (Math.random() * 10 + 5) + 'px';
        particle.style.backgroundColor = ['#14b8a6', '#f59e0b', '#6366f1', '#f43f5e'][Math.floor(Math.random() * 4)];
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        particle.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
        particle.style.setProperty('--ty', (Math.random() * 500 + 500) + 'px');
        particle.style.setProperty('--rot', Math.random() * 360 + 'deg');
        particle.style.animationDuration = (Math.random() * 2 + 1) + 's';
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
    }
}

function celebrarMision(puntos) {
    lanzarConfeti();
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 flex items-center justify-center z-[11000] pointer-events-none';
    popup.innerHTML = `
        <div class="bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-amber-200 animate-modal-in flex flex-col items-center">
            <div class="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner animate-bounce">
                ⭐
            </div>
            <h2 class="text-3xl font-black text-slate-800 mb-2">¡MISIÓN CUMPLIDA!</h2>
            <p class="text-amber-600 font-black text-xl">+${puntos} PUNTOS DE PODER</p>
        </div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.classList.add('animate-modal-out');
        setTimeout(() => popup.remove(), 600);
    }, 2500);

    // Actualizar mascota
    actualizarEstadoHeroe(STATE.heroe ? STATE.heroe.ultima_glucemia : 100);
}

// ── TIENDA DE RECOMPENSAS ─────────────────────────────────────────
function comprarArticulo(costo, articulo) {
    if (!STATE.heroe) return;
    const pts = STATE.heroe.puntos_juego || 0;
    if (pts >= costo) {
        STATE.heroe.puntos_juego -= costo;
        actualizarBarraPuntos();
        const disp = document.getElementById('tienda-puntos-disp');
        if (disp) disp.textContent = STATE.heroe.puntos_juego;
        mostrarToast(`¡Compraste ${articulo} con éxito! 🎁`, 'success');
        lanzarConfeti();
    } else {
        mostrarToast(`Te faltan ${costo - pts} puntos para comprar esto. ¡Juega más misiones!`, 'warning');
    }
}

// ── INIT MEJORADO ─────────────────────────────────────────────────
async function init() {
    // ── Registro de Service Worker para PWA Offline ──
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/static/sw.js');
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        } catch (err) {
            console.error('ServiceWorker registration failed: ', err);
        }
    }

    // Cortina suave con revelación tipo Agro-Master
    setTimeout(() => {
        const c = $('page-curtain');
        if (c) {
            c.classList.add('reveal');
            setTimeout(() => c.remove(), 1000);
        }
    }, 1500);

    const esEspecialista = document.querySelector('.nav-item[id="nav-dashboard"]') !== null;
    STATE.rol = esEspecialista ? 'especialista' : 'padre';

    if (esEspecialista) {
        await Promise.all([
            cargarDashboardEspecialista(),
            cargarAlertas(null),
            cargarPerfil()
        ]);
    } else {
        await cargarDashboardParent();

        // Persistencia de Héroe seleccionado
        const savedHeroId = localStorage.getItem('last_hero_id');
        if (savedHeroId && STATE.heroes) {
            const h = STATE.heroes.find(x => x.id == savedHeroId);
            if (h) {
                STATE.heroe = h;
                const hs = $('active-hero-name-sidebar');
                if (hs) hs.textContent = `Héroe: ${h.nombre}`;
            }
        }

        await Promise.all([
            cargarPerfilHeroe(),
            cargarSCIR(),
        ]);

        if (STATE.heroe) {
            await Promise.all([
                cargarHistorial(),
                cargarAlertas(STATE.heroe.id),
                cargarRecordatorios(),
                cargarRecomendaciones(STATE.heroe.id)
            ]);
            setTimeout(() => iniciarCDI(), 2000);
        }
    }

    // Tooltips genéricos
    $$('[title]').forEach(el => {
        el.addEventListener('mouseenter', () => { /* Logic for custom tooltip */ });
    });
}

async function cargarDashboardParent() {
    const grid = $('parent-heroes-grid');
    if (!grid) return;

    // Obtenemos héroes (ya se cargan en STATE via cargarPerfilHeroe, pero nos aseguramos)
    try {
        const heroes = await apiGet('/api/heroe');
        if (Array.isArray(heroes)) {
            STATE.heroes = heroes;
            if (heroes.length === 0) {
                grid.innerHTML = `
                <div class="col-span-full py-20 text-center glass-card rounded-3xl border-2 border-dashed border-teal-200">
                    <div class="text-6xl mb-4">🐣</div>
                    <h3 class="text-xl font-black text-slate-800">Aún no has registrado a tus hijos</h3>
                    <p class="text-slate-500 mb-6">Comienza registrando al primer héroe para activar el seguimiento.</p>
                    <button onclick="showSection('miHeroe')" class="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold">Comenzar Registro</button>
                </div>`;
                return;
            }

            grid.innerHTML = heroes.map(h => {
                const colors = {
                    'Critico': 'border-rose-500 bg-rose-50/30',
                    'Alerta': 'border-amber-500 bg-amber-50/30',
                    'Estable': 'border-teal-500 bg-teal-50/30'
                };
                const badgeCls = {
                    'Critico': 'bg-rose-100 text-rose-600 border-rose-200',
                    'Alerta': 'bg-amber-100 text-amber-600 border-amber-200',
                    'Estable': 'bg-emerald-100 text-emerald-600 border-emerald-200'
                };
                const status = h.estado || 'Estable';

                return `
                <div class="glass-card rounded-[2rem] p-6 hover:shadow-2xl transition-all group border-l-4 ${colors[status]} relative overflow-hidden">
                    ${h.alertas_pendientes > 0 ? `<div class="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl animate-pulse">🔔 ${h.alertas_pendientes} Alertas</div>` : ''}
                    
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-slate-100 group-hover:scale-110 transition-all">
                            ${h.foto_emoji || '🦸'}
                        </div>
                        <span class="border ${badgeCls[status]} text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">${status}</span>
                    </div>

                    <h4 class="text-xl font-black text-slate-800 mb-1">${h.nombre}</h4>
                    <p class="text-slate-400 text-xs font-bold mb-4">${h.edad} años · ${h.peso} kg</p>
                    
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <div class="bg-white/50 p-3 rounded-xl border border-slate-100">
                            <p class="text-[9px] font-black text-slate-400 uppercase">Tiempo en Rango</p>
                            <p class="font-black ${h.tir < 70 ? 'text-amber-600' : 'text-emerald-600'} text-sm">${h.tir}% TIR</p>
                            <div class="w-full bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
                                <div class="${h.tir < 70 ? 'bg-amber-400' : 'bg-emerald-500'} h-full" style="width: ${h.tir}%"></div>
                            </div>
                        </div>
                        <div class="bg-white/50 p-3 rounded-xl border border-slate-100">
                            <p class="text-[9px] font-black text-slate-400 uppercase">Puntos de Poder</p>
                            <p class="font-black text-amber-500 text-sm">${h.puntos_juego || 0} / 70</p>
                            <div class="w-full bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
                                <div class="bg-amber-400 h-full" style="width: ${(h.puntos_juego / 70) * 100}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-6">
                        <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Última Glucemia</p>
                        <div class="flex justify-between items-baseline">
                            <span class="font-black text-slate-700 text-base">${h.ultima_glucemia ? h.ultima_glucemia + ' mg/dL' : '—'}</span>
                            <span class="text-[8px] text-slate-400 font-bold">${h.fecha_glucemia || ''}</span>
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="seleccionarHeroe(${h.id})" class="flex-1 bg-slate-800 hover:bg-teal-600 text-white font-black py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                            <i class="fas fa-rocket"></i> Ver
                        </button>
                        <button onclick="abrirVincularParent(${h.id})" title="Vincular otro representante" class="bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 px-4 rounded-xl transition-all">
                            <i class="fas fa-user-plus"></i>
                        </button>
                    </div>
                </div>`;
            }).join('');

            // Si hay un héroe seleccionado, cargar sus recomendaciones
            if (STATE.heroe) cargarRecomendaciones(STATE.heroe.id);
        }
    } catch (e) { console.error("Error dashboard parent:", e); }
}

async function cargarRecomendaciones(hid) {
    const cont = $('recommendations-list');
    const box = $('parent-recommendations');
    if (!cont || !box) return;

    try {
        const recoms = await apiGet(`/api/recomendaciones/${hid}`);
        if (recoms && recoms.length > 0) {
            box.classList.remove('hidden');
            cont.innerHTML = recoms.map(r => `
                <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-4">
                    <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                        ${r.icon}
                    </div>
                    <div>
                        <h4 class="font-black text-slate-800 text-sm mb-1">${r.titulo}</h4>
                        <p class="text-xs text-slate-500 font-medium leading-relaxed">${r.texto}</p>
                    </div>
                </div>
            `).join('');
        } else {
            box.classList.add('hidden');
        }
    } catch (e) { console.error("Error cargando recomendaciones:", e); }
}

function abrirSOS() {
    const modal = $('modal-sos');
    if (!modal) return;

    // Si tenemos un héroe seleccionado, intentamos usar los datos de su especialista
    const h = STATE.heroe;
    if (h) {
        if ($('sos-doctor-name')) $('sos-doctor-name').textContent = h.especialista_nombre || 'Dr. Jesús García Coello';
        if ($('sos-doctor-specialty')) $('sos-doctor-specialty').textContent = h.especialista_especialidad || 'Endocrinólogo Pediátrico';

        const tel = h.especialista_telefono || '04141234567';
        // Limpiar el teléfono para el link de whatsapp (quitar guiones, espacios, etc.)
        let telClean = tel.replace(/[^0-9]/g, '');
        // Si empieza con 0, reemplazar por 58
        if (telClean.startsWith('0')) {
            telClean = '58' + telClean.substring(1);
        }

        if ($('sos-btn-call')) $('sos-btn-call').href = `tel:${telClean}`;
        if ($('sos-btn-whatsapp')) $('sos-btn-whatsapp').href = `https://wa.me/${telClean}`;
    }

    modal.classList.remove('hidden');
}

function cerrarSOS() {
    const modal = $('modal-sos');
    if (modal) modal.classList.add('hidden');
}

let heroeIdParaVincular = null;

function abrirVincularParent(hid) {
    heroeIdParaVincular = hid;
    const modal = $('modal-vincular-parent');
    if (modal) modal.classList.remove('hidden');
}

function cerrarVincularParent() {
    heroeIdParaVincular = null;
    const modal = $('modal-vincular-parent');
    if (modal) modal.classList.add('hidden');
}

async function ejecutarVinculacion() {
    const username = $('vincular-username')?.value;
    if (!username) { mostrarToast('Ingresa un nombre de usuario', 'warning'); return; }

    try {
        const res = await apiPost(`/api/heroe/${heroeIdParaVincular}/vincular`, { username });
        if (res.status === 'success') {
            mostrarToast(`¡Vínculo exitoso con ${res.vinculado}! 🤝`, 'success');
            cerrarVincularParent();
            cargarDashboardParent();
        } else {
            mostrarToast(res.error || 'Error al vincular', 'error');
        }
    } catch (e) {
        mostrarToast('Error en la vinculación', 'error');
    }
}
// ── Gestión de Perfil de Usuario ───────────────────────────────────
async function cargarPerfil() {
    try {
        const user = await apiGet('/api/auth/perfil');
        if (!user) return;

        // Mapear campos (IDs compartidos entre portal representante y especialista)
        const fields = {
            'parent-nombre': user.nombre_completo,
            'parent-cedula': user.cedula,
            'parent-email': user.email,
            'parent-tel': user.telefono,
            'especialista-nombre': user.nombre_completo,
            'especialista-cedula': user.cedula,
            'especialista-email': user.email,
            'especialista-tel': user.telefono,
            'especialista-especialidad': user.especialidad,
            'especialista-clinica': user.consultorio
        };

        for (const [id, val] of Object.entries(fields)) {
            const el = $(id);
            if (el) el.value = val || '';
        }
    } catch (e) {
        console.error("Error al cargar perfil:", e);
    }
}

async function guardarPerfilParent() {
    const body = {
        nombre_completo: $('parent-nombre')?.value || '',
        cedula: $('parent-cedula')?.value || '',
        email: $('parent-email')?.value || '',
        telefono: $('parent-tel')?.value || '',
    };

    if (!body.nombre_completo) { mostrarToast('El nombre es obligatorio', 'warning'); return; }

    const res = await apiPut('/api/auth/perfil', body);
    if (res.status === 'success') {
        mostrarToast('¡Perfil actualizado con éxito! ✅', 'success');
        const footers = document.querySelectorAll('.text-sm.font-black.text-white');
        footers.forEach(f => { if (f.textContent === STATE.parentName) f.textContent = body.nombre_completo; });
    } else {
        mostrarToast('Error al actualizar perfil', 'error');
    }
}

async function guardarPerfilEspecialista() {
    const body = {
        nombre_completo: $('especialista-nombre')?.value || '',
        cedula: $('especialista-cedula')?.value || '',
        email: $('especialista-email')?.value || '',
        telefono: $('especialista-tel')?.value || '',
        especialidad: $('especialista-especialidad')?.value || '',
        consultorio: $('especialista-clinica')?.value || '',
    };

    if (!body.nombre_completo) { mostrarToast('El nombre es obligatorio', 'warning'); return; }

    const res = await apiPut('/api/auth/perfil', body);
    if (res.status === 'success') {
        mostrarToast('¡Perfil actualizado con éxito! ✅', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } else {
        mostrarToast('Error al actualizar perfil', 'error');
    }
}

// ══════════════════════════════════════════════════════════════════════
//  🎨 MOTOR DE TEMA ADAPTATIVO (Módulo 1 – moo.md: edad < 12 vs ≥ 12)
// ══════════════════════════════════════════════════════════════════════
function aplicarTemaEdad(heroe) {
    if (!heroe) return;
    const esInfantil = heroe.edad < 12;
    const root = document.documentElement;

    if (esInfantil) {
        // 🌈 Tema Infantil: colores vibrantes, animaciones juguetosas
        root.style.setProperty('--hero-grad-from', '#f97316');
        root.style.setProperty('--hero-grad-to', '#f59e0b');
        root.style.setProperty('--hero-accent', '#fb923c');
        document.getElementById('sec-heroe')?.classList.add('tema-infantil');
        document.getElementById('sec-heroe')?.classList.remove('tema-juvenil');

        // Cambiar el encabezado del Hero Banner
        const bannerEl = document.querySelector('#sec-heroe .bg-gradient-to-r');
        if (bannerEl) {
            bannerEl.className = bannerEl.className
                .replace('from-amber-400 to-orange-500', 'from-pink-400 to-orange-400');
        }
        // Activar partículas de estrellas
        inyectarEstrellasFondo('sec-heroe', true);
    } else {
        // 🎮 Tema Juvenil: más oscuro, más moderno, menos "infantil"
        root.style.setProperty('--hero-grad-from', '#6366f1');
        root.style.setProperty('--hero-grad-to', '#8b5cf6');
        root.style.setProperty('--hero-accent', '#7c3aed');
        document.getElementById('sec-heroe')?.classList.add('tema-juvenil');
        document.getElementById('sec-heroe')?.classList.remove('tema-infantil');

        const bannerEl = document.querySelector('#sec-heroe .bg-gradient-to-r');
        if (bannerEl) {
            bannerEl.className = bannerEl.className
                .replace('from-amber-400 to-orange-500', 'from-indigo-600 to-violet-600')
                .replace('from-pink-400 to-orange-400', 'from-indigo-600 to-violet-600');
        }
        inyectarEstrellasFondo('sec-heroe', false);
    }

    // Actualizar saludo en el banner del Héroe
    const greetEl = document.getElementById('heroe-nombre-span');
    if (greetEl) greetEl.textContent = heroe.nombre;

    const taglineEl = document.querySelector('#sec-heroe .text-white\\/90.font-bold');
    if (taglineEl) {
        taglineEl.textContent = esInfantil
            ? 'Tu misión de hoy: ¡Mantener tu energía al 100%! ⚡'
            : 'Mantén tu control y conquista cada desafío 🏆';
    }
}

function inyectarEstrellasFondo(sectionId, activo) {
    const sec = document.getElementById(sectionId);
    if (!sec) return;
    // Remover estrellas anteriores
    sec.querySelectorAll('.star-particle').forEach(s => s.remove());
    if (!activo) return;

    for (let i = 0; i < 12; i++) {
        const star = document.createElement('div');
        star.className = 'star-particle';
        star.style.cssText = `
            position:absolute;pointer-events:none;z-index:0;
            width:${Math.random() * 6 + 3}px;height:${Math.random() * 6 + 3}px;
            background:rgba(255,255,255,0.6);border-radius:50%;
            left:${Math.random() * 100}%;top:${Math.random() * 100}%;
            animation:starTwinkle ${Math.random() * 2 + 1.5}s ease-in-out infinite alternate;
            animation-delay:${Math.random() * 2}s;
        `;
        sec.style.position = 'relative';
        sec.insertBefore(star, sec.firstChild);
    }
}

// Inyectar animación de estrellas si no existe
(function () {
    if (!document.getElementById('star-style')) {
        const s = document.createElement('style');
        s.id = 'star-style';
        s.textContent = `
            @keyframes starTwinkle {
                from { opacity: 0.2; transform: scale(0.8); }
                to   { opacity: 1;   transform: scale(1.3); }
            }
            .tema-infantil .game-card { border-radius: 2.5rem !important; }
            .tema-juvenil  .game-card {
                border-radius: 1rem !important;
                border: 1px solid rgba(99,102,241,0.15);
            }
            .tema-juvenil #sec-heroe { background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); }
        `;
        document.head.appendChild(s);
    }
})();

// ══════════════════════════════════════════════════════════════════════
//  🧠 DESAFÍO DEL SABIO — Quiz Diario de Conocimiento (Módulo 3 ext.)
// ══════════════════════════════════════════════════════════════════════
const BANCO_PREGUNTAS = [
    {
        p: '¿Qué debes hacer si tu glucosa está muy baja (menor a 70)?',
        ops: ['Tomar agua', 'Comer 15g de carbohidratos rápidos (jugo, caramelo)', 'Hacer ejercicio', 'Dormir'],
        r: 1, exp: '¡Correcto! 15g de carbs rápidos elevan la glucosa en 15 minutos. 🧃'
    },
    {
        p: '¿Cuántos gramos de carbohidratos tiene una porción de arroz blanco cocido (1 taza)?',
        ops: ['10g', '25g', '45g', '60g'],
        r: 2, exp: '¡Exacto! Una taza de arroz tiene ~45g de carbos. Siempre mide bien. 🍚'
    },
    {
        p: '¿Qué significa "TIR" (Tiempo en Rango)?',
        ops: [
            'El tiempo que duermes',
            'El porcentaje de tiempo con glucosa entre 70-180 mg/dL',
            'La cantidad de insulina que tomas',
            'Las horas de ejercicio por semana'
        ],
        r: 1, exp: '¡Muy bien! TIR ≥70% significa buen control glucémico. 🎯'
    },
    {
        p: '¿Qué tipo de insulina actúa más rápido?',
        ops: ['Insulina basal (lenta)', 'Insulina regular (rápida)', 'Pastillas de metformina', 'Suero salino'],
        r: 1, exp: '¡Correcto! La insulina rápida actúa en 15-30 minutos y se usa antes de comer. 💉'
    },
    {
        p: '¿Cuál de estos alimentos tiene MÁS carbohidratos?',
        ops: ['1 fresa', '1 plátano mediano', '1 huevo', '1 rebanada de queso'],
        r: 1, exp: '¡Así es! Un plátano tiene ~27g de carbos. Las frutas tropicales elevan más la glucosa. 🍌'
    },
    {
        p: '¿Cuándo DEBES revisar tu glucosa?',
        ops: ['Solo cuando te sientes mal', 'Antes y después de las comidas', 'Una vez por semana', 'Nunca, con insulina ya es suficiente'],
        r: 1, exp: '¡Exacto! Medir regularmente te ayuda a ajustar dosis y detectar patrones. 📊'
    },
    {
        p: '¿Qué puede bajar la glucosa además de la insulina?',
        ops: ['Comer dulces', 'Hacer ejercicio', 'Tomar refresco', 'Dormir más'],
        r: 1, exp: '¡Correcto! El ejercicio usa glucosa como energía. ¡Por eso es importante medirte antes de jugar! 🏃'
    },
];

const SABIO_KEY = 'glucoamigo_sabio_';

function iniciarDesafioSabio() {
    // Seleccionar pregunta del día (rotar por fecha)
    const dia = new Date().toDateString();
    const keyRespondida = SABIO_KEY + dia;

    if (localStorage.getItem(keyRespondida) === 'done') {
        renderSabioCompletado();
        return;
    }

    // Escoger pregunta pseudo-aleatoria por día
    const idx = new Date().getDate() % BANCO_PREGUNTAS.length;
    const pregunta = BANCO_PREGUNTAS[idx];
    renderSabioModal(pregunta, idx);
}

function renderSabioModal(q, idx) {
    // Crear overlay
    const prev = document.getElementById('sabio-overlay');
    if (prev) prev.remove();

    const overlay = document.createElement('div');
    overlay.id = 'sabio-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.8);backdrop-filter:blur(12px);z-index:3000;padding:16px;';

    overlay.innerHTML = `
        <div style="background:white;border-radius:2.5rem;max-width:480px;width:100%;box-shadow:0 40px 80px rgba(0,0,0,0.4);overflow:hidden;animation:gameModalIn 0.45s cubic-bezier(0.34,1.56,0.64,1);">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);padding:24px;text-align:center;position:relative;">
                <div style="font-size:2.5rem;margin-bottom:8px;">🧙‍♂️</div>
                <p style="color:white;font-weight:900;font-size:1.1rem;font-family:inherit;">Desafío del Sabio</p>
                <p style="color:rgba(255,255,255,0.65);font-size:0.7rem;font-weight:700;font-family:inherit;text-transform:uppercase;letter-spacing:0.1em;">¡Demuestra lo que sabes! • +15 Puntos</p>
            </div>
            <!-- Pregunta -->
            <div style="padding:28px;">
                <p style="font-size:1rem;font-weight:800;color:#1e293b;margin-bottom:20px;line-height:1.5;" id="sabio-pregunta">${q.p}</p>
                <div style="display:grid;gap:10px;" id="sabio-opciones">
                    ${q.ops.map((op, i) => `
                        <button onclick="responderSabio(${idx},${i},this)"
                            style="text-align:left;padding:14px 18px;border-radius:1rem;border:2px solid #e2e8f0;background:white;font-family:inherit;font-weight:700;font-size:0.85rem;color:#334155;cursor:pointer;transition:all 0.2s;"
                            onmouseover="this.style.borderColor='#7c3aed';this.style.background='#f5f3ff';"
                            onmouseout="if(!this.dataset.answered){this.style.borderColor='#e2e8f0';this.style.background='white';}">
                            <span style="display:inline-block;width:24px;height:24px;background:#f1f5f9;border-radius:50%;font-weight:900;font-size:0.7rem;line-height:24px;text-align:center;margin-right:10px;">${['A', 'B', 'C', 'D'][i]}</span>
                            ${op}
                        </button>
                    `).join('')}
                </div>
                <div id="sabio-explicacion" style="display:none;margin-top:16px;padding:16px;border-radius:1.2rem;font-weight:700;font-size:0.85rem;"></div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

function responderSabio(idx, respuesta, btn) {
    const q = BANCO_PREGUNTAS[idx];
    const botones = document.querySelectorAll('#sabio-opciones button');
    botones.forEach(b => { b.dataset.answered = 'true'; b.style.cursor = 'default'; });

    const correcto = respuesta === q.r;
    // Colorear respuestas
    botones.forEach((b, i) => {
        if (i === q.r) { b.style.borderColor = '#10b981'; b.style.background = '#f0fdf4'; b.style.color = '#065f46'; }
        else if (i === respuesta && !correcto) { b.style.borderColor = '#f43f5e'; b.style.background = '#fff1f2'; b.style.color = '#9f1239'; }
    });

    const expDiv = document.getElementById('sabio-explicacion');
    if (expDiv) {
        expDiv.style.display = 'block';
        expDiv.style.background = correcto ? '#f0fdf4' : '#fff1f2';
        expDiv.style.color = correcto ? '#065f46' : '#9f1239';
        expDiv.style.border = correcto ? '2px solid #bbf7d0' : '2px solid #fecdd3';
        expDiv.textContent = correcto ? `✅ ${q.exp}` : `❌ La respuesta correcta era: "${q.ops[q.r]}" — ${q.exp}`;
    }

    // Guardar como respondida hoy
    localStorage.setItem(SABIO_KEY + new Date().toDateString(), 'done');

    // Dar puntos si correcto
    if (correcto && STATE.heroe) {
        setTimeout(async () => {
            await registrarPuntuacion(0, 15); // juegoId=0 para sabio
            celebrarMision(15);
        }, 1200);
    }

    // Botón de cerrar
    setTimeout(() => {
        const expDiv2 = document.getElementById('sabio-explicacion');
        if (expDiv2) {
            const btn = document.createElement('button');
            btn.textContent = '¡Entendido, Sabio! 🧙‍♂️';
            btn.style.cssText = 'display:block;width:100%;margin-top:14px;padding:14px;border-radius:1rem;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;font-weight:900;font-family:inherit;cursor:pointer;border:none;font-size:0.9rem;';
            btn.onclick = () => document.getElementById('sabio-overlay')?.remove();
            expDiv2.parentElement.appendChild(btn);
        }
    }, 800);
}

function renderSabioCompletado() {
    mostrarToast('¡Ya completaste el Desafío del Sabio de hoy! 🧙‍♂️ Vuelve mañana.', 'info');
}

// ══════════════════════════════════════════════════════════════════════
//  🛡️ PREGUNTAS DE SEGURIDAD (Perfil del Representante)
// ══════════════════════════════════════════════════════════════════════
async function guardarPreguntasSeguridad() {
    const p1 = $('seg-pregunta-1')?.value;
    const r1 = $('seg-respuesta-1')?.value?.trim();
    const p2 = $('seg-pregunta-2')?.value;
    const r2 = $('seg-respuesta-2')?.value?.trim();

    if (!r1 || !r2) {
        return mostrarToast('Debes responder ambas preguntas de seguridad', 'warning');
    }

    try {
        const res = await apiPost('/api/auth/preguntas-seguridad', {
            preguntas: [
                { pregunta: p1, respuesta: r1 },
                { pregunta: p2, respuesta: r2 }
            ]
        });
        if (res.status === 'success') {
            mostrarToast('✅ Preguntas de seguridad guardadas correctamente', 'success');
            $('seg-respuesta-1').value = '';
            $('seg-respuesta-2').value = '';
        } else {
            mostrarToast(res.error || 'Error al guardar', 'error');
        }
    } catch (e) {
        mostrarToast('Error de conexión', 'error');
    }
}

// ══════════════════════════════════════════════════════════════════════
//  👫 CO-REPRESENTANTE — Vincular segundo cuidador
// ══════════════════════════════════════════════════════════════════════
async function vincularCoRep() {
    const username = $('co-rep-username')?.value?.trim();
    if (!username) return mostrarToast('Ingresa el nombre de usuario del co-representante', 'warning');

    // Necesitamos un héroe activo para saber cuál vincular
    if (!STATE.heroe) return mostrarToast('Primero selecciona un Héroe activo para vincular', 'info');

    try {
        const res = await apiPost(`/api/heroe/${STATE.heroe.id}/vincular`, { username });
        if (res.status === 'success') {
            mostrarToast(`🤝 ¡Vínculo exitoso con ${res.vinculado}!`, 'success');
            $('co-rep-username').value = '';
            // Mostrar en la lista
            const lista = $('co-rep-lista');
            if (lista) {
                const chip = document.createElement('div');
                chip.className = 'inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-full font-bold text-sm mr-2 mb-2';
                chip.innerHTML = `<i class="fas fa-user-check"></i> ${res.vinculado}`;
                lista.appendChild(chip);
            }
        } else {
            mostrarToast(res.error || 'Error al vincular', 'error');
        }
    } catch (e) {
        mostrarToast('Error de conexión', 'error');
    }
}

// ══════════════════════════════════════════════════════════════════════
//  🛒 TIENDA MEJORADA — Categorías y desbloqueos reales
// ══════════════════════════════════════════════════════════════════════
function aplicarAvatar(emoji) {
    if (!STATE.heroe) return;
    // Actualizar localmente
    STATE.heroe.foto_emoji = emoji;
    const img = $('heroe-img-main');
    if (img) img.style.fontSize = '4rem';

    // Guardar en servidor
    apiPut(`/api/heroe/${STATE.heroe.id}`, { foto_emoji: emoji, nombre: STATE.heroe.nombre, edad: STATE.heroe.edad, peso: STATE.heroe.peso })
        .then(() => mostrarToast(`¡Avatar cambiado a ${emoji}! 🎨`, 'success'))
        .catch(() => { });
}

function comprarAvatarTienda(emoji, costo) {
    if (!STATE.heroe) return;
    const pts = STATE.heroe.puntos_juego || 0;
    if (pts < costo) {
        return mostrarToast(`¡Te faltan ${costo - pts} puntos! Juega más misiones 🎮`, 'warning');
    }
    STATE.heroe.puntos_juego -= costo;
    actualizarBarraPuntos();
    const disp = document.getElementById('tienda-puntos-disp');
    if (disp) disp.textContent = STATE.heroe.puntos_juego;

    aplicarAvatar(emoji);
    lanzarConfeti();
}

// ══════════════════════════════════════════════════════════════════════
//  🔧 INTEGRAR TEMA + SABIO AL CARGAR PERFIL
// ══════════════════════════════════════════════════════════════════════
// Hook: aplicar tema cuando se carga un héroe
const _seleccionarHeroeOriginal = seleccionarHeroe;
seleccionarHeroe = function (hid) {
    _seleccionarHeroeOriginal(hid);
    const h = STATE.heroes.find(x => x.id === hid);
    if (h) setTimeout(() => aplicarTemaEdad(h), 300);
};

// Exponer función para el botón en la UI de la Zona de Misiones
window.iniciarDesafioSabio = iniciarDesafioSabio;
window.responderSabio = responderSabio;
window.comprarAvatarTienda = comprarAvatarTienda;
window.guardarPreguntasSeguridad = guardarPreguntasSeguridad;
window.vincularCoRep = vincularCoRep;
window.guardarPerfilEspecialista = guardarPerfilEspecialista;

// ── Cambio de Contraseña Propia ──────────────────────────────────────────────
window.abrirModalPassword = function () {
    const modal = $('modal-cambiar-password');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        if ($('mi-nueva-password')) $('mi-nueva-password').value = '';
        if ($('mi-nueva-password-conf')) $('mi-nueva-password-conf').value = '';
    }
};

window.cerrarModalPassword = function () {
    const modal = $('modal-cambiar-password');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.guardarMiPassword = async function () {
    const np = $('mi-nueva-password')?.value;
    const cp = $('mi-nueva-password-conf')?.value;

    if (!np || np.length < 6) return mostrarToast('La contraseña debe tener mínimo 6 caracteres', 'warning');
    if (np !== cp) return mostrarToast('Las contraseñas no coinciden', 'warning');

    const btn = $('btn-guardar-mi-password');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Guardando...'; }

    try {
        const res = await apiPut('/api/auth/perfil', { nueva_password: np });
        if (res.status === 'success') {
            mostrarToast('Contraseña actualizada con éxito ✅', 'success');
            window.cerrarModalPassword();
        } else {
            mostrarToast(res.error || 'Error al cambiar contraseña', 'error');
        }
    } catch (e) {
        mostrarToast('Error de conexión al guardar cambios', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Cambiar'; }
    }
};

document.addEventListener('DOMContentLoaded', init);
