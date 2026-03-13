# Sistema de Administración Hospitalaria

## 📋 Descripción del Proyecto

Este es un **Sistema de Administración Hospitalaria** desarrollado con React y TypeScript. La aplicación permite gestionar de manera integral los tres pilares fundamentales de un hospital:

- **Pacientes**: Registro, seguimiento y gestión de historiales médicos
- **Insumos Médicos**: Control de inventario de productos y medicamentos
- **Personal**: Administración del equipo médico y administrativo

## 🎯 Características Principales

### Gestión de Pacientes
- ✅ Registro completo de pacientes con datos personales y médicos
- ✅ Historial médico detallado
- ✅ Seguimiento de tratamientos y consultas
- ✅ Programación de citas
- ✅ Búsqueda rápida por identificación
- ✅ Exportación e importación de datos en Excel
- ✅ Edición segura con validación de credenciales

### Gestión de Insumos
- ✅ Control de inventario de productos médicos
- ✅ Seguimiento de stock y precios
- ✅ Control de fechas de vencimiento
- ✅ Historial de uso de productos
- ✅ Búsqueda por nombre o código
- ✅ Exportación e importación de datos en Excel

### Gestión de Personal
- ✅ Registro de personal médico y administrativo
- ✅ Especialización y departamento asignado
- ✅ Control de disponibilidad (días y horarios)
- ✅ Búsqueda por nombre o apellido
- ✅ Acceso protegido con autenticación

### Seguridad
- 🔐 Sistema de autenticación de usuarios
- 🔐 Validación de credenciales para operaciones críticas
- 🔐 Confirmación requerida para cerrar sesión
- 🔐 Protección de datos sensibles

## 🚀 Tecnologías Utilizadas

- **React 18**: Biblioteca principal para la interfaz de usuario
- **TypeScript**: Tipado estático para mayor seguridad y mantenibilidad
- **React Scripts**: Herramientas de desarrollo y construcción
- **XLSX**: Librería para importar/exportar archivos Excel
- **Chart.js & React-ChartJS-2**: Visualización de datos (preparado para futuras implementaciones)
- **Axios**: Cliente HTTP para comunicación con APIs (preparado para backend)
- **CSS Modules**: Estilos modulares y organizados

## 📦 Instalación

### Prerrequisitos

Asegúrate de tener instalado:
- **Node.js** (versión 14 o superior)
- **npm** (versión 6 o superior)

### Pasos de Instalación

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   ```

2. **Navega al directorio del proyecto**
   ```bash
   cd Proyecto-administracion-hospital-prototipo3
   ```

3. **Instala las dependencias**
   ```bash
   npm install
   ```

## 🎮 Uso de la Aplicación

### Iniciar el Servidor de Desarrollo

```bash
npm start
```

La aplicación se abrirá automáticamente en tu navegador en `http://localhost:3000`

### Credenciales de Acceso

Para acceder al sistema, utiliza las siguientes credenciales:

- **Usuario**: `admin`
- **Contraseña**: `1234`

> ⚠️ **Nota**: Estas son credenciales de desarrollo. En un entorno de producción, deberían implementarse credenciales seguras y un sistema de autenticación robusto.

### Construir para Producción

```bash
npm run build
```

Esto generará una carpeta `build` con los archivos optimizados para producción.

### Ejecutar Pruebas

```bash
npm test
```

## 📁 Estructura del Proyecto

```
Proyecto-administracion-hospital-prototipo3/
├── public/                      # Archivos públicos estáticos
│   └── index.html              # HTML principal
├── src/                        # Código fuente
│   ├── components/             # Componentes React
│   │   ├── Login.tsx          # Componente de inicio de sesión
│   │   ├── Header.tsx         # Barra superior
│   │   ├── Sidebar.tsx        # Menú lateral de navegación
│   │   ├── ClientesList.tsx   # Lista de pacientes
│   │   ├── ClienteForm.tsx    # Formulario de pacientes
│   │   ├── ClienteDetalle.tsx # Detalles de paciente
│   │   ├── ProductosList.tsx  # Lista de insumos
│   │   ├── ProductoForm.tsx   # Formulario de insumos
│   │   ├── ProductoDetalle.tsx# Detalles de insumo
│   │   └── PersonalList.tsx   # Lista de personal
│   ├── types/                  # Definiciones de TypeScript
│   │   ├── Cliente.ts         # Interfaz de paciente
│   │   ├── Producto.ts        # Interfaz de producto
│   │   ├── Personal.ts        # Interfaz de personal
│   │   └── index.ts           # Exportaciones centralizadas
│   ├── styles/                 # Archivos CSS
│   │   ├── index.css          # Estilos globales
│   │   ├── login.css          # Estilos del login
│   │   ├── header.css         # Estilos del header
│   │   ├── sidebar.css        # Estilos del sidebar
│   │   ├── clientelist.css    # Estilos de lista de pacientes
│   │   ├── clienteform.css    # Estilos de formulario de pacientes
│   │   ├── productoslist.css  # Estilos de lista de productos
│   │   └── personallist.css   # Estilos de lista de personal
│   ├── imagens/                # Recursos de imágenes
│   │   └── Logo.png           # Logo del sistema
│   ├── App.tsx                 # Componente principal
│   ├── index.tsx               # Punto de entrada
│   └── custom.d.ts             # Declaraciones TypeScript personalizadas
├── package.json                # Dependencias y scripts
├── tsconfig.json               # Configuración de TypeScript
└── README.md                   # Este archivo

```

## 🔧 Funcionalidades Detalladas

### Módulo de Pacientes

#### Agregar Paciente
1. Navega a "Agregar Paciente" desde el menú lateral
2. Completa todos los campos requeridos:
   - Nombre y apellido
   - Edad y teléfono
   - Identificación única
   - Número de consulta
   - Razón de visita
   - Departamento asignado
   - Condición médica
   - Historial médico (opcional)
3. Haz clic en "Guardar"

#### Ver y Editar Pacientes
1. Navega a "Pacientes" desde el menú lateral
2. Usa la barra de búsqueda para encontrar un paciente por ID
3. Haz clic en "Ver detalles" para abrir el modal
4. Edita los campos necesarios
5. Haz clic en "Guardar" e ingresa credenciales de administrador

#### Importar/Exportar Datos
- **Exportar**: Haz clic en "Exportar a Excel" para descargar todos los pacientes
- **Importar**: Haz clic en "Importar desde Excel" y selecciona un archivo .xlsx

### Módulo de Insumos

#### Agregar Insumo
1. Navega a "Agregar Insumos" desde el menú lateral
2. Completa los campos:
   - Nombre del producto
   - Código único
   - Stock disponible
   - Precio
   - Fecha de vencimiento
3. Haz clic en "Guardar"

#### Gestionar Insumos
1. Navega a "Insumos" desde el menú lateral
2. Busca productos por nombre o código
3. Edita o elimina productos según sea necesario
4. Visualiza detalles e historial de uso

### Módulo de Personal

#### Agregar Personal
1. Navega a "Personal" desde el menú lateral
2. Ingresa credenciales de administrador (admin/1234)
3. Completa los campos en la fila de "Agregar":
   - Nombre y apellido
   - Especialización
   - Departamento
   - Días disponibles (separados por comas)
   - Horario de trabajo
4. Haz clic en "Agregar"

## 🎨 Personalización

### Modificar Estilos
Los estilos se encuentran en la carpeta `src/styles/`. Cada componente tiene su propio archivo CSS para facilitar la personalización.

### Agregar Nuevas Funcionalidades
El proyecto está estructurado de manera modular. Para agregar nuevas funcionalidades:
1. Crea un nuevo componente en `src/components/`
2. Define las interfaces TypeScript en `src/types/`
3. Crea los estilos correspondientes en `src/styles/`
4. Importa y usa el componente en `App.tsx`

## 🔮 Futuras Mejoras

- [ ] Integración con backend real (actualmente usa estado local)
- [ ] Base de datos persistente
- [ ] Sistema de roles y permisos más robusto
- [ ] Dashboard con gráficos y estadísticas
- [ ] Notificaciones y alertas
- [ ] Historial de cambios y auditoría
- [ ] Impresión de reportes
- [ ] Modo oscuro
- [ ] Aplicación móvil

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👨‍💻 Autor

**Cristian García**  
CI: 32.170.910

## 📞 Soporte

Para reportar problemas o sugerencias, por favor crea un issue en el repositorio del proyecto.

---

**Última actualización**: Enero 2026