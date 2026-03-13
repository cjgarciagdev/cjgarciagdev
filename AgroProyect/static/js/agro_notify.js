/**
 * AgroNotify - Modern Notification System for Agro-Master
 * Replaces native alert(), confirm(), and prompt() with stylized modals.
 */

const AgroNotify = {
    _containerId: 'agro-notify-overlay',

    _getTheme(type) {
        const themes = {
            'info': { bg: 'bg-indigo-50', text: 'text-indigo-600', btn: 'bg-indigo-600', icon: 'fa-info-circle', shadow: 'shadow-indigo-100' },
            'success': { bg: 'bg-emerald-50', text: 'text-emerald-600', btn: 'bg-emerald-600', icon: 'fa-check-circle', shadow: 'shadow-emerald-100' },
            'warning': { bg: 'bg-amber-50', text: 'text-amber-600', btn: 'bg-amber-600', icon: 'fa-exclamation-triangle', shadow: 'shadow-amber-100' },
            'danger': { bg: 'bg-rose-50', text: 'text-rose-600', btn: 'bg-rose-600', icon: 'fa-exclamation-circle', shadow: 'shadow-rose-100' },
            'delete': { bg: 'bg-rose-50', text: 'text-rose-500', btn: 'bg-rose-600', icon: 'fa-trash-alt', shadow: 'shadow-rose-100' },
            'nutricion': { bg: 'bg-lime-50', text: 'text-lime-600', btn: 'bg-lime-600', icon: 'fa-utensils', shadow: 'shadow-lime-100' },
            'inventario': { bg: 'bg-sky-50', text: 'text-sky-600', btn: 'bg-sky-600', icon: 'fa-boxes', shadow: 'shadow-sky-100' },
            'salud': { bg: 'bg-red-50', text: 'text-red-600', btn: 'bg-red-600', icon: 'fa-stethoscopes', shadow: 'shadow-red-100' },
            'maternidad': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', btn: 'bg-fuchsia-600', icon: 'fa-baby-carriage', shadow: 'shadow-fuchsia-100' }
        };
        return themes[type] || themes['info'];
    },

    _closeTimeout: null,
    _active: false,

    _createOverlay() {
        let overlay = document.getElementById(this._containerId);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = this._containerId;
            overlay.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/60 backdrop-blur-md opacity-0 pointer-events-none transition-all duration-300';
            document.body.appendChild(overlay);
        }
        return overlay;
    },

    _show(content) {
        this._active = true;
        if (this._closeTimeout) {
            clearTimeout(this._closeTimeout);
            this._closeTimeout = null;
        }

        const overlay = this._createOverlay();
        overlay.innerHTML = content;

        // Forzar reflow para asegurar que la entrada sea detectada
        overlay.offsetHeight;

        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-100');

        const card = overlay.querySelector('.notify-card');
        if (card) {
            setTimeout(() => {
                card.classList.remove('scale-90', 'opacity-0', 'translate-y-10');
                card.classList.add('scale-100', 'opacity-100', 'translate-y-0');
            }, 10);
        }
    },

    _close() {
        this._active = false;
        const overlay = document.getElementById(this._containerId);
        if (overlay) {
            const card = overlay.querySelector('.notify-card');
            if (card) {
                card.classList.add('scale-90', 'opacity-0', 'translate-y-10');
                card.classList.remove('scale-100', 'opacity-100', 'translate-y-0');
            }

            if (this._closeTimeout) clearTimeout(this._closeTimeout);

            this._closeTimeout = setTimeout(() => {
                // Solo ocultar si no se ha activado otra notificación mientras cerrábamos
                if (!this._active) {
                    overlay.classList.add('opacity-0', 'pointer-events-none');
                    overlay.classList.remove('opacity-100');
                    overlay.innerHTML = ''; // Limpiar contenido
                }
                this._closeTimeout = null;
            }, 300);
        }
    },

    toast(message, type = 'success', duration = 3000) {
        const theme = this._getTheme(type);
        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="fixed bottom-8 right-8 z-[11000] flex items-center gap-4 p-4 pr-6 ${theme.bg} border-2 ${theme.bg.replace('50', '200')} rounded-[1.5rem] shadow-2xl transition-all duration-500 transform translate-x-20 opacity-0">
                <div class="w-12 h-12 ${theme.bg.replace('50', '100')} ${theme.text} rounded-xl flex items-center justify-center shadow-inner">
                    <i class="fas ${theme.icon} text-xl"></i>
                </div>
                <div>
                    <p class="text-xs font-black ${theme.text} uppercase tracking-widest">Aviso del Sistema</p>
                    <p class="text-sm font-bold text-gray-800">${message}</p>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = toastHtml;
        const toastEl = div.firstElementChild;
        document.body.appendChild(toastEl);

        // Animate in
        setTimeout(() => {
            toastEl.classList.remove('translate-x-20', 'opacity-0');
            toastEl.classList.add('translate-x-0', 'opacity-100');
        }, 100);

        // Auto remove
        setTimeout(() => {
            toastEl.classList.add('translate-y-20', 'opacity-0');
            setTimeout(() => toastEl.remove(), 500);
        }, duration);
    },

    alert(message, title = 'Notificación', type = 'info') {
        const theme = this._getTheme(type);
        return new Promise((resolve) => {
            const html = `
                <div class="notify-card bg-white rounded-[3rem] p-10 max-w-sm w-full mx-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 transform scale-90 opacity-0 translate-y-10 border border-gray-100/50 text-center relative">
                    <button class="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition-all text-xl" id="notify-close">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="w-24 h-24 ${theme.bg} ${theme.text} rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <i class="fas ${theme.icon} text-4xl"></i>
                    </div>
                    <h3 class="text-3xl font-black text-gray-900 mb-4 tracking-tight">${title}</h3>
                    <div class="text-gray-500 mb-10 leading-relaxed font-semibold text-sm px-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <button class="w-full py-5 ${theme.btn} text-white rounded-[1.5rem] font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl ${theme.shadow.replace('shadow-', 'shadow-')}/40 hover:brightness-110" id="notify-ok">
                        CONTINUAR
                    </button>
                </div>
            `;
            this._show(html);
            const close = () => {
                this._close();
                resolve(true);
            };
            document.getElementById('notify-ok').onclick = close;
            document.getElementById('notify-close').onclick = close;
        });
    },

    confirm(message, title = '¿Confirmar?', type = 'warning') {
        const theme = this._getTheme(type);
        return new Promise((resolve) => {
            const html = `
                <div class="notify-card bg-white rounded-[3rem] p-10 max-w-sm w-full mx-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 transform scale-90 opacity-0 translate-y-10 border border-gray-100/50 relative">
                    <button class="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition-all text-xl" id="notify-close">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="w-24 h-24 ${theme.bg} ${theme.text} rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <i class="fas ${theme.icon} text-4xl"></i>
                    </div>
                    <h3 class="text-3xl font-black text-gray-900 mb-4 tracking-tight text-center">${title}</h3>
                    <div class="text-gray-500 mb-10 leading-relaxed font-semibold text-center text-sm px-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
                        ${message.replace(/\n/g, '<br>').replace('ADVERTENCIA:', '<span class="text-rose-600 font-black">ADVERTENCIA:</span>')}
                    </div>
                    <div class="flex gap-4">
                        <button class="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[1.5rem] font-black hover:bg-gray-200 active:scale-95 transition-all" id="notify-cancel">
                            CANCELAR
                        </button>
                        <button class="flex-1 py-5 ${theme.btn} text-white rounded-[1.5rem] font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl ${theme.shadow.replace('shadow-', 'shadow-')}/40 hover:brightness-110" id="notify-ok">
                            CONFIRMAR
                        </button>
                    </div>
                </div>
            `;
            this._show(html);
            document.getElementById('notify-cancel').onclick = () => {
                this._close();
                resolve(false);
            };
            document.getElementById('notify-ok').onclick = () => {
                this._close();
                resolve(true);
            };
            document.getElementById('notify-close').onclick = () => {
                this._close();
                resolve(false);
            };
        });
    },

    prompt(message, defaultValue = '', title = 'Entrada de datos', type = 'info') {
        const theme = this._getTheme(type);
        const focusColor = theme.btn.replace('bg-', 'focus:border-');

        return new Promise((resolve) => {
            const html = `
                <div class="notify-card bg-white rounded-[2.5rem] p-8 max-w-sm w-full mx-4 shadow-2xl transition-all duration-300 transform scale-90 opacity-0 border border-gray-100">
                    <div class="w-20 h-20 ${theme.bg} ${theme.text} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <i class="fas ${theme.icon} text-4xl"></i>
                    </div>
                    <h3 class="text-2xl font-black text-gray-800 mb-2 text-center">${title}</h3>
                    <p class="text-gray-500 mb-6 leading-relaxed font-medium text-center text-xs uppercase tracking-wider">${message}</p>
                    <input type="text" id="notify-input" value="${defaultValue}" 
                           class="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl ${focusColor} outline-none transition-all mb-8 font-black text-center text-gray-700 text-lg"
                           placeholder="Ingresa valor..." autocomplete="off">
                    <div class="flex gap-3">
                        <button class="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95" id="notify-cancel">
                            CANCELAR
                        </button>
                        <button class="flex-1 py-4 ${theme.btn} text-white rounded-2xl font-black hover:brightness-110 transition-all shadow-lg ${theme.shadow} active:scale-95" id="notify-ok">
                            ACEPTAR
                        </button>
                    </div>
                </div>
            `;
            this._show(html);
            const input = document.getElementById('notify-input');
            input.focus();
            input.select();

            document.getElementById('notify-cancel').onclick = () => {
                this._close();
                resolve(null);
            };

            const handleOk = () => {
                const val = input.value;
                this._close();
                resolve(val);
            };

            document.getElementById('notify-ok').onclick = handleOk;
            input.onkeyup = (e) => { if (e.key === 'Enter') handleOk(); };
        });
    },
    async desktop(message, title = 'Agro-Master Alerta', icon = '/static/img/logo.png') {
        if (!("Notification" in window)) {
            console.log("Este navegador no soporta notificaciones de escritorio");
            return;
        }

        if (Notification.permission === "granted") {
            new Notification(title, { body: message, icon: icon });
        } else if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                new Notification(title, { body: message, icon: icon });
            }
        }
    },

    requestDesktopPermission() {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }
};

// Wrappers adaptados para mayor elegancia automática
window.agroAlert = (message, title, type = 'info') => AgroNotify.alert(message, title, type);
window.agroConfirm = (message, title, type = 'warning') => AgroNotify.confirm(message, title, type);
window.agroPrompt = (message, defaultValue, title, type = 'info') => AgroNotify.prompt(message, defaultValue, title, type);
window.agroToast = (message, type, duration) => AgroNotify.toast(message, type, duration);
window.agroDesktopNotify = (message, title, icon) => AgroNotify.desktop(message, title, icon);
window.requestAgroDesktopPermission = () => AgroNotify.requestDesktopPermission();

/**
 * Módulo de Desafío de Credenciales
 * Solicita usuario y clave para acciones críticas.
 */
window.agroChallenge = (message, title = 'Confirmación de Seguridad', type = 'danger') => {
    const theme = AgroNotify._getTheme(type);
    return new Promise((resolve) => {
        const html = `
            <div class="notify-card bg-white rounded-[2.5rem] p-8 max-w-sm w-full mx-4 shadow-2xl transition-all duration-300 transform scale-90 opacity-0 border border-gray-100">
                <div class="w-16 h-16 ${theme.bg} ${theme.text} rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-lock text-3xl"></i>
                </div>
                <h3 class="text-xl font-black text-gray-800 mb-2 text-center">${title}</h3>
                <p class="text-gray-500 mb-6 text-center text-xs font-bold uppercase tracking-widest">${message}</p>
                
                <div class="space-y-4 mb-8">
                    <div class="relative">
                        <input type="text" id="challenge-user" placeholder="Usuario" 
                               class="w-full p-4 pl-12 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition font-bold text-gray-700">
                        <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <div class="relative">
                        <input type="password" id="challenge-pass" placeholder="Contraseña" 
                               class="w-full p-4 pl-12 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition font-bold text-gray-700">
                        <i class="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button class="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all" id="challenge-cancel">
                        CANCELAR
                    </button>
                    <button class="flex-1 py-4 ${theme.btn} text-white rounded-2xl font-black hover:brightness-110 transition-all shadow-lg ${theme.shadow}" id="challenge-ok">
                        CONFIRMAR
                    </button>
                </div>
            </div>
        `;
        AgroNotify._show(html);

        const userInput = document.getElementById('challenge-user');
        const passInput = document.getElementById('challenge-pass');
        userInput.focus();

        document.getElementById('challenge-cancel').onclick = () => {
            AgroNotify._close();
            resolve(null);
        };

        const handleConfirm = async () => {
            const user = userInput.value;
            const pass = passInput.value;

            if (!user || !pass) {
                // Mostrar alerta sin cerrar el modal de credenciales
                await agroAlert('Ingresa tus credenciales', 'Atención', 'warning');
                // Re-mostrar el modal de credenciales después de la alerta
                AgroNotify._show(html);
                // Re-asignar eventos después de re-mostrar
                setTimeout(() => {
                    const newUserInput = document.getElementById('challenge-user');
                    const newPassInput = document.getElementById('challenge-pass');
                    if (newUserInput) newUserInput.value = user;
                    if (newPassInput) newPassInput.value = pass;
                    if (newUserInput) newUserInput.focus();

                    document.getElementById('challenge-cancel').onclick = () => {
                        AgroNotify._close();
                        resolve(null);
                    };
                    document.getElementById('challenge-ok').onclick = handleConfirm;
                    if (newPassInput) newPassInput.onkeyup = (e) => { if (e.key === 'Enter') handleConfirm(); };
                }, 100);
                return;
            }

            AgroNotify._close();
            resolve({ user, pass });
        };

        document.getElementById('challenge-ok').onclick = handleConfirm;
        passInput.onkeyup = (e) => { if (e.key === 'Enter') handleConfirm(); };
    });
};
