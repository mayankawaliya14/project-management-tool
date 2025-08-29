import os
from pathlib import Path
from dotenv import load_dotenv
from corsheaders.defaults import default_headers

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# --- Core Django settings ---
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret")
DEBUG = os.environ.get("DEBUG", "True") == "True"

ALLOWED_HOSTS = [
    h for h in os.environ.get("ALLOWED_HOSTS", "").split(",") if h
] or ["*"]

# --- Apps ---
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "graphene_django",
    "django_filters",
    "corsheaders",
    "rest_framework",

    # Local
    "core",
]

# --- Middleware ---
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "pmtool.middleware.OrganizationMiddleware",
]

ROOT_URLCONF = "pmtool.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
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

WSGI_APPLICATION = "pmtool.wsgi.application"
ASGI_APPLICATION = "pmtool.asgi.application"

# --- Database (PostgreSQL via Docker) ---
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "pmtool"),
        "USER": os.environ.get("DB_USER", "pmtool"),
        "PASSWORD": os.environ.get("DB_PASSWORD", "pmtool"),
        "HOST": os.environ.get("DB_HOST", "127.0.0.1"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    }
}

# --- Internationalization ---
LANGUAGE_CODE = "en-us"
TIME_ZONE = os.environ.get("TIME_ZONE", "UTC")
USE_I18N = True
USE_TZ = True

# --- Static files ---
STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- Graphene (GraphQL) ---
GRAPHENE = {"SCHEMA": "core.schema.schema"}

# --- CORS / CSRF (frontend at http://localhost:5173 by default) ---
# If env var is not set, allow common local dev origins for Vite
_default_cors = ["http://localhost:5173", "http://127.0.0.1:5173"]
CORS_ALLOWED_ORIGINS = [
    o for o in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",") if o
] or _default_cors

# Keep default headers and add the org header (lowercase per corsheaders docs)
CORS_ALLOW_HEADERS = list(default_headers) + ["x-org-slug"]

# If you’re making POST requests from a different origin and use CSRF,
# add your origin(s) here (safe for local dev).
CSRF_TRUSTED_ORIGINS = [
    o.replace("http://", "http://").replace("https://", "https://")
    for o in CORS_ALLOWED_ORIGINS
]

# --- Multi-tenancy header name (used by middleware) ---
ORG_HEADER = os.environ.get("ORG_HEADER", "X-Org-Slug")
