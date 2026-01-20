from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
import resend
import asyncio
import os
from typing import Optional

SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'noreply@vclub.com')

# Resend configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
RESEND_FROM_EMAIL = os.environ.get('RESEND_FROM_EMAIL', 'HØME Records <onboarding@resend.dev>')

# Initialize Resend
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


async def send_verification_email(to_email: str, verification_code: str) -> bool:
    """
    Enviar email de verificación con código
    """
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        
        from_email = Email(FROM_EMAIL)
        to_email = To(to_email)
        subject = "Verifica tu cuenta en HØME"
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #000000;
                    color: #ffffff;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #18181b;
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    border-radius: 8px;
                    padding: 40px;
                }}
                .logo {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .logo img {{
                    width: 80px;
                    height: 80px;
                }}
                .code {{
                    background-color: #dc2626;
                    color: #ffffff;
                    font-size: 32px;
                    font-weight: bold;
                    text-align: center;
                    padding: 20px;
                    border-radius: 8px;
                    letter-spacing: 8px;
                    margin: 30px 0;
                }}
                .footer {{
                    text-align: center;
                    color: #9ca3af;
                    font-size: 12px;
                    margin-top: 30px;
                }}
                h1 {{
                    color: #dc2626;
                    text-align: center;
                    font-size: 36px;
                    margin: 0;
                }}
                p {{
                    color: #d1d5db;
                    line-height: 1.6;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <img src="https://customer-assets.emergentagent.com/job_beatmarket-43/artifacts/nqptbjvc_Sin%20t%C3%ADtulo-1-Recuperado-Recuperado%20%281%29.png" alt="HØME Logo">
                    <h1>HØME</h1>
                </div>
                
                <h2 style="text-align: center;">Verifica tu cuenta</h2>
                
                <p>Hola,</p>
                
                <p>Gracias por registrarte en HØME. Para completar tu registro, por favor usa el siguiente código de verificación:</p>
                
                <div class="code">{verification_code}</div>
                
                <p>Este código expirará en <strong>10 minutos</strong>.</p>
                
                <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
                
                <div class="footer">
                    <p>© 2025 HØME. Beats que te hacen ganar dinero.</p>
                    <p>Este es un email automático, por favor no respondas.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text content
        plain_content = f"""
        Verifica tu cuenta en HØME
        
        Tu código de verificación es: {verification_code}
        
        Este código expirará en 10 minutos.
        
        Si no creaste esta cuenta, puedes ignorar este email.
        
        © 2025 HØME
        """
        
        content = Content("text/html", html_content)
        mail = Mail(from_email, to_email, subject, plain_text_content=plain_content, html_content=html_content)
        
        response = sg.client.mail.send.post(request_body=mail.get())
        
        return response.status_code in [200, 201, 202]
        
    except Exception as e:
        print(f"Error enviando email: {str(e)}")
        return False


async def send_password_reset_email_resend(to_email: str, reset_url: str) -> bool:
    """
    Enviar email de restablecimiento de contraseña usando Resend
    """
    if not RESEND_API_KEY:
        print("Error: RESEND_API_KEY no configurada")
        return False
    
    try:
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 20px; margin: 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
                <tr>
                    <td style="background-color: #18181b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="text-align: center; padding-bottom: 30px;">
                                    <img src="https://customer-assets.emergentagent.com/job_beatmarket-43/artifacts/nqptbjvc_Sin%20t%C3%ADtulo-1-Recuperado-Recuperado%20%281%29.png" alt="HØME Logo" width="80" height="80" style="display: block; margin: 0 auto;">
                                    <h1 style="color: #ffffff; font-size: 36px; margin: 10px 0 0 0;">HØME</h1>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <h2 style="text-align: center; color: #ffffff; margin-bottom: 20px;">Restablece tu contraseña</h2>
                                    <p style="color: #d1d5db; line-height: 1.6;">Hola,</p>
                                    <p style="color: #d1d5db; line-height: 1.6;">Recibimos una solicitud para restablecer la contraseña de tu cuenta en HØME. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: center; padding: 30px 0;">
                                    <a href="{reset_url}" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 16px; font-weight: bold; text-align: center; padding: 15px 30px; border-radius: 8px; text-decoration: none;">Restablecer Contraseña</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: rgba(255, 255, 255, 0.05); border-left: 4px solid #ffffff; padding: 15px; margin: 20px 0;">
                                    <p style="color: #d1d5db; margin: 0; font-size: 14px;"><strong>⏰ Este enlace expirará en 30 minutos.</strong><br>Si no solicitaste este cambio, puedes ignorar este email.</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top: 20px;">
                                    <p style="color: #9ca3af; font-size: 12px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                                    <p style="color: #9ca3af; font-size: 11px; word-break: break-all;">{reset_url}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                                    <p style="margin: 5px 0;">© 2025 HØME. Beats que te hacen ganar dinero.</p>
                                    <p style="margin: 5px 0;">Este es un email automático, por favor no respondas.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        params = {
            "from": RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "Restablece tu contraseña - HØME",
            "html": html_content
        }
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        email_response = await asyncio.to_thread(resend.Emails.send, params)
        print(f"Email de reset enviado exitosamente: {email_response}")
        return True
        
    except Exception as e:
        print(f"Error enviando email de reset con Resend: {str(e)}")
        return False


async def send_purchase_confirmation_email(
    to_email: str, 
    beat_name: str, 
    license_type: str, 
    amount: float,
    download_url: Optional[str] = None
) -> bool:
    """
    Enviar email de confirmación de compra
    """
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        
        from_email = Email(FROM_EMAIL)
        to_email = To(to_email)
        subject = f"Tu compra: {beat_name} - HØME"
        
        license_names = {
            'basica': 'Básica',
            'premium': 'Premium',
            'exclusiva': 'Exclusiva'
        }
        
        license_display = license_names.get(license_type, license_type)
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #000000;
                    color: #ffffff;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #18181b;
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    border-radius: 8px;
                    padding: 40px;
                }}
                .success-icon {{
                    text-align: center;
                    font-size: 48px;
                    margin-bottom: 20px;
                }}
                .order-details {{
                    background-color: #0a0a0a;
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .download-button {{
                    display: inline-block;
                    background-color: #dc2626;
                    color: #ffffff;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    text-align: center;
                    margin: 20px 0;
                }}
                h1 {{
                    color: #dc2626;
                    text-align: center;
                }}
                p {{
                    color: #d1d5db;
                    line-height: 1.6;
                }}
                .footer {{
                    text-align: center;
                    color: #9ca3af;
                    font-size: 12px;
                    margin-top: 30px;
                    border-top: 1px solid rgba(220, 38, 38, 0.2);
                    padding-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon">✅</div>
                
                <h1>¡Compra Exitosa!</h1>
                
                <p>Gracias por tu compra en HØME.</p>
                
                <div class="order-details">
                    <h3 style="color: #dc2626; margin-top: 0;">Detalles de tu orden:</h3>
                    <p><strong>Beat:</strong> {beat_name}</p>
                    <p><strong>Licencia:</strong> {license_display}</p>
                    <p><strong>Monto:</strong> ${amount:.2f} USD</p>
                </div>
                
                {"<a href='" + download_url + "' class='download-button'>Descargar Beat</a>" if download_url else ""}
                
                <p>Tu beat y el contrato de licencia en PDF están listos para descargar.</p>
                
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                
                <div class="footer">
                    <p>© 2025 HØME. Beats que te hacen ganar dinero.</p>
                    <p>home.recordsinfo@gmail.com</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        content = Content("text/html", html_content)
        mail = Mail(from_email, to_email, subject, html_content=html_content)
        
        response = sg.client.mail.send.post(request_body=mail.get())
        
        return response.status_code in [200, 201, 202]
        
    except Exception as e:
        print(f"Error enviando email de compra: {str(e)}")
        return False


async def send_password_reset_email(to_email: str, reset_url: str) -> bool:
    """
    Enviar email de restablecimiento de contraseña
    """
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        
        from_email = Email(FROM_EMAIL)
        to_email_obj = To(to_email)
        subject = "Restablece tu contraseña - HØME"
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #000000;
                    color: #ffffff;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #18181b;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 40px;
                }}
                .logo {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .logo img {{
                    width: 80px;
                    height: 80px;
                }}
                .reset-button {{
                    display: block;
                    background-color: #ffffff;
                    color: #000000;
                    font-size: 16px;
                    font-weight: bold;
                    text-align: center;
                    padding: 15px 30px;
                    border-radius: 8px;
                    text-decoration: none;
                    margin: 30px auto;
                    max-width: 300px;
                }}
                .footer {{
                    text-align: center;
                    color: #9ca3af;
                    font-size: 12px;
                    margin-top: 30px;
                }}
                h1 {{
                    color: #ffffff;
                    text-align: center;
                    font-size: 36px;
                    margin: 0;
                }}
                p {{
                    color: #d1d5db;
                    line-height: 1.6;
                }}
                .warning {{
                    background-color: rgba(255, 255, 255, 0.05);
                    border-left: 4px solid #ffffff;
                    padding: 15px;
                    margin: 20px 0;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <img src="https://customer-assets.emergentagent.com/job_beatmarket-43/artifacts/nqptbjvc_Sin%20t%C3%ADtulo-1-Recuperado-Recuperado%20%281%29.png" alt="HØME Logo">
                    <h1>HØME</h1>
                </div>
                
                <h2 style="text-align: center; color: #ffffff;">Restablece tu contraseña</h2>
                
                <p>Hola,</p>
                
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en HØME. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                
                <a href="{reset_url}" class="reset-button">Restablecer Contraseña</a>
                
                <div class="warning">
                    <strong>⏰ Este enlace expirará en 30 minutos.</strong><br>
                    Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá igual.
                </div>
                
                <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #9ca3af; font-size: 12px;">{reset_url}</p>
                
                <div class="footer">
                    <p>© 2025 HØME. Beats que te hacen ganar dinero.</p>
                    <p>Este es un email automático, por favor no respondas.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text content
        plain_content = f"""
        Restablece tu contraseña en HØME
        
        Recibimos una solicitud para restablecer tu contraseña.
        
        Haz clic en el siguiente enlace para crear una nueva contraseña:
        {reset_url}
        
        Este enlace expirará en 30 minutos.
        
        Si no solicitaste este cambio, puedes ignorar este email.
        
        © 2025 HØME
        """
        
        content = Content("text/html", html_content)
        mail = Mail(from_email, to_email_obj, subject, plain_text_content=plain_content, html_content=html_content)
        
        response = sg.client.mail.send.post(request_body=mail.get())
        
        return response.status_code in [200, 201, 202]
        
    except Exception as e:
        print(f"Error enviando email de reset: {str(e)}")
        return False


async def send_custom_beat_request(
    nombre: str,
    email: str,
    propuesta: str,
    genero: str,
    detalles: str,
    referencias: str
) -> bool:
    """
    Enviar solicitud de beat personalizado a home.recordsinfo@gmail.com
    """
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        
        from_email = Email(FROM_EMAIL)
        to_email = To("home.recordsinfo@gmail.com")
        subject = f"🎵 Nueva Solicitud de Beat Personalizado - {nombre}"
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #000000;
                    color: #ffffff;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #18181b;
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    border-radius: 8px;
                    padding: 40px;
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(220, 38, 38, 0.3);
                }}
                .header h1 {{
                    color: #dc2626;
                    font-size: 28px;
                    margin: 0;
                }}
                .field {{
                    background-color: #0a0a0a;
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    border-radius: 8px;
                    padding: 15px;
                    margin: 15px 0;
                }}
                .field-label {{
                    color: #dc2626;
                    font-weight: bold;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }}
                .field-value {{
                    color: #ffffff;
                    font-size: 16px;
                    line-height: 1.6;
                }}
                .footer {{
                    text-align: center;
                    color: #9ca3af;
                    font-size: 12px;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(220, 38, 38, 0.2);
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎵 Nueva Solicitud de Beat</h1>
                    <p style="color: #9ca3af; margin-top: 10px;">Un cliente quiere un beat personalizado</p>
                </div>
                
                <div class="field">
                    <div class="field-label">Nombre del Cliente</div>
                    <div class="field-value">{nombre}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">Email de Contacto</div>
                    <div class="field-value">{email}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">Propuesta</div>
                    <div class="field-value">{propuesta}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">Género Musical</div>
                    <div class="field-value">{genero}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">Detalles del Proyecto</div>
                    <div class="field-value">{detalles}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">Referencias (Canciones)</div>
                    <div class="field-value">{referencias}</div>
                </div>
                
                <div class="footer">
                    <p>Solicitud recibida desde HØME Records</p>
                    <p>Responder dentro de 24-48 horas</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text content
        plain_content = f"""
        Nueva Solicitud de Beat Personalizado
        
        Nombre: {nombre}
        Email: {email}
        Propuesta: {propuesta}
        Género: {genero}
        Detalles: {detalles}
        Referencias: {referencias}
        
        ---
        Solicitud recibida desde HØME Records
        """
        
        content = Content("text/html", html_content)
        mail = Mail(from_email, to_email, subject, plain_text_content=plain_content, html_content=html_content)
        
        response = sg.client.mail.send.post(request_body=mail.get())
        
        return response.status_code in [200, 201, 202]
        
    except Exception as e:
        print(f"Error enviando solicitud de beat: {str(e)}")
        return False
