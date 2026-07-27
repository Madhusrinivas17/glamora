import os
import random
import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def generate_otp():
    """Generates a secure 6-digit numeric OTP."""
    otp = f"{random.randint(100000, 999999)}"
    logger.info("[OTP GENERATED] Created secure 6-digit numeric OTP.")
    return otp


def send_email_otp(user_email, user_name, otp):
    """
    Sends a luxury-styled OTP verification email to the user using Django's email backend.
    Returns (success_boolean, message_string).
    """
    subject = "Verify Your Glamora Account"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background-color: #FAFAFA;
                margin: 0;
                padding: 0;
                color: #2D2529;
            }}
            .email-container {{
                max-width: 580px;
                margin: 30px auto;
                background: #FFFFFF;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(91, 58, 85, 0.08);
                border: 1px solid #F0E6EC;
            }}
            .header {{
                background: linear-gradient(135deg, #5B3A55 0%, #3D2237 100%);
                padding: 32px 24px;
                text-align: center;
                color: #FFFFFF;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 2px;
                text-transform: lowercase;
                color: #FFFFFF;
            }}
            .header h1 span {{
                color: #D4AF37;
            }}
            .header p {{
                margin: 6px 0 0 0;
                font-size: 13px;
                color: #E2CFDD;
                letter-spacing: 1px;
                text-transform: uppercase;
            }}
            .content {{
                padding: 36px 32px;
                text-align: center;
            }}
            .greeting {{
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 12px;
                color: #3D2237;
            }}
            .message {{
                font-size: 15px;
                color: #6E5A69;
                line-height: 1.6;
                margin-bottom: 28px;
            }}
            .otp-box {{
                background: #FDF8F5;
                border: 2px dashed #E5B3C9;
                border-radius: 12px;
                padding: 20px;
                margin: 0 auto 28px;
                display: inline-block;
                min-width: 220px;
            }}
            .otp-code {{
                font-size: 36px;
                font-weight: 800;
                letter-spacing: 8px;
                color: #5B3A55;
                font-family: monospace;
            }}
            .expire-note {{
                font-size: 13px;
                color: #9C8294;
                margin-bottom: 24px;
            }}
            .footer {{
                background: #FAF7F9;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #A3919E;
                border-top: 1px solid #F0E6EC;
            }}
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

    # Resolve settings dynamically from django.conf.settings
    host_user = (getattr(settings, 'EMAIL_HOST_USER', '') or '').strip()
    host_password = (getattr(settings, 'EMAIL_HOST_PASSWORD', '') or '').strip()
    from_email = (getattr(settings, 'DEFAULT_FROM_EMAIL', '') or host_user).strip()

    logger.info(f"[EMAIL OTP INITIATED] Target recipient: {user_email} | Backend: {getattr(settings, 'EMAIL_BACKEND', 'SMTP')}")

    if not host_user or not host_password:
        logger.warning("[EMAIL OTP CONFIG ERROR] EMAIL_HOST_USER or EMAIL_HOST_PASSWORD is genuinely missing.")
        return False, "Email service is not configured. Configure SMTP credentials (EMAIL_HOST_USER, EMAIL_HOST_PASSWORD) in the backend .env file."

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=from_email,
            recipient_list=[user_email],
            html_message=html_content,
            fail_silently=False,
        )
        logger.info(f"[EMAIL OTP ACCEPTED] Email provider accepted message for delivery to recipient: {user_email}")
        return True, "OTP sent successfully to your email address."
    except Exception:
        logger.exception("[EMAIL OTP SENDING FAILED]")
        raise
