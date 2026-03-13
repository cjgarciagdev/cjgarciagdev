# Guía de Usuario - Sistema de Administración Hospitalaria

## 📖 Bienvenido

Esta guía te ayudará a utilizar todas las funcionalidades del Sistema de Administración Hospitalaria de manera efectiva.

---

## 🚪 Inicio de Sesión

### Acceder al Sistema

1. Al abrir la aplicación, verás la pantalla de inicio de sesión
2. Ingresa las credenciales:
   - **Usuario**: `admin`
   - **Contraseña**: `1234`
3. Haz clic en el botón **"Entrar"**

![Login](https://via.placeholder.com/600x400?text=Pantalla+de+Login)

> 💡 **Consejo**: Si olvidas las credenciales, contacta al administrador del sistema.

---

## 🏥 Gestión de Pacientes

### Ver Lista de Pacientes

1. En el menú lateral, haz clic en **"Pacientes"**
2. Verás una tabla con todos los pacientes registrados
3. La tabla muestra:
   - Nombre y apellido
   - Edad
   - Teléfono
   - Identificación
   - Número de consulta
   - Fecha de ingreso
   - Próxima cita
   - Departamento

### Buscar un Paciente

1. En la parte superior de la lista, encontrarás una barra de búsqueda
2. Escribe el **número de identificación** del paciente
3. La lista se filtrará automáticamente

### Agregar un Nuevo Paciente

1. En el menú lateral, haz clic en **"Agregar Paciente"**
2. Completa todos los campos del formulario:

   **Datos Personales:**
   - Nombre (obligatorio)
   - Apellido (obligatorio)
   - Edad (obligatorio)
   - Teléfono (obligatorio, máximo 11 dígitos)
   - Identificación (obligatorio, máximo 11 dígitos)

   **Datos Médicos:**
   - Número de consulta (obligatorio)
   - Razón de visita (obligatorio)
   - Departamento asignado (obligatorio)
   - Condición médica (obligatorio)
   - Historial médico (opcional)

   **Fechas:**
   - Fecha de ingreso (obligatorio)
   - Próxima cita (opcional)

3. Haz clic en **"Guardar"**
4. El paciente se agregará a la lista automáticamente

> ⚠️ **Importante**: Todos los campos marcados como obligatorios deben completarse para poder guardar.

### Ver y Editar Detalles de un Paciente

1. En la lista de pacientes, localiza al paciente que deseas editar
2. Haz clic en el botón **"Ver detalles"**
3. Se abrirá un modal con toda la información del paciente
4. Puedes editar cualquier campo:
   - Datos personales
   - Información médica
   - Tratamiento
   - Resultado de la consulta
5. Haz clic en **"Guardar"**
6. Se te pedirá que ingreses tus credenciales de administrador:
   - Usuario: `admin`
   - Contraseña: `1234`
7. Haz clic en **"Confirmar"** para guardar los cambios
8. Para cerrar sin guardar, haz clic en **"Cerrar"** o **"Cancelar"**

### Exportar Datos de Pacientes

1. En la lista de pacientes, haz clic en **"Exportar a Excel"**
2. Se descargará un archivo `clientes.xlsx` con todos los pacientes
3. El archivo incluye:
   - Todos los datos personales
   - Información médica completa
   - Historial y resultados

### Importar Datos de Pacientes

1. Prepara un archivo Excel (.xlsx) con los siguientes encabezados:
   ```
   Nombre | Apellido | Edad | Teléfono | Identificación | Tratamiento | 
   Fecha de ingreso | Próxima cita | Condición | Razón de visita | 
   Departamento | Historial médico | Resultado de Revisión
   ```
2. En la lista de pacientes, haz clic en **"Importar desde Excel"**
3. Selecciona tu archivo
4. Los pacientes se agregarán automáticamente a la lista

> 💡 **Consejo**: Puedes exportar primero para ver el formato correcto del archivo.

---

## 💊 Gestión de Insumos Médicos

### Ver Lista de Insumos

1. En el menú lateral, haz clic en **"Insumos"**
2. Verás una tabla con todos los productos registrados
3. La tabla muestra:
   - Nombre del producto
   - Código
   - Stock disponible
   - Precio
   - Fecha de vencimiento

### Buscar un Insumo

1. En la parte superior de la lista, encontrarás una barra de búsqueda
2. Escribe el **nombre** o **código** del producto
3. La lista se filtrará automáticamente

### Agregar un Nuevo Insumo

1. En el menú lateral, haz clic en **"Agregar Insumos"**
2. Completa todos los campos del formulario:
   - Nombre del producto (obligatorio)
   - Código único (obligatorio)
   - Stock disponible (obligatorio)
   - Precio (obligatorio)
   - Fecha de vencimiento (obligatorio)
3. Haz clic en **"Guardar"**
4. El insumo se agregará a la lista automáticamente

### Editar un Insumo

1. En la lista de insumos, localiza el producto que deseas editar
2. Haz clic en el botón **"Editar"**
3. Se mostrará un formulario de edición
4. Modifica los campos necesarios
5. Haz clic en **"Guardar"** para confirmar
6. Para cancelar, haz clic en **"Cancelar"**

### Eliminar un Insumo

1. En la lista de insumos, localiza el producto que deseas eliminar
2. Haz clic en el botón **"Eliminar"**
3. Confirma la acción en el mensaje que aparece
4. El producto se eliminará de la lista

> ⚠️ **Advertencia**: La eliminación es permanente y no se puede deshacer.

### Ver Detalles e Historial de un Insumo

1. En la lista de insumos, haz clic en **"Ver detalles"**
2. Se abrirá un modal con:
   - Información completa del producto
   - Historial de uso
3. Puedes agregar notas al historial
4. Haz clic en **"Guardar"** para guardar cambios en el historial
5. Haz clic en **"Cerrar"** para salir

### Exportar/Importar Insumos

El proceso es similar al de pacientes:

**Exportar:**
- Haz clic en **"Exportar a Excel"**
- Se descargará `productos.xlsx`

**Importar:**
- Prepara un archivo con los encabezados: Nombre, Código, Stock, Precio, Vencimiento, Historial
- Haz clic en **"Importar desde Excel"**
- Selecciona tu archivo

---

## 👨‍⚕️ Gestión de Personal

### Acceder al Módulo de Personal

1. En el menú lateral, haz clic en **"Personal"**
2. Se te pedirá que ingreses credenciales:
   - Usuario: `admin`
   - Contraseña: `1234`
3. Haz clic en **"Iniciar sesión"**

> 🔒 **Seguridad**: Este módulo requiere autenticación adicional por contener información sensible.

### Ver Lista de Personal

Una vez autenticado, verás una tabla con:
- Nombre y apellido
- Especialización
- Departamento
- Disponibilidad (días y horarios)

### Buscar Personal

1. Usa la barra de búsqueda en la parte superior
2. Escribe el **nombre** o **apellido**
3. La lista se filtrará automáticamente

### Agregar Nuevo Personal

1. En la última fila de la tabla, encontrarás campos de entrada
2. Completa los campos:
   - **Nombre** (obligatorio)
   - **Apellido** (obligatorio)
   - **Especialización** (obligatorio) - Ejemplo: "Cardiología", "Enfermería"
   - **Departamento** (obligatorio) - Ejemplo: "Emergencias", "UCI"
   - **Días** (obligatorio) - Ejemplo: "Lunes, Miércoles, Viernes"
   - **Horario** (obligatorio) - Ejemplo: "08:00 - 16:00"
3. Haz clic en **"Agregar"**
4. El personal se agregará a la lista

> 💡 **Consejo**: Para los días, sepáralos con comas. Ejemplo: "Lunes, Martes, Miércoles"

### Eliminar Personal

1. Localiza al personal que deseas eliminar
2. Haz clic en el botón **"Eliminar"**
3. Confirma la acción
4. El registro se eliminará de la lista

---

## 🔄 Navegación General

### Menú Lateral (Sidebar)

El menú lateral siempre está visible y contiene:

- **Pacientes**: Ver lista de pacientes
- **Agregar Paciente**: Formulario para nuevo paciente
- **Insumos**: Ver lista de insumos médicos
- **Agregar Insumos**: Formulario para nuevo insumo
- **Personal**: Ver y gestionar personal (requiere autenticación)
- **Cerrar sesión**: Salir del sistema

### Cambiar de Sección

1. Haz clic en cualquier opción del menú lateral
2. El contenido principal cambiará automáticamente
3. Puedes navegar libremente entre secciones

---

## 🚪 Cerrar Sesión

### Salir del Sistema de Forma Segura

1. En el menú lateral, haz clic en **"Cerrar sesión"**
2. Se abrirá un modal de confirmación
3. Ingresa tus credenciales:
   - Usuario: `admin`
   - Contraseña: `1234`
4. Haz clic en **"Confirmar"**
5. Serás redirigido a la pantalla de login

> 🔒 **Seguridad**: Este paso adicional previene cierres de sesión accidentales.

Para cancelar:
- Haz clic en **"Cancelar"**
- El modal se cerrará y permanecerás en el sistema

---

## 💡 Consejos y Buenas Prácticas

### Gestión de Pacientes

✅ **Haz:**
- Verifica que la identificación sea única antes de agregar
- Actualiza la próxima cita después de cada consulta
- Mantén el historial médico actualizado
- Exporta los datos regularmente como respaldo

❌ **Evita:**
- Dejar campos obligatorios vacíos
- Usar identificaciones duplicadas
- Olvidar guardar cambios antes de cerrar modales

### Gestión de Insumos

✅ **Haz:**
- Revisa las fechas de vencimiento regularmente
- Actualiza el stock después de cada uso
- Usa códigos únicos y descriptivos
- Mantén el historial de uso actualizado

❌ **Evita:**
- Permitir que el stock llegue a cero sin reorden
- Usar productos vencidos
- Duplicar códigos de productos

### Gestión de Personal

✅ **Haz:**
- Actualiza la disponibilidad cuando cambie
- Verifica que los horarios no se superpongan
- Mantén la información de contacto actualizada

❌ **Evita:**
- Eliminar personal sin verificar primero
- Dejar campos de disponibilidad vacíos

---

## 🆘 Solución de Problemas

### No puedo iniciar sesión

**Problema**: El sistema no acepta mis credenciales

**Solución**:
1. Verifica que estés usando:
   - Usuario: `admin` (en minúsculas)
   - Contraseña: `1234`
2. Asegúrate de no tener espacios antes o después
3. Verifica que Caps Lock esté desactivado

### Los datos no se guardan

**Problema**: Al guardar, los datos desaparecen

**Solución**:
1. Verifica que todos los campos obligatorios estén completos
2. Asegúrate de hacer clic en "Guardar" antes de cerrar
3. En ediciones de pacientes, confirma con tus credenciales

### No puedo importar el archivo Excel

**Problema**: El archivo no se importa correctamente

**Solución**:
1. Verifica que el archivo sea .xlsx
2. Asegúrate de que los encabezados coincidan exactamente
3. Revisa que no haya celdas vacías en campos obligatorios
4. Exporta primero para ver el formato correcto

### El modal no se cierra

**Problema**: No puedo cerrar un modal

**Solución**:
1. Busca el botón "Cerrar" o "Cancelar"
2. Si editaste datos, guarda o cancela primero
3. Recarga la página si el problema persiste

### La búsqueda no funciona

**Problema**: No encuentro resultados al buscar

**Solución**:
1. Verifica que estés buscando por el campo correcto:
   - Pacientes: por identificación
   - Insumos: por nombre o código
   - Personal: por nombre o apellido
2. Asegúrate de escribir correctamente
3. La búsqueda distingue mayúsculas/minúsculas en algunos casos

---

## 📞 Soporte y Ayuda

### ¿Necesitas Ayuda Adicional?

Si encuentras problemas no cubiertos en esta guía:

1. **Documenta el problema**:
   - ¿Qué estabas haciendo?
   - ¿Qué esperabas que sucediera?
   - ¿Qué sucedió en realidad?

2. **Toma capturas de pantalla** si es posible

3. **Contacta al soporte técnico** con toda la información

### Reportar Errores

Para reportar un error:
1. Describe el problema detalladamente
2. Incluye los pasos para reproducirlo
3. Adjunta capturas de pantalla
4. Indica qué navegador estás usando

---

## 📚 Glosario

- **Paciente/Cliente**: Persona que recibe atención médica
- **Insumo**: Producto médico o medicamento
- **Personal**: Empleado del hospital (médico, enfermero, administrativo)
- **Identificación**: Número único de cédula o documento
- **Historial**: Registro de eventos pasados
- **Modal**: Ventana emergente sobre la interfaz principal
- **Exportar**: Guardar datos en un archivo externo
- **Importar**: Cargar datos desde un archivo externo

---

## 🎓 Capacitación Recomendada

Para nuevos usuarios, se recomienda:

1. **Día 1**: Familiarización con la interfaz y navegación
2. **Día 2**: Práctica con gestión de pacientes
3. **Día 3**: Práctica con gestión de insumos
4. **Día 4**: Práctica con gestión de personal
5. **Día 5**: Práctica con importación/exportación

---

**¿Listo para comenzar?** ¡Inicia sesión y explora el sistema!

---

**Autor:** Cristian García (CI: 32.170.910)  
**Versión de la Guía:** 1.0  
**Última actualización:** Enero 2026
