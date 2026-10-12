import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from backend.config import Config
from backend.database import get_db
from backend.models import User

def generate_token(user_id, email, role):
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")

def decode_token(token):
    try:
        return jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authorization token required"}), 401
        
        parts = auth_header.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid Authorization header format. Expected 'Bearer <token>'"}), 401
        
        token = parts[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Token is invalid or expired"}), 401
        
        db = get_db()
        current_user = db.query(User).filter_by(id=payload["user_id"]).first()
        if not current_user:
            return jsonify({"error": "User account no longer exists"}), 401
        
        request.current_user = current_user
        return f(*args, **kwargs)
    return decorated

def optional_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        request.current_user = None
        if auth_header:
            parts = auth_header.split(" ")
            if len(parts) == 2 and parts[0].lower() == "bearer":
                payload = decode_token(parts[1])
                if payload:
                    db = get_db()
                    request.current_user = db.query(User).filter_by(id=payload["user_id"]).first()
        return f(*args, **kwargs)
    return decorated
