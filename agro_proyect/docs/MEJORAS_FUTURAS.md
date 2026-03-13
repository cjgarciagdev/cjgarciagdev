# Roadmap de Innovación: Agro-Master Vision 2027
> **OBJETIVO DEL DOCUMENTO:** Proyectar la evolución del sistema para convertirlo en una herramienta de vanguardia en la Ganadería de Precisión.

---

## 1. Inteligencia Artificial (Soporte de Decisión)
*   **Gemelo Digital Animal**
    *   **¿Por qué?**: Predecir el peso de un animal a 6 meses permite planificar las ventas y asegurar contratos antes de que el animal esté listo.
    *   **¿Cómo?**: Mediante redes neuronales recurrentes (RNN) entrenadas con los datos históricos de pesaje que el usuario ya está cargando hoy.
*   **Diagnóstico por Imagen**
    *   **¿Por qué?**: Identificar lesiones o enfermedades de la piel sin contacto humano reduce el estrés del animal y libera tiempo del veterinario.
    *   **¿Cómo?**: Integrando modelos de TensorFlow Lite que analicen fotos capturadas por cámaras en los bebederos automáticos.

---

## 2. Ecosistema IoT (Sensores en Campo)
*   **Básculas de Pasaje RFID**
    *   **¿Por qué?**: Eliminar el error humano y el estrés del animal al moverlo a una báscula manual.
    *   **¿Cómo?**: Usando lectores RFID que identifiquen el arete del animal y envíen el peso vía Bluetooth/Wi-Fi directamente a la base de datos SQLite.
*   **Monitoreo Biométrico (Collares)**
    *   **¿Por qué?**: Detectar celo o fiebre instantáneamente para actuar antes de que el problema escale.
    *   **¿Cómo?**: Implementando el protocolo MQTT para recibir señales de baja frecuencia de collares inteligentes.

---

## 3. Infraestructura Híbrida (Nube + Local)
*   **¿Por qué?**: El dueño de la finca necesita ver los reportes desde la ciudad, mientras que el operario necesita trabajar sin internet en la montaña.
*   **¿Cómo?**: Desarrollando un sistema de **Sincronización Incremental**. El sistema local guardará los cambios y, apenas detecte conexión, los enviará a un servidor central en la nube.

---

## 4. Trazabilidad con Blockchain
*   **¿Por qué?**: Garantizar al comprador final que el animal nunca fue tratado con hormonas prohibidas y que su origen es 100% legal e inmutable.
*   **¿Cómo?**: Generando un **Hash Único** por cada evento médico. Estos hashes se escribirán en una red descentralizada para que sean imposibles de alterar por humanos.

---

## 5. Calendario Estratégico
*   **T3 2026**: Módulo de Costos y ROI. (¿Por qué? Para saber cuánto dinero neto deja cada animal).
*   **T1 2027**: App Móvil Nativa (¿Cómo? Mediante React Native para acceso táctil rápido).

---

## 6. Seguridad y Autenticación Avanzada

### ✅ **IMPLEMENTADO - Sistema de Recuperación de Contraseñas**
*   **¿Qué se implementó?**
    *   Recuperación diferenciada por tipo de usuario:
        - **Administradores**: Preguntas de seguridad personalizadas
        - **Usuarios normales**: Contraseñas temporales con cambio obligatorio
    *   Modal de configuración de preguntas de seguridad para admin
    *   Flujo completo de recuperación con validación
    *   Normalización de respuestas (case-insensitive)

### 🔮 **Mejoras Futuras de Seguridad**
*   **Autenticación de Dos Factores (2FA)**
    *   **¿Por qué?**: Proteger cuentas administrativas de accesos no autorizados
    *   **¿Cómo?**: Integración con Google Authenticator o SMS OTP
*   **Notificaciones por Email**
    *   **¿Por qué?**: Enviar contraseñas temporales de forma segura en lugar de mostrarlas en pantalla
    *   **¿Cómo?**: Integración con SendGrid o servicio SMTP
*   **Expiración de Contraseñas Temporales**
    *   **¿Por qué?**: Limitar el tiempo de validez de contraseñas temporales (24-48h)
    *   **¿Cómo?**: Campo `fecha_expiracion_temporal` en modelo Usuario
*   **Límite de Intentos Fallidos**
    *   **¿Por qué?**: Prevenir ataques de fuerza bruta
    *   **¿Cómo?**: Sistema de bloqueo temporal después de 5 intentos fallidos
*   **Auditoría de Recuperación**
    *   **¿Por qué?**: Registrar todos los intentos de recuperación para detectar actividad sospechosa
    *   **¿Cómo?**: Tabla `RecuperacionLog` con timestamp, IP, resultado

---
> 🚀 **Visión:** Agro-Master evoluciona de ser un registro de datos a ser el cerebro operativo de la ganadería moderna.
