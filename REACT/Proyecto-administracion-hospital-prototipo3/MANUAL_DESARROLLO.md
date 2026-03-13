# MANUAL DE DESARROLLO: SISTEMA DE ADMINISTRACIÓN HOSPITALARIA (PROTOTIPO 3)

Este manual proporciona las instrucciones técnicas necesarias para replicar la arquitectura, el backend y el frontend del proyecto desde cero.

---

## 🏗️ 1. REQUISITOS DEL ENTORNO
*   **Node.js**: Versión 18.0.0 o superior.
*   **Gestor de paquetes**: npm (incluido con Node.js).
*   **Herramientas recomendadas**: VS Code, DB Browser for SQLite (para visualizar la base de datos).

---

## 📁 2. ESTRUCTURA DE ARCHIVOS RECOMENDADA
```text
/PROYECTO
  ├── /backend                # Servidor API (Node.js)
  │   ├── server.js           # Lógica principal del servidor
  │   ├── init-db.js          # Script de creación de tablas
  │   ├── pharmacore.db       # Base de datos SQLite
  │   └── package.json        # Dependencias del backend
  ├── /src                    # Aplicación Frontend (React)
  │   ├── /components         # Componentes UI (Login, Listas, Form),
  │   ├── /services           # dbService.ts (Conexión API)
  │   ├── /types              # Interfaces TypeScript
  │   ├── /styles             # Archivos CSS Modulares
  │   ├── App.tsx             # Orquestador principal
  │   └── index.tsx           # Punto de entrada
  ├── package.json            # Dependencias del frontend
  └── tsconfig.json           # Configuración de TypeScript
```

---

## ⚙️ 3. CONFIGURACIÓN DEL BACKEND

### Paso 1: Instalación de dependencias
En la carpeta `/backend`:
```bash
npm init -y
npm install express sqlite3 cors
```

### Paso 2: Servidor API (`server.js`)
Configurar un servidor con Express que escuche en el puerto `3001`. Debe incluir:
*   Manejo de JSON: `app.use(express.json())`.
*   CORS: `app.use(cors())` para permitir peticiones desde el frontend.
*   Rutas API:
    *   `GET /api/clientes`: Devuelve todos los registros de la tabla clientes.
    *   `POST /api/clientes`: Recibe un JSON y lo inserta en la base de datos.
    *   `PUT /api/clientes/:id`: Actualiza datos de un cliente específico.

### Paso 3: Base de Datos (`init-db.js`)
Script para crear las tablas si no existen:
```sql
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    apellido TEXT,
    identificacion INTEGER,
    fecha_ingreso TEXT,
    departamento TEXT
);
-- Repetir para tablas 'productos' y 'personal'
```

---

## 💻 4. CONFIGURACIÓN DEL FRONTEND

### Paso 1: Creación del proyecto
En la raíz del proyecto:
```bash
npx create-react-app . --template typescript
npm install axios chart.js react-chartjs-2 xlsx
```

### Paso 2: Servicio de Comunicación (`src/services/dbService.ts`)
Implementar un objeto que gestione las peticiones `fetch`.
**Punto clave:** Incluir lógica de respaldo. Si `fetch` falla, guardar/leer de `localStorage`.

### Paso 3: Manejo de Estado en `App.tsx`
Utilizar hooks de React para centralizar los datos:
*   `useState<Cliente[]>([])`: Almacena la lista de pacientes.
*   `useEffect()`: Carga los datos desde la API al iniciar la aplicación.
*   **Renderizado Condicional:** Si el estado `usuario` es null, mostrar componente `Login`.

---

## 📊 5. FUNCIONALIDADES CRÍTICAS

### A. Gestión de Excel (`xlsx`)
*   **Exportar:** Convertir el estado de React (JSON) a una hoja de cálculo mediante `XLSX.utils.json_to_sheet`.
*   **Importar:** Usar un `FileReader` para leer archivos `.xlsx` y actualizar el estado de la aplicación.

### B. Dashboard Dinámico
*   Utilizar `react-chartjs-2` para crear gráficos de barras o líneas basados en el conteo de pacientes por departamento o stock de productos.

### C. Seguridad
*   **Cierre de sesión:** Implementar un modal de validación que compare el input del usuario con credenciales fijas (`admin`/`1234`) antes de limpiar el estado global.

---

## 🎨 6. SISTEMA DE DISEÑO
Para replicar la estética premium:
*   **Fuentes**: Importar 'Inter' u 'Outfit' desde Google Fonts.
*   **Colores**: Usar `--accent: #10b981;` (Esmeralda) para botones y elementos activos.
*   **Glassmorphism**: Aplicar fondos translucidos:
    ```css
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    ```

---

## 🚀 7. PUESTA EN MARCHA
1.  **Ejecutar Backend:** `cd backend && node server.js`
2.  **Ejecutar Frontend:** `npm start` (en una terminal nueva).

---
**Manual generado para el Proyecto de Administración Hospitalaria - Prototipo 3.**
