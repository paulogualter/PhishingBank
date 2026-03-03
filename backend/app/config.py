"""
Phishing Bank - Configurações
VULN: Secrets hardcoded propositais para fins educacionais
"""
import os
from datetime import timedelta


class Config:
    """Config base com vulnerabilidades intencionais"""
    SECRET_KEY = os.getenv("SECRET_KEY", "phishingbank_secret_2024_weak")
    # VULN-45: JWT secret fraco proposital
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "bank@2024")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Database - MySQL em Docker, SQLite para dev local
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "SQLALCHEMY_DATABASE_URI",
        f"mysql+pymysql://{os.getenv('MYSQL_USER', 'phishingbank')}:"
        f"{os.getenv('MYSQL_PASSWORD', 'bank123')}@"
        f"{os.getenv('MYSQL_HOST', 'localhost')}:"
        f"{os.getenv('MYSQL_PORT', '3306')}/"
        f"{os.getenv('MYSQL_DATABASE', 'phishingbank')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    # Redis - VULN-04: Sem auth
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # VULN-46: API keys hardcoded propositais
    INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "sk_internal_phishbank_2024_prod")
    INTERNAL_API_URL = os.getenv("INTERNAL_API_URL", "https://internal-api.phishingbank.local")
    
    # CORS - VULN-38: Regex vulnerável proposital
    CORS_ORIGINS = os.getenv("ALLOWED_ORIGINS", ".*phishingbank\\.com")
    
    # Upload
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "uploads")
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    
    # Celery
    CELERY_BROKER_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")


class DevelopmentConfig(Config):
    DEBUG = True
    FLASK_ENV = "development"


class ProductionConfig(Config):
    DEBUG = False  # VULN: Em docker-compose forçamos DEBUG=True
    FLASK_ENV = "production"


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
