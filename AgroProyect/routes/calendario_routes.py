# ==============================================================================
# RUTAS API: CALENDARIO DE ACTIVIDADES / AGENDA
# ==============================================================================
from flask import Blueprint, request, jsonify, session
from models import db, EventoCalendario, ProtocoloSalud, PlanMaternidad, Ganado, MovimientoFinanciero
from datetime import datetime, date, timedelta

calendario_bp = Blueprint('calendario', __name__)

@calendario_bp.route('/api/calendario', methods=['GET'])
def get_eventos():
    """Lista eventos del calendario con filtros de rango de fechas."""
    try:
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        tipo = request.args.get('tipo')
        completado = request.args.get('completado')

        query = EventoCalendario.query

        if fecha_desde:
            query = query.filter(EventoCalendario.fecha_inicio >= datetime.strptime(fecha_desde, '%Y-%m-%d'))
        if fecha_hasta:
            query = query.filter(EventoCalendario.fecha_inicio <= datetime.strptime(fecha_hasta + ' 23:59:59', '%Y-%m-%d %H:%M:%S'))
        if tipo:
            query = query.filter_by(tipo=tipo)
        if completado is not None:
            query = query.filter_by(completado=completado == 'true')

        # 1. EVENTOS DIRECTOS DEL CALENDARIO
        eventos = query.order_by(EventoCalendario.fecha_inicio.asc()).all()
        resultado = [e.to_dict() for e in eventos]

        # 2. INTEGRACIÓN SALUD: Protocolos de salud
        if not tipo or tipo in ['Salud', 'Protocolo', 'Veterinario']:
            q_proto = ProtocoloSalud.query
            if fecha_desde:
                q_proto = q_proto.filter(ProtocoloSalud.fecha_programada >= datetime.strptime(fecha_desde, '%Y-%m-%d'))
            if fecha_hasta:
                q_proto = q_proto.filter(ProtocoloSalud.fecha_programada <= datetime.strptime(fecha_hasta + ' 23:59:59', '%Y-%m-%d %H:%M:%S'))
            
            if completado is not None:
                is_completed = (completado == 'true')
                if is_completed:
                    q_proto = q_proto.filter(ProtocoloSalud.fecha_realizada != None)
                else:
                    q_proto = q_proto.filter(ProtocoloSalud.fecha_realizada == None)

            for p in q_proto.all():
                color = '#ef4444' if not p.fecha_realizada else '#10b981'
                resultado.append({
                    'id': f'proto_{p.id}',
                    'titulo': f"💉 {p.cat_tipo.nombre if p.cat_tipo else 'Protocolo'} - #{p.animal_id}",
                    'fecha_inicio': p.fecha_programada.strftime('%Y-%m-%dT%H:%M'),
                    'fecha_fin': (p.fecha_programada + timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M'),
                    'color': color,
                    'todo_el_dia': False,
                    'descripcion': p.descripcion,
                    'tipo': 'Salud',
                    'es_protocolo': True,
                    'completado': p.fecha_realizada is not None
                })

        # 3. INTEGRACIÓN MATERNIDAD: Fechas probables de parto
        if not tipo or tipo in ['Parto', 'Maternidad']:
            q_mat = PlanMaternidad.query.filter(PlanMaternidad.activo == True)
            if fecha_desde:
                q_mat = q_mat.filter(PlanMaternidad.fecha_probable_parto >= datetime.strptime(fecha_desde, '%Y-%m-%d'))
            if fecha_hasta:
                q_mat = q_mat.filter(PlanMaternidad.fecha_probable_parto <= datetime.strptime(fecha_hasta + ' 23:59:59', '%Y-%m-%d %H:%M:%S'))
            
            for m in q_mat.all():
                resultado.append({
                    'id': f'mat_{m.id}',
                    'titulo': f"🍼 Parto Probable - #{m.animal_id}",
                    'fecha_inicio': m.fecha_probable_parto.strftime('%Y-%m-%dT%00:00'),
                    'fecha_fin': m.fecha_probable_parto.strftime('%Y-%m-%dT%23:59'),
                    'color': '#ec4899',
                    'todo_el_dia': True,
                    'descripcion': f"Plan: {m.cat_tipo.nombre if m.cat_tipo else 'N/A'}. {m.observaciones or ''}",
                    'tipo': 'Parto',
                    'completado': False
                })

        # 4. INTEGRACIÓN INVENTARIO: Vencimientos de insumos
        if not tipo or tipo in ['Inventario', 'Vencimiento']:
            from models import Insumo
            q_ins = Insumo.query
            if fecha_desde:
                q_ins = q_ins.filter(Insumo.fecha_vencimiento >= datetime.strptime(fecha_desde, '%Y-%m-%d').date())
            if fecha_hasta:
                q_ins = q_ins.filter(Insumo.fecha_vencimiento <= datetime.strptime(fecha_hasta, '%Y-%m-%d').date())
                
            for i in q_ins.all():
                resultado.append({
                    'id': f'ins_{i.id}',
                    'titulo': f"⚠️ Vence: {i.nombre}",
                    'fecha_inicio': i.fecha_vencimiento.strftime('%Y-%m-%dT00:00'),
                    'color': '#f59e0b',
                    'todo_el_dia': True,
                    'descripcion': f"Ubicación: {i.ubicacion or 'N/A'}. Cantidad actual: {i.cantidad} {i.cat_unidad.nombre if i.cat_unidad else ''}",
                    'tipo': 'Inventario',
                    'completado': False
                })

        # 5. INTEGRACIÓN FINANZAS: Pagos pendientes
        if not tipo or tipo in ['Finanzas', 'Pago']:
            from models import MovimientoFinanciero
            q_fin = MovimientoFinanciero.query.filter_by(estado='Pendiente')
            if fecha_desde:
                q_fin = q_fin.filter(MovimientoFinanciero.fecha >= datetime.strptime(fecha_desde, '%Y-%m-%d').date())
            if fecha_hasta:
                q_fin = q_fin.filter(MovimientoFinanciero.fecha <= datetime.strptime(fecha_hasta, '%Y-%m-%d').date())
                
            for f in q_fin.all():
                resultado.append({
                    'id': f'fin_{f.id}',
                    'titulo': f"💰 Pago Pendiente: {f.categoria}",
                    'fecha_inicio': f.fecha.strftime('%Y-%m-%dT08:00'),
                    'color': '#10b981',
                    'todo_el_dia': True,
                    'descripcion': f.descripcion,
                    'tipo': 'Finanzas',
                    'completado': False
                })

        return jsonify(resultado)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@calendario_bp.route('/api/calendario', methods=['POST'])
def crear_evento():
    """Crea un nuevo evento en el calendario."""
    try:
        data = request.json
        if not data.get('titulo') or not data.get('fecha_inicio') or not data.get('tipo'):
            return jsonify({'error': 'titulo, fecha_inicio y tipo son requeridos'}), 400

        evento = EventoCalendario(
            titulo=data['titulo'],
            descripcion=data.get('descripcion'),
            tipo=data['tipo'],
            color=data.get('color', _color_por_tipo(data['tipo'])),
            todo_el_dia=data.get('todo_el_dia', False),
            recurrente=data.get('recurrente', False),
            patron_recurrencia=data.get('patron_recurrencia'),
            animal_id=int(data['animal_id']) if data.get('animal_id') else None,
            lote_id=int(data['lote_id']) if data.get('lote_id') else None,
            prioridad=data.get('prioridad', 'Media'),
            recordatorio_minutos=int(data.get('recordatorio_minutos', 60)),
            usuario_creador=session.get('username', 'admin'),
            usuario_asignado=data.get('usuario_asignado')
        )

        # Parsear fechas
        try:
            evento.fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%dT%H:%M')
        except:
            evento.fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d')

        if data.get('fecha_fin'):
            try:
                evento.fecha_fin = datetime.strptime(data['fecha_fin'], '%Y-%m-%dT%H:%M')
            except:
                evento.fecha_fin = datetime.strptime(data['fecha_fin'], '%Y-%m-%d')

        db.session.add(evento)
        db.session.commit()
        return jsonify({'status': 'success', 'id': evento.id, 'evento': evento.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@calendario_bp.route('/api/calendario/<int:id>', methods=['PUT'])
def update_evento(id):
    """Actualiza un evento del calendario."""
    try:
        evento = EventoCalendario.query.get(id)
        if not evento:
            return jsonify({'error': 'Evento no encontrado'}), 404

        data = request.json
        for campo in ['titulo', 'descripcion', 'tipo', 'color', 'prioridad',
                       'patron_recurrencia', 'usuario_asignado']:
            if campo in data:
                setattr(evento, campo, data[campo])
        
        for campo in ['todo_el_dia', 'recurrente', 'completado']:
            if campo in data:
                setattr(evento, campo, bool(data[campo]))

        if 'recordatorio_minutos' in data:
            evento.recordatorio_minutos = int(data['recordatorio_minutos'])

        if 'fecha_inicio' in data:
            try:
                evento.fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%dT%H:%M')
            except:
                evento.fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d')

        if 'fecha_fin' in data:
            try:
                evento.fecha_fin = datetime.strptime(data['fecha_fin'], '%Y-%m-%dT%H:%M')
            except:
                evento.fecha_fin = datetime.strptime(data['fecha_fin'], '%Y-%m-%d')

        db.session.commit()
        return jsonify({'status': 'success', 'evento': evento.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@calendario_bp.route('/api/calendario/<int:id>', methods=['DELETE'])
def delete_evento(id):
    """Elimina un evento del calendario."""
    try:
        evento = EventoCalendario.query.get(id)
        if not evento:
            return jsonify({'error': 'Evento no encontrado'}), 404
        db.session.delete(evento)
        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@calendario_bp.route('/api/calendario/<int:id>/completar', methods=['POST'])
def completar_evento(id):
    """Marca un evento como completado."""
    try:
        evento = EventoCalendario.query.get(id)
        if not evento:
            return jsonify({'error': 'Evento no encontrado'}), 404
        evento.completado = True
        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@calendario_bp.route('/api/calendario/proximos')
def proximos_eventos():
    """Eventos próximos (siguiente semana) para notificaciones."""
    try:
        # Definir rango absoluto: Desde el inicio de HOY hasta el final del día 7
        hoy_date = date.today()
        fin_date = hoy_date + timedelta(days=7)
        
        start_dt = datetime.combine(hoy_date, datetime.min.time())
        end_dt = datetime.combine(fin_date, datetime.max.time())
        
        print(f"DEBUG: Buscando próximos eventos entre {start_dt} y {end_dt}")

        eventos = EventoCalendario.query.filter(
            EventoCalendario.fecha_inicio >= start_dt,
            EventoCalendario.fecha_inicio <= end_dt,
            EventoCalendario.completado == False
        ).order_by(EventoCalendario.fecha_inicio.asc()).all()

        resultado_eventos = [e.to_dict() for e in eventos]

        # 1. Protocolos de salud pendientes
        protocolos = ProtocoloSalud.query.filter(
            ProtocoloSalud.fecha_programada >= start_dt,
            ProtocoloSalud.fecha_programada <= end_dt,
            ProtocoloSalud.fecha_realizada.is_(None)
        ).all()
        for p in protocolos:
            resultado_eventos.append({
                'id': f'proto_{p.id}',
                'titulo': f'💉 Protocolo: {p.cat_tipo.nombre if p.cat_tipo else "N/A"} - Animal #{p.animal_id}',
                'descripcion': p.descripcion,
                'tipo': 'Protocolo',
                'color': '#ef4444',
                'fecha_inicio': p.fecha_programada.strftime('%Y-%m-%dT%H:%M'),
                'completado': False,
                'es_protocolo': True
            })

        # 2. Maternidad (Partos próximos)
        partos = PlanMaternidad.query.filter(
            PlanMaternidad.activo == True,
            PlanMaternidad.fecha_probable_parto >= start_dt,
            PlanMaternidad.fecha_probable_parto <= end_dt
        ).all()
        for m in partos:
            resultado_eventos.append({
                'id': f'mat_{m.id}',
                'titulo': f'🍼 Parto: #{m.animal_id}',
                'descripcion': 'Establecido en plan de maternidad',
                'tipo': 'Parto',
                'color': '#ec4899',
                'fecha_inicio': m.fecha_probable_parto.strftime('%Y-%m-%dT00:00'),
                'completado': False
            })

        # 3. Finanzas (Vencimientos próximos)
        pagos = MovimientoFinanciero.query.filter(
            MovimientoFinanciero.estado == 'Pendiente',
            MovimientoFinanciero.fecha >= hoy_date,
            MovimientoFinanciero.fecha <= fin_date
        ).all()
        for f in pagos:
            resultado_eventos.append({
                'id': f'fin_{f.id}',
                'titulo': f'💰 Pago: {f.categoria}',
                'descripcion': f'Monto: {f.monto} {f.moneda}',
                'tipo': 'Finanzas',
                'color': '#10b981',
                'fecha_inicio': f.fecha.strftime('%Y-%m-%dT08:00'),
                'completado': False
            })

        return jsonify({
            'eventos': sorted(resultado_eventos, key=lambda x: x['fecha_inicio']),
            'protocolos': [], # Ya incluidos en eventos para simplificar
            'total_pendientes': len(resultado_eventos)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@calendario_bp.route('/api/calendario/resumen')
def resumen_calendario():
    """Resumen: eventos del mes, completados, pendientes."""
    try:
        hoy = date.today()
        inicio_mes = hoy.replace(day=1)
        fin_mes = (inicio_mes + timedelta(days=32)).replace(day=1)
        
        start_dt = datetime.combine(inicio_mes, datetime.min.time())
        end_dt = datetime.combine(fin_mes, datetime.min.time())

        # 1. Eventos base
        eventos_mes = EventoCalendario.query.filter(EventoCalendario.fecha_inicio >= start_dt, EventoCalendario.fecha_inicio < end_dt).all()
        
        # 2. Protocolos
        protos_mes = ProtocoloSalud.query.filter(ProtocoloSalud.fecha_programada >= start_dt, ProtocoloSalud.fecha_programada < end_dt).all()
        
        # 3. Maternidad
        partos_mes = PlanMaternidad.query.filter(PlanMaternidad.activo == True, PlanMaternidad.fecha_probable_parto >= start_dt, PlanMaternidad.fecha_probable_parto < end_dt).all()
        
        # 4. Finanzas
        pagos_mes = MovimientoFinanciero.query.filter(MovimientoFinanciero.estado == 'Pendiente', MovimientoFinanciero.fecha >= inicio_mes, MovimientoFinanciero.fecha < fin_mes).all()

        total = len(eventos_mes) + len(protos_mes) + len(partos_mes) + len(pagos_mes)
        completados = len([e for e in eventos_mes if e.completado]) + len([p for p in protos_mes if p.fecha_realizada])
        pendientes = total - completados

        # Vencidos (Pasados de hoy y no realizados/completados)
        ahora = datetime.now()
        vencidos = len([e for e in eventos_mes if not e.completado and e.fecha_inicio < ahora]) + \
                   len([p for p in protos_mes if not p.fecha_realizada and p.fecha_programada < ahora])

        return jsonify({
            'total_mes': total,
            'completados_mes': completados,
            'pendientes_mes': pendientes,
            'pendientes_hoy': vencidos, # Usado para el card de "vencidos"
            'por_tipo': {
                'Salud': len(protos_mes),
                'Parto': len(partos_mes),
                'Finanzas': len(pagos_mes),
                'Otros': len(eventos_mes)
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def _color_por_tipo(tipo):
    """Asigna color por defecto según el tipo de evento."""
    colores = {
        'Vacunación': '#3b82f6',
        'Parto': '#ec4899',
        'Destete': '#f59e0b',
        'Rotación': '#22c55e',
        'Veterinario': '#ef4444',
        'Reunión': '#8b5cf6',
        'Inventario': '#06b6d4',
        'Financiero': '#10b981',
        'Otro': '#6b7280'
    }
    return colores.get(tipo, '#3b82f6')
