from flask import Blueprint, send_file, jsonify
from services.export_service import ExportadorExcel, ExportadorPDF, generar_grafica_pesos, generar_grafica_especie
from models import (
    obtener_animal, obtener_pesos_animal, PlanNutricional, Ganado, 
    HistorialMedico, ProtocoloSalud, ExpedienteMedico, obtener_plan_nutricional, 
    obtener_todos, obtener_estadisticas, RegistroProduccion, MovimientoFinanciero, Insumo, Lote,
    db
)
from services.animal_service import calcular_nutricion
from utils.decorators import require_permission
from datetime import datetime
import io
import matplotlib.pyplot as plt
from io import BytesIO
import logging

# ==============================================================================
# MÓDULO DE EXPORTACIÓN Y GENERACIÓN DE REPORTES
# Este Blueprint gestiona la creación de documentos PDF y Excel.
# 
# ARQUITECTURA: 
# Utiliza servicios especializados (ExportadorPDF, ExportadorExcel) para desacoplar
# la lógica de formato de las rutas web. Integra Matplotlib para gráficas dinámicas.
# ==============================================================================

export_bp = Blueprint('export', __name__)
logger = logging.getLogger(__name__)

# --- Exportación General (Inventario) ---

@export_bp.route('/api/export/excel/completo')
@require_permission('exportar')
def export_excel_completo():
    """Genera y descarga un reporte completo en Excel"""
    try:
        animales_db = obtener_todos()
        # Asegurar formato
        if animales_db and not isinstance(animales_db[0], dict):
             animales = [a.to_dict() for a in animales_db]
        else:
             animales = animales_db

        exportador = ExportadorExcel("Inventario Completo")
        exportador.agregar_datos(animales)
        
        # Estadísticas
        total, peso, alertas, criticos, _, _ = obtener_estadisticas()
        exportador.agregar_estadisticas(total, peso, alertas, criticos)
        
        output = exportador.obtener_bytes()
        
        return send_file(
            output,
            download_name=f'inventario_{datetime.now().strftime("%Y%m%d")}.xlsx',
            as_attachment=True,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as e:
        logger.error(f"Error exportando Excel: {e}")
        return jsonify({'error': str(e)}), 500

@export_bp.route('/api/export/excel')
@require_permission('exportar')
def export_excel():
    """Alias para excel completo"""
    return export_excel_completo()

@export_bp.route('/api/export/pdf/inventario')
@require_permission('exportar')
def export_pdf_inventario():
    ganado_list = obtener_todos()
    descripcion = "Reporte detallado de la población ganadera actual. Este informe consolida la información de identificación, ubicación por lote y estado productivo."
    exportador = ExportadorPDF("Inventario Centralizado", descripcion=descripcion)
    
    # Tabla
    headers = ['ID', 'Código', 'Especie', 'Estado', 'Peso (kg)']
    try:
        datos = [[str(a['id']), a.get('codigo_identificacion', 'N/A'), a['especie'], a['estado'], f"{a['peso']}"] for a in ganado_list]
    except Exception: 
        datos = [[str(a.id), a.codigo_identificacion, a.especie, a.cat_estado.nombre, str(a.peso)] for a in ganado_list]

    exportador.agregar_tabla(headers, datos)
    
    # Gráficas
    exportador.pdf.ln(5)
    exportador.pdf.set_font("Arial", 'B', 12)
    exportador.pdf.cell(0, 8, txt="Representación Visual de Población", ln=True)
    exportador.pdf.ln(2)
    
    try:
        grafica_buf = generar_grafica_especie(ganado_list)
        exportador.pdf.image(grafica_buf, x=30, w=150)
        exportador.pdf.ln(5)
    except Exception as e:
        logger.error(f"Error al generar gráfica para inventario: {e}")
        
    # Estadísticas
    total, peso_avg, alertas, criticos, _, inv_critico = obtener_estadisticas()
    stats = {
        'Población Total': f"{total} ejemplares",
        'Biomasa Promedio': f"{peso_avg} kg",
        'Alertas de salud': alertas,
        'Casos Críticos': criticos,
        'Insumos en Bajo Stock': inv_critico
    }
    exportador.agregar_estadisticas(stats)
    
    output = exportador.obtener_bytes()
    return send_file(output, download_name=f'inventario_agro_{datetime.now().strftime("%Y%m%d")}.pdf', as_attachment=True)

@export_bp.route('/api/export/pdf/smart-report')
@require_permission('exportar')
def export_smart_report():
    """
    GENERADOR DE REPORTE INTELIGENTE (SMART REPORT):
    Consolida métricas de múltiples módulos: Animales, Producción, Finanzas e Inventario.
    """
    try:
        hoy = datetime.now()
        mes_actual = hoy.month
        anio_actual = hoy.year
        
        descripcion = f"Informe Gerencial Consolidado. Resumen analítico de población, producción, finanzas e inventario para el período de {hoy.strftime('%B %Y')}."
        exportador = ExportadorPDF("REPORTE GERENCIAL INTELIGENTE", descripcion=descripcion)
        
        # 0. RESUMEN DE POBLACIÓN
        exportador.pdf.ln(5)
        exportador.pdf.set_fill_color(31, 41, 55) # Gris Oscuro
        exportador.pdf.set_text_color(255, 255, 255)
        exportador.pdf.set_font("Arial", 'B', 14)
        exportador.pdf.cell(0, 10, txt="  1. ESTADÍSTICA DE POBLACIÓN", ln=True, fill=True)
        exportador.pdf.set_text_color(0, 0, 0)
        
        total, peso_avg, alertas, criticos, _, inv_bajo = obtener_estadisticas()
        ganado_list = obtener_todos()
        
        exportador.pdf.ln(3)
        exportador.pdf.set_font("Arial", '', 11)
        exportador.pdf.cell(0, 7, txt=f"- Población Total: {total} ejemplares", ln=True)
        exportador.pdf.cell(0, 7, txt=f"- Biomasa Total Estimada: {sum(a['peso'] for a in ganado_list):,.2f} kg", ln=True)
        exportador.pdf.cell(0, 7, txt=f"- Casos con Alerta de Salud: {alertas}", ln=True)
        exportador.pdf.cell(0, 7, txt=f"- Animales en Estado Crítico: {criticos}", ln=True)

        # 1. RESUMEN DE PRODUCCIÓN (Mes en curso)
        exportador.pdf.ln(8)
        exportador.pdf.set_fill_color(37, 99, 235) # Azul Producción
        exportador.pdf.set_text_color(255, 255, 255)
        exportador.pdf.cell(0, 10, txt="  2. ANALÍTICA DE PRODUCCIÓN MENSUAL", ln=True, fill=True)
        exportador.pdf.set_text_color(0, 0, 0)
        
        prod_mes = RegistroProduccion.query.filter(
            db.func.extract('month', RegistroProduccion.fecha) == mes_actual,
            db.func.extract('year', RegistroProduccion.fecha) == anio_actual
        ).all()
        
        # Agrupar por tipo de producción
        tipos_prod = {}
        for p in prod_mes:
            if p.tipo_produccion not in tipos_prod:
                tipos_prod[p.tipo_produccion] = {'total': 0, 'unidad': p.unidad, 'count': 0}
            tipos_prod[p.tipo_produccion]['total'] += p.cantidad
            tipos_prod[p.tipo_produccion]['count'] += 1

        exportador.pdf.ln(3)
        if prod_mes:
            for tipo, data in tipos_prod.items():
                avg = data['total'] / data['count']
                exportador.pdf.set_font("Arial", 'B', 10)
                exportador.pdf.cell(0, 7, txt=f"Tipo: {tipo}", ln=True)
                exportador.pdf.set_font("Arial", '', 10)
                exportador.pdf.cell(0, 6, txt=f"   - Total {tipo}: {data['total']:.2f} {data['unidad']}", ln=True)
                exportador.pdf.cell(0, 6, txt=f"   - Promedio por Registro: {avg:.2f} {data['unidad']}", ln=True)
                exportador.pdf.cell(0, 6, txt=f"   - Nro. de Registros: {data['count']}", ln=True)
        else:
            exportador.pdf.set_font("Arial", 'I', 11)
            exportador.pdf.cell(0, 7, txt="Sin registros de producción en este mes.", ln=True)

        # 2. BALANCE FINANCIERO
        exportador.pdf.ln(8)
        exportador.pdf.set_fill_color(16, 185, 129) # Esmeralda Finanzas
        exportador.pdf.set_text_color(255, 255, 255)
        exportador.pdf.cell(0, 10, txt="  3. BALANCE FINANCIERO MENSUAL", ln=True, fill=True)
        exportador.pdf.set_text_color(0, 0, 0)
        
        mov_mes = MovimientoFinanciero.query.filter(
            db.func.extract('month', MovimientoFinanciero.fecha) == mes_actual,
            db.func.extract('year', MovimientoFinanciero.fecha) == anio_actual
        ).all()
        
        ingresos = sum(m.monto for m in mov_mes if m.tipo == 'Ingreso')
        gastos = sum(m.monto for m in mov_mes if m.tipo == 'Gasto')
        balance = ingresos - gastos
        
        exportador.pdf.ln(3)
        exportador.pdf.set_font("Arial", 'B', 11)
        exportador.pdf.cell(0, 7, txt=f"Ingresos Totales: ${ingresos:,.2f} USD", ln=True)
        exportador.pdf.set_text_color(220, 38, 38)
        exportador.pdf.cell(0, 7, txt=f"Gastos Totales: ${gastos:,.2f} USD", ln=True)
        
        if balance >= 0:
            exportador.pdf.set_text_color(22, 163, 74)
            prep = "UTILIDAD"
        else:
            exportador.pdf.set_text_color(220, 38, 38)
            prep = "PÉRDIDA"
            
        exportador.pdf.cell(0, 8, txt=f"BALANCE NETO DEL MES ({prep}): ${balance:,.2f} USD", ln=True)
        exportador.pdf.set_text_color(0, 0, 0)

        # 3. ESTADO CRÍTICO DE INVENTARIO
        exportador.pdf.ln(8)
        exportador.pdf.set_fill_color(249, 115, 22) # Naranja Inventario
        exportador.pdf.set_text_color(255, 255, 255)
        exportador.pdf.cell(0, 10, txt="  4. ALERTAS DE INVENTARIO Y ALMACÉN", ln=True, fill=True)
        exportador.pdf.set_text_color(0, 0, 0)
        
        insumos_criticos = Insumo.query.filter(Insumo.cantidad <= Insumo.stock_minimo).all()
        
        if insumos_criticos:
            exportador.pdf.ln(3)
            exportador.pdf.set_font("Arial", 'B', 9)
            exportador.pdf.set_fill_color(243, 244, 246)
            exportador.pdf.cell(80, 7, txt="Material/Insumo", border=1, fill=True)
            exportador.pdf.cell(40, 7, txt="Stock Actual", border=1, fill=True)
            exportador.pdf.cell(40, 7, txt="Stock Mínimo", border=1, fill=True)
            exportador.pdf.cell(30, 7, txt="Estado", border=1, fill=True)
            exportador.pdf.ln()
            
            exportador.pdf.set_font("Arial", '', 9)
            for ins in insumos_criticos:
                exportador.pdf.cell(80, 6, txt=ins.nombre, border=1)
                exportador.pdf.cell(40, 6, txt=f"{ins.cantidad} {ins.cat_unidad.nombre if ins.cat_unidad else ''}", border=1)
                exportador.pdf.cell(40, 6, txt=f"{ins.stock_minimo}", border=1)
                exportador.pdf.set_text_color(220, 38, 38)
                exportador.pdf.cell(30, 6, txt="BAJO STOCK", border=1)
                exportador.pdf.set_text_color(0, 0, 0)
                exportador.pdf.ln()
        else:
            exportador.pdf.ln(3)
            exportador.pdf.cell(0, 7, txt="Todos los insumos se encuentran dentro de los niveles óptimos de stock.", ln=True)

        # 4. RESUMEN DE SALUD Y PROTOCOLOS
        exportador.pdf.ln(8)
        exportador.pdf.set_fill_color(220, 38, 38) # Rojo Salud
        exportador.pdf.set_text_color(255, 255, 255)
        exportador.pdf.cell(0, 10, txt="  5. RESUMEN DE SALUD Y MEDICINA", ln=True, fill=True)
        exportador.pdf.set_text_color(0, 0, 0)
        
        protocolos_hoy = ProtocoloSalud.query.filter(
            db.func.date(ProtocoloSalud.fecha_programada) == hoy.date()
        ).count()
        
        historial_reciente = HistorialMedico.query.order_by(HistorialMedico.fecha.desc()).limit(5).all()
        
        exportador.pdf.ln(3)
        exportador.pdf.set_font("Arial", 'B', 10)
        exportador.pdf.cell(0, 7, txt=f"- Protocolos Programados para Hoy: {protocolos_hoy}", ln=True)
        
        if historial_reciente:
            exportador.pdf.ln(2)
            exportador.pdf.set_font("Arial", 'B', 9)
            exportador.pdf.cell(0, 6, txt="Últimos Eventos Médicos:", ln=True)
            exportador.pdf.set_font("Arial", '', 8)
            for h in historial_reciente:
                fecha_s = h.fecha.strftime('%d/%m')
                exportador.pdf.cell(0, 5, txt=f"   [{fecha_s}] Animal #{h.animal_id}: {h.cat_tipo.nombre if h.cat_tipo else 'Chequeo'} - {h.descripcion[:60]}...", ln=True)

        output = exportador.obtener_bytes()
        return send_file(output, download_name=f'REPORTE_INTELIGENTE_{hoy.strftime("%Y%m%d")}.pdf', as_attachment=True)

    except Exception as e:
        logger.error(f"Error en Reporte Inteligente: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

# --- Fichas y Planes Individuales ---

@export_bp.route('/api/export/pdf/ficha/<int:id>')
@require_permission('exportar')
def export_pdf_ficha(id):
    """
    GENERADOR DE FICHA TÉCNICA (PDF):
    Genera un documento profesional con la identidad visual de la finca.
    
    Flujo:
    1. Obtiene datos maestros del animal y su historial de pesajes.
    2. Genera una gráfica de evolución temporal (Matplotlib) en memoria (BytesIO).
    3. Construye secciones visuales con colores corporativos.
    4. Provee un análisis de ganancia de peso (inicial vs actual).
    """
    animal = obtener_animal(id)
    if not animal:
        return jsonify({'error': 'Animal not found'}), 404
        
    descripcion = f"Ficha técnica del animal #{id}. Incluye información general y seguimiento de evolución de peso para control de crecimiento."
    exportador = ExportadorPDF(f"Ficha Técnica - Animal #{id}", descripcion=descripcion)
    
    # ==================== INFORMACIÓN GENERAL ====================
    exportador.pdf.set_fill_color(27, 67, 50)  # Verde oscuro
    exportador.pdf.set_text_color(255, 255, 255)
    exportador.pdf.set_font("Arial", 'B', 14)
    exportador.pdf.cell(0, 10, txt="  INFORMACIÓN GENERAL", ln=True, fill=True)
    exportador.pdf.set_text_color(0, 0, 0)
    exportador.pdf.ln(3)
    
    # Tabla de información en 2 columnas
    exportador.pdf.set_font("Arial", '', 11)
    col_width = 95
    row_height = 8
    
    info_data = [
        ("ID del Animal:", str(animal['id']), "Especie:", animal['especie']),
        ("Raza:", animal['raza'], "Sexo:", animal['sexo']),
        ("Peso Actual:", f"{animal['peso']} kg", "Edad:", f"{animal['edad']} meses"),
        ("Estado:", animal['estado'], "Fecha Nacimiento:", animal.get('fecha_nacimiento', 'N/D')),
    ]
    
    for row in info_data:
        exportador.pdf.set_font("Arial", 'B', 10)
        exportador.pdf.cell(40, row_height, txt=row[0], border=0)
        exportador.pdf.set_font("Arial", '', 10)
        exportador.pdf.cell(55, row_height, txt=row[1], border=0)
        exportador.pdf.set_font("Arial", 'B', 10)
        exportador.pdf.cell(40, row_height, txt=row[2], border=0)
        exportador.pdf.set_font("Arial", '', 10)
        exportador.pdf.cell(55, row_height, txt=row[3], border=0)
        exportador.pdf.ln()
    
    # ==================== GRÁFICA DE EVOLUCIÓN DE PESO ====================
    pesos = obtener_pesos_animal(id)
    
    if pesos and len(pesos) >= 1:
        exportador.pdf.ln(8)
        exportador.pdf.set_fill_color(59, 130, 246)  # Azul
        exportador.pdf.set_text_color(255, 255, 255)
        exportador.pdf.set_font("Arial", 'B', 14)
        exportador.pdf.cell(0, 10, txt="  EVOLUCIÓN DE PESO", ln=True, fill=True)
        exportador.pdf.set_text_color(0, 0, 0)
        exportador.pdf.ln(3)
        
        # Generar gráfica
        try:
            fig, ax = plt.subplots(figsize=(8, 3.5))
            fechas = [p['fecha'].split(' ')[0] for p in pesos]
            valores = [p['peso'] for p in pesos]
            
            # Añadir peso actual si no está
            if len(valores) == 0:
                fechas = ['Actual']
                valores = [animal['peso']]
            
            ax.plot(fechas, valores, marker='o', linewidth=2, color='#1b4332', markersize=6)
            ax.fill_between(range(len(fechas)), valores, alpha=0.3, color='#1b4332')
            ax.set_xlabel('Fecha', fontsize=10)
            ax.set_ylabel('Peso (kg)', fontsize=10)
            ax.set_title(f"Evolución de Peso - {animal['especie']} #{id}", fontsize=12, fontweight='bold')
            ax.grid(True, alpha=0.3)
            plt.xticks(rotation=45, ha='right', fontsize=8)
            plt.tight_layout()
            
            img_buffer = BytesIO()
            plt.savefig(img_buffer, format='PNG', dpi=100, bbox_inches='tight')
            img_buffer.seek(0)
            plt.close(fig)
            
            exportador.pdf.image(img_buffer, x=25, w=160)
            exportador.pdf.ln(5)
        except Exception as e:
            logger.error(f"Error generando gráfica de peso: {e}")
            exportador.pdf.set_font("Arial", 'I', 10)
            exportador.pdf.cell(0, 8, txt="No se pudo generar la gráfica.", ln=True)
    
    # ==================== TABLA HISTORIAL DE PESOS ====================
    if pesos and len(pesos) > 0:
        exportador.pdf.ln(5)
        exportador.pdf.set_fill_color(34, 197, 94)  # Verde
        exportador.pdf.set_text_color(255, 255, 255)
        exportador.pdf.set_font("Arial", 'B', 14)
        exportador.pdf.cell(0, 10, txt="  REGISTRO DE PESAJES", ln=True, fill=True)
        exportador.pdf.set_text_color(0, 0, 0)
        exportador.pdf.ln(3)
        
        # Encabezados de tabla
        exportador.pdf.set_fill_color(240, 240, 240)
        exportador.pdf.set_font("Arial", 'B', 10)
        exportador.pdf.cell(15, 8, txt="#", border=1, align='C', fill=True)
        exportador.pdf.cell(55, 8, txt="Fecha", border=1, align='C', fill=True)
        exportador.pdf.cell(40, 8, txt="Peso (kg)", border=1, align='C', fill=True)
        exportador.pdf.cell(40, 8, txt="Variación", border=1, align='C', fill=True)
        exportador.pdf.cell(40, 8, txt="% Cambio", border=1, align='C', fill=True)
        exportador.pdf.ln()
        
        # Datos de la tabla
        exportador.pdf.set_font("Arial", '', 9)
        for i, registro in enumerate(pesos):
            diff = ""
            pct = ""
            color_diff = (0, 0, 0)
            
            if i > 0:
                prev_peso = pesos[i-1]['peso']
                diferencia = registro['peso'] - prev_peso
                diff = f"{diferencia:+.1f} kg"
                if prev_peso > 0:
                    porcentaje = (diferencia / prev_peso) * 100
                    pct = f"{porcentaje:+.1f}%"
                
                # Colores según tendencia
                if diferencia > 0:
                    color_diff = (34, 197, 94)  # Verde
                elif diferencia < 0:
                    color_diff = (239, 68, 68)  # Rojo
            
            exportador.pdf.cell(15, 6, txt=str(i+1), border=1, align='C')
            exportador.pdf.cell(55, 6, txt=registro['fecha'].split(' ')[0], border=1, align='C')
            exportador.pdf.cell(40, 6, txt=f"{registro['peso']:.1f}", border=1, align='C')
            
            # Diferencia con color
            exportador.pdf.set_text_color(*color_diff)
            exportador.pdf.cell(40, 6, txt=diff, border=1, align='C')
            exportador.pdf.cell(40, 6, txt=pct, border=1, align='C')
            exportador.pdf.set_text_color(0, 0, 0)
            exportador.pdf.ln()
        
        # Resumen de crecimiento
        if len(pesos) > 1:
            exportador.pdf.ln(3)
            peso_inicial = pesos[0]['peso']
            peso_final = pesos[-1]['peso']
            ganancia_total = peso_final - peso_inicial
            ganancia_pct = (ganancia_total / peso_inicial) * 100 if peso_inicial > 0 else 0
            
            exportador.pdf.set_fill_color(240, 253, 244)
            exportador.pdf.set_font("Arial", 'B', 10)
            exportador.pdf.cell(0, 8, txt=f"  Resumen: Peso inicial {peso_inicial:.1f} kg → Peso actual {peso_final:.1f} kg | Ganancia total: {ganancia_total:+.1f} kg ({ganancia_pct:+.1f}%)", ln=True, fill=True)
    
    output = exportador.obtener_bytes()
    return send_file(output, download_name=f'ficha_{id}_{datetime.now().strftime("%Y%m%d")}.pdf', as_attachment=True)

@export_bp.route('/api/export/pdf/historial/<int:id>')
@require_permission('exportar')
def export_pdf_historial(id):
    """
    Exporta el historial médico completo del animal con:
    - Información básica del animal
    - Protocolos de salud programados
    - Historial médico (eventos pasados)
    - Historial de pesajes y gráfica de evolución (NUEVO)
    """
    animal = obtener_animal(id)
    if not animal:
        return jsonify({'error': 'Animal not found'}), 404
        
    descripcion = f"Historial médico y protocolos de salud del animal #{id}. Documento para seguimiento clínico veterinario y evolución de crecimiento."
    exportador = ExportadorPDF(f"Historial Médico - Animal #{id}", descripcion=descripcion)
    
    # ==================== INFORMACIÓN DEL ANIMAL ====================
    exportador.pdf.set_fill_color(220, 38, 38)  # Rojo médico
    exportador.pdf.set_text_color(255, 255, 255)
    exportador.pdf.set_font("Arial", 'B', 14)
    exportador.pdf.cell(0, 10, txt="  DATOS DEL PACIENTE", ln=True, fill=True)
    exportador.pdf.set_text_color(0, 0, 0)
    exportador.pdf.ln(3)
    
    # Información en formato compacto
    exportador.pdf.set_font("Arial", '', 10)
    info_line = f"ID: #{animal['id']} | {animal['especie']} {animal['raza']} | {animal['sexo']} | {animal['edad']} meses | {animal['peso']} kg | Estado: {animal['estado']}"
    exportador.pdf.cell(0, 8, txt=info_line, ln=True)
    
    # ==================== EVOLUCIÓN DE PESO (NUEVO) ====================
    pesos = obtener_pesos_animal(id)
    if pesos and len(pesos) >= 1:
        exportador.pdf.ln(5)
        exportador.pdf.set_fill_color(59, 130, 246)  # Azul
        exportador.pdf.set_text_color(255, 255, 255)
        exportador.pdf.set_font("Arial", 'B', 12)
        exportador.pdf.cell(0, 8, txt="  EVOLUCIÓN DE PESO", ln=True, fill=True)
        exportador.pdf.set_text_color(0, 0, 0)
        exportador.pdf.ln(3)
        
        try:
            fig, ax = plt.subplots(figsize=(8, 3.5))
            fechas = [p['fecha'].split(' ')[0] for p in pesos]
            valores = [p['peso'] for p in pesos]
            
            ax.plot(fechas, valores, marker='o', linewidth=2, color='#1b4332', markersize=6)
            ax.fill_between(range(len(fechas)), valores, alpha=0.3, color='#1b4332')
            ax.set_xlabel('Fecha', fontsize=10)
            ax.set_ylabel('Peso (kg)', fontsize=10)
            ax.set_title(f"Evolución de Peso - {animal['especie']} #{id}", fontsize=12, fontweight='bold')
            ax.grid(True, alpha=0.3)
            plt.xticks(rotation=45, ha='right', fontsize=8)
            plt.tight_layout()
            
            img_buffer = BytesIO()
            plt.savefig(img_buffer, format='PNG', dpi=100, bbox_inches='tight')
            img_buffer.seek(0)
            plt.close(fig)
            
            exportador.pdf.image(img_buffer, x=25, w=160)
            exportador.pdf.ln(5)
        except Exception as e:
            logger.error(f"Error generando gráfica de peso en historial: {e}")
            
        # Tabla resumida de pesos
        exportador.pdf.set_font("Arial", 'B', 10)
        exportador.pdf.cell(50, 7, txt="Fecha de Pesaje", border=1, align='C', fill=False)
        exportador.pdf.cell(40, 7, txt="Peso (kg)", border=1, align='C', fill=False)
        exportador.pdf.cell(50, 7, txt="Variación", border=1, align='C', fill=False)
        exportador.pdf.ln()
        
        exportador.pdf.set_font("Arial", '', 9)
        for i, registro in enumerate(pesos[-5:]): # Mostrar solo los últimos 5 para no saturar
            diff = "---"
            actual_idx = pesos.index(registro)
            if actual_idx > 0:
                prev_p = pesos[actual_idx-1]['peso']
                diferencia = registro['peso'] - prev_p
                diff = f"{diferencia:+.1f} kg"
            
            exportador.pdf.cell(50, 6, txt=registro['fecha'].split(' ')[0], border=1, align='C')
            exportador.pdf.cell(40, 6, txt=f"{registro['peso']:.1f}", border=1, align='C')
            exportador.pdf.cell(50, 6, txt=diff, border=1, align='C')
            exportador.pdf.ln()
        if len(pesos) > 5:
            exportador.pdf.set_font("Arial", 'I', 8)
            exportador.pdf.cell(0, 5, txt=f"* Mostrando últimos 5 de {len(pesos)} registros de peso.", ln=True)

    # ==================== EXPEDIENTE MÉDICO ====================
    expediente = ExpedienteMedico.query.filter_by(animal_id=id).first()
    if expediente:
        exportador.pdf.ln(5)
        exportador.pdf.set_fill_color(147, 51, 234)  # Púrpura
        exportador.pdf.set_text_color(255, 255, 255)
        exportador.pdf.set_font("Arial", 'B', 12)
        exportador.pdf.cell(0, 8, txt="  EXPEDIENTE MÉDICO", ln=True, fill=True)
        exportador.pdf.set_text_color(0, 0, 0)
        exportador.pdf.ln(2)
        
        exportador.pdf.set_font("Arial", '', 10)
        if expediente.tipo_sangre:
            exportador.pdf.cell(0, 6, txt=f"Tipo de Sangre: {expediente.tipo_sangre}", ln=True)
        if expediente.alergias and expediente.alergias != 'Ninguna':
            exportador.pdf.cell(0, 6, txt=f"Alergias: {expediente.alergias}", ln=True)
        if expediente.condiciones_cronicas and expediente.condiciones_cronicas != 'Ninguna':
            exportador.pdf.cell(0, 6, txt=f"Condiciones Crónicas: {expediente.condiciones_cronicas}", ln=True)
        if expediente.antecedentes_geneticos:
            exportador.pdf.cell(0, 6, txt=f"Antecedentes Genéticos: {expediente.antecedentes_geneticos}", ln=True)
        if expediente.notas_generales:
            exportador.pdf.multi_cell(0, 5, txt=f"Notas: {expediente.notas_generales}")
    
    # ==================== PROTOCOLOS PROGRAMADOS ====================
    protocolos_db = ProtocoloSalud.query.filter_by(animal_id=id).order_by(ProtocoloSalud.fecha_programada.desc()).all()
    protocolos = [p.to_dict() for p in protocolos_db]
    
    exportador.pdf.ln(5)
    exportador.pdf.set_fill_color(34, 197, 94)  # Verde
    exportador.pdf.set_text_color(255, 255, 255)
    exportador.pdf.set_font("Arial", 'B', 12)
    exportador.pdf.cell(0, 8, txt=f"  PROTOCOLOS DE SALUD ({len(protocolos)} registros)", ln=True, fill=True)
    exportador.pdf.set_text_color(0, 0, 0)
    exportador.pdf.ln(2)
    
    if protocolos:
        # Encabezados de tabla
        exportador.pdf.set_fill_color(240, 253, 244)
        exportador.pdf.set_font("Arial", 'B', 9)
        exportador.pdf.cell(25, 7, txt="Fecha", border=1, align='C', fill=True)
        exportador.pdf.cell(30, 7, txt="Tipo", border=1, align='C', fill=True)
        exportador.pdf.cell(65, 7, txt="Descripción", border=1, align='C', fill=True)
        exportador.pdf.cell(25, 7, txt="Estado", border=1, align='C', fill=True)
        exportador.pdf.cell(45, 7, txt="Medicamento/Dosis", border=1, align='C', fill=True)
        exportador.pdf.ln()
        
        exportador.pdf.set_font("Arial", '', 8)
        for protocolo in protocolos:
            # Color según estado
            if protocolo['estado'] == 'Pendiente':
                exportador.pdf.set_fill_color(254, 249, 195)  # Amarillo claro
            elif protocolo['estado'] == 'Realizado':
                exportador.pdf.set_fill_color(220, 252, 231)  # Verde claro
            else:
                exportador.pdf.set_fill_color(255, 255, 255)
            
            fecha_str = protocolo['fecha_programada'] # Ya es string por to_dict
            med_dosis = f"{protocolo['medicamento'] or ''} {protocolo['dosis'] or ''}".strip() or 'N/A'
            desc = protocolo['descripcion'][:40] + "..." if len(protocolo['descripcion']) > 40 else protocolo['descripcion']
            
            exportador.pdf.cell(25, 6, txt=fecha_str.split(' ')[0], border=1, align='C', fill=True)
            exportador.pdf.cell(30, 6, txt=protocolo['tipo_protocolo'][:15], border=1, align='C', fill=True)
            exportador.pdf.cell(65, 6, txt=desc, border=1, fill=True)
            exportador.pdf.cell(25, 6, txt=protocolo['estado'], border=1, align='C', fill=True)
            exportador.pdf.cell(45, 6, txt=med_dosis[:25], border=1, fill=True)
            exportador.pdf.ln()
    else:
        exportador.pdf.set_font("Arial", 'I', 10)
        exportador.pdf.cell(0, 8, txt="No hay protocolos registrados.", ln=True)
    
    # ==================== HISTORIAL MÉDICO ====================
    historial_medico_db = HistorialMedico.query.filter_by(animal_id=id).order_by(HistorialMedico.fecha.desc()).all()
    historial_medico = [h.to_dict() for h in historial_medico_db]
    
    exportador.pdf.ln(5)
    exportador.pdf.set_fill_color(59, 130, 246)  # Azul
    exportador.pdf.set_text_color(255, 255, 255)
    exportador.pdf.set_font("Arial", 'B', 12)
    exportador.pdf.cell(0, 8, txt=f"  HISTORIAL MÉDICO ({len(historial_medico)} eventos)", ln=True, fill=True)
    exportador.pdf.set_text_color(0, 0, 0)
    exportador.pdf.ln(2)
    
    if historial_medico:
        for i, registro in enumerate(historial_medico):
            # Alternar colores de fondo
            if i % 2 == 0:
                exportador.pdf.set_fill_color(248, 250, 252)
            else:
                exportador.pdf.set_fill_color(255, 255, 255)
            
            # Identificar si es de protocolo completado
            is_protocolo = '[PROTOCOLO COMPLETADO]' in registro['descripcion']
            descripcion_limpia = registro['descripcion'].replace('[PROTOCOLO COMPLETADO]', '').strip()
            
            # Encabezado del registro
            exportador.pdf.set_font("Arial", 'B', 10)
            tipo_badge = f"[P] {registro['tipo']}" if is_protocolo else registro['tipo']
            fecha_str = registro['fecha'] # Ya es string por to_dict
            
            # Color según el tipo
            color_tipos = {
                'Vacunación': (34, 197, 94),
                'Tratamiento': (249, 115, 22),
                'Desparasitación': (147, 51, 234),
                'Revisión Veterinaria': (59, 130, 246),
                'Actualización Expediente': (107, 114, 128)
            }
            color = color_tipos.get(registro['tipo'], (0, 0, 0))
            
            exportador.pdf.set_text_color(*color)
            exportador.pdf.cell(50, 6, txt=tipo_badge, border=0)
            exportador.pdf.set_text_color(128, 128, 128)
            exportador.pdf.cell(0, 6, txt=fecha_str, ln=True)
            exportador.pdf.set_text_color(0, 0, 0)
            
            # Descripción
            exportador.pdf.set_font("Arial", '', 9)
            exportador.pdf.multi_cell(0, 5, txt=f"   {descripcion_limpia}")
            
            # Veterinario
            if registro['veterinario']:
                exportador.pdf.set_font("Arial", 'I', 8)
                exportador.pdf.set_text_color(100, 100, 100)
                exportador.pdf.cell(0, 4, txt=f"   Veterinario: {registro['veterinario']}", ln=True)
                exportador.pdf.set_text_color(0, 0, 0)
            
            exportador.pdf.ln(2)
            
            # Línea divisoria sutil
            if i < len(historial_medico) - 1:
                exportador.pdf.set_draw_color(230, 230, 230)
                exportador.pdf.line(10, exportador.pdf.get_y(), 200, exportador.pdf.get_y())
                exportador.pdf.ln(2)
    else:
        exportador.pdf.set_font("Arial", 'I', 10)
        exportador.pdf.cell(0, 8, txt="No hay eventos médicos registrados.", ln=True)
    
    # ==================== PIE DE PÁGINA CON RESUMEN ====================
    exportador.pdf.ln(8)
    exportador.pdf.set_fill_color(243, 244, 246)
    exportador.pdf.set_font("Arial", 'B', 9)
    
    # Contar por tipo
    tipos_count = {}
    for h in historial_medico:
        tipo = h['tipo']
        tipos_count[tipo] = tipos_count.get(tipo, 0) + 1
    
    resumen_texto = "Resumen: "
    for tipo, count in tipos_count.items():
        resumen_texto += f"{tipo}: {count} | "
    resumen_texto = resumen_texto.rstrip(" | ")
    
    if tipos_count:
        exportador.pdf.cell(0, 8, txt=resumen_texto, ln=True, fill=True)
    
    output = exportador.obtener_bytes()
    return send_file(output, download_name=f'historial_medico_{id}_{datetime.now().strftime("%Y%m%d")}.pdf', as_attachment=True)

@export_bp.route('/api/export/pdf/plan-nutricional/<int:animal_id>')
@require_permission('exportar')
def export_pdf_plan_nutricional(animal_id):
    animal = obtener_animal(animal_id)
    if not animal:
        return jsonify({'error': 'Animal not found'}), 404
        
    plan = obtener_plan_nutricional(animal_id)
    nutricion_rec = calcular_nutricion(animal['peso'], animal['edad'], animal['especie'])
    
    descripcion = f"Plan nutricional del animal #{animal_id}. Incluye alimentación recomendada y plan actual."
    exportador = ExportadorPDF(f"Plan Nutricional - Animal #{animal_id}", descripcion=descripcion)
    
    # Información del animal
    exportador.pdf.set_font("Arial", 'B', 14)
    exportador.pdf.cell(0, 10, txt="INFORMACIÓN DEL ANIMAL", ln=True)
    exportador.pdf.ln(2)
    
    exportador.pdf.set_font("Arial", '', 11)
    exportador.pdf.cell(0, 8, txt=f"ID: {animal['id']}", ln=True)
    exportador.pdf.cell(0, 8, txt=f"Especie: {animal['especie']}", ln=True)
    exportador.pdf.cell(0, 8, txt=f"Raza: {animal['raza']}", ln=True)
    exportador.pdf.cell(0, 8, txt=f"Peso Actual: {animal['peso']} kg", ln=True)
    exportador.pdf.cell(0, 8, txt=f"Edad: {animal['edad']} meses", ln=True)
    
    # Plan nutricional actual
    exportador.pdf.ln(8)
    exportador.pdf.set_font("Arial", 'B', 14)
    exportador.pdf.cell(0, 10, txt="PLAN NUTRICIONAL ACTUAL", ln=True)
    exportador.pdf.ln(2)
    
    if plan:
        exportador.pdf.set_font("Arial", '', 11)
        exportador.pdf.cell(0, 8, txt=f"Tipo de Alimentación: {plan['tipo_alimentacion']}", ln=True)
        exportador.pdf.cell(0, 8, txt=f"Forraje: {plan['cantidad_forraje']} kg/día", ln=True)
        exportador.pdf.cell(0, 8, txt=f"Concentrado: {plan['cantidad_concentrado']} kg/día", ln=True)
        exportador.pdf.cell(0, 8, txt=f"Fecha de Inicio: {plan['fecha_inicio']}", ln=True)
        if plan.get('observaciones'):
            exportador.pdf.cell(0, 8, txt=f"Observaciones: {plan['observaciones']}", ln=True)
    else:
        exportador.pdf.set_font("Arial", '', 11)
        exportador.pdf.cell(0, 8, txt="No hay plan nutricional activo.", ln=True)
    
    # Recomendaciones nutricionales
    exportador.pdf.ln(8)
    exportador.pdf.set_font("Arial", 'B', 14)
    exportador.pdf.cell(0, 10, txt="RECOMENDACIONES NUTRICIONALES COMPLETAS", ln=True)
    exportador.pdf.ln(2)
    
    exportador.pdf.set_font("Arial", '', 11)
    exportador.pdf.cell(0, 8, txt=f"Forraje Verde: {nutricion_rec['forraje_verde']} kg/día", ln=True)
    exportador.pdf.cell(0, 8, txt=f"Concentrado: {nutricion_rec['concentrado']} kg/día", ln=True)
    exportador.pdf.cell(0, 8, txt=f"Suplementos: {', '.join(nutricion_rec['suplementos'])}", ln=True)
    exportador.pdf.cell(0, 8, txt=f"Minerales: {nutricion_rec['minerales']}", ln=True)
    exportador.pdf.cell(0, 8, txt=f"Vitaminas: {nutricion_rec['vitaminas']}", ln=True)
    exportador.pdf.cell(0, 8, txt=f"Energía Metabolizable: {nutricion_rec['energia_metabolizable']} Mcal/día", ln=True)
    exportador.pdf.cell(0, 8, txt=f"Peso Ajustado: {nutricion_rec['peso_ajustado']} kg (Factor: {nutricion_rec['factor_total']})", ln=True)
    
    output = exportador.obtener_bytes()
    return send_file(output, download_name=f'plan_nutricional_{animal_id}_{datetime.now().strftime("%Y%m%d")}.pdf', as_attachment=True)

@export_bp.route('/api/export/pdf/plan/<int:plan_id>')
@require_permission('exportar')
def export_pdf_plan_individual(plan_id):
    """Exporta un plan nutricional individual a PDF"""
    plan_obj = PlanNutricional.query.get(plan_id)
    if not plan_obj:
        return jsonify({'error': 'Plan not found'}), 404
    plan = plan_obj.to_dict()
        
    animal_obj = Ganado.query.get(plan['animal_id'])
    if not animal_obj:
        return jsonify({'error': 'Animal associated with plan not found'}), 404
    animal = animal_obj.to_dict()

    descripcion = f"Detalle del Plan Nutricional #{plan['id']} para el animal #{animal['id']} ({animal['especie']})."
    exportador = ExportadorPDF(f"Plan Nutricional #{plan['id']}", descripcion=descripcion)
    
    # Información del animal
    exportador.pdf.set_fill_color(27, 67, 50)
    exportador.pdf.set_text_color(255, 255, 255)
    exportador.pdf.set_font("Arial", 'B', 14)
    exportador.pdf.cell(0, 10, txt=f"  ANIMAL: {animal['especie']} - {animal['raza']}", ln=True, fill=True)
    exportador.pdf.set_text_color(0, 0, 0)
    exportador.pdf.ln(2)
    
    exportador.pdf.set_font("Arial", '', 11)
    exportador.pdf.cell(0, 6, txt=f"ID: {animal['id']} | Sexo: {animal['sexo']} | Peso: {animal['peso']} kg | Edad: {animal['edad']} meses | Estado: {animal['estado']}", ln=True)
    exportador.pdf.ln(5)
    
    # Detalles del Plan
    exportador.pdf.set_fill_color(59, 130, 246) # Azul corporativo
    exportador.pdf.set_text_color(255, 255, 255)
    exportador.pdf.set_font("Arial", 'B', 12)
    exportador.pdf.cell(0, 8, txt="  DETALLES DEL PLAN ACTUAL", ln=True, fill=True)
    exportador.pdf.set_text_color(0, 0, 0)
    exportador.pdf.ln(2)
    
    exportador.pdf.set_font("Arial", '', 11)
    # Tabla simple manual
    col_w = 90
    exportador.pdf.cell(col_w, 6, txt=f"Tipo de Alimentación: {plan['tipo_alimentacion']}", ln=True)
    exportador.pdf.cell(col_w, 6, txt=f"Fecha Inicio: {plan['fecha_inicio']}", ln=True)
    exportador.pdf.cell(col_w, 6, txt=f"Forraje Verde: {plan['cantidad_forraje']} kg", ln=True)
    exportador.pdf.cell(col_w, 6, txt=f"Concentrado: {plan['cantidad_concentrado']} kg", ln=True)
    
    if plan.get('agua'):
        exportador.pdf.cell(col_w, 6, txt=f"Requerimiento Agua: {plan['agua']}", ln=True)
    if plan.get('frecuencia'):
        exportador.pdf.cell(col_w, 6, txt=f"Frecuencia Alimentación: {plan['frecuencia']}", ln=True)
        
    exportador.pdf.ln(3)
    exportador.pdf.set_font("Arial", 'B', 11)
    exportador.pdf.cell(0, 6, txt="Suplementos y Observaciones:", ln=True)
    exportador.pdf.set_font("Arial", '', 11)
    
    if plan.get('suplementos'):
        exportador.pdf.multi_cell(0, 6, txt=f"Suplementos: {plan['suplementos']}")
    if plan.get('minerales'):
        exportador.pdf.multi_cell(0, 6, txt=f"Minerales: {plan['minerales']}")
    if plan.get('vitaminas'):
        exportador.pdf.multi_cell(0, 6, txt=f"Vitaminas: {plan['vitaminas']}")
    if plan.get('observaciones'):
        exportador.pdf.ln(2)
        exportador.pdf.set_font("Arial", 'I', 10)
        exportador.pdf.multi_cell(0, 6, txt=f"Notas: {plan['observaciones']}")
        
    exportador.pdf.ln(8)
    
    # Comparativa con Recomendaciones
    exportador.pdf.set_fill_color(234, 179, 8) # Amarillo/Dorado
    exportador.pdf.set_text_color(0, 0, 0)
    exportador.pdf.set_font("Arial", 'B', 12)
    exportador.pdf.cell(0, 8, txt="  ANÁLISIS DE REQUERIMIENTOS TEÓRICOS", ln=True, fill=True)
    exportador.pdf.ln(2)
    
    # Recalcular
    rec = calcular_nutricion(animal['peso'], animal['edad'], animal['especie'], animal['raza'], animal['sexo'], animal['estado'])
    
    exportador.pdf.set_font("Arial", '', 11)
    exportador.pdf.cell(0, 6, txt=f"Requerimiento Forraje: {rec['forraje_verde']} kg (Dif: {round(plan['cantidad_forraje'] - rec['forraje_verde'], 2)})", ln=True)
    exportador.pdf.cell(0, 6, txt=f"Requerimiento Concentrado: {rec['concentrado']} kg (Dif: {round(plan['cantidad_concentrado'] - rec['concentrado'], 2)})", ln=True)
    exportador.pdf.cell(0, 6, txt=f"Energía Metabolizable Est.: {rec['energia_metabolizable']} Mcal", ln=True)
    exportador.pdf.cell(0, 6, txt=f"Agua Estimada: {rec.get('agua', 'N/A')}", ln=True)
    
    exportador.pdf.ln(2)
    exportador.pdf.cell(0, 6, txt=f"Suplementos Sugeridos: {', '.join(rec['suplementos'])}", ln=True)
    
    output = exportador.obtener_bytes()
    return send_file(output, download_name=f"Plan_Nutricional_{plan['id']}_{animal['especie']}.pdf", as_attachment=True)

@export_bp.route('/api/export/pdf/planes-nutricionales-todos')
@require_permission('exportar')
def export_pdf_todos_planes_nutricionales():
    descripcion = f"Todos los planes nutricionales activos del rebaño. Reporte completo generado el {datetime.now().strftime('%d/%m/%Y')}."
    exportador = ExportadorPDF("Planes Nutricionales - Rebaño Completo", descripcion=descripcion)
    
    # Obtener todos los animales
    animales = Ganado.query.all()
    
    if not animales:
        exportador.pdf.set_font("Arial", '', 12)
        exportador.pdf.cell(0, 10, txt="No hay animales registrados en el sistema.", ln=True)
    else:
        for i, animal_obj in enumerate(animales):
            animal = animal_obj.to_dict()
            # Nueva página para cada animal (excepto el primero)
            if i > 0:
                exportador.pdf.add_page()
            
            # Información del animal
            exportador.pdf.set_font("Arial", 'B', 14)
            exportador.pdf.cell(0, 10, txt=f"ANIMAL #{animal['id']} - {animal['especie']} {animal['raza']}", ln=True)
            exportador.pdf.ln(2)
            
            exportador.pdf.set_font("Arial", '', 11)
            exportador.pdf.cell(0, 8, txt=f"Peso Actual: {animal['peso']} kg | Edad: {animal['edad']} meses | Sexo: {animal['sexo']}", ln=True)
            exportador.pdf.ln(5)
            
            # Buscar plan activo para este animal
            plan_obj = PlanNutricional.query.filter_by(animal_id=animal['id'], activo=True).first()
            
            # Plan nutricional
            exportador.pdf.set_font("Arial", 'B', 12)
            if plan_obj:
                plan = plan_obj.to_dict()
                exportador.pdf.cell(0, 8, txt="PLAN NUTRICIONAL ACTIVO", ln=True)
                exportador.pdf.ln(2)
                
                exportador.pdf.set_font("Arial", '', 11)
                exportador.pdf.cell(0, 6, txt=f"Tipo de Alimentación: {plan['tipo_alimentacion']}", ln=True)
                exportador.pdf.cell(0, 6, txt=f"Forraje: {plan['cantidad_forraje']} kg/día", ln=True)
                exportador.pdf.cell(0, 6, txt=f"Concentrado: {plan['cantidad_concentrado']} kg/día", ln=True)
                exportador.pdf.cell(0, 6, txt=f"Fecha de Inicio: {plan['fecha_inicio']}", ln=True)
                if plan.get('observaciones'):
                    exportador.pdf.cell(0, 6, txt=f"Observaciones: {plan['observaciones']}", ln=True)
            else:
                exportador.pdf.cell(0, 8, txt="ESTADO DEL PLAN", ln=True)
                exportador.pdf.ln(2)
                exportador.pdf.set_font("Arial", 'I', 11)
                exportador.pdf.cell(0, 6, txt="Este animal no tiene un plan nutricional activo registrado.", ln=True)
            
            # Recomendaciones (siempre se muestran)
            nutricion_rec = calcular_nutricion(animal['peso'], animal['edad'], animal['especie'])
            exportador.pdf.ln(5)
            exportador.pdf.set_font("Arial", 'B', 12)
            exportador.pdf.cell(0, 8, txt="RECOMENDACIONES CALCULADAS COMPLETAS", ln=True)
            exportador.pdf.ln(2)
            
            exportador.pdf.set_font("Arial", '', 11)
            exportador.pdf.cell(0, 6, txt=f"Forraje Verde: {nutricion_rec['forraje_verde']} kg/día", ln=True)
            exportador.pdf.cell(0, 6, txt=f"Concentrado: {nutricion_rec['concentrado']} kg/día", ln=True)
            exportador.pdf.cell(0, 6, txt=f"Suplementos: {', '.join(nutricion_rec['suplementos'])}", ln=True)
            exportador.pdf.cell(0, 6, txt=f"Minerales: {nutricion_rec['minerales']}", ln=True)
            exportador.pdf.cell(0, 6, txt=f"Vitaminas: {nutricion_rec['vitaminas']}", ln=True)
            exportador.pdf.cell(0, 6, txt=f"Energía Metabolizable: {nutricion_rec['energia_metabolizable']} Mcal/día", ln=True)
            exportador.pdf.cell(0, 6, txt=f"Peso Ajustado: {nutricion_rec['peso_ajustado']} kg (Factor: {nutricion_rec['factor_total']})", ln=True)
            
            exportador.pdf.ln(10)
    
    output = exportador.obtener_bytes()
    return send_file(output, download_name=f'planes_nutricionales_rebano_{datetime.now().strftime("%Y%m%d")}.pdf', as_attachment=True)
