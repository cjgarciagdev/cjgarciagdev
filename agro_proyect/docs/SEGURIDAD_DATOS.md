# 🔐 Seguridad de Datos - Sistema de Autenticación AGRO-MASTER

## 📋 Resumen Ejecutivo

El sistema AGRO-MASTER implementa **encriptación robusta** para todos los datos sensibles de autenticación, garantizando que ninguna contraseña o respuesta de seguridad se almacene en texto plano.

---

## 🔒 Datos Encriptados en la Base de Datos

### 1. **Contraseñas de Usuario** ✅ ENCRIPTADAS

**Algoritmo**: PBKDF2-SHA256  
**Campo en BD**: `password_hash`  
**Tipo**: String(255)

#### ¿Cómo funciona?

```python
# Al crear/cambiar contraseña
usuario.set_password("miContraseña123")
# Se guarda: pbkdf2:sha256:600000$abc123xyz$hash_muy_largo...

# Al verificar login
usuario.check_password("miContraseña123")  # True
usuario.check_password("incorrecta")       # False
```

#### Características de Seguridad:

- ✅ **Irreversible**: No se puede obtener la contraseña original del hash
- ✅ **Salt único**: Cada contraseña tiene un "salt" aleatorio único
- ✅ **600,000 iteraciones**: Hace muy lento cualquier ataque de fuerza bruta
- ✅ **SHA-256**: Algoritmo criptográfico de grado militar

**Ejemplo en BD:**
```
password_hash: "pbkdf2:sha256:600000$KjH8mN2p$e4a5c8f9d2b1a3e6f7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0"
```

---

### 2. **Respuestas de Seguridad** ✅ ENCRIPTADAS (ACTUALIZADO)

**Algoritmo**: PBKDF2-SHA256 (mismo que contraseñas)  
**Campo en BD**: `respuesta_seguridad`  
**Tipo**: String(255)

#### ¿Cómo funciona?

```python
# Al configurar pregunta de seguridad
usuario.set_respuesta_seguridad("Firulais")
# 1. Normaliza: "firulais" (lowercase, trim)
# 2. Encripta: pbkdf2:sha256:600000$xyz789abc$hash_largo...

# Al verificar respuesta
usuario.check_respuesta_seguridad("FIRULAIS")  # True (normaliza y verifica)
usuario.check_respuesta_seguridad("Firulais")  # True
usuario.check_respuesta_seguridad("firulais")  # True
usuario.check_respuesta_seguridad("Otro")      # False
```

#### Características de Seguridad:

- ✅ **Encriptada**: Mismo nivel de seguridad que las contraseñas
- ✅ **Normalización**: Convierte a minúsculas antes de encriptar
- ✅ **Case-insensitive**: "Firulais", "FIRULAIS", "firulais" son iguales
- ✅ **Irreversible**: Imposible recuperar la respuesta original

**Ejemplo en BD:**
```
pregunta_seguridad: "¿Cuál es el nombre de tu primera mascota?"
respuesta_seguridad: "pbkdf2:sha256:600000$Lm9pQ4r$a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
```

---

### 3. **Preguntas de Seguridad** ⚠️ TEXTO PLANO (No Sensible)

**Campo en BD**: `pregunta_seguridad`  
**Tipo**: String(255)

#### ¿Por qué NO está encriptada?

La pregunta NO es sensible porque:
- Se muestra al usuario durante la recuperación
- No contiene información privada
- Es necesaria para el flujo de recuperación

**Ejemplo en BD:**
```
pregunta_seguridad: "¿Cuál es el nombre de tu primera mascota?"
```

---

## 🗄️ Estructura de la Tabla Usuario

```sql
CREATE TABLE usuario (
    id INTEGER PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    
    -- ENCRIPTADO: Hash PBKDF2-SHA256
    password_hash VARCHAR(255) NOT NULL,
    
    -- TEXTO PLANO: No sensible, necesario para mostrar
    pregunta_seguridad VARCHAR(255),
    
    -- ENCRIPTADO: Hash PBKDF2-SHA256
    respuesta_seguridad VARCHAR(255),
    
    nombre_completo VARCHAR(200),
    rol VARCHAR(50),
    activo BOOLEAN,
    cambio_password_requerido BOOLEAN,
    ...
);
```

---

## 🔐 Algoritmo PBKDF2-SHA256 Explicado

### ¿Qué es PBKDF2?

**PBKDF2** = Password-Based Key Derivation Function 2

Es un algoritmo diseñado específicamente para:
1. Derivar claves criptográficas de contraseñas
2. Hacer muy lento el proceso de verificación (contra fuerza bruta)
3. Usar "salt" único para cada contraseña

### Componentes del Hash

```
pbkdf2:sha256:600000$KjH8mN2p$e4a5c8f9d2b1a3e6f7c8d9e0f1a2b3c4...
  │      │       │        │         │
  │      │       │        │         └─ Hash final (derivado)
  │      │       │        └─────────── Salt único (aleatorio)
  │      │       └──────────────────── Iteraciones (600,000)
  │      └──────────────────────────── Algoritmo hash (SHA-256)
  └─────────────────────────────────── Método (PBKDF2)
```

### ¿Por qué 600,000 iteraciones?

- Cada verificación toma ~100-200ms (imperceptible para usuario)
- Un atacante necesitaría **años** para probar millones de combinaciones
- Protege contra ataques de fuerza bruta y rainbow tables

---

## 🛡️ Niveles de Protección

### Nivel 1: Encriptación en Reposo

```
Base de Datos SQLite
├─ password_hash: "pbkdf2:sha256:600000$..."  ✅ ENCRIPTADO
├─ respuesta_seguridad: "pbkdf2:sha256:600000$..."  ✅ ENCRIPTADO
└─ pregunta_seguridad: "¿Nombre de mascota?"  ⚠️ TEXTO PLANO (OK)
```

### Nivel 2: Transmisión (HTTPS Recomendado)

```
Cliente (Navegador)
    │
    ├─ HTTPS (SSL/TLS) ─────┐  ✅ Recomendado en producción
    │                        │
    └─ HTTP ─────────────────┤  ⚠️ Solo para desarrollo local
                             │
                        Servidor Flask
```

### Nivel 3: Validación en Código

```python
# Nunca se comparan contraseñas en texto plano
❌ if usuario.password == "admin123":  # MAL - Nunca hacer esto

✅ if usuario.check_password("admin123"):  # BIEN - Usa hash
```

---

## 🔍 Comparación: Antes vs Después

### ANTES (Versión Inicial) ⚠️

```python
# Respuestas en texto plano
respuesta_seguridad: "firulais"  # ❌ INSEGURO
```

**Problema**: Si alguien accede a la base de datos, puede ver todas las respuestas.

### DESPUÉS (Versión Mejorada) ✅

```python
# Respuestas encriptadas
respuesta_seguridad: "pbkdf2:sha256:600000$..."  # ✅ SEGURO
```

**Beneficio**: Incluso con acceso a la BD, las respuestas son ilegibles.

---

## 🧪 Prueba de Seguridad

### Test 1: Verificar Encriptación de Contraseñas

```python
from app import create_app
from models import Usuario, db

app = create_app()
with app.app_context():
    # Crear usuario
    usuario = Usuario(username="test", email="test@test.com")
    usuario.set_password("MiPassword123")
    
    # Verificar que NO se guarda en texto plano
    print(usuario.password_hash)
    # Output: pbkdf2:sha256:600000$abc123$hash_largo...
    
    # Verificar que la verificación funciona
    print(usuario.check_password("MiPassword123"))  # True
    print(usuario.check_password("Incorrecta"))     # False
```

### Test 2: Verificar Encriptación de Respuestas

```python
# Configurar respuesta
usuario.set_respuesta_seguridad("Firulais")

# Verificar que NO se guarda en texto plano
print(usuario.respuesta_seguridad)
# Output: pbkdf2:sha256:600000$xyz789$hash_largo...

# Verificar que la verificación funciona (case-insensitive)
print(usuario.check_respuesta_seguridad("Firulais"))   # True
print(usuario.check_respuesta_seguridad("FIRULAIS"))   # True
print(usuario.check_respuesta_seguridad("firulais"))   # True
print(usuario.check_respuesta_seguridad("Otro"))       # False
```

---

## 📊 Tabla Comparativa de Seguridad

| Dato | Almacenamiento | Algoritmo | Reversible | Nivel de Seguridad |
|------|---------------|-----------|------------|-------------------|
| **Contraseña** | Hash | PBKDF2-SHA256 | ❌ No | 🔴 Crítico |
| **Respuesta Seguridad** | Hash | PBKDF2-SHA256 | ❌ No | 🔴 Crítico |
| **Pregunta Seguridad** | Texto Plano | N/A | ✅ Sí | 🟢 Bajo (No sensible) |
| **Username** | Texto Plano | N/A | ✅ Sí | 🟡 Medio (Público) |
| **Email** | Texto Plano | N/A | ✅ Sí | 🟡 Medio (Contacto) |

---

## 🚨 Escenarios de Ataque y Protección

### Escenario 1: Acceso a la Base de Datos

**Ataque**: Un atacante obtiene el archivo `ganado.db`

**Protección**:
- ✅ No puede ver contraseñas (están hasheadas)
- ✅ No puede ver respuestas de seguridad (están hasheadas)
- ⚠️ Puede ver usernames y emails (no sensibles)
- ⚠️ Puede ver preguntas de seguridad (necesarias para el sistema)

**Resultado**: El atacante NO puede iniciar sesión ni recuperar cuentas.

### Escenario 2: Ataque de Fuerza Bruta

**Ataque**: Intentar millones de combinaciones de contraseñas

**Protección**:
- ✅ 600,000 iteraciones hacen cada intento muy lento (~100ms)
- ✅ Salt único previene rainbow tables
- ✅ Hash irreversible

**Cálculo**:
```
1 millón de intentos × 100ms = 100,000 segundos = 27.7 horas
1 billón de intentos = 3,170 años
```

### Escenario 3: Inyección SQL

**Ataque**: Intentar inyectar código SQL malicioso

**Protección**:
- ✅ SQLAlchemy usa consultas parametrizadas
- ✅ Validación de entrada en formularios
- ✅ Escape automático de caracteres especiales

---

## 🔄 Migración de Datos Existentes

Si ya tienes respuestas de seguridad en texto plano, ejecuta:

```python
from app import create_app
from models import Usuario, db

app = create_app()
with app.app_context():
    # Obtener usuarios con respuestas en texto plano
    usuarios = Usuario.query.filter(
        Usuario.respuesta_seguridad.isnot(None),
        ~Usuario.respuesta_seguridad.like('pbkdf2:%')
    ).all()
    
    for usuario in usuarios:
        # Guardar respuesta actual
        respuesta_plana = usuario.respuesta_seguridad
        
        # Re-encriptar usando el nuevo método
        usuario.set_respuesta_seguridad(respuesta_plana)
        
        print(f"✅ Migrado: {usuario.username}")
    
    db.session.commit()
    print(f"\n✅ {len(usuarios)} respuestas migradas a formato encriptado")
```

---

## ✅ Checklist de Seguridad

### Datos en Reposo (Base de Datos)
- [x] Contraseñas encriptadas con PBKDF2-SHA256
- [x] Respuestas de seguridad encriptadas con PBKDF2-SHA256
- [x] Salt único por cada hash
- [x] 600,000 iteraciones PBKDF2

### Datos en Tránsito
- [ ] HTTPS/SSL en producción (Recomendado)
- [x] Validación de entrada en formularios
- [x] Protección contra inyección SQL

### Código
- [x] Nunca comparar contraseñas en texto plano
- [x] Usar métodos de verificación seguros
- [x] Normalización de respuestas antes de hashear
- [x] Validación de roles y permisos

---

## 📚 Referencias

- **PBKDF2**: [RFC 8018](https://tools.ietf.org/html/rfc8018)
- **SHA-256**: [FIPS 180-4](https://csrc.nist.gov/publications/detail/fips/180/4/final)
- **Werkzeug Security**: [Documentación](https://werkzeug.palletsprojects.com/en/2.0.x/utils/#module-werkzeug.security)

---

## 🎯 Conclusión

El sistema AGRO-MASTER implementa **seguridad de grado empresarial** para todos los datos de autenticación:

✅ **Contraseñas**: PBKDF2-SHA256 con 600,000 iteraciones  
✅ **Respuestas de Seguridad**: PBKDF2-SHA256 con 600,000 iteraciones  
✅ **Salt Único**: Cada hash tiene su propio salt aleatorio  
✅ **Irreversible**: Imposible obtener datos originales del hash  

**Resultado**: Incluso si un atacante obtiene acceso a la base de datos, NO puede:
- Ver contraseñas
- Ver respuestas de seguridad
- Iniciar sesión como otro usuario
- Recuperar cuentas ajenas

---

**Versión**: 2.0 (Mejorada)  
**Fecha**: 2026-01-30  
**Estado**: ✅ Seguridad Empresarial Implementada
