"""
Módulo de Circuitos Lógicos para evaluación de condiciones de salud y manejo ganadero.
Implementa expresiones booleanas, tablas de verdad y reglas de inferencia.
"""

class CircuitoLogico:
    """
    MOTOR DE INFERENCIA LÓGICA (BOOLEANA):
    Esta clase actúa como el 'cerebro' de decisiones automatizadas del sistema.
    Permite evaluar condiciones complejas (Expresiones) sobre un conjunto de datos (Variables).
    
    Capacidades:
    - Evaluación de predicados (and, or, not).
    - Gestión de Reglas de Inferencia (IF condition THEN action).
    - Generación de Tablas de Verdad para Auditoría Genética.
    
    Uso: Se utiliza para detectar alertas de salud, aptitud reproductiva y 
    alertas de manejo de forma dinámica sin reprogramar el núcleo del sistema.
    """
    
    def __init__(self):
        self.variables = {}
        self.reglas = {}
    
    
    def establecer_variable(self, nombre, valor):
        """
        Define una variable para ser utilizada en la evaluación lógica.
        
        Args:
            nombre (str): Nombre de la variable.
            valor (any): Valor de la variable (int, float, str, bool).
        """
        self.variables[nombre] = valor
    
    
    def establecer_variables(self, dict_variables):
        """
        Define múltiples variables simultáneamente desde un diccionario.
        
        Args:
            dict_variables (dict): Diccionario con nombres y valores.
        """
        self.variables.update(dict_variables)
    
    
    def evaluar_expresion(self, expresion):
        """
        Evalúa una expresión lógica utilizando las variables definidas en la instancia.
        Soporta operadores básicos: and, or, not, <, >, ==, <=, >=, !=.
        Realiza una sustitución segura de variables antes de evaluar.
        
        Args:
            expresion (str): Cadena con la expresión lógica (ej. "edad > 5 and peso < 100").
            
        Returns:
            dict: Resultado de la evaluación o detalles del error.
        """
        try:
            import re
            # Reemplazar nombres de variables con sus valores de forma segura (palabras completas)
            expr_evaluable = expresion
            
            # Ordenar variables por longitud descendente para evitar reemplazos parciales si no se usara regex,
            # pero con regex \b es más seguro.
            for var in sorted(self.variables.keys(), key=len, reverse=True):
                valor = self.variables[var]
                # Manejar strings y números para la sustitución
                if isinstance(valor, str):
                    sustitucion = f"'{valor}'"
                else:
                    sustitucion = str(valor)
                
                # Usar límites de palabra (\b) para asegurar que solo reemplazamos la variable exacta
                expr_evaluable = re.sub(r'\b' + re.escape(var) + r'\b', sustitucion, expr_evaluable)
            
            # Evaluar expresión de forma segura
            # Nota: Python eval es potente pero debe usarse con cuidado.
            # Aquí las variables están controladas.
            resultado = eval(expr_evaluable)
            return {
                'expresion': expresion,
                'resultado': bool(resultado),
                'variables_utilizadas': self.variables.copy()
            }
        except Exception as e:
            return {
                'expresion': expresion,
                'resultado': None,
                'error': str(e)
            }
    
    def crear_tabla_verdad(self, variables_entrada, expresion):
        """
        Generar tabla de verdad para una expresión lógica.
        
        Args:
            variables_entrada: Lista de nombres de variables
            expresion: Expresión lógica a evaluar
        
        Returns:
            Tabla de verdad con todas las combinaciones
        """
        n_vars = len(variables_entrada)
        n_combinaciones = 2 ** n_vars
        tabla = []
        
        for i in range(n_combinaciones):
            # Generar combinación binaria
            binario = format(i, f'0{n_vars}b')
            
            # Asignar variables
            valores = {}
            for j, var in enumerate(variables_entrada):
                valores[var] = bool(int(binario[j]))
            
            # Construir expresión evaluable
            expr_evaluable = expresion
            # Reemplazar variables de forma inteligente (mayores primero para evitar conflictos)
            for var in sorted(valores.keys(), key=len, reverse=True):
                valor = valores[var]
                # Usar regex para reemplazar solo palabras completas
                import re
                expr_evaluable = re.sub(r'\b' + var + r'\b', str(valor), expr_evaluable)
            
            try:
                resultado = eval(expr_evaluable)
            except Exception as e:
                resultado = None
            
            # Agregar fila a tabla
            fila = {**valores, 'resultado': resultado}
            tabla.append(fila)
        
        return {
            'expresion': expresion,
            'variables': variables_entrada,
            'tabla': tabla,
            'total_combinaciones': n_combinaciones
        }
    
    def agregar_regla(self, nombre, condicion, accion):
        """
        Agregar regla de inferencia (if-then).
        
        Args:
            nombre: Nombre descriptivo de la regla
            condicion: Expresión lógica (str)
            accion: Descripción de la acción si es verdadera (str)
        """
        self.reglas[nombre] = {
            'condicion': condicion,
            'accion': accion,
            'activada': False
        }
    
    
    def evaluar_reglas(self):
        """
        Itera sobre todas las reglas registradas y evalúa sus condiciones.
        Actualiza el estado 'activada' de cada regla.
        
        Returns:
            list: Lista de diccionarios con los resultados de cada regla.
        """
        resultados = []
        
        for nombre, regla in self.reglas.items():
            evaluacion = self.evaluar_expresion(regla['condicion'])
            self.reglas[nombre]['activada'] = evaluacion['resultado']
            
            resultados.append({
                'regla': nombre,
                'condicion': regla['condicion'],
                'activada': evaluacion['resultado'],
                'accion': regla['accion'] if evaluacion['resultado'] else None
            })
        
        return resultados
    
    def simplificar_expresion(self, expresion):
        """
        Simplificar expresión lógica aplicando leyes de algebra booleana.
        Versión simple que aplica reglas comunes.
        """
        resultado = expresion
        
        # Aplicar simplificaciones comunes
        simplificaciones = [
            ('(True and ', '('),
            ('(False and ', '(False'),
            ('(True or ', '(True'),
            ('(False or ', '('),
            ('not True', 'False'),
            ('not False', 'True'),
        ]
        
        for patron, reemplazo in simplificaciones:
            resultado = resultado.replace(patron, reemplazo)
        
        return resultado


class EvaluadorSaludAnimal:
    """
    EVALUADOR BIO-FISIOLÓGICO:
    Especialización del motor lógico configurado con el protocolo médico de la finca.
    
    Funcionamiento:
    1. Carga los parámetros vitales del animal (Edad, Peso, Especie, Estado).
    2. Ejecuta una batería de reglas pre-cargadas (Crianza, Vacunación, Reproducción).
    3. Clasifica el resultado en niveles de SEVERIDAD (Crítico, Alerta, Normal).
    
    Propósito: Automatizar el triaje veterinario y asegurar que ningún animal 
    pierda sus ciclos de vacunación o monitoreo crítico.
    """
    
    def __init__(self, peso, edad_meses, especie, estado_general, sexo="Desconocido"):
        """
        Inicializa el evaluador con los datos del animal.
        Configura las variables y carga las reglas específicas.
        
        Variables de Entrada:
        - peso: Peso vivo actual del animal.
        - edad: Edad cronológica en meses.
        - especie: Categoría taxonómica (Bovino, Ovino, etc).
        - estado: Condición fisiológica (Saludable, Gestante, etc).
        """
        self.circuito = CircuitoLogico()
        self.circuito.establecer_variables({
            'peso': peso,
            'edad': edad_meses,
            'especie': especie,
            'estado': estado_general,
            'sexo': sexo
        })
        self._crear_reglas_salud()
    
    def _crear_reglas_salud(self):
        """Crear reglas de salud específicas para animales, diferenciadas por especie"""
        
        # --- REGLAS GENERALES Y CRÍTICAS ---
        self.circuito.agregar_regla(
            'bajo_peso',
            'peso < 100 and edad > 6', # Ajustado para no alertar en recién nacidos prematuramente
            'ALERTA: Animal por debajo del peso esperado. Revisar alimentación'
        )
        
        self.circuito.agregar_regla(
            'estado_critico',
            "estado == 'Crítico' or (peso < 50 and edad > 3)",
            'EMERGENCIA: Animal en estado crítico. Requiere atención veterinaria inmediata'
        )

        # --- REGLAS DE SANIDAD (VACUNACIÓN Y PURGA) ---
        self.circuito.agregar_regla(
            'desparasitacion_requerida',
            'edad == 3 or edad == 6 or edad == 12',
            'PROTOCOLO: Desparasitación recomendada (3, 6, 12 meses)'
        )

        self.circuito.agregar_regla(
            'vacuna_aftosa',
            '(edad == 6 or edad == 12) and (especie == "Bovino" or especie == "Porcino")',
            'PROTOCOLO: Vacunación Aftosa requerida (Ciclo semestral)'
        )
        
        self.circuito.agregar_regla(
            'vacuna_brucelosis',
            'edad >= 3 and edad <= 8 and sexo == "Hembra" and especie == "Bovino"',
            'PROTOCOLO: Vacunación Brucelosis (Hembras 3-8 meses)'
        )

        # --- REGLAS REPRODUCTIVAS POR ESPECIE ---
        # Bovino
        self.circuito.agregar_regla(
            'edad_reproductiva_bovino',
            "especie == 'Bovino' and edad >= 15 and peso >= 320 and sexo == 'Hembra'",
            'OPORTUNIDAD: Hembra Bovino apta para primer servicio (>15 meses, >320kg)'
        )
        
        self.circuito.agregar_regla(
            'macho_reproduc_bovino',
            "especie == 'Bovino' and edad >= 24 and peso >= 450 and sexo == 'Macho'",
            'OPORTUNIDAD: Macho Bovino apto para reproducción controlada'
        )

        # Ovino / Caprino
        self.circuito.agregar_regla(
            'edad_reproductiva_ovino_caprino',
            "(especie == 'Ovino' or especie == 'Caprino') and edad >= 8 and peso >= 35 and sexo == 'Hembra'",
            'OPORTUNIDAD: Pequeña rumiante apta para primer encaste'
        )

        # Porcino
        self.circuito.agregar_regla(
            'edad_reproductiva_porcino',
            "especie == 'Porcino' and edad >= 7 and peso >= 105 and sexo == 'Hembra'",
            'OPORTUNIDAD: Porcino hembra lista para inseminación'
        )
        
        # Equino
        self.circuito.agregar_regla(
            'edad_reproductiva_equino',
            "especie == 'Equino' and edad >= 36 and sexo == 'Hembra'", # 3 años
            'OPORTUNIDAD: Yegua madura para cría'
        )

        # --- REGLAS DE MANEJO ESPECÍFICO ---
        self.circuito.agregar_regla(
            'destete_sugerido_bovino',
            "especie == 'Bovino' and edad >= 7 and edad <= 9",
            'MANEJO: Ventana ideal de destete tradicional (7-9 meses)'
        )

        self.circuito.agregar_regla(
            'alerta_senescencia',
            "(especie == 'Bovino' and edad > 120) or (especie == 'Porcino' and edad > 48)",
            'ALERTA: Animal en edad de descarte. Productividad decreciente'
        )

        self.circuito.agregar_regla(
            'riesgo_estres_termico',
            "estado == 'Saludable' and peso > 500 and especie == 'Bovino' and sexo == 'Macho'",
            'MANEJO: Riesgo de estrés térmico en padrotes pesados. Asegurar sombra'
        )
        
        # --- REGLAS DE NUTRICIÓN Y CRECIMIENTO ---
        self.circuito.agregar_regla(
            'inicio_suplementacion',
            'edad >= 2 and edad <= 6',
            'NUTRICIÓN: Iniciar suplementación proteica fase crecimiento'
        )
    
    
    def evaluar_salud(self):
        """
        Ejecuta la evaluación de todas las reglas de salud.
        Determina la severidad global (CRÍTICO, ALERTA, NORMAL) basada en las reglas activadas.
        
        Returns:
            dict: Resumen del estado de salud, reglas activadas y acciones de recomendadas.
        """
        reglas_activadas = self.circuito.evaluar_reglas()
        
        # Clasificar severidad
        acciones_criticas = [r for r in reglas_activadas if r['activada'] and 'EMERGENCIA' in (r['accion'] or '')]
        acciones_alerta = [r for r in reglas_activadas if r['activada'] and 'ALERTA' in (r['accion'] or '')]
        acciones_protocolos = [r for r in reglas_activadas if r['activada'] and 'PROTOCOLO' in (r['accion'] or '')]
        
        severidad = 'CRÍTICO' if acciones_criticas else 'ALERTA' if acciones_alerta else 'NORMAL'
        
        return {
            'severidad': severidad,
            'reglas_activadas': [r['regla'] for r in reglas_activadas if r['activada']],
            'acciones': [r['accion'] for r in reglas_activadas if r['activada'] and r['accion']],
            'total_reglas': len(reglas_activadas),
            'reglas_con_accion': len([r for r in reglas_activadas if r['activada']])
        }


class AnalizadorGeneticoLogico:
    """Analizador de aptitud genética usando lógica booleana"""
    
    def __init__(self):
        self.circuito = CircuitoLogico()
    
    def evaluar_aptitud_cria(self, animal_data):
        """
        Evaluar si un animal es apto para reproducción basado en múltiples criterios.
        
        Args:
            animal_data: Dict con datos del animal
        """
        variables = {
            'peso': animal_data.get('peso', 0),
            'edad': animal_data.get('edad', 0),
            'estado_salud': animal_data.get('estado', 'Desconocido'),
            'padres_conocidos': animal_data.get('padre_id') and animal_data.get('madre_id'),
            'score_genetico': animal_data.get('score_genetico', 0)
        }
        
        self.circuito.establecer_variables(variables)
        
        # Condiciones para apto de cría
        es_apto = self.circuito.evaluar_expresion(
            'edad >= 18 and peso > 300 and estado_salud != "Crítico" and padres_conocidos and score_genetico > 70'
        )
        
        return {
            'apto_cria': es_apto['resultado'],
            'variables_evaluadas': variables,
            'expresion': es_apto['expresion']
        }
    
    def detectar_problemas_consanguinidad(self, coeficiente_inbreeding):
        """Detectar problemas de consanguinidad"""
        self.circuito.establecer_variable('inbreeding', coeficiente_inbreeding)
        
        evaluacion = self.circuito.evaluar_expresion(
            'inbreeding > 0.3'
        )
        
        riesgo = 'ALTO' if evaluacion['resultado'] else 'BAJO'
        
        return {
            'tiene_riesgo': evaluacion['resultado'],
            'nivel_riesgo': riesgo,
            'coeficiente': coeficiente_inbreeding,
            'recomendacion': 'Evitar cruces' if evaluacion['resultado'] else 'Cruce permitido'
        }

    def evaluar_compatibilidad_cruce(self, macho, hembra):
        """
        Evalúa si un cruce entre dos animales es viable genéticamente.
        """
        if macho['sexo'] == hembra['sexo']:
             return {'viable': False, 'razon': 'Mismo sexo'}

        circuito = CircuitoLogico()
        variables = {
            'macho_raza': macho['raza'],
            'hembra_raza': hembra['raza'],
            'macho_especie': macho['especie'],
            'hembra_especie': hembra['especie'],
            'macho_score': macho.get('score_genetico', 0),
            'hembra_score': hembra.get('score_genetico', 0),
            'parentesco': 0 # Idealmente calcular parentesco real
        }
        circuito.establecer_variables(variables)

        # Regla 1: Misma especie
        especie_ok = circuito.evaluar_expresion('macho_especie == hembra_especie')
        if not especie_ok['resultado']:
             return {'viable': False, 'razon': 'Especies incompatibles'}

        # Regla 2: Vigor híbrido (Cruce de razas distintas suele ser bueno para carne)
        vigor_hibrido = circuito.evaluar_expresion('macho_raza != hembra_raza')
        
        # Regla 3: Calidad Genética
        alta_calidad = circuito.evaluar_expresion('macho_score > 80 and hembra_score > 80')

        return {
            'viable': True,
            'misma_raza': not vigor_hibrido['resultado'],
            'potencial_genetico': 'Elite' if alta_calidad['resultado'] else 'Estándar',
            'recomendacion': 'Cruce Pureza' if not vigor_hibrido['resultado'] else 'Cruce Industrial (Vigor Híbrido)'
        }


class ReglaManejador:
    """Sistema de reglas para toma de decisiones en manejo ganadero"""
    
    def __init__(self):
        self.reglas_manejo = {}
        self._inicializar_reglas()
    
    def _inicializar_reglas(self):
        """Inicializar conjunto de reglas de manejo comunes"""
        
        reglas_basicas = {
            'destete_precoz': {
                'condicion': 'edad >= 4 and peso >= 120 and especie == "Bovino"',
                'descripcion': 'Bovino listo para destete precoz'
            },
            'destete_tradicional': {
                'condicion': 'edad >= 8 and especie == "Bovino"',
                'descripcion': 'Bovino listo para destete tradicional'
            },
            'destete_porcino': {
                'condicion': 'edad_dias >= 21 and especie == "Porcino"',
                'descripcion': 'Lechón listo para destete (21+ días)'
            },
            'venta_deshecho': {
                'condicion': 'edad >= 96', # 8 años
                'descripcion': 'Evaluar descarte por edad avanzada / productividad baja'
            },
            'cambio_alojamiento': {
                'condicion': 'edad >= 12',
                'descripcion': 'Animal listo para cambio a área de crecimiento'
            },
            'venta_preparacion': {
                'condicion': 'peso >= 450 and edad >= 24',
                'descripcion': 'Animal apto para venta/mercado final'
            },
            'retiro_reproduccion': {
                'condicion': 'edad >= 120 or (edad > 24 and peso < 250 and especie == "Bovino")',
                'descripcion': 'Animal recomendado retirar de reproducción (Edad/Condición)'
            },
            'revision_veterinaria_urgente': {
                'condicion': 'peso < 50 or estado == "Crítico"',
                'descripcion': 'Requiere revisión veterinaria inmediata'
            },
            'inicio_ordeño': {
                'condicion': 'edad >= 24 and sexo == "Hembra"',
                'descripcion': 'Hembra lista para iniciar ordeño'
            }
        }
        
        for nombre, regla in reglas_basicas.items():
            self.reglas_manejo[nombre] = regla
    
    def evaluar_manejo(self, **parametros):
        """Evaluar qué reglas de manejo aplican"""
        circuito = CircuitoLogico()
        circuito.establecer_variables(parametros)
        
        aplicables = []
        for nombre, regla in self.reglas_manejo.items():
            resultado = circuito.evaluar_expresion(regla['condicion'])
            if resultado['resultado']:
                aplicables.append({
                    'regla': nombre,
                    'descripcion': regla['descripcion']
                })
        
        return {
            'parametros': parametros,
            'reglas_aplicables': aplicables,
            'total': len(aplicables)
        }
