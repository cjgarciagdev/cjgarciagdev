"""
Aplicación web Flask para el sistema de predicción
Sistema de carga manual de datos (sin web scraping)
"""
from flask import Flask, render_template, request, jsonify, redirect, url_for
from database import init_db, get_session, NumeroExtraido, Prediccion
from predictor import PredictorNumeros
from datetime import datetime, timedelta
import json
import os
import logging

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'clave-secreta-desarrollo')

# Inicializar base de datos
init_db()

# Configurar logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.route('/')
def index():
    """Página principal"""
    session = get_session()
    try:
        total_numeros = session.query(NumeroExtraido).count()
        total_predicciones = session.query(Prediccion).count()

        ultimos_numeros = session.query(NumeroExtraido)\
            .order_by(NumeroExtraido.fecha_extraccion.desc())\
            .limit(10)\
            .all()

        ultima_prediccion = session.query(Prediccion)\
            .order_by(Prediccion.fecha_prediccion.desc())\
            .first()

        return render_template('index.html',
            total_numeros=total_numeros,
            total_predicciones=total_predicciones,
            ultimos_numeros=ultimos_numeros,
            ultima_prediccion=ultima_prediccion
        )
    finally:
        session.close()


@app.route('/dashboard')
def dashboard():
    """Dashboard con análisis completo"""
    session = get_session()
    try:
        predictor = PredictorNumeros()
        numeros, fechas = predictor.obtener_datos_historicos(limite=500)

        stats = {}
        predicciones = {}

        if len(numeros) >= predictor.min_samples:
            stats = predictor.analisis_estadistico(numeros)
            predicciones = predictor.predecir_proximo_numero(metodo='combinado')

        return render_template('dashboard.html',
            numeros=numeros,
            fechas=[f.isoformat() for f in fechas],
            stats=stats,
            predicciones=predicciones
        )
    finally:
        session.close()


@app.route('/carga-datos')
def carga_datos():
    """Página de carga manual de datos"""
    session = get_session()
    try:
        total = session.query(NumeroExtraido).count()
        ultimos = session.query(NumeroExtraido)\
            .order_by(NumeroExtraido.fecha_extraccion.desc())\
            .limit(20)\
            .all()
        return render_template('carga_datos.html', total=total, ultimos=ultimos)
    finally:
        session.close()


@app.route('/api/numeros/agregar', methods=['POST'])
def agregar_numero_manual():
    """Agregar un número manualmente"""
    data = request.json
    numero = data.get('numero')
    sorteo = data.get('sorteo', 'Manual')
    hora = data.get('hora', datetime.now().strftime('%H:%M'))
    fecha_str = data.get('fecha')

    if numero is None:
        return jsonify({'success': False, 'error': 'Número no proporcionado'}), 400

    try:
        numero = int(numero)
    except (ValueError, TypeError):
        return jsonify({'success': False, 'error': 'Número inválido'}), 400

    if fecha_str:
        try:
            fecha = datetime.strptime(fecha_str, '%Y-%m-%d')
            if hora:
                h, m = hora.split(':')
                fecha = fecha.replace(hour=int(h), minute=int(m))
        except Exception:
            fecha = datetime.now()
    else:
        fecha = datetime.now()

    session = get_session()
    try:
        nuevo = NumeroExtraido(
            numero=numero,
            nombre_sorteo=sorteo,
            hora_sorteo=hora,
            fuente='Carga Manual',
            fecha_extraccion=fecha
        )
        session.add(nuevo)
        session.commit()
        return jsonify({'success': True, 'mensaje': 'Número agregado correctamente', 'id': nuevo.id})
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/numeros/agregar-lote', methods=['POST'])
def agregar_numeros_lote():
    """Agregar múltiples números de una vez (desde texto o lista)"""
    data = request.json
    numeros_raw = data.get('numeros', '')
    sorteo = data.get('sorteo', 'Carga en Lote')
    fecha_str = data.get('fecha', datetime.now().strftime('%Y-%m-%d'))

    import re
    # Extraer todos los números del texto ingresado
    numeros_encontrados = re.findall(r'\b\d+\b', str(numeros_raw))
    numeros_encontrados = [int(n) for n in numeros_encontrados]

    if not numeros_encontrados:
        return jsonify({'success': False, 'error': 'No se encontraron números válidos en el texto'}), 400

    try:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d')
    except Exception:
        fecha = datetime.now()

    session = get_session()
    try:
        guardados = 0
        for num in numeros_encontrados:
            nuevo = NumeroExtraido(
                numero=num,
                nombre_sorteo=sorteo,
                hora_sorteo=datetime.now().strftime('%H:%M'),
                fuente='Carga en Lote',
                fecha_extraccion=fecha
            )
            session.add(nuevo)
            guardados += 1

        session.commit()
        return jsonify({
            'success': True,
            'mensaje': f'{guardados} números guardados correctamente',
            'numeros': numeros_encontrados
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/numeros/eliminar/<int:num_id>', methods=['DELETE'])
def eliminar_numero(num_id):
    """Eliminar un número por ID"""
    session = get_session()
    try:
        registro = session.query(NumeroExtraido).get(num_id)
        if not registro:
            return jsonify({'success': False, 'error': 'Registro no encontrado'}), 404
        session.delete(registro)
        session.commit()
        return jsonify({'success': True, 'mensaje': 'Número eliminado'})
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/numeros/eliminar-todos', methods=['DELETE'])
def eliminar_todos_numeros():
    """Eliminar todos los números de la base de datos"""
    session = get_session()
    try:
        eliminados = session.query(NumeroExtraido).delete()
        session.commit()
        return jsonify({'success': True, 'mensaje': f'{eliminados} registros eliminados'})
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/prediccion/generar', methods=['POST'])
def generar_prediccion():
    """Generar nueva predicción"""
    data = request.json
    metodo = data.get('metodo', 'combinado')

    try:
        predictor = PredictorNumeros()
        predicciones = predictor.predecir_proximo_numero(metodo=metodo)

        if 'error' in predicciones:
            return jsonify({'success': False, 'error': predicciones['error']})

        pred_principal = predicciones.get(metodo, predicciones.get('combinado'))
        if pred_principal:
            predictor.guardar_prediccion(
                pred_principal['numero'],
                pred_principal['confianza'],
                metodo
            )

        return jsonify({
            'success': True,
            'predicciones': predicciones
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/estadisticas')
def obtener_estadisticas():
    """Obtener estadísticas del sistema"""
    try:
        predictor = PredictorNumeros()
        numeros, fechas = predictor.obtener_datos_historicos(limite=500)

        if len(numeros) < predictor.min_samples:
            return jsonify({
                'error': 'Datos insuficientes',
                'disponibles': len(numeros),
                'necesarios': predictor.min_samples
            })

        stats = predictor.analisis_estadistico(numeros)

        return jsonify({
            'success': True,
            'estadisticas': stats
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/numeros/recientes')
def obtener_numeros_recientes():
    """Obtener los números más recientes"""
    limite = request.args.get('limite', 50, type=int)
    session = get_session()

    try:
        numeros = session.query(NumeroExtraido)\
            .order_by(NumeroExtraido.fecha_extraccion.desc())\
            .limit(limite)\
            .all()

        datos = [
            {
                'id': n.id,
                'numero': n.numero,
                'fecha': n.fecha_extraccion.isoformat(),
                'sorteo': n.nombre_sorteo or 'N/A',
                'hora': n.hora_sorteo or 'N/A',
                'fuente': n.fuente or 'Manual'
            }
            for n in numeros
        ]

        return jsonify({'success': True, 'numeros': datos})

    finally:
        session.close()


@app.route('/historial')
def historial():
    """Página de historial de predicciones"""
    session = get_session()
    try:
        predicciones = session.query(Prediccion)\
            .order_by(Prediccion.fecha_prediccion.desc())\
            .limit(100)\
            .all()

        return render_template('historial.html', predicciones=predicciones)
    finally:
        session.close()


@app.route('/historial-resultados')
def historial_resultados():
    """Página de historial de números ingresados"""
    pagina = request.args.get('pagina', 1, type=int)
    por_pagina = 50
    session = get_session()
    try:
        total_numeros = session.query(NumeroExtraido).count()
        total_paginas = (total_numeros + por_pagina - 1) // por_pagina

        numeros = session.query(NumeroExtraido)\
            .order_by(NumeroExtraido.fecha_extraccion.desc())\
            .offset((pagina - 1) * por_pagina)\
            .limit(por_pagina)\
            .all()

        return render_template('historial_resultados.html',
                             numeros=numeros,
                             pagina=pagina,
                             total_paginas=total_paginas,
                             total_numeros=total_numeros)
    finally:
        session.close()


@app.errorhandler(404)
def pagina_no_encontrada(e):
    return render_template('404.html'), 404


@app.errorhandler(500)
def error_servidor(e):
    return render_template('500.html'), 500


if __name__ == '__main__':
    print("\n" + "="*50)
    print("SISTEMA DE PREDICCION - Prediccion-7")
    print("="*50)
    print(f"\nServidor: http://127.0.0.1:5000")
    print(f"Iniciado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    app.run(debug=True, host='0.0.0.0', port=5000)
