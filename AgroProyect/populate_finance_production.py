import sys
import os
import random
from datetime import datetime, timedelta

# Agregar directorio actual al path
sys.path.append(os.getcwd())

from app import create_app
from models import db, Ganado, RegistroProduccion, MovimientoFinanciero, Especie, Insumo

app = create_app()

def populate_data():
    with app.app_context():
        print("Iniciando población de datos de Producción y Finanzas...")
        
        # --- LIMPIEZA INICIAL (Opcional, para evitar duplicados masivos si se corre varias veces) ---
        # RegistroProduccion.query.delete() 
        # MovimientoFinanciero.query.delete()
        # db.session.commit()

        animales = Ganado.query.all()
        if not animales:
            print("No hay animales en el sistema. Creando algunos básicos...")
            # (Aquí se podría llamar a otro seed, pero asumimos que ya hay animales por pasos previos)
            return

        fecha_fin = datetime.now()
        fecha_inicio = fecha_fin - timedelta(days=60) # Últimos 2 meses

        count_prod = 0
        count_fin = 0

        # ==========================================
        # 1. GENERAR PRODUCCIÓN (Diaria)
        # ==========================================
        print("Generando registros de producción...")
        
        for dia_offset in range(61): # 0 a 60
            fecha_actual = fecha_inicio + timedelta(days=dia_offset)
            
            for animal in animales:
                # Lógica simplificada basada en especie/sexo
                especie = animal.cat_especie.nombre if animal.cat_especie else "Desconocido"
                sexo = animal.cat_sexo.nombre if animal.cat_sexo else "N/A"
                
                # LECHE (Bovinos y Caprinos Hembras)
                if (especie in ['Bovino', 'Caprino']) and (sexo == 'Hembra') and (animal.edad > 18):
                    # Producción varía día a día y por animal
                    base_litros = 15 if especie == 'Bovino' else 3
                    variacion = random.uniform(-2.0, 3.0)
                    cantidad = max(0.5, round(base_litros + variacion, 2))
                    
                    # 70% probabilidad de registro mañanero, 30% tarde (o ambos)
                    if random.random() > 0.1: # Casi siempre ordeño mañana
                        rp1 = RegistroProduccion(
                            animal_id=animal.id,
                            tipo_produccion='Leche',
                            cantidad=round(cantidad * 0.6, 2), # 60% en la mañana
                            unidad='litros',
                            calidad=random.choice(['Premium', 'Estándar', 'Estándar', 'Premium']),
                            grasa_porcentaje=random.uniform(3.2, 4.5),
                            proteina_porcentaje=random.uniform(3.0, 3.8),
                            fecha=fecha_actual.replace(hour=6, minute=30),
                            turno='Mañana',
                            observaciones="",
                            usuario='auto_seed'
                        )
                        db.session.add(rp1)
                        count_prod += 1

                    if random.random() > 0.2: # Ordeño tarde
                        rp2 = RegistroProduccion(
                            animal_id=animal.id,
                            tipo_produccion='Leche',
                            cantidad=round(cantidad * 0.4, 2), # 40% en la tarde
                            unidad='litros',
                            calidad='Estándar',
                            fecha=fecha_actual.replace(hour=16, minute=0),
                            turno='Tarde',
                            usuario='auto_seed'
                        )
                        db.session.add(rp2)
                        count_prod += 1

                # HUEVOS (Aves - si existieran, o Ovinos Lana esporádica)
                elif especie == 'Ovino' and dia_offset % 30 == 0: # Lana 1 vez al mes (simulado)
                    cant_lana = random.uniform(2.5, 5.0)
                    rp_lana = RegistroProduccion(
                        animal_id=animal.id,
                        tipo_produccion='Lana',
                        cantidad=round(cant_lana, 2),
                        unidad='kg',
                        calidad='Primera',
                        fecha=fecha_actual.replace(hour=10, minute=0),
                        turno='Mañana',
                        observaciones="Esquila programada",
                        usuario='auto_seed'
                    )
                    db.session.add(rp_lana)
                    count_prod += 1

            # Commit parcial cada semana para no saturar memoria
            if dia_offset % 7 == 0:
                db.session.commit()

        # ==========================================
        # 2. GENERAR FINANZAS (Movimientos Variados)
        # ==========================================
        print("Generando movimientos financieros...")

        # A. VENTAS DE LECHE (Ingresos Semanales)
        active_date = fecha_inicio
        while active_date <= fecha_fin:
            if active_date.weekday() == 4: # Viernes de pago
                monto_venta = random.uniform(1500, 3500)
                ingreso = MovimientoFinanciero(
                    tipo='Ingreso',
                    categoria='Venta Producción',
                    subcategoria='Leche',
                    monto=round(monto_venta, 2),
                    moneda='USD',
                    descripcion=f'Venta semanal de leche acumulada - Semana {active_date.strftime("%W")}',
                    fecha=active_date.replace(hour=14, minute=0),
                    estado='Completado',
                    usuario='admin'
                )
                db.session.add(ingreso)
                count_fin += 1
            active_date += timedelta(days=1)

        # B. GASTOS RECURRENTES (Alimento, Nómina, Servicios)
        active_date = fecha_inicio
        while active_date <= fecha_fin:
            # Compra Alimento (Cada 10 días)
            if active_date.day in [5, 15, 25]:
                gasto_alim = MovimientoFinanciero(
                    tipo='Gasto',
                    categoria='Alimentación',
                    subcategoria='Concentrado y Forraje',
                    monto=round(random.uniform(500, 1200), 2),
                    moneda='USD',
                    descripcion='Reabastecimiento de bodega principal',
                    proveedor_cliente='AgroInsumos SA',
                    fecha=active_date.replace(hour=9, minute=0),
                    estado='Completado'
                )
                db.session.add(gasto_alim)
                count_fin += 1
            
            # Pago Servicios (Mensual, día 1)
            if active_date.day == 1:
                gasto_serv = MovimientoFinanciero(
                    tipo='Gasto',
                    categoria='Servicios',
                    subcategoria='Electricidad y Agua',
                    monto=round(random.uniform(200, 450), 2),
                    moneda='USD',
                    descripcion='Factura mensual servicios básicos',
                    fecha=active_date.replace(hour=8, minute=0),
                    estado='Completado'
                )
                db.session.add(gasto_serv)
                count_fin += 1

            # Gastos Veterinarios (Aleatorios)
            if random.random() < 0.15: # 15% de probabilidad diaria
                gasto_vet = MovimientoFinanciero(
                    tipo='Gasto',
                    categoria='Salud',
                    subcategoria='Medicamentos',
                    monto=round(random.uniform(50, 300), 2),
                    moneda='USD',
                    descripcion='Compra emergencia medicamentos / Visita veterinaria',
                    fecha=active_date.replace(hour=11, minute=30),
                    estado='Completado'
                )
                db.session.add(gasto_vet)
                count_fin += 1

            active_date += timedelta(days=1)


        # C. VENTAS DE ANIMALES (Esporádicas)
        for _ in range(3): # Unas 3 ventas en el periodo
            fecha_venta = fecha_inicio + timedelta(days=random.randint(5, 50))
            ingreso_venta = MovimientoFinanciero(
                tipo='Ingreso',
                categoria='Venta Animal',
                subcategoria='Descarte',
                monto=round(random.uniform(800, 2000), 2),
                moneda='USD',
                descripcion='Venta de animales de descarte',
                fecha=fecha_venta,
                estado='Completado'
            )
            db.session.add(ingreso_venta)
            count_fin += 1

        db.session.commit()
        print(f"--- PROCESO COMPLETADO ---")
        print(f"Registros de Producción creados: {count_prod}")
        print(f"Movimientos Financieros creados: {count_fin}")

if __name__ == '__main__':
    populate_data()
