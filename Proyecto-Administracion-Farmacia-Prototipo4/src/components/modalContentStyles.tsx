import React from 'react';

export const modalContentStyles: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    width: '400px', // Reducir el ancho del recuadro

    // maxHeight: '80vh', // Limitar la altura del recuadro
    overflowY: 'auto', // Permitir desplazamiento si el contenido es demasiado largo
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};