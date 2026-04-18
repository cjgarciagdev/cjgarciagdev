import time
import os
import random
import sys

def limpiar_pantalla():
    os.system('cls' if os.name == 'nt' else 'clear')

def escribir_suave(texto, velocidad=0.05):
    for caracter in texto:
        sys.stdout.write(caracter)
        sys.stdout.flush()
        time.sleep(velocidad)
    print()

def corazon_pro():
    rojo = "\033[91m"
    reset = "\033[0m"
    
    frames = [
        """
               ♥♥♥  ♥♥♥      
           ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥    
          ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥  
         ♥♥♥♥♥♥  LOVE  ♥♥♥♥♥♥ 
         ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥ 
          ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥ 
           ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥  
            ♥♥♥♥♥♥♥♥♥♥♥♥♥♥    
              ♥♥♥♥♥♥♥♥♥♥      
                ♥♥♥♥♥♥        
                 ♥♥♥♥
                  ♥♥          
        """,
        """
               ♥♥♥  ♥♥♥      
           ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥    
          ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥  
         ♥♥♥♥♥♥   YOU  ♥♥♥♥♥♥ 
         ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥ 
          ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥ 
           ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥  
            ♥♥♥♥♥♥♥♥♥♥♥♥♥♥    
              ♥♥♥♥♥♥♥♥♥♥      
                ♥♥♥♥♥♥        
                 ♥♥♥♥
                  ♥♥  
        """
    ]

    for i in range(10):  # Latido
        limpiar_pantalla()
        color = rojo if i % 2 == 0 else "\033[95m"  # Alterna entre rojo y rosa
        print(color + frames[0 if i % 2 == 0 else 1] + reset)
        print("\n" + "♥ ♥ ♥ ♥ ♥ ♥ Latiendo por ti  ♥ ♥ ♥ ♥ ♥ ♥".center(50))
        time.sleep(0.4)

def sorpresa_mejorada():
    mensajes = [
        "Eres el 'commit' que le faltaba a mi código de vida. ",
        "Si fueras un error de sistema, no querría que nadie me debugueara.",
        "Mi amor por ti es como un bucle infinito: no tiene salida (y me encanta).",
        "¿Me dejas ser el administrador de tu corazón? Prometo no borrar nada.",
        "Te quiero más que a mi conexión de fibra óptica a las 3 AM."
    ]
    
    limpiar_pantalla()
    print("\n\n")
    escribir_suave("CARGANDO SENTIMIENTOS... [████████████████] 100%".center(60), 0.03)
    time.sleep(1)
    
    corazon_pro()
        
    limpiar_pantalla()
    print("\033[93m" + "♥ ♥ " * 15 + "\033[0m")
    print("\n")
    escribir_suave(random.choice(mensajes).center(60), 0.08)
    print("\n")
    print("\033[93m" + "♥ ♥ " * 15 + "\033[0m")
    
    print("\n\n PD: Tienes 5 segundos para venir a darme un beso.")
    time.sleep(5)

if __name__ == "__main__":
    # Inicialización para Windows (hace que los colores funcionen)
    if os.name == 'nt':
        os.system('color') 
    
    sorpresa_mejorada()