from flask import Blueprint, request, jsonify
from backend.models import Feedback, get_utc_now
from backend.database import get_db
from backend.auth import optional_auth, auth_required

feedback_bp = Blueprint("feedback", __name__, url_prefix="/api/feedback")

@feedback_bp.route("", methods=["GET"])
@optional_auth
def list_feedback():
    db = get_db()
    
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()
    sentiment = request.args.get("sentiment", "").strip()
    severity = request.args.get("severity", "").strip()
    source = request.args.get("source", "").strip()
    sort_by = request.args.get("sort_by", "timestamp")
    order = request.args.get("order", "desc")

    query = db.query(Feedback)

    if search:
        query = query.filter(Feedback.text.ilike(f"%{search}%"))
    if category and category != "All":
        query = query.filter(Feedback.category == category)
    if sentiment and sentiment != "All":
        query = query.filter(Feedback.sentiment == sentiment)
    if severity and severity != "All":
        query = query.filter(Feedback.severity == severity)
    if source and source != "All":
        query = query.filter(Feedback.source == source)

    total_count = query.count()

    # Sorting
    if sort_by == "severity":
        sort_col = Feedback.severity
    elif sort_by == "sentiment":
        sort_col = Feedback.sentiment_score
    else:
        sort_col = Feedback.timestamp

    if order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    offset = (page - 1) * limit
    records = query.offset(offset).limit(limit).all()

    return jsonify({
        "items": [r.to_dict() for r in records],
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1
    })

@feedback_bp.route("/<int:feedback_id>", methods=["GET"])
@optional_auth
def get_feedback_detail(feedback_id):
    db = get_db()
    fb = db.query(Feedback).filter_by(id=feedback_id).first()
    if not fb:
        return jsonify({"error": "Feedback record not found"}), 404

    # Related evidence and clusters
    evidence_links = [el.to_dict() for el in fb.evidence_links]
    return jsonify({
        "feedback": fb.to_dict(),
        "evidence_links": evidence_links
    })

@feedback_bp.route("", methods=["POST"])
@optional_auth
def create_feedback():
    data = request.get_json() or {}
    text = data.get("text", "").strip()
    category = data.get("category", "General").strip()
    source = data.get("source", "Manual Submission").strip()
    
    if not text:
        return jsonify({"error": "Feedback text is required"}), 400

    from backend.pipeline import analyze_sentiment, determine_severity, match_hidden_pattern
    sentiment, score = analyze_sentiment(text)
    sev = determine_severity(text, category, sentiment)
    hidden_pat, is_hidden = match_hidden_pattern(text, category)

    db = get_db()
    user_id = request.current_user.id if getattr(request, "current_user", None) else None

    fb = Feedback(
        text=text,
        category=category,
        sentiment=sentiment,
        sentiment_score=score,
        severity=sev,
        source=source,
        timestamp=get_utc_now(),
        hidden_cluster=hidden_pat,
        is_hidden_complaint=is_hidden,
        user_id=user_id
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)

    return jsonify({"message": "Feedback submitted successfully", "feedback": fb.to_dict()}), 201

@feedback_bp.route("/<int:feedback_id>", methods=["PUT"])
@optional_auth
def update_feedback(feedback_id):
    db = get_db()
    fb = db.query(Feedback).filter_by(id=feedback_id).first()
    if not fb:
        return jsonify({"error": "Feedback record not found"}), 404

    data = request.get_json() or {}
    if "text" in data:
        fb.text = data["text"].strip()
        from backend.pipeline import analyze_sentiment, determine_severity
        fb.sentiment, fb.sentiment_score = analyze_sentiment(fb.text)
        fb.severity = determine_severity(fb.text, fb.category, fb.sentiment)
    if "category" in data:
        fb.category = data["category"].strip()
    if "severity" in data:
        fb.severity = data["severity"].strip()

    db.commit()
    db.refresh(fb)
    return jsonify({"message": "Feedback updated", "feedback": fb.to_dict()})

@feedback_bp.route("/<int:feedback_id>", methods=["DELETE"])
@optional_auth
def delete_feedback(feedback_id):
    db = get_db()
    fb = db.query(Feedback).filter_by(id=feedback_id).first()
    if not fb:
        return jsonify({"error": "Feedback record not found"}), 404

    db.delete(fb)
    db.commit()
    return jsonify({"message": "Feedback record deleted successfully"})
