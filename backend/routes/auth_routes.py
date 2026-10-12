from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models import User, get_utc_now
from backend.database import get_db
from backend.auth import generate_token, auth_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("full_name", "").strip()
    role = data.get("role", "Product Lead").strip()

    if not email or not password or not full_name:
        return jsonify({"error": "Email, password, and full name are required."}), 400

    db = get_db()
    existing = db.query(User).filter_by(email=email).first()
    if existing:
        return jsonify({"error": "An account with this email already exists."}), 409

    hashed = generate_password_hash(password)
    user = User(
        email=email,
        password_hash=hashed,
        full_name=full_name,
        role=role,
        created_at=get_utc_now()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = generate_token(user.id, user.email, user.role)
    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": user.to_dict()
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    db = get_db()
    user = db.query(User).filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password."}), 401

    token = generate_token(user.id, user.email, user.role)
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict()
    })

@auth_bp.route("/demo-login", methods=["POST"])
def demo_login():
    """Allows one-click demo access for hackathon judges."""
    db = get_db()
    demo_email = "demo@insightflow.ai"
    user = db.query(User).filter_by(email=demo_email).first()
    if not user:
        user = User(
            email=demo_email,
            password_hash=generate_password_hash("insightflow2026"),
            full_name="Alex Chen (Demo Reviewer)",
            role="VP of Product Experience",
            created_at=get_utc_now()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = generate_token(user.id, user.email, user.role)
    return jsonify({
        "message": "Demo login successful",
        "token": token,
        "user": user.to_dict()
    })

@auth_bp.route("/me", methods=["GET"])
@auth_required
def get_current_user_profile():
    return jsonify({
        "user": request.current_user.to_dict()
    })
