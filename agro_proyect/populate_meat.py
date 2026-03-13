import sys
import os
import random
from datetime import datetime, timedelta

# Agregar directorio actual al path
sys.path.append(os.getcwd())

from app import create_app
from models import db, Ganado, RegistroProduccion, MovimientoFinanciero

app = create_app()

def populate_meat():
    with app.app_context():
        print("--- GENERANDO DATOS DE PRODUCCIÓN CÁRNICA ---")
        
        # 1. Obtener animales aptos (No Equinos)
        # Filtramos por nombre de especie en la relación (asumiendo que cat_especie existe y tiene nombre)
        # Si no, filtramos post-query
        animales = Ganado.query.all()
        aptos = [a for a in animales if a.cat_especie and a.cat_especie.nombre != 'Equino']
        
        print(f"Total animales encontrados: {len(animales)}")
        print(f"Animales aptos para carne (No Equinos): {len(aptos)}")
        
        if not aptos:
            print("No se encontraron animales aptos.")
            return

        registros_creados = 0
        fecha_fin = datetime.now()
        
        # 2. Generar registros históricos de carne
        # Simulamos que al 30% de los animales aptos se les ha registrado producción de carne
        # (Puede ser por venta, faena o medición de rendimiento en canal)
        
        # Mezclamos lista para aleatoriedad
        random.shuffle(aptos)
        seleccionados = aptos[:int(len(aptos) * 0.4)] # 40% de la población

        for animal in seleccionados:
            especie = animal.cat_especie.nombre
            
            # Definir rangos de peso canal según especie
            peso_carne = 0
            if especie == 'Bovino':
                peso_carne = random.uniform(220, 550)
            elif especie == 'Porcino':
                peso_carne = random.uniform(70, 110)
            elif especie == 'Ovino':
                peso_carne = random.uniform(15, 35)
            elif especie == 'Caprino':
                peso_carne = random.uniform(12, 30)
            else:
                peso_carne = random.uniform(20, 50) # Default
            
            # Fecha aleatoria en los últimos 60 días
            dias_atras = random.randint(1, 60)
            fecha_evento = fecha_fin - timedelta(days=dias_atras)
            
            # Crear registro de producción
            rp = RegistroProduccion(
                animal_id=animal.id,
                tipo_produccion='Carne',
                cantidad=round(peso_carne, 2),
                unidad='kg',
                calidad=random.choice(['Premium', 'Primera', 'Estándar']),
                fecha=fecha_evento.replace(hour=random.randint(6, 11), minute=0),
                turno='Mañana',
                observaciones=f"Rendimiento en canal - Lote {random.randint(1, 5)}",
                usuario='auto_seed_meat'
            )
            db.session.add(rp)
            registros_creados += 1
            
            # Opcional: Generar ingreso financiero asociado a esa carne
            if random.random() > 0.3: # 70% de las veces se vendió
                precio_kg = {
                    'Bovino': 4.5, 'Porcino': 3.2, 
                    'Ovino': 5.0, 'Caprino': 4.8
                }.get(especie, 3.0)
                
                ingreso = MovimientoFinanciero(
                    tipo='Ingreso',
                    categoria='Venta Producción',
                    subcategoria=f'Carne {especie}',
                    monto=round(peso_carne * precio_kg, 2),
                    moneda='USD',
                    descripcion=f'Venta de carne {especie} - Animal #{animal.id}',
                    fecha=fecha_evento,
                    estado='Completado',
                    usuario='admin' # Admin
                )
                db.session.add(ingreso)
        
        db.session.commit()
        print(f"--- PROCESO COMPLETADO ---")
        print(f"Registros de Producción (Carne) generados: {registros_creados}")

if __name__ == '__main__':
    populate_meat()
