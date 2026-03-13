/**
 * PUNTO DE ENTRADA DE LA APLICACIÓN
 * Este archivo es el punto de inicio de la aplicación React
 * Se encarga de renderizar el componente principal (App) en el DOM
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Obtiene el elemento HTML con id 'root' donde se montará la aplicación
const container = document.getElementById('root');

// Crea la raíz de React para el renderizado concurrente (React 18+)
const root = createRoot(container!);

/**
 * RENDERIZADO DE LA APLICACIÓN
 * React.StrictMode es una herramienta de desarrollo que:
 * - Detecta problemas potenciales en la aplicación
 * - Verifica el uso de APIs obsoletas
 * - Advierte sobre efectos secundarios inesperados
 * Solo se ejecuta en modo desarrollo, no afecta la producción
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Creador: Cristian García CI:32.170.910