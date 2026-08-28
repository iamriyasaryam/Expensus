"""
Production Django settings for Expensus project.
Hardened for secure deployment.
"""

from .base import *
import os

DEBUG = False

SECRET_KEY = os.environ['DJANGO_SECRET_KEY']

allowed_hosts_env = os.environ.get('DJANGO_ALLOWED_HOSTS', '')
ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_env.split(',') if host.strip()]

# ------------------------------------------------------------------------------
# Production Database Configuration (PostgreSQL)
# ------------------------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ['DB_NAME'],
        'USER': os.environ['DB_USER'],
        'PASSWORD': os.environ['DB_PASSWORD'],
        'HOST': os.environ['DB_HOST'],
        'PORT': os.environ.get('DB_PORT', '5432'),
        'CONN_MAX_AGE': 600,  # 10 minute persistent database connection pooling
    }
}

# ------------------------------------------------------------------------------
# CORS Configuration
# ------------------------------------------------------------------------------
cors_origins = os.environ.get('CORS_ALLOWED_ORIGINS', '')
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]
CORS_ALLOW_CREDENTIALS = True

# ------------------------------------------------------------------------------
# Static Files (Served with WhiteNoise)
# ------------------------------------------------------------------------------
# WhiteNoise middleware should be placed immediately after SecurityMiddleware
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ------------------------------------------------------------------------------
# Production Security Hardening
# ------------------------------------------------------------------------------
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True').lower() in ('true', '1', 't')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
