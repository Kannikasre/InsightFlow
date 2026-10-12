import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "insightflow-buildbattle-2026-supersecret-jwt-key-32chars!")
    # Allow Postgres via DATABASE_URL if configured, fallback cleanly to SQLite
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    if not SQLALCHEMY_DATABASE_URI:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'insightflow.db')}"
    elif SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 32 * 1024 * 1024  # 32MB max CSV upload
    ADAPTION_API_KEY = os.environ.get("ADAPTION_API_KEY", "")
    JWT_EXPIRATION_HOURS = 48
