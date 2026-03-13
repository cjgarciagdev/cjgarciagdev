# 📊 MÓDULOS AVANZADOS: Teoría de Grafos y Circuitos Lógicos

## 🔗 TEORÍA DE GRAFOS - Análisis Genealógico

### Descripción
Implementa análisis genealógico avanzado usando teoría de grafos para comprender relaciones familiares, consanguinidad y pureza genética en rebaños.

### Funcionalidades Principales

#### 1. **Árbol Genealógico Completo**
```
GET /api/grafo/genealogia/<animal_id>
```
Obtiene la estructura genealógica completa como grafo direccionado.

**Respuesta:**
```json
{
  "animal_central": 1,
  "nodos": [
    {"id": 1, "especie": "Bovino", "raza": "Holstein"},
    {"id": 2, "especie": "Bovino", "raza": "Jersey"}
  ],
  "enlaces": [
    {"origen": 2, "destino": 1, "relacion": "madre"}
  ],
  "estadisticas": {
    "total_nodos": 15,
    "total_enlaces": 14
  }
}
```

#### 2. **Cálculo de Consanguinidad**
```
POST /api/grafo/consanguinidad
```
Calcula el coeficiente de consanguinidad entre dos animales.

**Request:**
```json
{
  "animal1_id": 5,
  "animal2_id": 8
}
```

**Respuesta:**
```json
{
  "animal1_id": 5,
  "animal2_id": 8,
  "resultado": {
    "consanguinidad": 0.2500,
    "ancestros_comunes": 3,
    "riesgo_genetico": "Medio"
  }
}
```

#### 3. **Buscador de Rutas (Pathfinding)**
```
POST /api/grafo/camino
```
Encuentra el vínculo genealógico más corto entre dos animales cualesquiera, devolviendo los pasos intermedios y la relación (padre/madre/hijo).

**Request:**
```json
{
  "origen": 10,
  "destino": 15
}
```

**Respuesta:**
```json
{
  "distancia": 3,
  "existe": true,
  "pasos": [
    {"desde": 10, "hacia": 5, "relacion": "padre de"},
    {"desde": 5, "hacia": 2, "relacion": "padre de"},
    {"desde": 2, "hacia": 15, "relacion": "hijo de"}
  ]
}
```

#### 4. **Análisis de Línea Pura**
```
GET /api/grafo/linea-pura/<animal_id>
```
Analiza la pureza genealógica y consanguinidad del animal.

**Respuesta:**
```json
{
  "animal_id": 1,
  "linea_pura": {
    "pureza_lineal": 80.0,
    "generaciones_completas": 4,
    "rastreo_disponible": 14
  },
  "linea_completa": {
    "linea_completa": true,
    "padres_informacion": [...]
  },
  "inbreeding": {
    "coeficiente_inbreeding": 0.1250,
    "calidad_genealogia": "Buena",
    "ancestros_unicos": 12,
    "ancestros_esperados": 16
  }
}
```

#### 5. **Detección de Ciclos**
```
GET /api/grafo/ciclos
```
Detecta inconsistencias genealógicas (ciclos en el grafo).

**Respuesta:**
```json
{
  "tiene_ciclos": false,
  "ciclos_detectados": 0,
  "ciclos": []
}
```

#### 6. **Estadísticas del Grafo**
```
GET /api/grafo/estadisticas
```
Obtiene estadísticas generales del grafo genealógico completo.

**Respuesta:**
```json
{
  "total_animales": 150,
  "total_relaciones": 148,
  "ciclos_detectados": 0,
  "integridad_genealogica": "Sin ciclos"
}
```

---

## ⚡ CIRCUITOS LÓGICOS - Evaluación de Condiciones

### Descripción
Sistema de lógica booleana para evaluación de condiciones de salud, reproducción y manejo ganadero.

### Funcionalidades Principales

#### 1. **Evaluación de Expresiones Lógicas**
```
POST /api/logica/evaluar-expresion
```
Evalúa cualquier expresión lógica con variables personalizadas.

**Request:**
```json
{
  "expresion": "(peso > 200) and (edad >= 18)",
  "variables": {
    "peso": 350,
    "edad": 24
  }
}
```

**Respuesta:**
```json
{
  "expresion": "(peso > 200) and (edad >= 18)",
  "resultado": true,
  "variables_utilizadas": {
    "peso": 350,
    "edad": 24
  }
}
```

#### 2. **Generación de Tablas de Verdad**
```
POST /api/logica/tabla-verdad
```
Genera tabla de verdad completa para una expresión.

**Request:**
```json
{
  "variables": ["a", "b"],
  "expresion": "a and b"
}
```

**Respuesta:**
```json
{
  "expresion": "a and b",
  "variables": ["a", "b"],
  "tabla": [
    {"a": false, "b": false, "resultado": false},
    {"a": false, "b": true, "resultado": false},
    {"a": true, "b": false, "resultado": false},
    {"a": true, "b": true, "resultado": true}
  ],
  "total_combinaciones": 4
}
```

#### 3. **Evaluación de Salud Animal**
```
GET /api/logica/salud-animal/<animal_id>
```
Evalúa la salud del animal usando reglas lógicas automáticas.

**Respuesta:**
```json
{
  "animal_id": 1,
  "datos_animal": {
    "peso": 320,
    "edad": 8,
    "especie": "Bovino",
    "estado": "Saludable"
  },
  "evaluacion": {
    "severidad": "NORMAL",
    "reglas_activadas": [
      "nutricion_especial"
    ],
    "acciones": [
      "NUTRICIÓN: Requiere suplemento de crecimiento especial"
    ],
    "total_reglas": 6,
    "reglas_con_accion": 1
  }
}
```

#### 4. **Evaluación de Aptitud para Reproducción**
```
GET /api/logica/aptitud-cria/<animal_id>
```
Determina si un animal es apto para reproducción basado en múltiples criterios.

**Respuesta:**
```json
{
  "animal_id": 5,
  "resultado": {
    "apto_cria": true,
    "variables_evaluadas": {
      "peso": 450,
      "edad": 24,
      "estado_salud": "Saludable",
      "padres_conocidos": true,
      "score_genetico": 82
    }
  }
}
```

#### 5. **Evaluación de Reglas de Manejo**
```
POST /api/logica/manejo-reglas
```
Evalúa qué reglas de manejo aplican a situación específica.

**Request:**
```json
{
  "parametros": {
    "edad": 12,
    "peso": 300,
    "sexo": "Hembra"
  }
}
```

**Respuesta:**
```json
{
  "parametros": {
    "edad": 12,
    "peso": 300,
    "sexo": "Hembra"
  },
  "reglas_aplicables": [
    {
      "regla": "cambio_alojamiento",
      "descripcion": "Animal listo para cambio a área de crecimiento"
    }
  ],
  "total": 1
}
```

#### 6. **Detector de Problemas de Consanguinidad**
```
GET /api/logica/detector-problemas/<animal_id>
```
Detecta riesgos genéticos por consanguinidad.

**Respuesta:**
```json
{
  "animal_id": 3,
  "inbreeding": {
    "coeficiente_inbreeding": 0.3500,
    "calidad_genealogia": "Regular",
    "ancestros_unicos": 8,
    "ancestros_esperados": 16
  },
  "riesgo_consanguinidad": {
    "tiene_riesgo": true,
    "nivel_riesgo": "ALTO",
    "coeficiente": 0.35,
    "recomendacion": "Evitar cruces"
  }
}
```

#### 7. **Listar Reglas Disponibles**
```
GET /api/logica/reglas-disponibles
```
Lista todas las reglas de manejo disponibles en el sistema.

**Respuesta:**
```json
{
  "total_reglas": 5,
  "reglas": [
    {
      "nombre": "cambio_alojamiento",
      "condicion": "edad >= 12",
      "descripcion": "Animal listo para cambio a área de crecimiento"
    },
    {
      "nombre": "venta_preparacion",
      "condicion": "peso >= 450 and edad >= 24",
      "descripcion": "Animal apto para venta/mercado"
    },
    {
      "nombre": "retiro_reproduccion",
      "condicion": "edad >= 60 or peso < 200",
      "descripcion": "Animal recomendado retirar de reproducción"
    },
    {
      "nombre": "revision_veterinaria_urgente",
      "condicion": "peso < 50 or estado == 'Crítico'",
      "descripcion": "Requiere revisión veterinaria inmediata"
    },
    {
      "nombre": "inicio_ordeño",
      "condicion": "edad >= 24 and sexo == 'Hembra'",
      "descripcion": "Hembra lista para iniciar ordeño"
    }
  ]
}
```

---

## 🧮 VARIABLES SOPORTADAS EN EXPRESIONES LÓGICAS

### Tipos de Datos
- **Números**: peso, edad, score
- **Strings**: especie, raza, estado, sexo
- **Booleanos**: padres_conocidos, linea_completa

### Operadores Soportados
- **Comparación**: `<`, `>`, `==`, `<=`, `>=`, `!=`
- **Lógicos**: `and`, `or`, `not`
- **Agrupación**: `(`, `)`

### Ejemplos de Expresiones

```javascript
// Bajo peso
"peso < 100"

// Edad para reproducción
"edad >= 18 and peso > 300"

// Crítico
"estado == 'Crítico' or peso < 50"

// Apto para venta
"peso >= 450 and edad >= 24 and estado != 'Crítico'"

// Cría selectiva
"padres_conocidos and score_genetico > 75"
```

---

## 📈 CASOS DE USO

### Caso 1: Evaluación de Consanguinidad Previa al Cruce
```bash
curl -X POST http://localhost:5000/api/grafo/consanguinidad \
  -H "Content-Type: application/json" \
  -d '{"animal1_id": 5, "animal2_id": 8}'
```

Si retorna `riesgo_genetico: Alto`, evitar cruce.

### Caso 2: Determinar Animales Aptos para Reproducción
```bash
curl http://localhost:5000/api/logica/aptitud-cria/10
```

Si `apto_cria: true`, incluir en programa de cría.

### Caso 3: Evaluación de Salud Automática
```bash
curl http://localhost:5000/api/logica/salud-animal/7
```

Si `severidad: CRÍTICO`, derivar a veterinario inmediatamente.

### Caso 4: Toma de Decisiones de Manejo
```bash
curl -X POST http://localhost:5000/api/logica/manejo-reglas \
  -H "Content-Type: application/json" \
  -d '{"parametros": {"edad": 24, "peso": 450, "sexo": "Hembra"}}'
```

Implementar las acciones recomendadas.

---

## 🔬 ALGORITMOS UTILIZADOS

### Teoría de Grafos
- **BFS (Breadth-First Search)**: Buscar caminos más cortos
- **DFS (Depth-First Search)**: Detectar ciclos
- **Algoritmo de Floyd-Warshall**: Distancias entre nodos
- **Análisis de Nodos**: Detección de ancestros comunes

### Circuitos Lógicos
- **Evaluación Booleana**: Expresiones AND, OR, NOT
- **Tablas de Verdad**: Todas las combinaciones posibles
- **Sistema de Reglas**: Inferencia basada en condiciones
- **Simplificación**: Álgebra booleana básica

---

**Última actualización**: Febrero 2026
**Versión**: 3.1 - Teoría de Grafos y Circuitos Lógicos Avanzados
