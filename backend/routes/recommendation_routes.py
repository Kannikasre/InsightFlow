from flask import Blueprint, request, jsonify
from backend.models import Recommendation, TrackedIssue, IssueActivity, get_utc_now
from backend.database import get_db
from backend.auth import optional_auth

recommendations_bp = Blueprint("recommendations", __name__, url_prefix="/api/recommendations")

@recommendations_bp.route("", methods=["GET"])
@optional_auth
def list_recommendations():
    db = get_db()
    recs = db.query(Recommendation).all()
    return jsonify({
        "items": [r.to_dict() for r in recs],
        "total": len(recs)
    })

@recommendations_bp.route("/<int:rec_id>/convert-to-issue", methods=["POST"])
@optional_auth
def convert_to_issue(rec_id):
    """
    Feedback-to-Fix Workflow (Differentiator E):
    Promotes an evidence-backed recommendation into an accountable tracked engineering task.
    """
    db = get_db()
    rec = db.query(Recommendation).filter_by(id=rec_id).first()
    if not rec:
        return jsonify({"error": "Recommendation not found"}), 404

    # Check if already converted
    if rec.tracked_issue:
        return jsonify({
            "message": "Recommendation is already converted into a tracked issue",
            "tracked_issue": rec.tracked_issue.to_dict()
        }), 200

    data = request.get_json() or {}
    assigned_to = data.get("assigned_to", "Core Infrastructure Squad")
    priority = data.get("priority", rec.suggested_priority)

    user_id = request.current_user.id if getattr(request, "current_user", None) else None

    tracked = TrackedIssue(
        recommendation_id=rec.id,
        issue_group_id=rec.issue_group_id,
        title=rec.title,
        description=f"Action Steps:\n{rec.action_steps}\n\nStrategic Rationale:\n{rec.rationale}\n\nExpected Impact: {rec.potential_impact}",
        category=rec.issue_group.category if rec.issue_group else "General",
        priority=priority,
        status="Open",
        assigned_to=assigned_to,
        created_at=get_utc_now(),
        updated_at=get_utc_now(),
        user_id=user_id
    )
    db.add(tracked)
    db.flush()

    # Create audit activity
    activity = IssueActivity(
        tracked_issue_id=tracked.id,
        user_id=user_id,
        action_type="created_from_recommendation",
        old_value=None,
        new_value="Open",
        notes=f"Converted from Recommendation #{rec.id} via Feedback-to-Fix pipeline.",
        timestamp=get_utc_now()
    )
    db.add(activity)

    rec.status = "converted_to_issue"
    db.commit()
    db.refresh(tracked)

    return jsonify({
        "message": "Recommendation successfully promoted to Tracked Issue!",
        "tracked_issue": tracked.to_dict()
    }), 201
