import os
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.database.models import Alert, Project

def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

logger = logging.getLogger("BuildSureNotifications")
logger.setLevel(logging.INFO)

class NotificationService:
    """
    Notification & Escalation Service (Module 6)
    Handles Email (SMTP), SMS (Twilio), and Slack/Teams webhooks for safety alerts.
    """

    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.buildsure.ai")
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID", "mock_sid")
        self.slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL", "")

    def send_email_alert(self, recipient: str, subject: str, body: str) -> bool:
        """Simulates sending an Email alert via SMTP / SendGrid"""
        logger.info(f"[EMAIL NOTIFICATION] To: {recipient} | Subject: {subject} | Body: {body}")
        print(f"[EMAIL DISPATCHED] To: {recipient} | Subject: '{subject}'")
        return True

    def send_sms_alert(self, phone_number: str, message: str) -> bool:
        """Simulates sending an SMS alert via Twilio for critical incidents"""
        logger.info(f"[SMS ALERT] To: {phone_number} | Message: {message}")
        print(f"[SMS ALERT DISPATCHED] To: {phone_number} | Msg: '{message}'")
        return True

    def send_webhook_alert(self, title: str, payload: Dict[str, Any]) -> bool:
        """Simulates sending a Slack/Teams incoming webhook notification"""
        logger.info(f"[WEBHOOK NOTIFICATION] Title: {title} | Payload: {payload}")
        print(f"[SLACK/TEAMS WEBHOOK] Title: '{title}' | Payload: {payload}")
        return True

    def trigger_incident_escalation(
        self,
        db: Session,
        project_id: int,
        alert_type: str,
        severity: str,
        message: str
    ) -> Alert:
        """
        Escalation workflow:
        1. Logs alert entry to 'alerts' database table.
        2. Dispatches Email for High/Critical severity alerts.
        3. Dispatches SMS to Safety Officer immediately if severity == 'critical'.
        4. Sends Slack/Teams incoming webhook for daily summary/alert feed.
        """
        project = db.query(Project).filter(Project.project_id == project_id).first()
        proj_name = project.project_name if project else f"Project #{project_id}"

        # 1. Log alert to DB
        alert_entry = Alert(
            project_id=project_id,
            alert_type=alert_type,
            severity=severity.lower(),
            message=message,
            created_at=utc_now()
        )
        db.add(alert_entry)
        db.commit()
        db.refresh(alert_entry)

        # 2. Trigger notifications based on severity
        if severity.lower() == "critical":
            # Immediate SMS page to Safety Officer
            self.send_sms_alert(
                phone_number="+1-555-SAFE-911",
                message=f"[CRITICAL ALERT] [{proj_name}]: {message}"
            )
            # High-priority Email
            self.send_email_alert(
                recipient="safety-officer@buildsure.ai",
                subject=f"CRITICAL ESCALATION: {alert_type} on {proj_name}",
                body=f"Critical Incident Reported at {utc_now().strftime('%Y-%m-%d %H:%M:%S UTC')}.\n\nDetails: {message}"
            )

        elif severity.lower() == "high":
            # Email notification within 15 minutes
            self.send_email_alert(
                recipient="site-manager@buildsure.ai",
                subject=f"HIGH SEVERITY ALERT: {alert_type} on {proj_name}",
                body=f"High severity safety alert detected.\nDetails: {message}"
            )

        # Always notify Slack/Teams channel
        self.send_webhook_alert(
            title=f"BuildSure Alert [{severity.upper()}] - {proj_name}",
            payload={"type": alert_type, "severity": severity, "message": message, "timestamp": str(utc_now())}
        )

        # Broadcast zero-latency alert over WebSockets to active frontend dashboards
        try:
            from backend.notifications.websocket_manager import ws_manager
            ws_manager.sync_broadcast_to_project(project_id, {
                "type": "ALERT",
                "alert": {
                    "alert_id": alert_entry.alert_id,
                    "project_id": alert_entry.project_id,
                    "alert_type": alert_entry.alert_type,
                    "severity": alert_entry.severity,
                    "message": alert_entry.message,
                    "created_at": alert_entry.created_at.isoformat() if alert_entry.created_at else str(utc_now())
                }
            })
        except Exception as ws_err:
            logger.warning(f"WebSocket broadcast error: {ws_err}")

        return alert_entry

# Singleton instance
notifier = NotificationService()

def trigger_multi_channel_alert(db: Session, project_id: int, alert_type: str, severity: str, message: str) -> Dict[str, Any]:
    alert = notifier.trigger_incident_escalation(db, project_id, alert_type, severity, message)
    return {
        "alert_id": alert.alert_id,
        "project_id": alert.project_id,
        "alert_type": alert.alert_type,
        "severity": alert.severity,
        "message": alert.message,
        "created_at": alert.created_at.isoformat() if alert.created_at else str(utc_now())
    }
