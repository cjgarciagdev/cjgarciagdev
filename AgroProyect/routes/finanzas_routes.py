# ==============================================================================
# RUTAS API: MÓDULO FINANCIERO (Ingresos y Gastos)
# ==============================================================================
from flask import Blueprint, request, jsonify, session
from models import db, MovimientoFinanciero, Ganado
from datetime import datetime, date, timedelta
from sqlalchemy import func, and_, extract

finanzas_bp = Blueprint('finanzas', __name__)

@finanzas_bp.route('/api/finanzas', methods=['GET'])
def get_movimientos():
    """Lista movimientos financieros con filtros."""
    try:
        tipo = request.args.get('tipo')  # Ingreso o Gasto
        categoria = request.args.get('categoria')
        estado = request.args.get('estado')
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))

        query = MovimientoFinanciero.query

        if tipo:
            query = query.filter_by(tipo=tipo)
        if categoria:
            query = query.filter_by(categoria=categoria)
        if estado:
            query = query.filter_by(estado=estado)
        if fecha_desde:
            query = query.filter(MovimientoFinanciero.fecha >= datetime.strptime(fecha_desde, '%Y-%m-%d'))
        if fecha_hasta:
            query = query.filter(MovimientoFinanciero.fecha <= datetime.strptime(fecha_hasta + ' 23:59:59', '%Y-%m-%d %H:%M:%S'))

        total = query.count()
        movimientos = query.order_by(MovimientoFinanciero.fecha.desc()).limit(per_page).offset((page - 1) * per_page).all()

        return jsonify({
            'movimientos': [m.to_dict() for m in movimientos],
            'total': total,
            'page': page
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@finanzas_bp.route('/api/finanzas', methods=['POST'])
def add_movimiento():
    """Registra un nuevo movimiento financiero."""
    try:
        data = request.json
        if not data.get('tipo') or not data.get('categoria') or not data.get('monto'):
            return jsonify({'error': 'tipo, categoría y monto son requeridos'}), 400

        mov = MovimientoFinanciero(
            tipo=data['tipo'],
            categoria=data['categoria'],
            subcategoria=data.get('subcategoria'),
            monto=float(data['monto']),
            moneda=data.get('moneda', 'USD'),
            descripcion=data.get('descripcion'),
            animal_id=int(data['animal_id']) if data.get('animal_id') else None,
            lote_id=int(data['lote_id']) if data.get('lote_id') else None,
            insumo_id=int(data['insumo_id']) if data.get('insumo_id') else None,
            numero_factura=data.get('numero_factura'),
            proveedor_cliente=data.get('proveedor_cliente'),
            estado=data.get('estado', 'Completado'),
            usuario=session.get('username', 'admin')
        )

        if data.get('fecha'):
            try:
                mov.fecha = datetime.strptime(data['fecha'], '%Y-%m-%dT%H:%M')
            except:
                mov.fecha = datetime.strptime(data['fecha'], '%Y-%m-%d')

        if data.get('fecha_vencimiento'):
            mov.fecha_vencimiento = datetime.strptime(data['fecha_vencimiento'], '%Y-%m-%d').date()

        db.session.add(mov)
        db.session.commit()
        return jsonify({'status': 'success', 'id': mov.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@finanzas_bp.route('/api/finanzas/<int:id>', methods=['PUT'])
def update_movimiento(id):
    """Actualiza un movimiento financiero."""
    try:
        mov = MovimientoFinanciero.query.get(id)
        if not mov:
            return jsonify({'error': 'Movimiento no encontrado'}), 404

        data = request.json
        for campo in ['tipo', 'categoria', 'subcategoria', 'descripcion', 'moneda',
                       'numero_factura', 'proveedor_cliente', 'estado']:
            if campo in data:
                setattr(mov, campo, data[campo])
        
        if 'monto' in data:
            mov.monto = float(data['monto'])

        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@finanzas_bp.route('/api/finanzas/<int:id>', methods=['DELETE'])
def delete_movimiento(id):
    """Elimina un movimiento financiero."""
    try:
        mov = MovimientoFinanciero.query.get(id)
        if not mov:
            return jsonify({'error': 'Movimiento no encontrado'}), 404
        db.session.delete(mov)
        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@finanzas_bp.route('/api/finanzas/resumen')
def resumen_financiero():
    """Resumen financiero: balance, ingresos, gastos, tendencias."""
    try:
        hoy = date.today()
        inicio_mes = hoy.replace(day=1)
        inicio_anio = hoy.replace(month=1, day=1)

        # Ingresos y gastos del mes
        ingresos_mes = db.session.query(func.sum(MovimientoFinanciero.monto)).filter(
            and_(
                MovimientoFinanciero.tipo == 'Ingreso',
                func.date(MovimientoFinanciero.fecha) >= inicio_mes,
                MovimientoFinanciero.estado != 'Cancelado'
            )
        ).scalar() or 0

        gastos_mes = db.session.query(func.sum(MovimientoFinanciero.monto)).filter(
            and_(
                MovimientoFinanciero.tipo == 'Gasto',
                func.date(MovimientoFinanciero.fecha) >= inicio_mes,
                MovimientoFinanciero.estado != 'Cancelado'
            )
        ).scalar() or 0

        # Ingresos y gastos del año
        ingresos_anio = db.session.query(func.sum(MovimientoFinanciero.monto)).filter(
            and_(
                MovimientoFinanciero.tipo == 'Ingreso',
                func.date(MovimientoFinanciero.fecha) >= inicio_anio,
                MovimientoFinanciero.estado != 'Cancelado'
            )
        ).scalar() or 0

        gastos_anio = db.session.query(func.sum(MovimientoFinanciero.monto)).filter(
            and_(
                MovimientoFinanciero.tipo == 'Gasto',
                func.date(MovimientoFinanciero.fecha) >= inicio_anio,
                MovimientoFinanciero.estado != 'Cancelado'
            )
        ).scalar() or 0

        # Gastos por categoría (mes)
        gastos_por_cat = db.session.query(
            MovimientoFinanciero.categoria,
            func.sum(MovimientoFinanciero.monto).label('total')
        ).filter(
            and_(
                MovimientoFinanciero.tipo == 'Gasto',
                func.date(MovimientoFinanciero.fecha) >= inicio_mes,
                MovimientoFinanciero.estado != 'Cancelado'
            )
        ).group_by(MovimientoFinanciero.categoria).all()

        # Ingresos por categoría (mes)
        ingresos_por_cat = db.session.query(
            MovimientoFinanciero.categoria,
            func.sum(MovimientoFinanciero.monto).label('total')
        ).filter(
            and_(
                MovimientoFinanciero.tipo == 'Ingreso',
                func.date(MovimientoFinanciero.fecha) >= inicio_mes,
                MovimientoFinanciero.estado != 'Cancelado'
            )
        ).group_by(MovimientoFinanciero.categoria).all()

        # Flujo de caja por mes (últimos 12 meses)
        flujo_mensual = []
        for i in range(11, -1, -1):
            mes_ref = hoy - timedelta(days=30 * i)
            mes_inicio = mes_ref.replace(day=1)
            if mes_ref.month == 12:
                mes_fin = mes_ref.replace(year=mes_ref.year + 1, month=1, day=1)
            else:
                mes_fin = mes_ref.replace(month=mes_ref.month + 1, day=1)

            ing = db.session.query(func.sum(MovimientoFinanciero.monto)).filter(
                and_(
                    MovimientoFinanciero.tipo == 'Ingreso',
                    func.date(MovimientoFinanciero.fecha) >= mes_inicio,
                    func.date(MovimientoFinanciero.fecha) < mes_fin,
                    MovimientoFinanciero.estado != 'Cancelado'
                )
            ).scalar() or 0

            gas = db.session.query(func.sum(MovimientoFinanciero.monto)).filter(
                and_(
                    MovimientoFinanciero.tipo == 'Gasto',
                    func.date(MovimientoFinanciero.fecha) >= mes_inicio,
                    func.date(MovimientoFinanciero.fecha) < mes_fin,
                    MovimientoFinanciero.estado != 'Cancelado'
                )
            ).scalar() or 0

            flujo_mensual.append({
                'mes': mes_inicio.strftime('%Y-%m'),
                'mes_nombre': mes_inicio.strftime('%b %Y'),
                'ingresos': round(ing, 2),
                'gastos': round(gas, 2),
                'balance': round(ing - gas, 2)
            })

        # Pagos pendientes
        pendientes = db.session.query(func.sum(MovimientoFinanciero.monto)).filter(
            MovimientoFinanciero.estado == 'Pendiente'
        ).scalar() or 0

        return jsonify({
            'mes': {
                'ingresos': round(ingresos_mes, 2),
                'gastos': round(gastos_mes, 2),
                'balance': round(ingresos_mes - gastos_mes, 2)
            },
            'anio': {
                'ingresos': round(ingresos_anio, 2),
                'gastos': round(gastos_anio, 2),
                'balance': round(ingresos_anio - gastos_anio, 2)
            },
            'gastos_por_categoria': {cat: round(total, 2) for cat, total in gastos_por_cat},
            'ingresos_por_categoria': {cat: round(total, 2) for cat, total in ingresos_por_cat},
            'flujo_mensual': flujo_mensual,
            'pagos_pendientes': round(pendientes, 2)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@finanzas_bp.route('/api/finanzas/categorias')
def categorias_financieras():
    """Retorna las categorías predefinidas de ingresos y gastos."""
    return jsonify({
        'ingresos': [
            'Venta de Animal', 'Venta de Leche', 'Venta de Carne',
            'Venta de Queso', 'Venta de Lana', 'Servicios (Monta)',
            'Subsidios', 'Otros Ingresos'
        ],
        'gastos': [
            'Alimentación', 'Medicinas/Veterinario', 'Insumos Operativos',
            'Mano de Obra', 'Transporte', 'Mantenimiento/Reparaciones',
            'Servicios Públicos', 'Compra de Animal', 'Semillas/Pastizales',
            'Impuestos', 'Seguros', 'Otros Gastos'
        ]
    })
