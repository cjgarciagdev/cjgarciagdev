# GlucoAmigo - Documentación del Código 📋
> **PRODUCTOR ÚNICO:** CRISTIAN J GARCIA | CI: 32.170.910 | Email: cjgarciag.dev@gmail.com

---

Este documento proporciona una descripción detallada de cada componente del código del sistema GlucoAmigo, explicando su función, propósito y cómo interactúa con los demás módulos del sistema.

---

## 1. MODELOS DE DATOS ([`models.py`](GlucoAmigo/models.py))

### 1.1 Usuario ([línea 11](GlucoAmigo/models.py:11))
**¿Qué es?** La clase principal de gestión de identidad y autenticación del sistema.

**¿Para qué sirve?**
- Gestiona las credenciales de acceso de todos los usuarios del sistema
- Almacena información personal (nombre, cédula, email, teléfono)
- Define el rol del usuario en el sistema (padre, especialista, admin, etc.)
- Controla el estado de actividad del usuario (activo/inactivo)

**Atributos principales:**
| Atributo | Tipo | Descripción |
|----------|------|-------------|
| `username` | String | Nombre de usuario único para login |
| `password_hash` | String | Contraseña encriptada con bcrypt |
| `rol` | String | Rol del usuario (padre, especialista, admin, etc.) |
| `nombre_completo` | String | Nombre completo del usuario |
| `cedula` | String | Número de identificación |
| `email` | String | Correo electrónico |
| `telefono` | String | Teléfono de contacto |
| `consentimiento_aceptado` | Boolean | Aceptación de términos |
| `activo` | Boolean | Estado de actividad del usuario |
| `cambio_password_requerido` | Boolean | Obliga cambio de contraseña |

**Métodos:**
- `set_password(pwd)`: Encripta y guarda la contraseña usando bcrypt
- `check_password(pwd)`: Verifica si la contraseña es correcta
- `registrar_acceso()`: Registra la fecha y hora del último acceso exitoso
- `to_dict()`: Convierte el objeto a diccionario para JSON

**Relaciones:**
- `perfil`: Relación uno-a-uno con PerfilProfesional
- `heroes`: Relación uno-a-muchos con Heroe (como representante)

---

### 1.2 PerfilProfesional ([línea 59](GlucoAmigo/models.py:59))
**¿Qué es?** Extension del Usuario para profesionales de la salud.

**¿Para qué sirve?**
- Almacena la especialidad médica del profesional
- Guarda la información del consultorio o institución

**Atributos:**
| Atributo | Tipo | Descripción |
|----------|------|-------------|
| `especialidad` | String | Especialidad médica (Endocrinólogo, Nutricionista, etc.) |
| `consultorio` | String | Nombre del consultorio o institución |

---

### 1.3 PreguntaSeguridad ([línea 69](GlucoAmigo/models.py:69))
**¿Qué es?** Sistema de seguridad adicional para recuperación de cuentas.

**¿Para qué sirve?**
- Almacena preguntas y respuestas de seguridad
- Permite verificar la identidad del usuario

**Métodos:**
- `set_respuesta(respuesta)`: Encripta la respuesta de seguridad
- `check_respuesta(respuesta)`: Verifica la respuesta

---

### 1.4 Heroe ([línea 87](GlucoAmigo/models.py:87))
**¿Qué es?** El modelo central del sistema - representa al niño/paciente con diabetes.

**¿Para qué sirve?**
- Almacena los datos demográficos del paciente
- Define los parámetros clínicos individuales (ratio de carbohidratos, factor de sensibilidad, etc.)
- Gestiona el sistema de gamificación (puntos, niveles)
- Relaciona al paciente con su representante y especialista

**Parámetros Clínicos:**
| Parámetro | Valor Default | Descripción |
|-----------|---------------|-------------|
| `ratio_carbohidratos` | 15.0 | Gramos de carbohidratos por unidad de insulina |
| `factor_sensibilidad` | 40.0 | mg/dL que baja 1 unidad de insulina |
| `glucemia_objetivo` | 100 | Meta clínica de glucosa en mg/dL |
| `dosis_max_kg` | 0.5 | Límite de seguridad pediátrica (u/kg) |

**Datos Médicos:**
| Campo | Descripción |
|-------|-------------|
| `tipo_diabetes` | Tipo de diabetes (DM1, DM2, etc.) |
| `tipo_insulina` | Tipo de insulina usada |
| `institucion` | Hospital o clínica de atención |
| `hba1c_ultimo` | Hemoglobina glicosilada (control glucémico) |
| `imc_ultimo` | Índice de masa corporal calculado |

**Gamificación:**
| Campo | Descripción |
|-------|-------------|
| `puntos_juego` | Puntos acumulados en juegos |
| `xp_puntos` | Puntos de experiencia |
| `nivel` | Nivel actual en el sistema |

**Relaciones:**
- `registros_glucosa`: Historial de mediciones de glucosa
- `evaluaciones`: Evaluaciones psicométricas (CDI, SCIR)
- `especialista`: Relación con el médico tratante

---

### 1.5 RegistroGlucosa ([línea 155](GlucoAmigo/models.py:155))
**¿Qué es?** Registro de cada medición de glucosa realizada.

**¿Para qué sirve?**
- Almacena cada lectura de glucosa con marca de tiempo
- Calcula la dosis sugerida basada en parámetros del héroe
- Registra carbohidratos consumidos
- Controla si se ha disparado una alerta clínica

**Atributos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `glucemia_actual` | Integer | Nivel de glucosa en mg/dL |
| `carbohidratos` | Integer | Carbohidratos consumidos (g) |
| `dosis_sugerida` | Float | Dosis de insulina calculada |
| `momento_dia` | String | Momento (ayunas, pos-almuerzo, etc.) |
| `alerta_disparada` | Boolean | Si se generó alerta clínica |
| `dosis_aplicada` | Float | Dosis realmente aplicada |
| `confirmado_por_id` | Integer | ID del usuario que confirmó |
| `notas` | Text | Notas adicionales |

---

### 1.6 EvaluacionPsicometrica ([línea 188](GlucoAmigo/models.py:188))
**¿Qué es?** Evaluaciones de estado emocional y adherencia al tratamiento.

**¿Para qué sirve?**
- Registra evaluaciones CDI (Children's Depression Inventory)
- Registra evaluaciones SCIR (Self-Care Inventory Revised)
- Determina el estado emocional y nivel de adherencia

**Tipos de evaluación:**
- `CDI`: Evalúa síntomas de depresión infantil
- `SCIR`: Evalúa adherencia al tratamiento

**Estados:**
- `Estable` / `Riesgo` (para CDI)
- `Alta` / `Baja` (para SCIR)

---

### 1.7 AlertaClinica ([línea 210](GlucoAmigo/models.py:210))
**¿Qué es?** Sistema de alertas clínicas automáticas.

**¿Para qué sirve?**
- Detecta y registra alertas de hipoglucemia/hiperglucemia
- Clasifica por severidad (roja, amarilla, verde)
- Permite seguimiento y resolución

**Tipos de alerta:**
- `hipo`: Hipoglucemia (glucosa baja)
- `hiper`: Hiperglucemia (glucosa alta)

---

### 1.8 AuditLog ([línea 231](GlucoAmigo/models.py:231))
**¿Qué es?** Sistema de auditoría y trazabilidad.

**¿Para qué sirve?**
- Registra cada cambio en los datos del sistema
- Mantiene historial de modificaciones para cumplimiento normativo
- Rastreable por usuario, fecha, entidad y campo

---

### 1.9 RegistroComida ([línea 256](GlucoAmigo/models.py:256))
**¿Qué es?** Registro nutricional de cada comida.

**¿Para qué sirve?**
- Controla el consumo de alimentos
- Calcula macronutrientes (carbohidratos, proteínas, grasas)
- Asocia comidas con momentos del día

---

### 1.10 CrecimientoRegistro ([línea 283](GlucoAmigo/models.py:283))
**¿Qué es?** Seguimiento del crecimiento físico.

**¿Para qué sirve?**
- Registra peso y estatura periódicamente
- Calcula IMC automáticamente
- Historial de crecimiento del paciente

---

### 1.11 Recordatorio ([línea 304](GlucoAmigo/models.py:304))
**¿Qué es?** Sistema de recordatorios y notificaciones.

**¿Para qué sirve?**
- Programa recordatorios de insulina, mediciones, citas
- Configurable por días y horarios
- Notificaciones recurrentes

---

## 2. APLICACIÓN PRINCIPAL ([`app.py`](GlucoAmigo/app.py))

### 2.1 Función create_app() ([línea 15](GlucoAmigo/app.py:15))
**¿Qué es?** Función factory que crea y configura la aplicación Flask.

**¿Para qué sirve?**
- Inicializa la aplicación Flask
- Configura la base de datos (SQLite para local, PostgreSQL para producción)
- Configura Flask-Login para autenticación
- Configura cookies de sesión seguras
- Registra los Blueprints de rutas
- Inicializa SocketIO para alertas en tiempo real
- Define las rutas principales del sistema

**Configuración de seguridad:**
```python
# Cookies seguras para producción
app.config['SESSION_COOKIE_SECURE'] = is_production  # Solo HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Protegido contra XSS
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection

# Sesión persistente por 30 días
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
```

### 2.2 Rutas principales ([líneas 73-98](GlucoAmigo/app.py:73))
| Ruta | Función | Descripción |
|------|---------|-------------|
| `/` | `index()` | Redirecciona según rol del usuario |
| `/representante` | `portal_representante()` | Portal del padre/representante |
| `/nino` | `portal_nino()` | Portal del niño (interfaz gamificada) |

---

## 3. SERVICIOS ([`services/`](GlucoAmigo/services/))

### 3.1 [`user_service.py`](GlucoAmigo/services/user_service.py)
**¿Qué es?** Servicio de gestión de usuarios.

**Funciones:**
| Función | Descripción |
|---------|-------------|
| `list_users_for(current_user)` | Lista usuarios según permisos |
| `create_user_by(current_user, data)` | Crea nuevo usuario con auditoría |

---

### 3.2 [`alerta_tiempo_real.py`](GlucoAmigo/services/alerta_tiempo_real.py)
**¿Qué es?** Sistema de notificaciones en tiempo real mediante WebSockets.

**Componentes principales:**

#### SocketIO ([líneas 36-99](GlucoAmigo/services/alerta_tiempo_real.py:36))
- `init_socketio(app)`: Inicializa SocketIO con la app Flask
- `registrar_handlers(socket_io)`: Registra manejadores de eventos

**Eventos Socket.IO:**
| Evento | Descripción |
|--------|-------------|
| `connect` | Cliente se conecta |
| `disconnect` | Cliente se desconecta |
| `unirse_usuario` | Usuario se une a su sala privada |
| `unirse_heroe` | Cliente se une a sala de héroe |
| `solicitar_estado` | Solicita estado de conexiones |
| `ping` | Heartbeat para mantener conexión |

#### Funciones de alerta ([líneas 101-242](GlucoAmigo/services/alerta_tiempo_real.py:101))
| Función | Descripción |
|---------|-------------|
| `enviar_alerta_hipoglucemia()` | Notifica niveles bajos de glucosa |
| `enviar_alerta_hiperglucemia()` | Notifica niveles altos de glucosa |
| `obtener_recomendacion()` | Genera recomendaciones clínicas |
| `enviar_notificacion_general()` | Notificación global |
| `broadcast_actualizacion_glucosa()` | Actualización en tiempo real |

#### MonitorGlucosa ([línea 248](GlucoAmigo/services/alerta_tiempo_real.py:248))
**¿Qué es?** Hilo en background que monitorea niveles de glucosa.

**¿Para qué sirve?**
- Verifica lecturas de glucosa cada 30 segundos
- Detecta hipoglucemia (< 70 mg/dL)
- Detecta hiperglucemia severa (> 250 mg/dL)
- Envía alertas automáticas

---

### 3.3 [`export_service.py`](GlucoAmigo/services/export_service.py)
**¿Qué es?** Servicio de exportación de reportes.

**Funciones de exportación:**

| Función | Descripción | Formato |
|---------|-------------|----------|
| `export_group_excel()` | Reporte de pacientes | Excel (.xlsx) |
| `export_group_pdf()` | Reporte de pacientes | PDF |
| `export_audit_excel()` | Registro de auditoría | Excel |
| `export_audit_pdf()` | Registro de auditoría | PDF |

**Características:**
- Colores temáticos según estado (verde=estable, rojo=riesgo)
- Cálculo automático de TIR (Tiempo en Rango)
- Gráficos y tablas profesionales

---

### 3.4 [`permissions.py`](GlucoAmigo/services/permissions.py)
**¿Qué es?** Sistema de control de permisos por rol.

**¿Para qué sirve?**
- Verifica si un usuario tiene permiso para realizar acciones
- Control de acceso granular basado en el rol

---

## 4. RUTAS ([`routes/`](GlucoAmigo/routes/))

### 4.1 [`auth_routes.py`](GlucoAmigo/routes/auth_routes.py)
**¿Qué es?** Rutas de autenticación y gestión de perfiles.

**Endpoints:**

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/login` | GET/POST | Inicio de sesión |
| `/logout` | GET | Cierre de sesión |
| `/api/auth/perfil` | GET/PUT | Perfil de usuario |
| `/api/auth/preguntas-seguridad` | POST | Configurar preguntas de seguridad |

**Características:**
- Sesiones persistentes (30 días con "recordarme")
- Validación de contraseñas con políticas de seguridad
- Auditoría de accesos

---

### 4.2 [`panel_routes.py`](GlucoAmigo/routes/panel_routes.py)
**¿Qué es?** Panel de control del especialista y gestión de pacientes.

**Endpoints del panel:**

| Ruta | Descripción |
|------|-------------|
| `/api/panel/resumen` | Vista general de todos los pacientes |
| `/api/panel/paciente/<id>` | Ficha clínica resumida |
| `/api/panel/paciente/<id>/completo` | Historial completo |
| `/api/panel/paciente/<id>/comidas` | Historial de comidas |
| `/api/panel/paciente/<id>/crecimiento` | Historial de crecimiento |
| `/api/panel/paciente/<id>/recordatorios` | Recordatorios activos |
| `/api/panel/graficos/<id>` | Visualizador de tendencias |
| `/api/panel/estadisticas` | Estadísticas globales |
| `/api/panel/usuarios` | Gestión de usuarios |
| `/api/panel/audit-logs` | Registro de auditoría |
| `/api/panel/export/*` | Exportación de reportes |

---

## 5. PLANTILLAS ([`templates/`](GlucoAmigo/templates/))

### 5.1 Estructura de plantillas
```
templates/
├── login.html                 # Página de inicio de sesión
├── index.html                 # Plantilla base SPA
├── selector.html              # Selector de perfil
├── portal_especialista.html   # Panel del especialista
├── portal_representante.html  # Panel del padre
├── portal_nino.html           # Interfaz del niño (gamificada)
├── components/               # Componentes reutilizables
│   ├── sidebar.html          # Navegación lateral
│   ├── topbar.html           # Barra superior
│   └── modals/               # Modales (editar usuario, etc.)
└── sections/                 # Secciones del SPA
    └── especialista/         # Secciones del panel especialista
        ├── sec_dashboard.html
        ├── sec_pacientes.html
        ├── sec_alertas.html
        └── sec_exportar.html
```

---

## 6. FRONTEND ([`static/js/`](GlucoAmigo/static/js/))

### 6.1 [`app.js`](GlucoAmigo/static/js/app.js)
**¿Qué es?** Aplicación JavaScript principal tipo SPA.

**Funcionalidades:**
- Navegación entre secciones sin recarga
- Carga de datos asíncrona (AJAX/Fetch)
- Integración con Socket.IO para alertas en tiempo real
- Validación de formularios
- Gráficos y visualizaciones

---

> 📝 **Nota:** Este documento es una guía de referencia rápida. Para información detallada sobre arquitectura, consulte [`ARQUITECTURA.md`](GlucoAmigo/docs/ARQUITECTURA.md).

---

> 👨‍💻 **Desarrollado por:** Cristian J Garcia | CI: 32.170.910 | Email: cjgarciag.dev@gmail.com
