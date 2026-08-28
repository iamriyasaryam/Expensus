"""
Development Django settings for Expensus project.
Loads environment variables from root '.env' file.
"""

from .base import *
from dotenv import load_dotenv
import os

# Load environment variables from root .env file
load_dotenv(BASE_DIR.parent / '.env')

# Security
SECRET_KEY = os.getenv(
    'DJANGO_SECRET_KEY',
    'django-insecure-expensus-dev-secret-key-change-in-production-1234567890'
)
DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() in ('true', '1', 't')

allowed_hosts_env = os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,backend,0.0.0.0')
ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_env.split(',') if host.strip()]
if 'testserver' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append('testserver')

# ------------------------------------------------------------------------------
# Database Configuration (PostgreSQL / SQLite toggle)
# ------------------------------------------------------------------------------
# In Docker, DB_HOST is 'db'. On host machine connecting to Docker port 5432, DB_HOST is 'localhost'.
db_host = os.getenv('DB_HOST', 'localhost')
if db_host == 'db' and not os.path.exists('/.dockerenv'):
    db_host = 'localhost'

if os.getenv('USE_SQLITE', 'False').lower() in ('true', '1', 't'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'expensus_db'),
            'USER': os.getenv('DB_USER', 'expensus_user'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'expensus_password'),
            'HOST': db_host,
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }

# ------------------------------------------------------------------------------
# CORS Configuration
# ------------------------------------------------------------------------------
cors_origins = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173'
)
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]
CORS_ALLOW_CREDENTIALS = True

# ------------------------------------------------------------------------------
# Static Files
# ------------------------------------------------------------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = []

# Optional local console logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
