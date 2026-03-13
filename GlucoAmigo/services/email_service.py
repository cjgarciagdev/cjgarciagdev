"""
GlucoAmigo - Servicio de Notificaciones por Email
=================================================
Sistema de alertas críticas a representantes por correo electrónico
Integración con SMTP para envío de alertas de hipoglucemia/hiperglucemia
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from threading import Thread
from datetime import datetime
from typing import Optional, Dict, List
import json

# Configuración SMTP (se carga desde variables de entorno)
SMTP_CONFIG = {
    'host': os.getenv('SMTP_HOST', ''),
    'port': int(os.getenv('SMTP_PORT', 587)),
    'username': os.getenv('SMTP_USERNAME', ''),
    'password': os.getenv('SMTP_PASSWORD', ''),
    'use_tls': os.getenv('SMTP_USE_TLS', 'true').lower() == 'true',
    'from_name': os.getenv('SMTP_FROM_NAME', 'GlucoAmigo'),
    'from_email': os.getenv('SMTP_FROM_EMAIL', 'alertas@glucoamigo.com'),
}

# Plantillas de email
PLANTILLAS_EMAIL = {
    'alerta_hipoglucemia': {
        'asunto': '🚨 ALERTA CRÍTICA: Hipoglucemia detectada - GlucoAmigo',
        'cuerpo': '''\n<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; }}
        .header h1 {{ color: white; margin: 0; font-size: 24px; }}
        .content {{ padding: 30px; }}
        .alert-box {{ background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .glucose-value {{ font-size: 48px; font-weight: bold; color: #ef4444; text-align: center; margin: 20px 0; }}
        .recommendation {{ background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; border-radius: 8px; }}
        .footer {{ background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Alerta de Hipoglucemia</h1>
        </div>
        <div class="content">
            <p>Estimado/a <strong>{nombre_representante}</strong>,</p>
            <p>Se ha detectado un nivel bajo de glucosa en <strong>{nombre_nino}</strong>:</p>
            <div class="alert-box">
                <div class="glucose-value">{glucemia} mg/dL</div>
                <p style="text-align: center; margin: 0; color: #64748b;">Nivel de glucosa actual</p>
            </div>
            <div class="recommendation">
                <strong>📋 Recomendación:</strong>
                <p>{recomendacion}</p>
            </div>
            <p style="margin-top: 30px; color: #64748b;">
                <em>Esta alerta fue enviada automáticamente por GlucoAmigo a las {timestamp}</em>
            </p>
        </div>
        <div class="footer">
            <p>GlucoAmigo - Sistema de Monitoreo de Glucosa Pediátrico</p>
            <p>Para configurar sus preferencias de notificación, ingrese a la aplicación.</p>
        </div>
    </div>
</body>
</html>
'''
    },
    
    'alerta_hiperglucemia': {
        'asunto': '⚠️ Alerta: Glucosa elevada - GlucoAmigo',
        'cuerpo': '''\n<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; }}
        .header h1 {{ color: white; margin: 0; font-size: 24px; }}
        .content {{ padding: 30px; }}
        .alert-box {{ background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .glucose-value {{ font-size: 48px; font-weight: bold; color: #d97706; text-align: center; margin: 20px 0; }}
        .recommendation {{ background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; border-radius: 8px; }}
        .footer {{ background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Alerta de Hiperglucemia</h1>
        </div>
        <div class="content">
            <p>Estimado/a <strong>{nombre_representante}</strong>,</p>
            <p>Se ha detectado un nivel elevado de glucosa en <strong>{nombre_nino}</strong>:</p>
            <div class="alert-box">
                <div class="glucose-value">{glucemia} mg/dL</div>
                <p style="text-align: center; margin: 0; color: #64748b;">Nivel de glucosa actual</p>
            </div>
            <div class="recommendation">
                <strong>📋 Recomendación:</strong>
                <p>{recomendacion}</p>
            </div>
            <p style="margin-top: 30px; color: #64748b;">
                <em>Esta alerta fue enviada automáticamente por GlucoAmigo a las {timestamp}</em>
            </p>
        </div>
        <div class="footer">
            <p>GlucoAmigo - Sistema de Monitoreo de Glucosa Pediátrico</p>
        </div>
    </div>
</body>
</html>
'''
    },
    
    'informe_semanal': {
        'asunto': '📊 Resumen Semanal de Glucosa - GlucoAmigo',
        'cuerpo': '''\n<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #0d9488 0%, #0ea5e9 100%); padding: 30px; text-align: center; }}
        .header h1 {{ color: white; margin: 0; }}
        .content {{ padding: 30px; }}
        .stats {{ display: flex; justify-content: space-around; margin: 20px 0; }}
        .stat-box {{ text-align: center; padding: 15px; background: #f1f5f9; border-radius: 8px; width: 30%; }}
        .stat-value {{ font-size: 24px; font-weight: bold; color: #0d9488; }}
        .stat-label {{ font-size: 12px; color: #64748b; }}
        .footer {{ background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Resumen Semanal</h1>
        </div>
        <div class="content">
            <p>Hola <strong>{nombre_representante}</strong>,</p>
            <p>Aquí está el resumen de la semana de <strong>{nombre_nino}</strong>:</p>
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-value">{promedio}</div>
                    <div class="stat-label">Promedio mg/dL</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">{tiempo_rango}%</div>
                    <div class="stat-label">Tiempo en Rango</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">{eventos}</div>
                    <div class="stat-label">Alertas</div>
                </div>
            </div>
            <p style="margin-top: 30px;">¡Gracias por usar GlucoAmigo!</p>
        </div>
        <div class="footer">
            <p>GlucoAmigo - Cuidando la salud de los héroes</p>
        </div>
    </div>
</body>
</html>
'''
    }
}


def enviar_email_async(asunto: str, cuerpo_html: str, destinatario: str, retry: int = 3):
    """
    Envía email de forma asíncrona (en background thread)
    
    Args:
        asunto: Asunto del email
        cuerpo_html: Cuerpo del email en HTML
        destinatario: Email del destinatario
        retry: Número de reintentos en caso de error
    """
    def _enviar():
        for intento in range(retry):
            try:
                # Verificar configuración SMTP
                if not SMTP_CONFIG['host'] or not SMTP_CONFIG['username']:
                    print(f'[Email] Configuración SMTP no disponible. Email en cola: {asunto}')
                    return
                
                msg = MIMEMultipart('alternative')
                msg['Subject'] = asunto
                msg['From'] = f"{SMTP_CONFIG['from_name']} <{SMTP_CONFIG['from_email']}>"
                msg['To'] = destinatario
                
                # Adjuntar HTML
                msg.attach(MIMEText(cuerpo_html, 'html', 'utf-8'))
                
                # Conectar y enviar
                with smtplib.SMTP(SMTP_CONFIG['host'], SMTP_CONFIG['port']) as server:
                    if SMTP_CONFIG['use_tls']:
                        server.starttls()
                    server.login(SMTP_CONFIG['username'], SMTP_CONFIG['password'])
                    server.send_message(msg)
                
                print(f'[Email] Enviado exitosamente a {destinatario}: {asunto}')
                return
                
            except Exception as e:
                print(f'[Email] Error en intento {intento + 1}/{retry}: {e}')
                if intento < retry - 1:
                    import time
                    time.sleep(2)  # Esperar antes de reintentar
    
    # Ejecutar en hilo separado
    thread = Thread(target=_enviar, daemon=True)
    thread.start()


def enviar_alerta_hipoglucemia_email(
    representante_email: str,
    nombre_representante: str,
    nombre_nino: str,
    glucemia: int,
    heroe_id: int
):
    """Envía alerta de hipoglucemia por email"""
    if not representante_email:
        return
    
    # Obtener recomendación
    if glucemia < 54:
        recomendacion = "EMERGENCIA: Administrar glucagón inmediatamente. Llamar a emergencias."
    elif glucemia < 70:
        recomendacion = "Regla 15:15 - Dar 15g de carbohidratos de acción rápida (jugo, caramelo). Reevaluar en 15 minutos."
    else:
        recomendacion = "Monitorear más frecuentemente. Considerar merienda si hay tendencia a baja."
    
    plantilla = PLANTILLAS_EMAIL['alerta_hipoglucemia']
    asunto = plantilla['asunto']
    cuerpo = plantilla['cuerpo'].format(
        nombre_representante=nombre_representante,
        nombre_nino=nombre_nino,
        glucemia=glucemia,
        recomendacion=recomendacion,
        timestamp=datetime.now().strftime('%d/%m/%Y %H:%M')
    )
    
    enviar_email_async(asunto, cuerpo, representante_email)


def enviar_alerta_hiperglucemia_email(
    representante_email: str,
    nombre_representante: str,
    nombre_nino: str,
    glucemia: int,
    heroe_id: int
):
    """Envía alerta de hiperglucemia por email"""
    if not representante_email:
        return
    
    if glucemia > 400:
        recomendacion = "Administrar insulina de acción rápida según esquema. Contactar al especialista inmediatamente."
    elif glucemia > 250:
        recomendacion = "Verificar cetonas en sangre. Aumentar hidratación con agua. Considerar corrección con insulina."
    else:
        recomendacion = "Monitorear cada 2 horas. Mantener hidratación adecuada. Verificar alimentación."
    
    plantilla = PLANTILLAS_EMAIL['alerta_hiperglucemia']
    asunto = plantilla['asunto']
    cuerpo = plantilla['cuerpo'].format(
        nombre_representante=nombre_representante,
        nombre_nino=nombre_nino,
        glucemia=glucemia,
        recomendacion=recomendacion,
        timestamp=datetime.now().strftime('%d/%m/%Y %H:%M')
    )
    
    enviar_email_async(asunto, cuerpo, representante_email)


def enviar_informe_semanal_email(
    representante_email: str,
    nombre_representante: str,
    nombre_nino: str,
    promedio_glucosa: float,
    tiempo_en_rango: float,
    num_alertas: int
):
    """Envía informe semanal por email"""
    if not representante_email:
        return
    
    plantilla = PLANTILLAS_EMAIL['informe_semanal']
    asunto = plantilla['asunto']
    cuerpo = plantilla['cuerpo'].format(
        nombre_representante=nombre_representante,
        nombre_nino=nombre_nino,
        promedio=round(promedio_glucosa, 1),
        tiempo_rango=round(tiempo_en_rango, 1),
        eventos=num_alertas
    )
    
    enviar_email_async(asunto, cuerpo, representante_email)


def verificar_configuracion_email() -> Dict:
    """Verifica si la configuración de email está completa"""
    configuracion_completa = bool(
        SMTP_CONFIG['host'] and 
        SMTP_CONFIG['username'] and 
        SMTP_CONFIG['password']
    )
    
    return {
        'configurado': configuracion_completa,
        'host': SMTP_CONFIG['host'],
        'from_email': SMTP_CONFIG['from_email'],
        'mensaje': 'Configuración completa' if configuracion_completa else 'Falta configurar variables SMTP'
    }
