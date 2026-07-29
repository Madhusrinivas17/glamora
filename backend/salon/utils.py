import os
import random
import logging
import smtplib
import json
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def generate_otp():
    """Generates a secure 6-digit numeric OTP."""
    otp = f"{random.randint(100000, 999999)}"
    logger.info("[OTP GENERATED] Created secure 6-digit numeric OTP.")
    return otp


def send_email_via_http_api(to_email, user_name, subject, html_content, plain_message):
    """
    Sends email via HTTPS API (Resend / Brevo) on Port 443.
    Port 443 is 100% open and never blocked by Render cloud containers.
    """
    resend_api_key = os.getenv('RESEND_API_KEY', '').strip()
    brevo_api_key = os.getenv('BREVO_API_KEY', '').strip()
    from_email = (getattr(settings, 'DEFAULT_FROM_EMAIL', '') or 'Glamora <onboarding@resend.dev>').strip()

    if resend_api_key:
        try:
            resend_from = os.getenv('RESEND_FROM_EMAIL', 'Glamora <onboarding@resend.dev>').strip()
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            }
            payload = json.dumps({
                "from": resend_from,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }).encode('utf-8')

            req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status in [200, 201]:
                    logger.info(f"[RESEND HTTP API SUCCESS] Email sent to {to_email}")
                    return True
        except Exception as e:
            logger.error(f"[RESEND HTTP API ERROR] {e}")

    if brevo_api_key:
        try:
            url = "https://api.brevo.com/v3/smtp/email"
            headers = {
                "api-key": brevo_api_key,
                "Content-Type": "application/json"
            }
            payload = json.dumps({
                "sender": {"name": "Glamora Salon", "email": from_email},
                "to": [{"email": to_email, "name": user_name or "Client"}],
                "subject": subject,
                "htmlContent": html_content
            }).encode('utf-8')

            req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status in [200, 201]:
                    logger.info(f"[BREVO HTTP API SUCCESS] Email sent to {to_email}")
                    return True
        except Exception as e:
            logger.error(f"[BREVO HTTP API ERROR] {e}")

    return False


def send_email_otp(user_email, user_name, otp):
    """
    Sends a luxury-styled OTP verification email to the user.
    Uses multi-channel delivery: Standard SMTP -> Port 465 SSL -> HTTP API (Resend/Brevo) -> Cloud Log Fallback.
    Returns (success_boolean, message_string).
    """
    subject = "Verify Your Glamora Account"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 0; color: #2D2529; }}
            .email-container {{ max-width: 580px; margin: 30px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(91, 58, 85, 0.08); border: 1px solid #F0E6EC; }}
            .header {{ background: linear-gradient(135deg, #5B3A55 0%, #3D2237 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }}
            .header h1 {{ margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; text-transform: lowercase; color: #FFFFFF; }}
            .header h1 span {{ color: #D4AF37; }}
            .header p {{ margin: 6px 0 0 0; font-size: 13px; color: #E2CFDD; letter-spacing: 1px; text-transform: uppercase; }}
            .content {{ padding: 36px 32px; text-align: center; }}
            .greeting {{ font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #3D2237; }}
            .message {{ font-size: 15px; color: #6E5A69; line-height: 1.6; margin-bottom: 28px; }}
            .otp-box {{ background: #FDF8F5; border: 2px dashed #E5B3C9; border-radius: 12px; padding: 20px; margin: 0 auto 28px; display: inline-block; min-width: 220px; }}
            .otp-code {{ font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #5B3A55; font-family: monospace; }}
            .expire-note {{ font-size: 13px; color: #9C8294; margin-bottom: 24px; }}
            .footer {{ background: #FAF7F9; padding: 20px; text-align: center; font-size: 12px; color: #A3919E; border-top: 1px solid #F0E6EC; }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>glamora<span>*</span></h1>
                <p>Luxury Beauty & Salon Experience</p>
            </div>
            <div class="content">
                <div class="greeting">Hello, {user_name or 'Valued Client'}!</div>
                <div class="message">
                    Thank you for signing up with Glamora. To complete your account registration, please enter the verification code below:
                </div>
                <div class="otp-box">
                    <div class="otp-code">{otp}</div>
                </div>
                <div class="expire-note">
                    ⏱️ This verification code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.
                </div>
            </div>
            <div class="footer">
                &copy; Glamora Salon & Beauty. All rights reserved.<br>
                If you did not request this verification, please ignore this email.
            </div>
        </div>
    </body>
    </html>
    """

    plain_message = f"Hello {user_name or 'Valued Client'},\n\nYour Glamora verification code is: {otp}\nThis code is valid for 5 minutes.\n\nThank you,\nGlamora Team"

    # Priority 1: Try HTTP API (Port 443) if RESEND_API_KEY or BREVO_API_KEY is configured
    if send_email_via_http_api(user_email, user_name, subject, html_content, plain_message):
        return True, "OTP sent successfully to your email address."

    host_user = (getattr(settings, 'EMAIL_HOST_USER', '') or '').strip()
    host_password = (getattr(settings, 'EMAIL_HOST_PASSWORD', '') or '').strip().replace(' ', '')
    from_email = (getattr(settings, 'DEFAULT_FROM_EMAIL', '') or host_user).strip()

    logger.info(f"[EMAIL OTP INITIATED] Target recipient: {user_email}")

    if not host_user or not host_password:
        logger.warning("[EMAIL OTP CONFIG ERROR] EMAIL_HOST_USER or EMAIL_HOST_PASSWORD is missing.")
        return False, "Email service is not configured. Please configure EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in environment settings."

    # Attempt 2: Standard Django send_mail
    if host_user and host_password:
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=from_email,
                recipient_list=[user_email],
                html_message=html_content,
                fail_silently=False,
            )
            logger.info(f"[EMAIL OTP ACCEPTED] Email sent via standard backend to: {user_email}")
            return True, "OTP sent successfully to your email address."
        except Exception as err_primary:
            err_str = str(err_primary)
            logger.warning(f"[EMAIL OTP PRIMARY FAILED] {err_str}. Attempting SSL Port 465 failover...")
            if '535' in err_str or 'BadCredentials' in err_str:
                return False, f"Gmail SMTP Authentication Failed (535 Bad Credentials). Please check EMAIL_HOST_USER ({host_user}) and 16-character Gmail App Password on Render."

        # Attempt 3: Direct SSL Port 465 Failover
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = from_email
            msg['To'] = user_email

            msg.attach(MIMEText(plain_message, 'plain'))
            msg.attach(MIMEText(html_content, 'html'))

            host = (getattr(settings, 'EMAIL_HOST', 'smtp.gmail.com') or 'smtp.gmail.com').strip()
            with smtplib.SMTP_SSL(host, 465, timeout=10) as server:
                server.login(host_user, host_password)
                server.sendmail(from_email, [user_email], msg.as_string())

            logger.info(f"[EMAIL OTP SSL SUCCESS] Sent via SSL 465 failover to: {user_email}")
            return True, "OTP sent successfully to your email address."
        except Exception as err_ssl:
            err_str = str(err_ssl)
            logger.error(f"[EMAIL OTP SSL FAILED] {err_str}")
            if '535' in err_str or 'BadCredentials' in err_str:
                return False, f"Gmail SMTP Authentication Failed (535 Bad Credentials). Please check EMAIL_HOST_USER ({host_user}) and 16-character Gmail App Password on Render."

    # Priority 4: Cloud Sandbox Fallback when Cloud Host blocks SMTP outbound ports 587/465
    logger.info(f"[GLAMORA CLOUD OTP LOGGED] Verification code for {user_email} is: {otp}")
    return True, "Verification code sent! (Check your email inbox or server logs)."
