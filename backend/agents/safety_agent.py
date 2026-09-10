from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database.models import PPEViolation, SafetyIncident, Project, Alert
from backend.notifications.notifier import notifier

def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)
from backend.schemas.safety_schemas import (
    PPEViolationIngest,
    SafetyIncidentIngest,
    SafetyScoreResponse,
    PPEComplianceResponse,
    PPETypeBreakdown,
    SafetyAnalyticsResponse,
    AccidentProneZone,
    RepeatViolator
)

class SafetyAgent:
    """
    Safety Agent (Milestone 2 - Module 4.2)
    Monitors worker safety compliance from Computer Vision (CV) PPE detection events,
    detects PPE violations (hard hat, vest, boots, gloves), tracks accident-prone zones,
    identifies unsafe worker behavior patterns, computes safety scores & PPE compliance rates,
    and dispatches safety escalation alerts via Email, SMS, and Webhooks.
    """

    PPE_TYPES = ["hard hat", "vest", "boots", "gloves"]

    def __init__(self):
        pass

    def ingest_ppe_violation(self, db: Session, data: PPEViolationIngest) -> PPEViolation:
        """
        Ingests CV camera PPE violation detection event
        """
        project = db.query(Project).filter(Project.project_id == data.project_id).first()
        if not project:
            raise ValueError(f"Project with ID {data.project_id} not found.")

        violation = PPEViolation(
            project_id=data.project_id,
            worker_id=data.worker_id or "W-UNIDENTIFIED",
            violation_type=data.violation_type.lower(),
            zone=data.zone or "General Site",
            timestamp=data.timestamp or utc_now()
        )

        db.add(violation)
        db.commit()
        db.refresh(violation)

        # Check for repeat violations by worker in last 24h
        cutoff = utc_now() - timedelta(hours=24)
        repeat_count = db.query(PPEViolation).filter(
            PPEViolation.project_id == data.project_id,
            PPEViolation.worker_id == data.worker_id,
            PPEViolation.timestamp >= cutoff
        ).count()

        if repeat_count >= 3:
            # Trigger escalation alert for repeat safety violator
            notifier.trigger_incident_escalation(
                db=db,
                project_id=data.project_id,
                alert_type="Repeat PPE Violator",
                severity="high",
                message=f"Worker {data.worker_id} committed {repeat_count} PPE violations ({data.violation_type}) in Zone '{data.zone or 'General Site'}' within 24 hours."
            )

        return violation

    def log_safety_incident(self, db: Session, data: SafetyIncidentIngest) -> SafetyIncident:
        """
        Logs a safety incident or near-miss event and triggers escalation
        """
        project = db.query(Project).filter(Project.project_id == data.project_id).first()
        if not project:
            raise ValueError(f"Project with ID {data.project_id} not found.")

        incident = SafetyIncident(
            project_id=data.project_id,
            incident_type=data.incident_type.lower(),
            severity=data.severity.lower(),
            zone=data.zone or "General Site",
            description=data.description,
            incident_date=data.incident_date or utc_now()
        )

        db.add(incident)
        db.commit()
        db.refresh(incident)

        # Trigger notification escalation for high/critical incidents
        if data.severity.lower() in ["high", "critical"]:
            notifier.trigger_incident_escalation(
                db=db,
                project_id=data.project_id,
                alert_type=f"Safety Incident ({data.incident_type})",
                severity=data.severity.lower(),
                message=f"Incident '{data.incident_type}' ({data.severity.upper()}) reported in Zone '{data.zone or 'General Site'}'. Notes: {data.description or 'No additional notes provided.'}"
            )

        return incident

    def calculate_ppe_compliance_rate(self, db: Session, project_id: int) -> PPEComplianceResponse:
        """
        Computes PPE compliance rate overall and breakdown by PPE type
        (Hard Hats, Vests, Boots, Gloves) over the last 30 days.
        """
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} not found.")

        # Total violations in last 30 days
        cutoff = utc_now() - timedelta(days=30)
        violations = db.query(PPEViolation).filter(
            PPEViolation.project_id == project_id,
            PPEViolation.timestamp >= cutoff
        ).all()

        total_violations = len(violations)
        
        # Estimate total monitored checks benchmark (approx 40 checks per worker/day)
        unique_workers = len(set(v.worker_id for v in violations if v.worker_id)) or 15
        total_estimated_checks = max(200, unique_workers * 40)

        # Categorize violations by PPE type
        type_counts: Dict[str, int] = {t: 0 for t in self.PPE_TYPES}
        for v in violations:
            v_type = v.violation_type.lower()
            for t in self.PPE_TYPES:
                if t in v_type or v_type in t:
                    type_counts[t] += 1
                    break

        breakdown: Dict[str, PPETypeBreakdown] = {}
        sub_check_count = total_estimated_checks // 4

        for t in self.PPE_TYPES:
            v_cnt = type_counts[t]
            comp_rate = round(max(0.0, min(100.0, ((sub_check_count - v_cnt) / sub_check_count) * 100.0)), 1)
            breakdown[t] = PPETypeBreakdown(
                ppe_type=t.title(),
                compliance_rate=comp_rate,
                total_checks=sub_check_count,
                violations_count=v_cnt
            )

        overall_compliance = round(max(0.0, min(100.0, ((total_estimated_checks - total_violations) / total_estimated_checks) * 100.0)), 1)

        return PPEComplianceResponse(
            project_id=project_id,
            overall_compliance_rate=overall_compliance,
            total_violations_count=total_violations,
            workers_monitored_count=unique_workers,
            breakdown_by_type=breakdown
        )

    def calculate_safety_score(self, db: Session, project_id: int) -> SafetyScoreResponse:
        """
        Computes overall safety score (0-100) where 100 represents zero incidents and full PPE compliance.
        Score = (PPE Compliance Rate * 60%) + (Incident Record Score * 40%)
        """
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} not found.")

        compliance_data = self.calculate_ppe_compliance_rate(db, project_id)
        
        # Calculate incident impact
        cutoff = utc_now() - timedelta(days=30)
        incidents = db.query(SafetyIncident).filter(
            SafetyIncident.project_id == project_id,
            SafetyIncident.incident_date >= cutoff
        ).all()

        incident_deduction = 0.0
        for inc in incidents:
            sev = inc.severity.lower()
            if sev == "critical":
                incident_deduction += 20.0
            elif sev == "high":
                incident_deduction += 10.0
            elif sev == "medium":
                incident_deduction += 5.0
            else:
                incident_deduction += 2.0

        # Base safety score combines PPE compliance (60% weight) and Incident record (40% weight)
        ppe_score = compliance_data.overall_compliance_rate
        record_score = max(0.0, 100.0 - incident_deduction)

        final_safety_score = round(max(0.0, min(100.0, (ppe_score * 0.6) + (record_score * 0.4))), 1)

        if final_safety_score >= 90.0:
            rating = "Excellent"
        elif final_safety_score >= 75.0:
            rating = "Good"
        elif final_safety_score >= 60.0:
            rating = "Fair"
        elif final_safety_score >= 40.0:
            rating = "Poor"
        else:
            rating = "Critical"

        return SafetyScoreResponse(
            project_id=project.project_id,
            project_name=project.project_name,
            safety_score=final_safety_score,
            safety_rating=rating,
            ppe_compliance_rate=compliance_data.overall_compliance_rate,
            active_violations_count=compliance_data.total_violations_count,
            total_incidents_count=len(incidents),
            workers_monitored=compliance_data.workers_monitored_count
        )

    def generate_safety_analytics(self, db: Session, project_id: int) -> SafetyAnalyticsResponse:
        """
        Analyzes accident-prone zones dynamically from stored violations and incidents,
        identifies repeat violator workers, and generates plain-language actionable safety recommendations.
        """
        cutoff = utc_now() - timedelta(days=30)
        violations = db.query(PPEViolation).filter(
            PPEViolation.project_id == project_id,
            PPEViolation.timestamp >= cutoff
        ).all()

        incidents = db.query(SafetyIncident).filter(
            SafetyIncident.project_id == project_id,
            SafetyIncident.incident_date >= cutoff
        ).all()

        # 1. Repeat Violators
        worker_map: Dict[str, Dict[str, Any]] = {}
        for v in violations:
            wid = v.worker_id or "W-UNKNOWN"
            if wid not in worker_map:
                worker_map[wid] = {"count": 0, "types": {}}
            worker_map[wid]["count"] += 1
            v_type = v.violation_type.lower()
            worker_map[wid]["types"][v_type] = worker_map[wid]["types"].get(v_type, 0) + 1

        repeat_violators = []
        for wid, info in sorted(worker_map.items(), key=lambda x: x[1]["count"], reverse=True)[:5]:
            freq_type = max(info["types"].items(), key=lambda x: x[1])[0] if info["types"] else "hard hat"
            repeat_violators.append(RepeatViolator(
                worker_id=wid,
                violations_count=info["count"],
                frequent_type=freq_type.title()
            ))

        # 2. Dynamic Accident-Prone Zones Aggregation
        zone_stats: Dict[str, Dict[str, Any]] = {}

        def get_zone_bucket(name: Optional[str]) -> Dict[str, Any]:
            clean_name = (name or "General Site").strip()
            if clean_name not in zone_stats:
                zone_stats[clean_name] = {
                    "incident_count": 0,
                    "violation_count": 0,
                    "weighted_score": 0.0
                }
            return zone_stats[clean_name]

        for inc in incidents:
            z_info = get_zone_bucket(getattr(inc, "zone", "General Site"))
            z_info["incident_count"] += 1
            sev = (inc.severity or "medium").lower()
            sev_weight = 10.0 if sev == "critical" else (5.0 if sev == "high" else (2.5 if sev == "medium" else 1.0))
            z_info["weighted_score"] += sev_weight

        for v in violations:
            z_info = get_zone_bucket(getattr(v, "zone", "General Site"))
            z_info["violation_count"] += 1
            z_info["weighted_score"] += 1.5

        accident_zones: List[AccidentProneZone] = []
        for zone_name, stats in sorted(zone_stats.items(), key=lambda x: x[1]["weighted_score"], reverse=True):
            if stats["incident_count"] == 0 and stats["violation_count"] == 0:
                continue
            if stats["weighted_score"] >= 12.0 or stats["incident_count"] >= 2:
                risk_level = "High"
            elif stats["weighted_score"] >= 5.0 or stats["incident_count"] >= 1:
                risk_level = "Medium"
            else:
                risk_level = "Low"

            accident_zones.append(AccidentProneZone(
                zone=zone_name,
                incident_count=stats["incident_count"],
                violation_count=stats["violation_count"],
                risk_level=risk_level
            ))

        # Baseline fallback zones if none logged yet
        if not accident_zones:
            accident_zones = [
                AccidentProneZone(zone="Scaffolding Tower", incident_count=0, violation_count=0, risk_level="Low"),
                AccidentProneZone(zone="Excavation Zone", incident_count=0, violation_count=0, risk_level="Low"),
                AccidentProneZone(zone="Crane & Rigging Yard", incident_count=0, violation_count=0, risk_level="Low"),
            ]

        # 3. Plain Language Safety Recommendations
        recommendations: List[str] = []
        
        # High exposure zone alerts
        high_zones = [z.zone for z in accident_zones if z.risk_level == "High"]
        if high_zones:
            recommendations.append(f"Deploy supervisor presence and inspect perimeter edge barriers immediately in: {', '.join(high_zones[:2])}.")

        # Repeat violators action
        top_violators = [v for v in repeat_violators if v.violations_count >= 2]
        if top_violators:
            v_summary = ", ".join(f"Worker {v.worker_id} ({v.violations_count}x {v.frequent_type})" for v in top_violators[:2])
            recommendations.append(f"Issue safety stand-down and mandatory retraining for repeat violators: {v_summary}.")

        # Category specific checks
        if any("hat" in v.violation_type.lower() for v in violations):
            recommendations.append("Mandate hard hat tethering for all high-altitude crews working above 15 meters.")
        if any("boots" in v.violation_type.lower() for v in violations):
            recommendations.append("Enforce steel-toe boot verification at turnstiles entering heavy machinery zones.")
        if any("vest" in v.violation_type.lower() for v in violations):
            recommendations.append("Require class 3 high-visibility safety vests with reflective strips in crane loading bays.")
        if any("gloves" in v.violation_type.lower() for v in violations):
            recommendations.append("Audit cut-resistant glove supply at material handling yards.")

        # Incident checks
        if any(i.incident_type.lower() in ["slip_trip", "falling_object"] for i in incidents):
            recommendations.append("Install debris netting and clear access walkways to mitigate slip/trip and falling object risks.")

        if not recommendations:
            recommendations.append("Maintain current daily safety briefings and continuous Computer Vision monitoring.")

        return SafetyAnalyticsResponse(
            project_id=project_id,
            accident_prone_zones=accident_zones,
            repeat_violators=repeat_violators,
            safety_recommendations=recommendations
        )
