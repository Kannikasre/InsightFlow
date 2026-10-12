import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from backend.models import Feedback, IssueGroup, Recommendation, TrackedIssue, AnalysisRun
from backend.database import get_db

def generate_pdf_report():
    db = get_db()
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0B0D12")
    )
    
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#5A6578")
    )
    
    h2_style = ParagraphStyle(
        "H2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#131720"),
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#293140")
    )

    story = []

    # Header
    story.append(Paragraph("INSIGHTFLOW — EXECUTIVE FEEDBACK & DECISION INTELLIGENCE REPORT", title_style))
    story.append(Spacer(1, 4))
    date_str = datetime.now().strftime("%B %d, %Y - %H:%M UTC")
    story.append(Paragraph(f"Generated on {date_str} • Build Battle 2026 Official Audit", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#71E3BD"), spaceAfter=15))

    # Metrics Summary
    total_feedback = db.query(Feedback).count()
    pos_feedback = db.query(Feedback).filter_by(sentiment="Positive").count()
    neg_feedback = db.query(Feedback).filter_by(sentiment="Negative").count()
    neu_feedback = db.query(Feedback).filter_by(sentiment="Neutral").count()

    metrics_data = [
        [
            Paragraph("<b>Total Records</b>", body_style),
            Paragraph("<b>Negative %</b>", body_style),
            Paragraph("<b>Positive %</b>", body_style),
            Paragraph("<b>Neutral %</b>", body_style)
        ],
        [
            f"{total_feedback:,}",
            f"{round((neg_feedback / max(total_feedback, 1)) * 100, 1)}%",
            f"{round((pos_feedback / max(total_feedback, 1)) * 100, 1)}%",
            f"{round((neu_feedback / max(total_feedback, 1)) * 100, 1)}%"
        ]
    ]
    t_metrics = Table(metrics_data, colWidths=[130, 130, 130, 130])
    t_metrics.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F4F8")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0B0D12")),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 1), (-1, 1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D0D7DE")),
    ]))
    story.append(t_metrics)
    story.append(Spacer(1, 14))

    # High Priority Issues & Customer Pain Radar
    story.append(Paragraph("1. CUSTOMER PAIN RADAR & IMPACT PRIORITIZATION", h2_style))
    issues = db.query(IssueGroup).order_by(IssueGroup.impact_score.desc()).all()
    
    issue_table_data = [
        [
            Paragraph("<b>Priority Issue</b>", body_style),
            Paragraph("<b>Category</b>", body_style),
            Paragraph("<b>Impact Score</b>", body_style),
            Paragraph("<b>Volume</b>", body_style),
            Paragraph("<b>Negative %</b>", body_style),
            Paragraph("<b>Trend</b>", body_style)
        ]
    ]
    for iss in issues[:6]:
        issue_table_data.append([
            Paragraph(f"<b>{iss.title}</b>", body_style),
            Paragraph(iss.category, body_style),
            Paragraph(f"<b>{iss.impact_score}/100</b>", body_style),
            f"{iss.frequency:,}",
            f"{iss.negative_pct}%",
            iss.trend
        ])

    t_issues = Table(issue_table_data, colWidths=[170, 90, 75, 55, 65, 65])
    t_issues.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#131720")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E1E4E8")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_issues)
    story.append(Spacer(1, 14))

    # Actionable Recommendations
    story.append(Paragraph("2. STRATEGIC RECOMMENDATIONS & EVIDENCE RATIONALE", h2_style))
    recs = db.query(Recommendation).limit(4).all()
    for idx, rec in enumerate(recs, 1):
        rec_text = f"<b>{idx}. {rec.title}</b> (Priority: {rec.suggested_priority})<br/>"
        rec_text += f"<i>Rationale:</i> {rec.rationale}<br/>"
        rec_text += f"<i>Action Steps:</i><br/>{rec.action_steps.replace(chr(10), '<br/>')}<br/>"
        rec_text += f"<i>Expected Impact:</i> {rec.potential_impact}"
        story.append(Paragraph(rec_text, body_style))
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 10))

    # Tracked Work / Issue Tracker
    story.append(Paragraph("3. FEEDBACK-TO-FIX WORKFLOW (TRACKED ISSUES)", h2_style))
    tracked = db.query(TrackedIssue).all()
    if tracked:
        tracked_data = [
            [
                Paragraph("<b>Task Title</b>", body_style),
                Paragraph("<b>Category</b>", body_style),
                Paragraph("<b>Priority</b>", body_style),
                Paragraph("<b>Status</b>", body_style),
                Paragraph("<b>Assigned Owner</b>", body_style)
            ]
        ]
        for t in tracked:
            tracked_data.append([
                Paragraph(t.title, body_style),
                t.category,
                t.priority,
                t.status,
                t.assigned_to
            ])
        t_tracked = Table(tracked_data, colWidths=[180, 85, 65, 75, 115])
        t_tracked.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#191F2B")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ]))
        story.append(t_tracked)
    else:
        story.append(Paragraph("No active engineering issues currently open in tracker.", body_style))

    # Build document
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
