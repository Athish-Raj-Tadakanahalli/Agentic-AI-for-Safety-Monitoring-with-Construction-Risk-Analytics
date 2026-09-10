from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import PPEViolation, SafetyIncident, Alert
from backend.agents.safety_agent import SafetyAgent
from backend.notifications.notifier import notifier
from backend.schemas.safety_schemas import (
    PPEViolationIngest,
    PPEViolationResponse,
    SafetyIncidentIngest,
    SafetyIncidentResponse,
    PPEComplianceResponse,
    SafetyScoreResponse,
    SafetyAnalyticsResponse,
    AlertResponse
)

router = APIRouter(tags=["Safety Agent & Notifications"])
agent = SafetyAgent()

# Safety Agent Endpoints
@router.post("/api/safety/ppe-event", response_model=PPEViolationResponse, status_code=status.HTTP_201_CREATED)
def ingest_ppe_event(data: PPEViolationIngest, db: Session = Depends(get_db)):
    """
    POST /api/safety/ppe-event
    Ingests computer vision PPE violation detection event (hard hat, vest, boots, gloves).
    """
    try:
        violation = agent.ingest_ppe_violation(db, data)
        return violation
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.post("/api/safety/incident", response_model=SafetyIncidentResponse, status_code=status.HTTP_201_CREATED)
def log_safety_incident(data: SafetyIncidentIngest, db: Session = Depends(get_db)):
    """
    POST /api/safety/incident
    Logs a safety incident or near-miss event. Triggers escalation alerts if high/critical.
    """
    try:
        incident = agent.log_safety_incident(db, data)
        return incident
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/api/safety/{project_id}/compliance-rate", response_model=PPEComplianceResponse)
def get_ppe_compliance_rate(project_id: int, db: Session = Depends(get_db)):
    """
    GET /api/safety/{project_id}/compliance-rate
    Returns PPE compliance rate % and breakdown by type (Hard Hats, Vests, Boots, Gloves).
    """
    try:
        compliance = agent.calculate_ppe_compliance_rate(db, project_id)
        return compliance
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/api/safety/{project_id}/score", response_model=SafetyScoreResponse)
def get_safety_score(project_id: int, db: Session = Depends(get_db)):
    """
    GET /api/safety/{project_id}/score
    Returns 0-100 overall safety score and safety rating.
    """
    try:
        score_data = agent.calculate_safety_score(db, project_id)
        return score_data
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/api/safety/{project_id}/violations", response_model=List[PPEViolationResponse])
def get_safety_violations(
    project_id: int,
    since: Optional[str] = Query(None, description="ISO timestamp filter e.g. 2026-08-01T00:00:00"),
    db: Session = Depends(get_db)
):
    """
    GET /api/safety/{project_id}/violations?since=
    Returns list of logged PPE violations with optional time filter.
    """
    query = db.query(PPEViolation).filter(PPEViolation.project_id == project_id)
    if since:
        try:
            since_dt = datetime.fromisoformat(since)
            query = query.filter(PPEViolation.timestamp >= since_dt)
        except Exception:
            pass

    violations = query.order_by(PPEViolation.timestamp.desc()).all()
    return violations


@router.get("/api/safety/{project_id}/analytics", response_model=SafetyAnalyticsResponse)
def get_safety_analytics(project_id: int, db: Session = Depends(get_db)):
    """
    GET /api/safety/{project_id}/analytics
    Returns accident-prone zones, repeat violator workers, and plain-language recommendations.
    """
    try:
        analytics = agent.generate_safety_analytics(db, project_id)
        return analytics
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


# Notification Module Endpoints (Section 6)
@router.post("/api/notifications/test")
def test_notification_channels(
    channel: str = Query("email", description="email, sms, or webhook"),
    message: str = Query("Test BuildSure Safety Alert", description="Alert message text"),
    project_id: Optional[int] = Query(None, description="Optional project ID to associate log with"),
    db: Session = Depends(get_db)
):
    """
    POST /api/notifications/test
    Tests email, SMS (Twilio), or Slack/Teams incoming webhook dispatch.
    """
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if channel.lower() == "email":
        notifier.send_email_alert("safety-officer@buildsure.ai", "BuildSure Test Safety Breach Alert", message)
    elif channel.lower() == "sms":
        notifier.send_sms_alert("+1-555-SAFE-911", f"[TEST SMS]: {message}")
    else:
        notifier.send_webhook_alert("BuildSure Test Webhook Notification", {"message": message, "timestamp": str(now)})

    # Log to alerts table if project_id is specified
    if project_id:
        test_alert = Alert(
            project_id=project_id,
            alert_type=f"Test Notification ({channel.upper()})",
            severity="medium",
            message=f"Dispatched test via {channel.upper()}: {message}",
            created_at=now
        )
        db.add(test_alert)
        db.commit()

    return {"status": "success", "channel": channel, "message": message, "dispatched_at": now}


@router.get("/api/notifications/{project_id}/log", response_model=List[AlertResponse])
def get_notification_log(project_id: int, db: Session = Depends(get_db)):
    """
    GET /api/notifications/{project_id}/log
    Returns logged alerts and notification escalation history for a project.
    """
    alerts = db.query(Alert).filter(Alert.project_id == project_id).order_by(Alert.created_at.desc()).all()
    return alerts
