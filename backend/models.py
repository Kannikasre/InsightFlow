from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="Product Lead")
    created_at = Column(DateTime, default=get_utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class DatasetImport(Base):
    __tablename__ = "dataset_imports"

    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    row_count = Column(Integer, default=0)
    valid_count = Column(Integer, default=0)
    rejected_count = Column(Integer, default=0)
    status = Column(String(50), default="completed") # pending, processing, completed, failed
    upload_date = Column(DateTime, default=get_utc_now)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    feedback_records = relationship("Feedback", back_populates="dataset_import", cascade="all, delete-orphan")
    analysis_runs = relationship("AnalysisRun", back_populates="dataset_import", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "row_count": self.row_count,
            "valid_count": self.valid_count,
            "rejected_count": self.rejected_count,
            "status": self.status,
            "upload_date": self.upload_date.isoformat() if self.upload_date else None,
            "user_id": self.user_id
        }

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    sentiment = Column(String(50), nullable=False, index=True)  # Positive, Neutral, Negative
    sentiment_score = Column(Float, default=0.0)  # -1.0 to 1.0
    severity = Column(String(50), default="Medium", index=True)  # Low, Medium, High, Critical
    source = Column(String(100), default="Customer Review", index=True)
    timestamp = Column(DateTime, default=get_utc_now, index=True)
    hidden_cluster = Column(String(150), nullable=True)
    is_hidden_complaint = Column(Boolean, default=False)
    
    dataset_import_id = Column(Integer, ForeignKey("dataset_imports.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    dataset_import = relationship("DatasetImport", back_populates="feedback_records")
    evidence_links = relationship("EvidenceLink", back_populates="feedback", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_category_sentiment", "category", "sentiment"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "category": self.category,
            "sentiment": self.sentiment,
            "sentiment_score": round(self.sentiment_score, 2) if self.sentiment_score is not None else 0.0,
            "severity": self.severity,
            "source": self.source,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "hidden_cluster": self.hidden_cluster,
            "is_hidden_complaint": self.is_hidden_complaint,
            "dataset_import_id": self.dataset_import_id
        }

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(Integer, primary_key=True)
    dataset_import_id = Column(Integer, ForeignKey("dataset_imports.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    started_at = Column(DateTime, default=get_utc_now)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="processing")  # processing, completed, failed
    total_analyzed = Column(Integer, default=0)
    positive_count = Column(Integer, default=0)
    neutral_count = Column(Integer, default=0)
    negative_count = Column(Integer, default=0)
    adaption_run_id = Column(String(100), nullable=True)
    adaption_status = Column(String(50), default="not_started")  # not_started, uploaded, adapting, completed, fallback_mode
    error_message = Column(Text, nullable=True)
    execution_time_sec = Column(Float, default=0.0)

    dataset_import = relationship("DatasetImport", back_populates="analysis_runs")
    issue_groups = relationship("IssueGroup", back_populates="analysis_run", cascade="all, delete-orphan")
    adaption_logs = relationship("AdaptionLog", back_populates="analysis_run", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "dataset_import_id": self.dataset_import_id,
            "user_id": self.user_id,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "status": self.status,
            "total_analyzed": self.total_analyzed,
            "positive_count": self.positive_count,
            "neutral_count": self.neutral_count,
            "negative_count": self.negative_count,
            "adaption_run_id": self.adaption_run_id,
            "adaption_status": self.adaption_status,
            "error_message": self.error_message,
            "execution_time_sec": round(self.execution_time_sec, 2)
        }

class IssueGroup(Base):
    __tablename__ = "issue_groups"

    id = Column(Integer, primary_key=True)
    analysis_run_id = Column(Integer, ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    frequency = Column(Integer, default=0)
    negative_pct = Column(Float, default=0.0)
    severity = Column(String(50), default="High")
    impact_score = Column(Float, default=0.0)  # Calculated Customer Impact Score (0-100)
    trend = Column(String(50), default="+14% this month")
    description = Column(Text, nullable=True)
    hidden_pattern = Column(String(255), nullable=True)
    root_cause_hypothesis = Column(Text, nullable=True)
    connected_issue = Column(String(255), nullable=True)

    analysis_run = relationship("AnalysisRun", back_populates="issue_groups")
    evidence_links = relationship("EvidenceLink", back_populates="issue_group", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="issue_group", cascade="all, delete-orphan")
    tracked_issues = relationship("TrackedIssue", back_populates="issue_group")

    def to_dict(self):
        return {
            "id": self.id,
            "analysis_run_id": self.analysis_run_id,
            "title": self.title,
            "category": self.category,
            "frequency": self.frequency,
            "negative_pct": round(self.negative_pct, 1),
            "severity": self.severity,
            "impact_score": round(self.impact_score, 1),
            "trend": self.trend,
            "description": self.description,
            "hidden_pattern": self.hidden_pattern,
            "root_cause_hypothesis": self.root_cause_hypothesis,
            "connected_issue": self.connected_issue,
            "evidence_count": len(self.evidence_links) if self.evidence_links else 0
        }

class EvidenceLink(Base):
    __tablename__ = "evidence_links"

    id = Column(Integer, primary_key=True)
    issue_group_id = Column(Integer, ForeignKey("issue_groups.id", ondelete="CASCADE"), nullable=False)
    feedback_id = Column(Integer, ForeignKey("feedback.id", ondelete="CASCADE"), nullable=False)
    relevance_score = Column(Float, default=0.9)
    quote_snippet = Column(Text, nullable=True)

    issue_group = relationship("IssueGroup", back_populates="evidence_links")
    feedback = relationship("Feedback", back_populates="evidence_links")

    def to_dict(self):
        return {
            "id": self.id,
            "issue_group_id": self.issue_group_id,
            "feedback_id": self.feedback_id,
            "relevance_score": self.relevance_score,
            "quote_snippet": self.quote_snippet,
            "feedback": self.feedback.to_dict() if self.feedback else None
        }

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True)
    issue_group_id = Column(Integer, ForeignKey("issue_groups.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    action_steps = Column(Text, nullable=False)
    rationale = Column(Text, nullable=False)
    suggested_priority = Column(String(50), default="High")  # Critical, High, Medium, Low
    potential_impact = Column(Text, nullable=True)
    limitations = Column(Text, nullable=True)
    status = Column(String(50), default="proposed")  # proposed, converted_to_issue, dismissed
    created_at = Column(DateTime, default=get_utc_now)

    issue_group = relationship("IssueGroup", back_populates="recommendations")
    tracked_issue = relationship("TrackedIssue", back_populates="recommendation", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "issue_group_id": self.issue_group_id,
            "issue_title": self.issue_group.title if self.issue_group else None,
            "category": self.issue_group.category if self.issue_group else None,
            "impact_score": self.issue_group.impact_score if self.issue_group else 0.0,
            "evidence_count": len(self.issue_group.evidence_links) if self.issue_group and self.issue_group.evidence_links else 0,
            "title": self.title,
            "action_steps": self.action_steps,
            "rationale": self.rationale,
            "suggested_priority": self.suggested_priority,
            "potential_impact": self.potential_impact,
            "limitations": self.limitations,
            "status": self.status,
            "has_tracked_issue": self.tracked_issue is not None,
            "tracked_issue_id": self.tracked_issue.id if self.tracked_issue else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class TrackedIssue(Base):
    __tablename__ = "tracked_issues"

    id = Column(Integer, primary_key=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"), nullable=True)
    issue_group_id = Column(Integer, ForeignKey("issue_groups.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    priority = Column(String(50), default="High")  # Critical, High, Medium, Low
    status = Column(String(50), default="Open")  # Open, In Progress, Resolved
    assigned_to = Column(String(100), default="Engineering Team")
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    recommendation = relationship("Recommendation", back_populates="tracked_issue")
    issue_group = relationship("IssueGroup", back_populates="tracked_issues")
    activities = relationship("IssueActivity", back_populates="tracked_issue", cascade="all, delete-orphan", order_by="desc(IssueActivity.timestamp)")

    def to_dict(self):
        return {
            "id": self.id,
            "recommendation_id": self.recommendation_id,
            "issue_group_id": self.issue_group_id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "priority": self.priority,
            "status": self.status,
            "assigned_to": self.assigned_to,
            "resolution_notes": self.resolution_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "user_id": self.user_id,
            "activities_count": len(self.activities) if self.activities else 0
        }

class IssueActivity(Base):
    __tablename__ = "issue_activities"

    id = Column(Integer, primary_key=True)
    tracked_issue_id = Column(Integer, ForeignKey("tracked_issues.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action_type = Column(String(50), nullable=False)  # created, status_change, priority_change, assigned, comment
    old_value = Column(String(255), nullable=True)
    new_value = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=get_utc_now)

    tracked_issue = relationship("TrackedIssue", back_populates="activities")

    def to_dict(self):
        return {
            "id": self.id,
            "tracked_issue_id": self.tracked_issue_id,
            "user_id": self.user_id,
            "action_type": self.action_type,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "notes": self.notes,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }

class AdaptionLog(Base):
    __tablename__ = "adaption_logs"

    id = Column(Integer, primary_key=True)
    analysis_run_id = Column(Integer, ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=True)
    dataset_id = Column(String(100), nullable=True)
    run_id = Column(String(100), nullable=True)
    operation = Column(String(100), nullable=False)  # upload_file, adapt, get_status, download, fallback_simulation
    status = Column(String(50), nullable=False)  # success, failed, in_progress, simulated
    request_payload = Column(Text, nullable=True)
    response_payload = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    analysis_run = relationship("AnalysisRun", back_populates="adaption_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "analysis_run_id": self.analysis_run_id,
            "dataset_id": self.dataset_id,
            "run_id": self.run_id,
            "operation": self.operation,
            "status": self.status,
            "request_payload": self.request_payload,
            "response_payload": self.response_payload,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
