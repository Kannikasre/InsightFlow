import io
import csv
from flask import Blueprint, jsonify, make_response
from backend.models import Feedback, IssueGroup, TrackedIssue, Recommendation
from backend.database import get_db
from backend.report_generator import generate_pdf_report
from backend.auth import optional_auth

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

@reports_bp.route("/summary", methods=["GET"])
@optional_auth
def get_report_summary():
    db = get_db()
    total_fb = db.query(Feedback).count()
    pos = db.query(Feedback).filter_by(sentiment="Positive").count()
    neg = db.query(Feedback).filter_by(sentiment="Negative").count()
    neu = db.query(Feedback).filter_by(sentiment="Neutral").count()

    top_issues = [i.to_dict() for i in db.query(IssueGroup).order_by(IssueGroup.impact_score.desc()).limit(5).all()]
    recommendations = [r.to_dict() for r in db.query(Recommendation).limit(5).all()]
    
    tracked_open = db.query(TrackedIssue).filter_by(status="Open").count()
    tracked_in_progress = db.query(TrackedIssue).filter_by(status="In Progress").count()
    tracked_resolved = db.query(TrackedIssue).filter_by(status="Resolved").count()

    return jsonify({
        "metrics": {
            "total_records": total_fb,
            "positive_count": pos,
            "neutral_count": neu,
            "negative_count": neg,
            "negative_rate": round((neg / max(total_fb, 1)) * 100, 1),
            "positive_rate": round((pos / max(total_fb, 1)) * 100, 1)
        },
        "top_issues": top_issues,
        "recommendations": recommendations,
        "issue_tracking": {
            "open": tracked_open,
            "in_progress": tracked_in_progress,
            "resolved": tracked_resolved,
            "total": tracked_open + tracked_in_progress + tracked_resolved
        }
    })

@reports_bp.route("/export-pdf", methods=["GET"])
@optional_auth
def export_pdf():
    pdf_bytes = generate_pdf_report()
    response = make_response(pdf_bytes)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = "attachment; filename=InsightFlow_Executive_Feedback_Report.pdf"
    return response

@reports_bp.route("/export-csv", methods=["GET"])
@optional_auth
def export_csv():
    db = get_db()
    records = db.query(Feedback).limit(10000).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Category", "Sentiment", "Sentiment_Score", "Severity", "Source", "Date", "Review_Text"])
    
    for r in records:
        writer.writerow([
            r.id,
            r.category,
            r.sentiment,
            r.sentiment_score,
            r.severity,
            r.source,
            r.timestamp.isoformat() if r.timestamp else "",
            r.text
        ])
    
    response = make_response(output.getvalue())
    response.headers["Content-Type"] = "text/csv; charset=utf-8"
    response.headers["Content-Disposition"] = "attachment; filename=InsightFlow_Analyzed_Customer_Feedback.csv"
    return response
