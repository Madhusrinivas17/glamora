import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env', override=True)

SECRET_KEY = os.getenv('SECRET_KEY', 'unsafe-development-key')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

raw_hosts = os.getenv('ALLOWED_HOSTS', '*')
ALLOWED_HOSTS = [host.strip() for host in raw_hosts.split(',') if host.strip()]
if '*' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.extend(['localhost', '127.0.0.1', '.onrender.com'])

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'salon',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'glamora.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'glamora.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DATABASE_NAME', 'defaultdb'),
        'USER': os.getenv('DATABASE_USER', 'avnadmin'),
        'PASSWORD': os.getenv('DATABASE_PASSWORD'),
        'HOST': os.getenv(
            'DATABASE_HOST',
            'glamora-mysql-sves-madhu.f.aivencloud.com'
        ),
        'PORT': os.getenv('DATABASE_PORT', '22774'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'ssl': {
                'ssl_mode': 'REQUIRED',
            },
        },
    }
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'glamora-otp-cache',
    }
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'salon.User'

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'True').lower() == 'true'

default_cors = (
    'http://localhost:5173,'
    'http://127.0.0.1:5173,'
    'http://localhost:5174,'
    'http://127.0.0.1:5174,'
    'https://glamora-bice.vercel.app,'
    'https://glamora-hm0tt6bjl-madhusrinivas17s-projects.vercel.app'
)

raw_cors = os.getenv('CORS_ALLOWED_ORIGINS', default_cors)

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in raw_cors.split(',')
    if origin.strip()
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.vercel\.app$",
    r"^http:\/\/localhost:[0-9]+$",
    r"^http:\/\/127\.0\.0\.1:[0-9]+$",
]

CORS_ALLOW_CREDENTIALS = True

# CSRF Configuration
CSRF_TRUSTED_ORIGINS = [
    'https://*.vercel.app',
    'https://glamora-bice.vercel.app',
    'https://glamora-hm0tt6bjl-madhusrinivas17s-projects.vercel.app',
    'https://glamora-1io9.onrender.com',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',

    'JTI_CLAIM': 'jti',
}

# Email Configuration
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend').strip()
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com').strip()

try:
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587').strip())
except (ValueError, TypeError):
    EMAIL_PORT = 587

EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').strip().lower() == 'true'
EMAIL_USE_SSL = os.getenv('EMAIL_USE_SSL', 'False').strip().lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '').strip()
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '').strip()
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER or 'Glamora <noreply@glamora.com>').strip()

try:
    EMAIL_TIMEOUT = int(os.getenv('EMAIL_TIMEOUT', '10').strip())
except (ValueError, TypeError):
    EMAIL_TIMEOUT = 10
