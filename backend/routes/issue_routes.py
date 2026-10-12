from flask import Blueprint, request, jsonify
from backend.models import TrackedIssue, IssueActivity, IssueGroup, get_utc_now
from backend.database import get_db
from backend.auth import optional_auth

issues_bp = Blueprint("issues", __name__, url_prefix="/api/issues")

@issues_bp.route("", methods=["GET"])
@optional_auth
def list_tracked_issues():
    db = get_db()
    status_filter = request.args.get("status")
    priority_filter = request.args.get("priority")
    category_filter = request.args.get("category")

    query = db.query(TrackedIssue)
    if status_filter and status_filter != "All":
        query = query.filter(TrackedIssue.status == status_filter)
    if priority_filter and priority_filter != "All":
        query = query.filter(TrackedIssue.priority == priority_filter)
    if category_filter and category_filter != "All":
        query = query.filter(TrackedIssue.category == category_filter)

    issues = query.order_by(TrackedIssue.created_at.desc()).all()
    
    # Counts by status
    open_count = db.query(TrackedIssue).filter_by(status="Open").count()
    in_prog_count = db.query(TrackedIssue).filter_by(status="In Progress").count()
    resolved_count = db.query(TrackedIssue).filter_by(status="Resolved").count()

    return jsonify({
        "items": [i.to_dict() for i in issues],
        "total": len(issues),
        "status_counts": {
            "open": open_count,
            "in_progress": in_prog_count,
            "resolved": resolved_count
        }
    })

@issues_bp.route("/<int:issue_id>", methods=["GET"])
@optional_auth
def get_tracked_issue(issue_id):
    db = get_db()
    issue = db.query(TrackedIssue).filter_by(id=issue_id).first()
    if not issue:
        return jsonify({"error": "Tracked issue not found"}), 404

    activities = [a.to_dict() for a in issue.activities]
    
    # Linked feedback evidence if tied to an issue group
    evidence = []
    if issue.issue_group:
        evidence = [el.to_dict() for el in issue.issue_group.evidence_links[:6]]

    return jsonify({
        "issue": issue.to_dict(),
        "activities": activities,
        "evidence": evidence
    })

@issues_bp.route("", methods=["POST"])
@optional_auth
def create_tracked_issue():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "Operational Issues").strip()
    priority = data.get("priority", "High").strip()
    assigned_to = data.get("assigned_to", "Engineering Squad").strip()

    if not title:
        return jsonify({"error": "Issue title is required"}), 400

    db = get_db()
    user_id = request.current_user.id if getattr(request, "current_user", None) else None

    issue = TrackedIssue(
        title=title,
        description=description,
        category=category,
        priority=priority,
        status="Open",
        assigned_to=assigned_to,
        created_at=get_utc_now(),
        updated_at=get_utc_now(),
        user_id=user_id
    )
    db.add(issue)
    db.flush()

    activity = IssueActivity(
        tracked_issue_id=issue.id,
        user_id=user_id,
        action_type="created_manually",
        new_value="Open",
        notes=f"Created manual issue: {title}",
        timestamp=get_utc_now()
    )
    db.add(activity)
    db.commit()
    db.refresh(issue)

    return jsonify({"message": "Issue created successfully", "issue": issue.to_dict()}), 201

@issues_bp.route("/<int:issue_id>", methods=["PATCH"])
@optional_auth
def update_tracked_issue(issue_id):
    db = get_db()
    issue = db.query(TrackedIssue).filter_by(id=issue_id).first()
    if not issue:
        return jsonify({"error": "Tracked issue not found"}), 404

    data = request.get_json() or {}
    user_id = request.current_user.id if getattr(request, "current_user", None) else None

    # Status update
    if "status" in data and data["status"] != issue.status:
        old_status = issue.status
        new_status = data["status"]
        issue.status = new_status
        act = IssueActivity(
            tracked_issue_id=issue.id,
            user_id=user_id,
            action_type="status_change",
            old_value=old_status,
            new_value=new_status,
            notes=data.get("notes", f"Status changed from {old_status} to {new_status}"),
            timestamp=get_utc_now()
        )
        db.add(act)

    # Priority update
    if "priority" in data and data["priority"] != issue.priority:
        old_pri = issue.priority
        new_pri = data["priority"]
        issue.priority = new_pri
        act = IssueActivity(
            tracked_issue_id=issue.id,
            user_id=user_id,
            action_type="priority_change",
            old_value=old_pri,
            new_value=new_pri,
            notes=f"Priority changed from {old_pri} to {new_pri}",
            timestamp=get_utc_now()
        )
        db.add(act)

    # Assignment update
    if "assigned_to" in data and data["assigned_to"] != issue.assigned_to:
        old_assignee = issue.assigned_to
        new_assignee = data["assigned_to"]
        issue.assigned_to = new_assignee
        act = IssueActivity(
            tracked_issue_id=issue.id,
            user_id=user_id,
            action_type="assignment_change",
            old_value=old_assignee,
            new_value=new_assignee,
            notes=f"Reassigned to {new_assignee}",
            timestamp=get_utc_now()
        )
        db.add(act)

    if "resolution_notes" in data:
        issue.resolution_notes = data["resolution_notes"]

    issue.updated_at = get_utc_now()
    db.commit()
    db.refresh(issue)

    return jsonify({"message": "Issue updated successfully", "issue": issue.to_dict()})

@issues_bp.route("/<int:issue_id>", methods=["DELETE"])
@optional_auth
def delete_tracked_issue(issue_id):
    db = get_db()
    issue = db.query(TrackedIssue).filter_by(id=issue_id).first()
    if not issue:
        return jsonify({"error": "Tracked issue not found"}), 404

    db.delete(issue)
    db.commit()
    return jsonify({"message": "Tracked issue deleted successfully"})
