"""
Script de tareas programadas (Scheduler) para ejecución autónoma en el servidor
"""
from apscheduler.schedulers.blocking import BlockingScheduler
from scraper import ejecutar_scraping_automatico
from datetime import datetime
import logging

# Configurar logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

sched = BlockingScheduler()

@sched.scheduled_job('interval', minutes=30)
def timed_job():
    """Ejecuta el scraping cada 30 minutos"""
    logger.info(f"🚀 Iniciando tarea programada: {datetime.now()}")
    try:
        ejecutar_scraping_automatico()
        logger.info("✅ Tarea completada con éxito")
    except Exception as e:
        logger.error(f"❌ Error en la tarea: {e}")

if __name__ == "__main__":
    logger.info("⏰ Scheduler iniciado. El sistema revisará el sitio cada 30 minutos.")
    sched.start()
