from flask import Blueprint, request, jsonify
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from backend.models import Feedback, IssueGroup, TrackedIssue, AnalysisRun
from backend.database import get_db
from backend.auth import optional_auth

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/metrics", methods=["GET"])
@optional_auth
def get_dashboard_metrics():
    db = get_db()
    
    # Query filters
    category_filter = request.args.get("category")
    sentiment_filter = request.args.get("sentiment")
    source_filter = request.args.get("source")
    days_filter = request.args.get("days", type=int)

    query = db.query(Feedback)

    if category_filter and category_filter != "All":
        query = query.filter(Feedback.category == category_filter)
    if sentiment_filter and sentiment_filter != "All":
        query = query.filter(Feedback.sentiment == sentiment_filter)
    if source_filter and source_filter != "All":
        query = query.filter(Feedback.source == source_filter)
    if days_filter:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days_filter)
        query = query.filter(Feedback.timestamp >= cutoff)

    total_records = query.count()

    if total_records == 0:
        return jsonify({
            "total_records": 0,
            "sentiment_summary": {"positive": 0, "neutral": 0, "negative": 0},
            "sentiment_percentages": {"positive": 0, "neutral": 0, "negative": 0},
            "category_distribution": [],
            "temporal_trends": [],
            "top_issues": [],
            "impact_index": 0.0,
            "recent_activity": []
        })

    # Sentiment distribution
    sentiment_counts = dict(
        query.with_entities(Feedback.sentiment, func.count(Feedback.id))
        .group_by(Feedback.sentiment)
        .all()
    )
    pos = sentiment_counts.get("Positive", 0)
    neu = sentiment_counts.get("Neutral", 0)
    neg = sentiment_counts.get("Negative", 0)

    # Category distribution
    cat_query = (
        query.with_entities(Feedback.category, Feedback.sentiment, func.count(Feedback.id))
        .group_by(Feedback.category, Feedback.sentiment)
        .all()
    )
    cat_map = {}
    for cat, sent, count in cat_query:
        if cat not in cat_map:
            cat_map[cat] = {"category": cat, "total": 0, "positive": 0, "neutral": 0, "negative": 0}
        cat_map[cat]["total"] += count
        if sent == "Positive":
            cat_map[cat]["positive"] += count
        elif sent == "Neutral":
            cat_map[cat]["neutral"] += count
        elif sent == "Negative":
            cat_map[cat]["negative"] += count

    cat_list = sorted(list(cat_map.values()), key=lambda x: x["total"], reverse=True)

    # Temporal trends (weekly aggregation over past 12 weeks)
    now = datetime.now(timezone.utc)
    trends = []
    for w in range(11, -1, -1):
        w_start = now - timedelta(days=(w + 1) * 7)
        w_end = now - timedelta(days=w * 7)
        
        w_records = query.filter(Feedback.timestamp >= w_start, Feedback.timestamp < w_end).all()
        w_pos = sum(1 for r in w_records if r.sentiment == "Positive")
        w_neg = sum(1 for r in w_records if r.sentiment == "Negative")
        w_neu = sum(1 for r in w_records if r.sentiment == "Neutral")
        
        label = (now - timedelta(days=w * 7)).strftime("%b %d")
        trends.append({
            "period": label,
            "total": len(w_records),
            "positive": w_pos,
            "neutral": w_neu,
            "negative": w_neg,
            "negative_rate": round((w_neg / max(len(w_records), 1)) * 100, 1)
        })

    # Top Issues from IssueGroup
    issue_query = db.query(IssueGroup).order_by(IssueGroup.impact_score.desc())
    if category_filter and category_filter != "All":
        issue_query = issue_query.filter(IssueGroup.category == category_filter)
    top_issues = [ig.to_dict() for ig in issue_query.limit(5).all()]

    # Overall Customer Impact Index (0-100 average of top active issues)
    avg_impact = round(
        sum(i["impact_score"] for i in top_issues) / max(len(top_issues), 1), 1
    ) if top_issues else 0.0

    # Recent activity
    recent_runs = db.query(AnalysisRun).order_by(AnalysisRun.started_at.desc()).limit(3).all()
    recent_issues = db.query(TrackedIssue).order_by(TrackedIssue.created_at.desc()).limit(3).all()

    recent_activity = []
    for r in recent_runs:
        recent_activity.append({
            "type": "analysis_run",
            "title": f"Analyzed {r.total_analyzed:,} customer feedback entries",
            "time": r.completed_at.isoformat() if r.completed_at else r.started_at.isoformat(),
            "status": r.status,
            "badge": r.adaption_status
        })
    for i in recent_issues:
        recent_activity.append({
            "type": "issue_created",
            "title": f"Tracked Issue: {i.title}",
            "time": i.created_at.isoformat() if i.created_at else None,
            "status": i.status,
            "badge": i.priority
        })

    return jsonify({
        "total_records": total_records,
        "sentiment_summary": {
            "positive": pos,
            "neutral": neu,
            "negative": neg
        },
        "sentiment_percentages": {
            "positive": round((pos / total_records) * 100, 1),
            "neutral": round((neu / total_records) * 100, 1),
            "negative": round((neg / total_records) * 100, 1)
        },
        "category_distribution": cat_list,
        "temporal_trends": trends,
        "top_issues": top_issues,
        "impact_index": avg_impact,
        "recent_activity": recent_activity
    })
