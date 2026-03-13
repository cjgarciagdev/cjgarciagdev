# Manual del Usuario - GlucoAmigo 👶🩺
> **DESARROLLADOR ÚNICO:** CRISTIAN J GARCIA | CI: 32.170.910 | Email: cjgarciag.dev@gmail.com
> **OBJETIVO DEL DOCUMENTO:** Capacitar al usuario para operar el sistema con eficacia, entendiendo los beneficios detrás de cada función.

---

## 🏗️ 1. Estructura de la Interfaz (Zonificación)

### ¿Por qué es importante?
Un diseño ordenado reduce el estrés del operario y evita errores de entrada de datos. En un sistema de salud, la claridad es vital.

### ¿Cómo navegar?
Navega usando el **menú lateral** o la **barra de navegación inferior** (en móviles). 
- Las opciones están agrupadas por categorías (Gestión, Reportes, Configuración).
- El sistema recordará tu última sección activa.

---

## 🎯 2. Roles de Usuario y sus Funciones

### 2.1 Representante/Padre 👨‍👩‍👧
**¿Quién es?** El padre, madre o tutor legal del paciente.

**Funciones principales:**
- **Registrar glucosa**: Ingresar mediciones de glucosa del niño
- **Ver historial**: Consultar el historial de mediciones y evolución
- **Recibir alertas**: Notificaciones en tiempo real de niveles危险
- **Gestionar comidas**: Registrar alimentos consumidos
- **Ver crecimiento**: Monitorear peso y estatura
- **Configurar recordatorios**: Programar recordatorios de medicamentos

### 2.2 Especialista/Médico 👨‍⚕️
**¿Quién es?** El médico tratante (endocrinólogo, Nutricionista, etc.).

**Funciones principales:**
- **Panel de pacientes**: Vista general de todos los pacientes asignados
- **Gestionar pacientes**: Crear, editar o desactivar pacientes
- **Ver historial clínico**: Acceso completo a todos los datos del paciente
- **Configurar parámetros**: Ajustar ratio de carbohidratos, factor de sensibilidad, etc.
- **Evaluaciones psicométricas**: Aplicar y revisar evaluaciones CDI y SCIR
- **Alertas clínicas**: Ver y resolver alertas de hipoglucemia/hiperglucemia
- **Exportar reportes**: Generar reportes en Excel y PDF
- **Auditoría**: Ver registro de todos los cambios realizados

### 2.3 Niño/Héroe (Portal Gamificado) 🎮
**¿Quién es?** El paciente pediátrico con diabetes.

**Funciones:**
- **Juegos educativos**: 8 juegos diseñados para aprender sobre diabetes
- **Sistema de puntos**: Gana puntos por registrar su glucosa
- **Niveles**: Ascende de nivel con tu progreso
- **Recompensas**: Desbloquea logros y recompensas virtuales

---

## 📊 3. El Dashboard: Su Centro de Mando

### ¿Por qué?
Necesita saber el estado de salud de su hijo/a de un vistazo sin abrir 10 reportes.

### ¿Cómo?
- **Tarjetas de estado**: Muestran el estado actual (Estable, Alerta, Crítico)
- **TIR (Tiempo en Rango)**: Porcentaje de tiempo en rango objetivo (70-180 mg/dL)
- **Última medición**: La lectura más reciente de glucosa
- **Alertas pendientes**: Notificaciones clínicas sin resolver

---

## 🩸 4. Registro de Glucosa

### ¿Por qué?
Sin datos precisos de glucosa, el sistema no puede calcular dosis ni generar alertas.

### ¿Cómo registrar?
1. Ingrese el valor de glucosa en mg/dL
2. Indique los carbohidratos consumidos (si aplica)
3. Seleccione el momento del día (ayunas, antes de comida, etc.)
4. El sistema calculará automáticamente la dosis sugerida

### ¿Qué significa cada valor?
| Valor | Clasificación | Color |
|-------|--------------|-------|
| < 70 mg/dL | Hipoglucemia | 🔴 Rojo |
| 70-80 mg/dL | Rango bajo | 🟡 Amarillo |
| 80-180 mg/dL | **Rango objetivo** | 🟢 Verde |
| 180-250 mg/dL | Rango alto | 🟡 Amarillo |
| > 250 mg/dL | Hiperglucemia | 🔴 Rojo |

---

## 💉 5. Cálculo de Dosis de Insulina

### ¿Cómo funciona?
El sistema usa la **fórmula de bolo**:
```
Dosis = (Carbohidratos / Ratio Carbohidratos) + [(Glucosa Actual - Glucemia Objetivo) / Factor Sensibilidad]
```

### Parámetros personalizables:
- **Ratio de carbohidratos**: Gramos de carbohidratos que cubre 1 unidad de insulina
- **Factor de sensibilidad**: Cuántos mg/dL baja 1 unidad de insulina
- **Glucemia objetivo**: Meta clínica individual

> ⚠️ **Importante**: Estos parámetros deben ser configurados por el especialista médico.

---

## 🍽️ 6. Registro de Comidas

### ¿Por qué?
El control nutricional es parte fundamental del manejo de la diabetes.

### ¿Cómo registrar?
1. Seleccione el tipo de comida (desayuno, almuerzo, cena, merienda)
2. Agregue una descripción del alimento
3. Ingrese los macronutrientes (opcional):
   - Carbohidratos (g)
   - Proteínas (g)
   - Grasas (g)
   - Calorías

El sistema calculará automáticamente las calorías.

---

## 📈 7. Monitoreo de Crecimiento

### ¿Por qué?
El crecimiento saludable es un indicador de buen control metabólico.

### ¿Qué registrar?
- **Peso**: En kilogramos
- **Estatura**: En centímetros
- **IMC**: Se calcula automáticamente

El sistema graficará la tendencia de crecimiento en el tiempo.

---

## 🔔 8. Sistema de Alertas

### ¿Por qué?
Detectar situaciones危象 antes de que se conviertan en emergencias.

### Tipos de alertas:
| Tipo | Descripción | Severidad |
|------|-------------|-----------|
| Hipoglucemia severa | < 54 mg/dL | 🚨 Emergencia |
| Hipoglucemia | < 70 mg/dL | ⚠️ Alerta |
| Hiperglucemia severa | > 400 mg/dL | 🚨 Emergencia |
| Hiperglucemia | > 250 mg/dL | ⚠️ Alerta |

### ¿Cómo recibir alertas?
- **Tiempo real**: Notificaciones push en la aplicación (Socket.IO)
- **Email**: Correo electrónico al representante

---

## 🧠 9. Evaluaciones Psicométricas

### ¿Qué son?
Herramientas para evaluar el bienestar emocional del paciente.

### CDI (Children's Depression Inventory)
- Evalúa síntomas de depresión infantil
- Puntaje: 0-27
- Estados: Estable (< 19), Riesgo (≥ 19)

### SCIR (Self-Care Inventory Revised)
- Evalúa adherencia al tratamiento
- Porcentaje: 0-100%
- Estados: Baja (< 70%), Alta (≥ 70%)

---

## 🎮 10. Portal del Niño (Gamificación)

### ¿Por qué?
Motivar al niño a participar activamente en su cuidado.

### Sistema de puntos:
- **Registrar glucosa**: +10 puntos
- **Medir antes de comer**: +15 puntos
- **Mantener TIR > 70%**: +20 puntos

### Niveles:
| Nivel | Puntos requeridos |
|-------|------------------|
| Novato | 0-100 |
| Explorador | 101-500 |
| Guerrero | 501-1000 |
| Héroe | 1001-2500 |
| Leyenda | 2500+ |

### Juegos disponibles:
1. **Captura la Glucosa**: Aprende a identificar niveles
2. **Carrera de Insulina**: Simula el efecto de la insulina
3. **Memoria de Comidas**: Relaciona alimentos con glucosa
4. **Quiz Diabético**: Prueba tus conocimientos
5. **Simulador de Bolo**: Aprende a calcular dosis
6. **Crucigrama de Salud**: Vocabulario médico
7. **Sopa de Letras**: Terminos de diabetes
8. **Ahorcado**: Adivina palabras clave

---

## 📋 11. Gestión de Usuarios

### ¿Quién puede crear usuarios?
Solo el administrador del sistema puede crear nuevas cuentas.

### Roles disponibles:
| Rol | Descripción |
|-----|-------------|
| admin | Administrador del sistema |
| especialista | Médico tratante |
| padre | Representante del paciente |
| nutricionista | Especializado en nutrición |
| auditor | Solo puede ver reportes |

---

## 📊 12. Exportación de Reportes

### ¿Por qué?
Para análisis estadístico, tesis de investigación y registros médicos.

### Formatos disponibles:
- **Excel (.xlsx)**: Datos tabulares con formato profesional
- **PDF**: Reportes impresos con gráficos

### Contenido de reportes:
- Resumen de pacientes
- Historial de glucosa
- Evaluaciones psicométricas
- Registro de auditoría

---

## 🔐 13. Seguridad y Auditoría

### ¿Por qué?
En un sistema de salud, es vital saber quién hizo qué y cuándo.

### Características:
- **Sesiones seguras**: Cookies HttpOnly con vencimiento
- **Contraseñas encriptadas**: Hash bcrypt
- **Auditoría completa**: Cada cambio queda registrado
- **Contraseña requerida**: Para acciones críticas

### ¿Cómo ver la auditoría?
Los especialistas pueden acceder al registro de auditoría desde el panel de exportación.

---

## 📱 13. Acceso Móvil

### ¿Cómo acceder?
1. Abra el navegador en su dispositivo móvil
2. Ingrese a la URL del sistema
3. La interfaz se adaptará automáticamente

### Características PWA:
- **Instalable**: Puede agregar a pantalla de inicio
- **Funciona offline**: Carga datos guardados
- **Notificaciones**: Recibe alertas push

---

> 🆘 **Soporte Técnico:** Contacte a **Cristian J Garcia** para asistencia personalizada o actualizaciones del sistema.
> - **Email:** cjgarciag.dev@gmail.com
> - **CI:** 32.170.910

---

> 📝 **Nota:** Este manual es una guía de referencia. Siempre consulte con su médico tratante para decisiones médicas.
