from flask import Blueprint, request, jsonify
from backend.adaption_service import adaption_service
from backend.auth import optional_auth

adaption_bp = Blueprint("adaption", __name__, url_prefix="/api/adaption")

@adaption_bp.route("/status", methods=["GET"])
@optional_auth
def get_adaption_status():
    status = adaption_service.get_status_info()
    return jsonify(status)

@adaption_bp.route("/config", methods=["POST"])
@optional_auth
def update_adaption_config():
    data = request.get_json() or {}
    new_key = data.get("api_key", "").strip()
    if new_key:
        adaption_service.api_key = new_key
        return jsonify({
            "message": "Adaption API key updated successfully in runtime context.",
            "status": adaption_service.get_status_info()
        })
    return jsonify({"error": "No API key provided"}), 400
