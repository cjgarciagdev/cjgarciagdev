"""
Módulo de scraping para extraer números de páginas web
"""
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import re
from datetime import datetime
from database import get_session, NumeroExtraido, ConfiguracionScraper


class WebScraper:
    """Clase para realizar web scraping de números"""
    
    def __init__(self, use_selenium=False):
        self.use_selenium = use_selenium
        self.driver = None
        
    def __enter__(self):
        if self.use_selenium:
            self._init_selenium()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.driver:
            self.driver.quit()
    
    def _init_selenium(self):
        """Inicializar Selenium WebDriver"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # Ejecutar en modo headless
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
    
    def extraer_numeros_simple(self, url, selector_css=None, selector_xpath=None):
        """
        Extraer números de una página web usando requests + BeautifulSoup
        
        Args:
            url: URL de la página web
            selector_css: Selector CSS para encontrar los números
            selector_xpath: Selector XPath alternativo
            
        Returns:
            Lista de números encontrados
        """
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            numeros = []
            
            if selector_css:
                elementos = soup.select(selector_css)
                for elemento in elementos:
                    texto = elemento.get_text(strip=True)
                    numeros.extend(self._extraer_numeros_de_texto(texto))
            else:
                # Extraer todos los números de la página
                texto_completo = soup.get_text()
                numeros = self._extraer_numeros_de_texto(texto_completo)
            
            return numeros
            
        except Exception as e:
            print(f"Error al extraer números: {e}")
            return []
    
    def extraer_numeros_selenium(self, url, selector_css=None, selector_xpath=None, wait_time=10):
        """
        Extraer números de una página web usando Selenium (para sitios con JavaScript)
        
        Args:
            url: URL de la página web
            selector_css: Selector CSS para encontrar los números
            selector_xpath: Selector XPath alternativo
            wait_time: Tiempo de espera para cargar elementos
            
        Returns:
            Lista de números encontrados
        """
        if not self.driver:
            self._init_selenium()
        
        try:
            self.driver.get(url)
            numeros = []
            
            if selector_css:
                wait = WebDriverWait(self.driver, wait_time)
                elementos = wait.until(
                    EC.presence_of_all_elements_located((By.CSS_SELECTOR, selector_css))
                )
                for elemento in elementos:
                    texto = elemento.text
                    numeros.extend(self._extraer_numeros_de_texto(texto))
                    
            elif selector_xpath:
                wait = WebDriverWait(self.driver, wait_time)
                elementos = wait.until(
                    EC.presence_of_all_elements_located((By.XPATH, selector_xpath))
                )
                for elemento in elementos:
                    texto = elemento.text
                    numeros.extend(self._extraer_numeros_de_texto(texto))
            else:
                # Extraer todos los números de la página
                texto_completo = self.driver.find_element(By.TAG_NAME, 'body').text
                numeros = self._extraer_numeros_de_texto(texto_completo)
            
            return numeros
            
        except Exception as e:
            print(f"Error al extraer números con Selenium: {e}")
            return []
    
    def _extraer_numeros_de_texto(self, texto):
        """Extraer todos los números de un texto"""
        # Buscar números enteros en el texto
        numeros = re.findall(r'\b\d+\b', texto)
        return [int(num) for num in numeros]
    
    def guardar_numeros(self, numeros, fuente_url):
        """Guardar los números extraídos en la base de datos"""
        session = get_session()
        try:
            for numero in numeros:
                nuevo_registro = NumeroExtraido(
                    numero=numero,
                    fuente=fuente_url,
                    fecha_extraccion=datetime.utcnow()
                )
                session.add(nuevo_registro)
            
            session.commit()
            print(f"✓ {len(numeros)} números guardados en la base de datos")
            return True
            
        except Exception as e:
            session.rollback()
            print(f"Error al guardar números: {e}")
            return False
        finally:
            session.close()


def ejecutar_scraping_automatico():
    """Ejecutar el scraping basado en la configuración de la base de datos"""
    session = get_session()
    try:
        configuraciones = session.query(ConfiguracionScraper).filter_by(activo=True).all()
        
        for config in configuraciones:
            print(f"\n🔍 Scraping: {config.url_objetivo}")
            
            use_selenium = 'javascript' in config.url_objetivo.lower() or config.selector_xpath
            
            with WebScraper(use_selenium=use_selenium) as scraper:
                if use_selenium:
                    numeros = scraper.extraer_numeros_selenium(
                        config.url_objetivo,
                        selector_css=config.selector_css,
                        selector_xpath=config.selector_xpath
                    )
                else:
                    numeros = scraper.extraer_numeros_simple(
                        config.url_objetivo,
                        selector_css=config.selector_css
                    )
                
                if numeros:
                    scraper.guardar_numeros(numeros, config.url_objetivo)
                    config.ultima_ejecucion = datetime.utcnow()
                    session.commit()
                else:
                    print("⚠ No se encontraron números")
        
    except Exception as e:
        print(f"Error en scraping automático: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    # Ejemplo de uso
    print("=== Web Scraper de Números ===\n")
    
    # Ejemplo 1: Scraping simple (sin JavaScript)
    url_ejemplo = "https://www.random.org/integers/?num=10&min=1&max=100&col=1&base=10&format=html&rnd=new"
    
    with WebScraper(use_selenium=False) as scraper:
        numeros = scraper.extraer_numeros_simple(url_ejemplo)
        print(f"Números encontrados: {numeros[:10]}")  # Mostrar solo los primeros 10
