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
    } else if (tabName === 'maternidad') {
        document.getElementById('tabContent-maternidad').classList.remove('hidden');
        const btn = document.getElementById('tab-salud-maternidad');
        btn.classList.remove('text-gray-500', 'hover:bg-gray-50');
        btn.classList.add('text-pink-600', 'border-b-4', 'border-pink-600', 'bg-pink-50');

        // Cargar datos de maternidad si aún no se han cargado
        loadMaternityAnimals();
        loadMaternityPlanesList();
    }
}
