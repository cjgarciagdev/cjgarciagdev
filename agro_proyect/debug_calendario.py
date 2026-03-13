import sys
import os
from datetime import datetime, timedelta

# Asegurar que podemos importar app y models
sys.path.append(os.getcwd())

from app import create_app
from models import db, EventoCalendario, ProtocoloSalud, TipoProtocolo, EstadoProtocolo, Ganado, Especie, Raza, Sexo

app = create_app()

with app.app_context():
    print("--- DIAGNÓSTICO DE CALENDARIO ---")
    
    # 1. Definir rango de próximos 7 días
    hoy = datetime.now()
    prox_semana = hoy + timedelta(days=7)
    print(f"Rango: {hoy} a {prox_semana}")
    
    # 2. Buscar eventos existentes
    eventos = EventoCalendario.query.filter(
        EventoCalendario.fecha_inicio >= hoy,
        EventoCalendario.fecha_inicio <= prox_semana
    ).all()
    print(f"Eventos encontrados: {len(eventos)}")
    
    protocolos = ProtocoloSalud.query.filter(
        ProtocoloSalud.fecha_programada >= hoy,
        ProtocoloSalud.fecha_programada <= prox_semana
    ).all()
    print(f"Protocolos encontrados: {len(protocolos)}")

    # 3. Si no hay, crear datos de prueba
    if len(eventos) == 0 and len(protocolos) == 0:
        print("\n--- CREANDO DATOS DE PRUEBA ---")
        
        # Crear evento genérico
        evt = EventoCalendario(
            titulo="Reunión de Personal",
            descripcion="Planificación semanal",
            tipo="Reunión",
            fecha_inicio=hoy + timedelta(days=1, hours=2),
            fecha_fin=hoy + timedelta(days=1, hours=3),
            color="#8b5cf6",
            usuario_creador="admin"
        )
        db.session.add(evt)
        print(f"Creado evento: {evt.titulo} para {evt.fecha_inicio}")

        # Crear protocolo (necesita dependencias)
        # Asegurar animal
        animal = Ganado.query.first()
        if not animal:
            # Crear especie, raza, etc si vacio (raro pero posible)
            esp = Especie.query.first() or Especie(nombre="Bovino")
            db.session.add(esp)
            db.session.commit()
            raza = Raza.query.first() or Raza(nombre="Holstein", especie_id=esp.id)
            db.session.add(raza)
            db.session.commit()
            sexo = Sexo.query.first() or Sexo(nombre="Macho")
            db.session.add(sexo)
            db.session.commit()
            
            animal = Ganado(
                especie_id=esp.id, raza_id=raza.id, sexo_id=sexo.id,
                fecha_nacimiento="2024-01-01", edad=12, peso=300
            )
            db.session.add(animal)
            db.session.commit()

        # Asegurar tipos
        tipo_proto = TipoProtocolo.query.filter_by(nombre="Vacunación").first()
        if not tipo_proto:
            tipo_proto = TipoProtocolo(nombre="Vacunación")
            db.session.add(tipo_proto)
            db.session.commit()
        
        estado_proto = EstadoProtocolo.query.filter_by(nombre="Pendiente").first()
        if not estado_proto:
            estado_proto = EstadoProtocolo(nombre="Pendiente")
            db.session.add(estado_proto)
            db.session.commit()

        proto = ProtocoloSalud(
            animal_id=animal.id,
            tipo_protocolo_id=tipo_proto.id,
            descripcion="Vacuna Aftosa Anual",
            fecha_programada=hoy + timedelta(days=2, hours=4),
            estado_id=estado_proto.id
        )
        db.session.add(proto)
        db.session.commit()
        print(f"Creado protocolo: {proto.descripcion} para {proto.fecha_programada}")
        
    else:
        print("\nYa existen datos, verificando estado:")
        for e in eventos:
            print(f"- Evento: {e.titulo} ({e.fecha_inicio}) Completado: {e.completado}")
        for p in protocolos:
            estado = "REALIZADO" if p.fecha_realizada else "PENDIENTE"
            print(f"- Protocolo: {p.descripcion} ({p.fecha_programada}) Estado: {estado} [{p.fecha_realizada}]")

    print("\n--- DIAGNÓSTICO FINALIZADO ---")
