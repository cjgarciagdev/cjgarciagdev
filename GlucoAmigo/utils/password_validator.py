"""
GlucoAmigo - Módulo de Validación de Contraseñas
================================================
Políticas de seguridad:
- Forzar mayúsculas, números y símbolos
- Longitud mínima de 8 caracteres
- Validación robusta para cumplimiento HIPAA/BASIC
"""

import re
from typing import Tuple, Dict, List

class ValidacionPassword:
    """Clase para validar contraseñas según políticas de seguridad"""
    
    # Configuración de políticas
    MIN_LENGTH = 8
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_NUMBER = True
    REQUIRE_SPECIAL = True
    
    # Caracteres especiales permitidos
    SPECIAL_CHARS = r'!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    # Mensajes de error
    ERROR_MESSAGES = {
        'length': 'La contraseña debe tener al menos {} caracteres',
        'uppercase': 'La contraseña debe contener al menos una letra mayúscula (A-Z)',
        'lowercase': 'La contraseña debe contener al menos una letra minúscula (a-z)',
        'number': 'La contraseña debe contener al menos un número (0-9)',
        'special': f'La contraseña debe contener al menos un símbolo especial ({SPECIAL_CHARS})',
        'common': 'Esta contraseña es muy común. Por favor elige una más segura',
    }
    
    # Top 100 contraseñas comunes (versión reducida para producción ampliar)
    COMMON_PASSWORDS = [
        'password', '12345678', '123456', 'password123', 'qwerty', 'abc123',
        'password1', '1234567890', 'iloveyou', 'sunshine', 'princess',
        'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master',
        'login', 'passw0rd', 'hello', 'freedom', 'whatever', 'qazwsx',
        'trustno1', 'football', 'baseball', 'soccer', 'hockey', 'superman',
        'batman', 'spider', 'pokemon', 'michael', 'jennifer', 'jordan',
        'thomas', 'hunter', 'ranger', 'daniel', 'harley', 'liverpool',
        'chelsea', 'arsenal', 'manutd', 'realmadrid', 'barcelona', 'pepito',
        'juanito', 'carlitos', 'anita', 'mateo', 'lucia', 'valentina',
        'glucoamigo', 'diabetes', 'insulina', 'glucosa', 'salud2024'
    ]
    
    @classmethod
    def validar(cls, password: str) -> Tuple[bool, List[str]]:
        """
        Valida una contraseña contra todas las políticas de seguridad.
        
        Args:
            password: La contraseña a validar
            
        Returns:
            Tupla (es_valida, lista_errores)
        """
        errores = []
        
        if not password:
            return False, ['La contraseña no puede estar vacía']
        
        # Verificar longitud mínima
        if len(password) < cls.MIN_LENGTH:
            errores.append(cls.ERROR_MESSAGES['length'].format(cls.MIN_LENGTH))
        
        # Verificar mayúsculas
        if cls.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            errores.append(cls.ERROR_MESSAGES['uppercase'])
        
        # Verificar minúsculas
        if cls.REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            errores.append(cls.ERROR_MESSAGES['lowercase'])
        
        # Verificar números
        if cls.REQUIRE_NUMBER and not re.search(r'\d', password):
            errores.append(cls.ERROR_MESSAGES['number'])
        
        # Verificar caracteres especiales
        if cls.REQUIRE_SPECIAL:
            special_pattern = f'[{re.escape(cls.SPECIAL_CHARS)}]'
            if not re.search(special_pattern, password):
                errores.append(cls.ERROR_MESSAGES['special'])
        
        # Verificar contraseña común
        if password.lower() in cls.COMMON_PASSWORDS:
            errores.append(cls.ERROR_MESSAGES['common'])
        
        return len(errores) == 0, errores
    
    @classmethod
    def get_fortaleza(cls, password: str) -> Dict:
        """
        Calcula la fortaleza de una contraseña.
        
        Returns:
            Diccionario con puntuación y nivel de seguridad
        """
        if not password:
            return {'puntuacion': 0, 'nivel': 'N/A', 'color': '#64748b'}
        
        puntuacion = 0
        
        # Longitud
        if len(password) >= 8: puntuacion += 1
        if len(password) >= 12: puntuacion += 1
        if len(password) >= 16: puntuacion += 1
        
        # Complejidad
        if re.search(r'[a-z]', password): puntuacion += 1
        if re.search(r'[A-Z]', password): puntuacion += 1
        if re.search(r'\d', password): puntuacion += 1
        if re.search(rf'[{re.escape(cls.SPECIAL_CHARS)}]', password): puntuacion += 1
        
        # Penalización por patrones comunes
        if password.lower() in cls.COMMON_PASSWORDS:
            puntuacion = 1
        
        # Determinar nivel
        if puntuacion <= 2:
            nivel = 'Débil'
            color = '#ef4444'
        elif puntuacion <= 4:
            nivel = 'Moderada'
            color = '#f59e0b'
        elif puntuacion <= 6:
            nivel = 'Fuerte'
            color = '#22c55e'
        else:
            nivel = 'Muy Fuerte'
            color = '#0d9488'
        
        return {
            'puntuacion': puntuacion,
            'nivel': nivel,
            'color': color,
            'maxima': 10
        }
    
    @classmethod
    def generar_password_segura(cls, longitud: int = 12) -> str:
        """
        Genera una contraseña segura automáticamente.
        
        Args:
            longitud: Longitud de la contraseña (mínimo 8)
        """
        import random
        import string
        
        longitud = max(longitud, cls.MIN_LENGTH)
        
        # Asegurar al menos uno de cada tipo
        mayusculas = random.choice(string.ascii_uppercase)
        minusculas = random.choice(string.ascii_lowercase)
        numeros = random.choice(string.digits)
        especiales = random.choice(cls.SPECIAL_CHARS)
        
        # Resto aleatorio
        resto = ''.join(random.choices(
            string.ascii_letters + string.digits + cls.SPECIAL_CHARS,
            k=longitud - 4
        ))
        
        # Combinar y mezclar
        password = mayusculas + minusculas + numeros + especiales + resto
        return ''.join(random.sample(password, len(password)))


def validar_registro(username: str, password: str, email: str = None) -> Tuple[bool, Dict]:
    """
    Valida el registro completo de un nuevo usuario.
    
    Returns:
        (es_valido, {'errores': [], 'password_fortaleza': {...}})
    """
    errores = {}
    
    # Validar username
    if not username or len(username) < 3:
        errores['username'] = 'El nombre de usuario debe tener al menos 3 caracteres'
    elif not re.match(r'^[a-zA-Z0-9_]+$', username):
        errores['username'] = 'El usuario solo puede contener letras, números y guiones bajos'
    
    # Validar password
    password_valido, password_errores = ValidacionPassword.validar(password)
    if not password_valido:
        errores['password'] = password_errores
    
    # Validar email si se proporciona
    if email:
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            errores['email'] = 'El correo electrónico no tiene un formato válido'
    
    return len(errores) == 0, {
        'errores': errores,
        'password_fortaleza': ValidacionPassword.get_fortaleza(password)
    }


# ============================================================
# INTEGRACIÓN CON FLASK - Decoradores y validadores
# ============================================================

def validar_password_flasks(password: str) -> Tuple[bool, str]:
    """
    Validador compatible con Flask-WTF o validaciones manuales.
    Retorna (es_valido, mensaje_error)
    """
    es_valida, errores = ValidacionPassword.validar(password)
    if es_valida:
        return True, ''
    return False, '; '.join(errores)
