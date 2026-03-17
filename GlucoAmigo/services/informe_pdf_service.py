"""
GlucoAmigo - Generación de Informes PDF
========================================
Generación automática de informes para citas médicas
"""

from datetime import datetime, timedelta
from io import BytesIO
from typing import Dict, List, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.graphics.shapes import Drawing, Line
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics import renderPDF

from services.analisis_glucosa import AnalisisGlucosa


class GeneradorInformePDF:
    """Generador de informes PDF médicos"""
    
    def __init__(self, heroe, representante, buffer=None):
        self.heroe = heroe
        self.representante = representante
        self.buffer = buffer or BytesIO()
        self.doc = SimpleDocTemplate(
            self.buffer,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=20*mm,
            bottomMargin=20*mm
        )
        self.styles = getSampleStyleSheet()
        self._configurar_estilos()
        self.story = []
    
    def _configurar_estilos(self):
        """Configura estilos personalizados"""
        # Título principal
        self.styles.add(ParagraphStyle(
            name='TituloPrincipal',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#0d9488'),
            spaceAfter=20,
            alignment=TA_CENTER
        ))
        
        # Subtítulo
        self.styles.add(ParagraphStyle(
            name='Subtitulo',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#334155'),
            spaceBefore=15,
            spaceAfter=10
        ))
        
        # Texto normal
        self.styles.add(ParagraphStyle(
            name='TextoNormal',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#334155'),
            spaceAfter=8
        ))
        
        # Etiqueta
        self.styles.add(ParagraphStyle(
            name='Etiqueta',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=3
        ))
    
    def generar_informe(self, dias=14) -> BytesIO:
        """Genera el informe completo"""
        # Título
        self.story.append(Paragraph('📊 Informe Glucémico', self.styles['TituloPrincipal']))
        self.story.append(Paragraph('GlucoAmigo - Sistema de Monitoreo Pediátrico', self.styles['TextoNormal']))
        self.story.append(Spacer(1, 20))
        
        # Datos del paciente
        self._agregar_datos_paciente()
        
        # Resumen ejecutivo
        self._agregar_resumen_ejecutivo(dias)
        
        # Time in Range
        self._agregar_time_in_range(dias)
        
        # Estadísticas
        self._agregar_estadisticas(dias)
        
        # Recomendaciones
        self._agregar_recomendaciones()
        
        # Construir PDF
        self.doc.build(self.story)
        self.buffer.seek(0)
        return self.buffer
    
    def _agregar_datos_paciente(self):
        """Agrega datos del paciente"""
        self.story.append(Paragraph('Datos del Paciente', self.styles['Subtitulo']))
        
        datos = [
            ['Nombre:', self.heroe.nombre, 'Código:', self.heroe.codigo or 'N/A'],
            ['Edad:', f'{self.heroe.edad} años', 'Peso:', f'{self.heroe.peso} kg' if self.heroe.peso else 'N/A'],
            ['Tipo Diabetes:', self.heroe.tipo_diabetes or 'DM1', 'Última HbA1c:', f'{self.heroe.hba1c_ultimo}%' if self.heroe.hba1c_ultimo else 'N/A'],
            ['Especialista:', self.heroe.especialista.nombre_completo if self.heroe.especialista else 'No asignado', 
             'Institución:', self.heroe.institucion or 'No registrada']
        ]
        
        t = Table(datos, colWidths=[50, 150, 50, 150])
        t.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#64748b')),
            ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#64748b')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        self.story.append(t)
        self.story.append(Spacer(1, 20))
    
    def _agregar_resumen_ejecutivo(self, dias):
        """Agrega resumen ejecutivo"""
        self.story.append(Paragraph('Resumen Ejecutivo', self.styles['Subtitulo']))
        
        analisis = AnalisisGlucosa(self.heroe.id)
        analisis.cargar_datos(None, dias)
        tir = analisis.calcular_time_in_range()
        tendencias = analisis.obtener_tendencias()
        
        # Tarjetas de resumen
        datos_resumen = [
            ['Métrica', 'Valor', 'Estado'],
            ['Tiempo en Rango (TIR)', f'{tir["tiempo_en_rango"]}%', self._get_estado_emoji(tir["tiempo_en_rango"], 70)],
            ['Tiempo Bajo', f'{tir["tiempo_bajo"] + tir["tiempo_muy_bajo"]}%', self._get_estado_emoji(tir["tiempo_bajo"] + tir["tiempo_muy_bajo"], 4, invert=True)],
            ['Tiempo Alto', f'{tir["tiempo_alto"] + tir["tiempo_muy_alto"]}%', self._get_estado_emoji(tir["tiempo_alto"] + tir["tiempo_muy_alto"], 25, invert=True)],
            ['Promedio Glucosa', f'{tendencias.get("promedio", 0)} mg/dL', '📊'],
            ['Glucosa Mínima', f'{tendencias.get("minimo", 0)} mg/dL', '📉'],
            ['Glucosa Máxima', f'{tendencias.get("maximo", 0)} mg/dL', '📈'],
        ]
        
        t = Table(datos_resumen, colWidths=[120, 80, 60])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0d9488')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        
        self.story.append(t)
        self.story.append(Spacer(1, 20))
    
    def _agregar_time_in_range(self, dias):
        """Agrega sección Time in Range"""
        self.story.append(Paragraph('Análisis Time in Range (TIR)', self.styles['Subtitulo']))
        
        analisis = AnalisisGlucosa(self.heroe.id)
        analisis.cargar_datos(None, dias)
        tir = analisis.calcular_time_in_range()
        
        # Descripción TIR
        self.story.append(Paragraph(
            'El Time in Range (TIR) representa el porcentaje de tiempo que el paciente '
            'pasa dentro del rango glucémico objetivo (70-180 mg/dL). Las guías clínicas '
            'recomiendan un TIR mayor al 70% para un buen control glucémico.',
            self.styles['TextoNormal']
        ))
        
        # Distribución visual
        dist_data = [
            ['Rango', 'Porcentaje', 'Objetivo'],
            ['⬛ Muy Bajo (<54)', f'{tir["tiempo_muy_bajo"]}%', '<1%'],
            ['🟠 Bajo (54-70)', f'{tir["tiempo_bajo"]}%', '<4%'],
            ['🟢 En Rango (70-180)', f'{tir["tiempo_en_rango"]}%', '>70%'],
            ['🟡 Alto (180-250)', f'{tir["tiempo_alto"]}%', '<25%'],
            ['🔴 Muy Alto (>250)', f'{tir["tiempo_muy_alto"]}%', '<10%'],
        ]
        
        t = Table(dist_data, colWidths=[120, 80, 60])
        t.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 3), (1, 3), colors.HexColor('#dcfce7')),
            ('BACKGROUND', (0, 2), (1, 2), colors.HexColor('#dcfce7')),
        ]))
        
        self.story.append(t)
        self.story.append(Spacer(1, 20))
    
    def _agregar_estadisticas(self, dias):
        """Agrega estadísticas detalladas"""
        self.story.append(Paragraph('Estadísticas del Período', self.styles['Subtitulo']))
        
        analisis = AnalisisGlucosa(self.heroe.id)
        analisis.cargar_datos(None, dias)
        tendencias = analisis.obtener_tendencias()
        
        stats_html = f'''
        <b>Período analizado:</b> Últimos {dias} días<br/>
        <b>Total de lecturas:</b> {tendencias.get('lecturas', 0)}<br/>
        <b>Promedio:</b> {tendencias.get('promedio', 0)} mg/dL<br/>
        <b>Desviación estándar:</b> {tendencias.get('desviacion', 0)} mg/dL<br/>
        <b>Tendencia:</b> {tendencias.get('tendencia', 'N/A').upper()}
        '''
        
        self.story.append(Paragraph(stats_html, self.styles['TextoNormal']))
        self.story.append(Spacer(1, 20))
    
    def _agregar_recomendaciones(self):
        """Agrega recomendaciones clínicas"""
        self.story.append(Paragraph('Recomendaciones', self.styles['Subtitulo']))
        
        recomendaciones = [
            '1. Continuar monitoreos frecuentes, especialmente antes de las comidas y al acostarse.',
            '2. Mantener registro de carbohidratos consumidos para ajustar dosis de insulina.',
            '3. Revisar técnica de inyección y rotación de sitios.',
            '4. Programar cita de seguimiento con endocrinología.',
            '5. Considerar evaluación de bomba de insulina si hay múltiples inyecciones diarias.',
        ]
        
        for rec in recomendaciones:
            self.story.append(Paragraph(f'• {rec}', self.styles['TextoNormal']))
        
        self.story.append(Spacer(1, 20))
        
        # Footer
        self.story.append(Paragraph(
            f'Informe generado el {datetime.now().strftime("%d/%m/%Y a las %H:%M")} por GlucoAmigo',
            self.styles['Etiqueta']
        ))
    
    def _get_estado_emoji(self, valor, objetivo, invert=False):
        """Retorna emoji según objetivo"""
        if invert:
            # Menor es mejor
            if valor <= objetivo:
                return '✅'
            elif valor <= objetivo * 1.5:
                return '⚠️'
            else:
                return '❌'
        else:
            # Mayor es mejor
            if valor >= objetivo:
                return '✅'
            elif valor >= objetivo * 0.7:
                return '⚠️'
            else:
                return '❌'


def generar_informe(heroe_id: int, dias: int = 14) -> bytes:
    """Función de conveniencia para generar informe"""
    from models import db, Heroe
    
    heroe = Heroe.query.get(heroe_id)
    if not heroe:
        raise ValueError('Héroe no encontrado')
    
    representante = None
    if heroe.padre_id:
        from models import Usuario
        representante = Usuario.query.get(heroe.padre_id)
    
    generador = GeneradorInformePDF(heroe, representante)
    buffer = generador.generar_informe(dias)
    return buffer.getvalue()
