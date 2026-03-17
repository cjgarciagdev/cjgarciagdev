"""
GlucoAmigo - Módulo de Cifrado de Datos
========================================
Utiliza la biblioteca cryptography para cifrar datos sensibles en la base de datos.
Implementa Fernet (AES) para cifrado simétrico.

DATOS SENSIBLES A CIFRAR:
- Cédula del usuario
- Teléfono
- Email
- Datos médicos del héroe (enfermedades, notas médicas)
"""

import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.backends import default_backend

# Generar o recuperar la clave de cifrado desde variables de entorno
def get_encryption_key():
    """Obtiene o genera la clave de cifrado"""
    key_env = os.getenv('ENCRYPTION_KEY')
    
    if key_env:
        # La clave debe estar en formato base64url válido
        try:
            return key_env.encode() if isinstance(key_env, str) else key_env
        except Exception:
            pass
    
    # Generar nueva clave si no existe
    # Esta clave debe guardarse en .env para producción
    return Fernet.generate_key()


def create_fernet():
    """Crea una instancia de Fernet con la clave de cifrado"""
    key = get_encryption_key()
    return Fernet(key)


# Instancia global del cifrador
_fernet = None


def get_fernet():
    """Obtiene la instancia global de Fernet"""
    global _fernet
    if _fernet is None:
        _fernet = create_fernet()
    return _fernet


def encrypt(texto):
    """
    Cifra un texto sensible.
    
    Args:
        texto: String a cifrar
        
    Returns:
        String cifrado en base64 (seguro para almacenar en DB)
        None si el texto es None o vacío
    """
    if not texto:
        return None
    
    try:
        f = get_fernet()
        # Convertir a bytes si es string
        if isinstance(texto, str):
            texto = texto.encode('utf-8')
        encrypted = f.encrypt(texto)
        return base64.urlsafe_b64encode(encrypted).decode('utf-8')
    except Exception as e:
        print(f"[ENCRYPTION] Error cifrando datos: {e}")
        return None


def decrypt(texto_cifrado):
    """
    Descifra un texto previamente cifrado.
    
    Args:
        texto_cifrado: String cifrado en base64
        
    Returns:
        String descifrado
        None si el input es None o está vacío
    """
    if not texto_cifrado:
        return None
    
    try:
        f = get_fernet()
        # Decodificar de base64url
        decoded = base64.urlsafe_b64decode(texto_cifrado.encode('utf-8'))
        decrypted = f.decrypt(decoded)
        return decrypted.decode('utf-8')
    except Exception as e:
        print(f"[ENCRYPTION] Error descifrando datos: {e}")
        return None


def encrypt_if_needed(texto, ya_cifrado=False):
    """
    Cifra el texto solo si no está ya cifrado.
    Útil para actualizar campos que pueden tener valores antiguos sin cifrar.
    
    Args:
        texto: Texto a cifrar
        ya_cifrado: Si True, no cifra y devuelve el texto tal cual
        
    Returns:
        Texto cifrado o texto original
    """
    if ya_cifrado or not texto:
        return texto
    return encrypt(texto)


def is_encrypted(texto):
    """
    Verifica si un texto parece estar cifrado.
    Útil para detectar si un campo ya fue cifrado anteriormente.
    
    Args:
        texto: Texto a verificar
        
    Returns:
        True si el texto parece estar cifrado
    """
    if not texto:
        return False
    
    # Los textos cifrados con Fernet tienen ciertos patrones en base64
    # Longitud típica para textos cortos: 44+ caracteres
    if len(texto) < 20:
        return False
    
    try:
        # Intentar decodificar como base64url
        decoded = base64.urlsafe_b64decode(texto.encode('utf-8'))
        # Si tiene longitud múltiplo de 16, podría ser cifrado
        return len(decoded) % 16 == 0
    except Exception:
        return False


# ═══════════════════════════════════════════════════════════════
# UTILIDADES PARA DATOS SENSIBLES DEL SISTEMA
# ═══════════════════════════════════════════════════════════════

def generar_clave_master():
    """Genera una nueva clave maestra para el sistema"""
    return Fernet.generate_key()


def inicializar_sistema_cifrado():
    """Inicializa el sistema de cifrado y crea la clave si no existe"""
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        nueva_clave = generar_clave_master()
        print("=" * 60)
        print("⚠️  IMPORTANTE: Clave de cifrado generada")
        print("⚠️  Añade esta línea a tu archivo .env:")
        print(f"⚠️  ENCRYPTION_KEY={nueva_clave.decode('utf-8')}")
        print("⚠️  SIN ESTA CLAVE NO SE PODRÁN LEER LOS DATOS CIFRADOS")
        print("=" * 60)
        return False
    return True
