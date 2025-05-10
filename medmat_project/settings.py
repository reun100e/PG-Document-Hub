import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "dg456&sadjaafsgoasd14sfsd7v0s7dvsdv0786vsd5vs6vsc"  # Replace with a real secret key

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False  # Set to False in production

ALLOWED_HOSTS = [
    "*",
    "localhost",
    "127.0.0.1",
    "192.168.1.17",  # e.g., '192.168.1.105' TODO:
    "dev.onthewifi.com",
]

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "core_api.apps.CoreApiConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # <--- THIS IS CRUCIAL
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # CorsMiddleware should usually be high too
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "medmat_project.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            os.path.join(BASE_DIR, "medmat-frontend", "dist")
        ],  # For serving React index.html
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "medmat_project.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
# For production, consider PostgreSQL:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': 'your_db_name',
#         'USER': 'your_db_user',
#         'PASSWORD': 'your_db_password',
#         'HOST': 'localhost', # Or your DB host
#         'PORT': '5432',
#     }
# }


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"  # Or your department's time zone
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/
STATIC_URL = (
    "/static/"  # URLs for static files will be like /static/assets/index-....css
)

STATICFILES_DIRS = [
    # This tells collectstatic where to find the React assets
    os.path.join(BASE_DIR, "medmat-frontend", "dist"),
]

# STATIC_ROOT is where collectstatic copies them TO
STATIC_ROOT = os.path.join(
    BASE_DIR, "staticfiles_build", "static", "assets"
)  # WhiteNoise serves from here
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"


# Media files (User uploads)
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media_files")


# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Custom User Model
AUTH_USER_MODEL = "core_api.User"

# Django REST Framework settings
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",  # For browsable API & Admin
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",  # Default to authenticated for all views
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",  # For file uploads
    ],
    # Optional: Throttling
    # 'DEFAULT_THROTTLE_CLASSES': [
    #     'rest_framework.throttling.AnonRateThrottle',
    #     'rest_framework.throttling.UserRateThrottle'
    # ],
    # 'DEFAULT_THROTTLE_RATES': {
    #     'anon': '100/day',
    #     'user': '1000/day'
    # }
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default dev server
    "http://127.0.0.1:5173",
    "https://dev.onthewifi.com",
    # Add your production frontend URL here
]
# If you need to send cookies/auth headers from a different domain (not typical for token auth)
# CORS_ALLOW_CREDENTIALS = True
# For more specific origins in production, list them.
# In development, you might temporarily use:
# CORS_ALLOW_ALL_ORIGINS = True (Not for production)


# If Caddy is handling HTTPS and forwarding requests to Django as HTTP:
# This tells Django to trust the X-Forwarded-Proto header from Caddy.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
# Optional, but good for ensuring cookies are secure if served over HTTPS:
# SESSION_COOKIE_SECURE = True # Only if all access is HTTPS
# CSRF_COOKIE_SECURE = True    # Only if all access is HTTPS

# CSRF Protection: Add your domain with the scheme (https)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",  # For local testing if direct
    "http://127.0.0.1:8000",  # For local testing if direct
    "http://YOUR_WINDOWS_MACHINE_LOCAL_IP:8000",  # For local IP access if direct
    "https://dev.onthewifi.com",  # Your domain with HTTPS
    "http://dev.onthewifi.com",  # If Caddy also serves HTTP temporarily or for redirects
]

# settings.py
FILE_UPLOAD_MAX_MEMORY_SIZE = 262144000  # 250 MB in bytes (250 * 1024 * 1024)
DATA_UPLOAD_MAX_MEMORY_SIZE = (
    267386880  # Slightly larger than file upload for overhead (e.g., 255 MB)
)
