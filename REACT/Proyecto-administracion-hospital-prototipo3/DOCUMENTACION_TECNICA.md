# Documentación Técnica - Sistema de Administración Hospitalaria

## 📚 Índice

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Flujo de Datos](#flujo-de-datos)
3. [Componentes Principales](#componentes-principales)
4. [Gestión de Estado](#gestión-de-estado)
5. [Tipos y Interfaces](#tipos-y-interfaces)
6. [Funcionalidades Clave](#funcionalidades-clave)
7. [Seguridad](#seguridad)
8. [Manejo de Errores](#manejo-de-errores)

---

## 🏗️ Arquitectura del Sistema

### Patrón de Diseño

El sistema utiliza una **arquitectura basada en componentes** con React, siguiendo los principios de:

- **Separación de responsabilidades**: Cada componente tiene una función específica
- **Composición**: Los componentes se combinan para crear interfaces complejas
- **Unidireccionalidad de datos**: Los datos fluyen de arriba hacia abajo
- **Estado centralizado**: El estado principal se gestiona en el componente App

### Estructura de Capas

```
┌─────────────────────────────────────┐
│         Capa de Presentación        │
│    (Componentes React + CSS)        │
├─────────────────────────────────────┤
│      Capa de Lógica de Negocio      │
│    (Hooks, Handlers, Validaciones)  │
├─────────────────────────────────────┤
│        Capa de Tipos/Modelos        │
│      (Interfaces TypeScript)        │
├─────────────────────────────────────┤
│         Capa de Datos (Futuro)      │
│    (API REST, Base de Datos)        │
└─────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

### Flujo de Autenticación

```
1. Usuario ingresa credenciales en Login.tsx
   ↓
2. Login valida credenciales (admin/1234)
   ↓
3. Si es válido, ejecuta onLogin(usuario)
   ↓
4. App.tsx actualiza estado 'usuario'
   ↓
5. Se renderiza la interfaz principal
```

### Flujo de Navegación

```
1. Usuario hace clic en botón del Sidebar
   ↓
2. Sidebar ejecuta onSelect(seccion)
   ↓
3. App.tsx actualiza estado 'section'
   ↓
4. Switch en App.tsx renderiza componente correspondiente
```

### Flujo de Gestión de Pacientes

```
AGREGAR PACIENTE:
1. Usuario completa formulario en ClienteForm
   ↓
2. handleSubmit valida campos requeridos
   ↓
3. setClientes agrega nuevo paciente al array
   ↓
4. Formulario se limpia

EDITAR PACIENTE:
1. Usuario hace clic en "Ver detalles" en ClientesList
   ↓
2. Modal muestra datos del paciente
   ↓
3. Usuario edita campos
   ↓
4. Al guardar, se solicita validación de credenciales
   ↓
5. Si es válido, setClientes actualiza el array
```

---

## 🧩 Componentes Principales

### App.tsx - Componente Raíz

**Responsabilidades:**
- Gestionar el estado global de la aplicación
- Controlar la autenticación
- Manejar la navegación entre secciones
- Renderizar el layout principal

**Estados:**
```typescript
- usuario: string | null              // Usuario autenticado
- section: SectionType                // Sección actual
- clientes: Cliente[]                 // Array de pacientes
- productos: Producto[]               // Array de insumos
- personal: Personal[]                // Array de personal
- mostrarLoginCerrarSesion: boolean   // Control de modal
```

**Funciones Clave:**
- Renderizado condicional según autenticación
- Switch para mostrar componente según sección
- Validación de cierre de sesión

### Login.tsx - Autenticación

**Responsabilidades:**
- Capturar credenciales del usuario
- Validar credenciales
- Notificar al componente padre del login exitoso

**Flujo:**
1. Usuario ingresa datos
2. handleSubmit previene comportamiento por defecto
3. Valida credenciales hardcodeadas
4. Ejecuta callback onLogin o muestra error

### Sidebar.tsx - Navegación

**Responsabilidades:**
- Mostrar opciones de navegación
- Ejecutar callbacks de navegación
- Permitir cierre de sesión

**Secciones:**
- Pacientes (lista)
- Agregar Paciente (formulario)
- Insumos (lista)
- Agregar Insumos (formulario)
- Personal (lista con autenticación)

### ClientesList.tsx - Lista de Pacientes

**Responsabilidades:**
- Mostrar tabla de pacientes
- Búsqueda por identificación
- Exportar/Importar Excel
- Editar pacientes con validación

**Funcionalidades:**
```typescript
- abrirModal(): Abre detalles del paciente
- cerrarModal(): Cierra modal
- guardarEdicion(): Solicita validación para guardar
- confirmarGuardar(): Valida y guarda cambios
- exportarExcel(): Genera archivo Excel
- importarExcel(): Lee archivo Excel y agrega datos
```

### ClienteForm.tsx - Formulario de Pacientes

**Responsabilidades:**
- Capturar datos del nuevo paciente
- Validar campos requeridos
- Agregar paciente al estado global

**Validaciones:**
- Todos los campos básicos son obligatorios
- Teléfono e identificación: máximo 11 dígitos
- Formato de fecha para ingreso y citas

### ProductosList.tsx - Lista de Insumos

**Responsabilidades:**
- Mostrar tabla de productos
- Búsqueda por nombre o código
- Editar y eliminar productos
- Exportar/Importar Excel
- Gestionar historial de uso

**Funcionalidades:**
```typescript
- handleEdit(): Activa modo edición
- handleUpdate(): Actualiza producto
- handleDelete(): Elimina con confirmación
- handleSaveHistorial(): Guarda historial de uso
```

### ProductoForm.tsx - Formulario de Insumos

**Responsabilidades:**
- Capturar datos del nuevo producto
- Validar campos requeridos
- Agregar producto al estado global

### PersonalList.tsx - Lista de Personal

**Responsabilidades:**
- Mostrar tabla de personal
- Búsqueda por nombre o apellido
- Agregar nuevo personal
- Eliminar personal
- Validar acceso con credenciales

**Características Especiales:**
- Requiere login antes de mostrar datos
- Permite agregar personal directamente en la tabla
- Gestiona disponibilidad (días y horarios)

---

## 📊 Gestión de Estado

### Estado Local vs Estado Global

**Estado Global (en App.tsx):**
- `clientes[]`: Compartido entre ClientesList y ClienteForm
- `productos[]`: Compartido entre ProductosList y ProductoForm
- `personal[]`: Compartido entre PersonalList y otros componentes
- `usuario`: Controla autenticación en toda la app
- `section`: Controla navegación

**Estado Local (en componentes):**
- Formularios: valores temporales de inputs
- Modales: visibilidad y datos temporales
- Búsquedas: término de búsqueda
- Edición: índice del elemento en edición

### Actualización de Estado

**Patrón Inmutable:**
```typescript
// ❌ Incorrecto (muta el estado)
clientes.push(nuevoCliente);

// ✅ Correcto (crea nuevo array)
setClientes([...clientes, nuevoCliente]);

// ✅ Actualizar elemento específico
setClientes(prev => 
  prev.map(c => c.id === id ? clienteActualizado : c)
);

// ✅ Eliminar elemento
setClientes(prev => 
  prev.filter(c => c.id !== id)
);
```

---

## 🔤 Tipos y Interfaces

### Cliente (Paciente)

```typescript
interface Cliente {
  id: number;                    // Identificador único
  numeroConsulta: number;        // Número de consulta
  nombre: string;                // Nombre del paciente
  apellido: string;              // Apellido del paciente
  edad: number;                  // Edad
  telefono: number;              // Teléfono de contacto
  identificacion: number;        // Cédula/ID
  tratamiento?: string;          // Tratamiento actual (opcional)
  fechaIngreso?: string;         // Fecha de ingreso (opcional)
  proximaCita?: string;          // Próxima cita (opcional)
  condicion?: string;            // Condición médica (opcional)
  razonVisita?: string;          // Razón de visita (opcional)
  departamento?: string;         // Departamento asignado (opcional)
  historial?: string;            // Historial médico (opcional)
  resultadoRevision?: string;    // Resultado de consulta (opcional)
}
```

### Producto (Insumo)

```typescript
interface Producto {
  nombre: string;                // Nombre del producto
  codigo: string;                // Código único
  stock: number;                 // Cantidad disponible
  precio: number;                // Precio unitario
  vencimiento: string;           // Fecha de vencimiento
  historial?: string;            // Historial de uso (opcional)
}
```

### Personal

```typescript
interface Personal {
  id: string;                    // Identificador único
  nombre: string;                // Nombre
  apellido: string;              // Apellido
  especializacion: string;       // Especialización médica
  departamento: string;          // Departamento asignado
  disponibilidad: {              // Disponibilidad
    dias: string[];              // Días de trabajo
    horario: string;             // Horario de trabajo
  };
}
```

---

## ⚙️ Funcionalidades Clave

### Importación/Exportación de Excel

**Librería utilizada:** `xlsx`

**Exportación:**
```typescript
1. Crear encabezados como array
2. Mapear datos a arrays de valores
3. Convertir a hoja de Excel con XLSX.utils.aoa_to_sheet()
4. Crear libro y agregar hoja
5. Descargar con XLSX.writeFile()
```

**Importación:**
```typescript
1. Leer archivo con FileReader
2. Parsear con XLSX.read()
3. Convertir hoja a JSON con sheet_to_json()
4. Mapear filas a objetos con interfaz correcta
5. Agregar al estado con setClientes/setProductos
```

### Búsqueda y Filtrado

**Implementación:**
```typescript
// Filtrado por término de búsqueda
const clientesFiltrados = clientes.filter(cliente =>
  cliente.identificacion?.toString().includes(searchTerm)
);

// Filtrado múltiple
const productosFiltrados = productos.filter(p =>
  p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
  p.codigo.toLowerCase().includes(busqueda.toLowerCase())
);
```

### Validación de Formularios

**Campos Requeridos:**
```typescript
if (!cliente.nombre || !cliente.apellido || !cliente.edad) {
  setError('Todos los campos son obligatorios');
  return;
}
```

**Validación de Formato:**
```typescript
// Solo números, máximo 11 dígitos
if (/^\d{0,11}$/.test(e.target.value)) {
  setCliente({ ...cliente, telefono: Number(e.target.value) });
}
```

---

## 🔒 Seguridad

### Autenticación

**Nivel Actual:** Básico (desarrollo)
- Credenciales hardcodeadas: admin/1234
- Validación en cliente
- Sin encriptación

**Recomendaciones para Producción:**
- Implementar JWT (JSON Web Tokens)
- Hash de contraseñas con bcrypt
- Validación en servidor
- Sesiones con tiempo de expiración
- HTTPS obligatorio

### Validación de Operaciones Críticas

**Operaciones que requieren validación:**
- Editar paciente
- Cerrar sesión
- Acceder a módulo de personal

**Implementación:**
```typescript
// Modal de validación
if (username === 'admin' && password === '1234') {
  // Ejecutar operación
} else {
  alert('Usuario o contraseña incorrectos');
}
```

### Protección de Datos

**Medidas Actuales:**
- Estado local (no persistente)
- Sin exposición de API
- Validación de inputs

**Mejoras Futuras:**
- Encriptación de datos sensibles
- Auditoría de cambios
- Control de acceso basado en roles (RBAC)

---

## 🚨 Manejo de Errores

### Validación de Formularios

```typescript
// Mostrar errores al usuario
if (error) {
  return <div className="error">{error}</div>;
}
```

### Confirmaciones

```typescript
// Confirmar antes de eliminar
if (window.confirm('¿Seguro que deseas eliminar?')) {
  // Ejecutar eliminación
}
```

### Manejo de Archivos

```typescript
// Validar que se seleccionó un archivo
const archivo = event.target.files?.[0];
if (!archivo) return;
```

---

## 🔧 Configuración TypeScript

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

**Beneficios:**
- Detección de errores en tiempo de desarrollo
- Autocompletado inteligente
- Refactorización segura
- Documentación implícita

---

## 📈 Escalabilidad

### Preparación para Backend

El código está preparado para integración con backend:

```typescript
// Actualmente: Estado local
const [clientes, setClientes] = useState<Cliente[]>([]);

// Futuro: API REST
useEffect(() => {
  axios.get('/api/clientes')
    .then(response => setClientes(response.data))
    .catch(error => console.error(error));
}, []);
```

### Optimizaciones Futuras

- **React.memo**: Evitar re-renderizados innecesarios
- **useMemo**: Memorizar cálculos costosos
- **useCallback**: Memorizar funciones
- **Code Splitting**: Cargar componentes bajo demanda
- **Lazy Loading**: Cargar datos paginados

---

## 📝 Convenciones de Código

### Nomenclatura

- **Componentes**: PascalCase (ClientesList, ProductoForm)
- **Funciones**: camelCase (handleSubmit, guardarEdicion)
- **Constantes**: camelCase o UPPER_CASE
- **Archivos**: PascalCase para componentes, camelCase para utilidades

### Estructura de Componentes

```typescript
// 1. Imports
import React, { useState } from 'react';

// 2. Interfaces
interface Props { }

// 3. Componente
const Componente: React.FC<Props> = (props) => {
  // 3.1 Estados
  const [estado, setEstado] = useState();
  
  // 3.2 Funciones
  const handleFunction = () => { };
  
  // 3.3 Renderizado
  return ( );
};

// 4. Export
export default Componente;
```

---

## 🎓 Guía de Contribución

### Agregar Nuevo Componente

1. Crear archivo en `src/components/NombreComponente.tsx`
2. Definir interfaces en `src/types/` si es necesario
3. Crear estilos en `src/styles/nombrecomponente.css`
4. Agregar comentarios explicativos
5. Importar y usar en App.tsx

### Agregar Nueva Funcionalidad

1. Identificar el componente afectado
2. Actualizar interfaces TypeScript si es necesario
3. Implementar lógica con comentarios
4. Actualizar documentación
5. Probar exhaustivamente

---

**Autor:** Cristian García (CI: 32.170.910)  
**Última actualización:** Enero 2026
