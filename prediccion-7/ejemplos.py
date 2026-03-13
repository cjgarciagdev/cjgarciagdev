"""
Script de ejemplo para probar el sistema de scraping y predicción
"""
from scraper import WebScraper
from predictor import PredictorNumeros
from database import init_db, get_session, NumeroExtraido
import time

def ejemplo_scraping_simple():
    """Ejemplo de scraping simple"""
    print("\n" + "="*60)
    print("🕷️  EJEMPLO 1: Scraping Simple (BeautifulSoup)")
    print("="*60 + "\n")
    
    url = "https://www.random.org/integers/?num=10&min=1&max=100&col=1&base=10&format=html&rnd=new"
    
    print(f"📍 URL: {url}\n")
    print("⏳ Extrayendo números...\n")
    
    with WebScraper(use_selenium=False) as scraper:
        numeros = scraper.extraer_numeros_simple(url)
        
        if numeros:
            print(f"✅ Números encontrados: {len(numeros)}")
            print(f"📊 Números: {numeros[:20]}")  # Primeros 20
            
            # Guardar en BD
            print("\n💾 Guardando en base de datos...")
            scraper.guardar_numeros(numeros[:10], url)  # Guardar solo los primeros 10
        else:
            print("❌ No se encontraron números")


def ejemplo_prediccion():
    """Ejemplo de predicción"""
    print("\n" + "="*60)
    print("🔮 EJEMPLO 2: Sistema de Predicción")
    print("="*60 + "\n")
    
    predictor = PredictorNumeros()
    
    # Obtener datos históricos
    numeros, fechas = predictor.obtener_datos_historicos()
    print(f"📊 Datos históricos: {len(numeros)} números\n")
    
    if len(numeros) >= predictor.min_samples:
        # Análisis estadístico
        print("📈 Realizando análisis estadístico...")
        stats = predictor.analisis_estadistico(numeros)
        
        print(f"\n📊 ESTADÍSTICAS:")
        print(f"   Media: {stats['media']:.2f}")
        print(f"   Mediana: {stats['mediana']}")
        print(f"   Moda: {stats['moda']}")
        print(f"   Rango: {stats['minimo']} - {stats['maximo']}")
        print(f"   Desviación Estándar: {stats['desviacion_estandar']:.2f}")
        
        print(f"\n🎯 PATRONES:")
        print(f"   Números Pares: {stats['porcentaje_pares']:.1f}%")
        print(f"   Números Impares: {stats['porcentaje_impares']:.1f}%")
        print(f"   Racha Máxima: {stats['racha_maxima']}")
        
        print(f"\n🏆 TOP 5 MÁS FRECUENTES:")
        for numero, frecuencia in stats['frecuencias_top_10'][:5]:
            print(f"   {numero} → {frecuencia} veces")
        
        # Generar predicción
        print("\n🔮 Generando predicción...")
        predicciones = predictor.predecir_proximo_numero(metodo='combinado')
        
        print("\n✨ PREDICCIONES:")
        for metodo, pred in predicciones.items():
            if 'error' not in pred:
                print(f"\n   Método {metodo.upper()}:")
                print(f"   📍 Número predicho: {pred['numero']}")
                print(f"   📊 Confianza: {pred['confianza']:.2%}")
                print(f"   🤖 Algoritmo: {pred['metodo']}")
        
        # Guardar predicción
        if 'combinado' in predicciones:
            pred = predicciones['combinado']
            predictor.guardar_prediccion(pred['numero'], pred['confianza'], 'combinado')
    else:
        print(f"⚠️  Se necesitan al menos {predictor.min_samples} números.")
        print(f"   Actualmente tienes {len(numeros)} números.")
        print(f"   Faltan {predictor.min_samples - len(numeros)} números.")


def ejemplo_completo_automatico():
    """Ejemplo completo: scraping + predicción"""
    print("\n" + "="*60)
    print("🚀 EJEMPLO 3: Pipeline Completo Automático")
    print("="*60 + "\n")
    
    # Inicializar BD
    init_db()
    
    # 1. Hacer scraping 5 veces para acumular datos
    print("📥 Fase 1: Recolectando datos...\n")
    
    url = "https://www.random.org/integers/?num=10&min=1&max=100&col=1&base=10&format=html&rnd=new"
    
    for i in range(5):
        print(f"   🔄 Scraping {i+1}/5...")
        with WebScraper(use_selenium=False) as scraper:
            numeros = scraper.extraer_numeros_simple(url)
            if numeros:
                scraper.guardar_numeros(numeros[:10], url)
        time.sleep(1)  # Esperar 1 segundo entre requests
    
    print("\n✅ Datos recolectados\n")
    
    # 2. Verificar cuántos números tenemos
    session = get_session()
    total = session.query(NumeroExtraido).count()
    session.close()
    
    print(f"📊 Total de números en BD: {total}\n")
    
    # 3. Generar predicción si hay suficientes datos
    if total >= 50:
        print("✨ Generando predicción...\n")
        ejemplo_prediccion()
    else:
        print(f"⚠️  Necesitas {50 - total} números más para generar predicciones.")
        print("   Ejecuta este script varias veces o usa el scraper desde la web.\n")


def menu():
    """Menú interactivo"""
    print("\n" + "="*60)
    print("🔮 PREDICCIÓN-7 - Ejemplos y Pruebas")
    print("="*60)
    print("\nSelecciona una opción:")
    print("  1. Ejemplo de Scraping Simple")
    print("  2. Ejemplo de Predicción")
    print("  3. Pipeline Completo Automático")
    print("  4. Salir")
    print("\nOpción: ", end="")
    
    opcion = input().strip()
    
    if opcion == '1':
        ejemplo_scraping_simple()
    elif opcion == '2':
        ejemplo_prediccion()
    elif opcion == '3':
        ejemplo_completo_automatico()
    elif opcion == '4':
        print("\n👋 ¡Hasta luego!\n")
        return False
    else:
        print("\n❌ Opción inválida\n")
    
    return True


if __name__ == "__main__":
    print("\n🔮 Sistema de Predicción - Ejemplos\n")
    
    # Inicializar BD
    init_db()
    
    # Menú interactivo
    while True:
        if not menu():
            break
        
        print("\n" + "-"*60)
        input("Presiona Enter para continuar...")
