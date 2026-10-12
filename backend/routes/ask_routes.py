from flask import Blueprint, request, jsonify
from backend.ask_feedback import answer_feedback_query
from backend.auth import optional_auth

ask_bp = Blueprint("ask", __name__, url_prefix="/api/ask")

@ask_bp.route("", methods=["POST"])
@optional_auth
def ask_question():
    data = request.get_json() or {}
    question = data.get("question", "").strip()
    if not question:
        return jsonify({"error": "Question parameter is required"}), 400

    result = answer_feedback_query(question)
    return jsonify(result)
