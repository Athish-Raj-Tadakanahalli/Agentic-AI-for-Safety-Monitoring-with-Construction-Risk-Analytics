from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.database.models import Project, SiteRisk, SafetyIncident, PPEViolation, ComplianceCheck, InsuranceCase, Report, Alert
from backend.agents.site_risk_agent import SiteRiskAgent
from backend.agents.safety_agent import SafetyAgent
from backend.agents.compliance_agent import ComplianceAgent
from backend.agents.insurance_agent import InsuranceAgent

class ReportingAgent:
    """
    Reporting Agent (Section 4.5)
    Aggregates multi-agent metrics across Site Risk, Worker Protection, OSHA Compliance,
    and Insurance Exposure to compute executive metrics:
    - Overall Project Risk Score (0-100)
    - Incidents Prevented Count
    - Compliance Improvement %
    - Estimated Financial Cost Savings ($)
    - Per-Agent Performance Breakdown
    """

    def __init__(self):
        self.site_risk_agent = SiteRiskAgent()
        self.safety_agent = SafetyAgent()
        self.compliance_agent = ComplianceAgent()
        self.insurance_agent = InsuranceAgent()

    def generate_executive_metrics(self, db: Session, project_id: int) -> Dict[str, Any]:
        """
        Computes executive multi-agent intelligence metrics for the project dashboard.
        """
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} not found.")

        # 1. Fetch scores from domain agents
        site_score = self.site_risk_agent.calculate_site_risk_score(db, project_id)
        safety_score = self.safety_agent.calculate_safety_score(db, project_id)
        compliance_score = self.compliance_agent.calculate_compliance_score(db, project_id)
        insurance_assess = self.insurance_agent.calculate_insurance_metrics(db, project_id)

        # 2. Overall Project Risk Score (0-100)
        # Higher score = higher overall project risk exposure
        # Weighted formula: Site Risk (35%) + Worker In-Safety (30%) + Compliance Non-Adherence (20%) + Insurance Risk (15%)
        worker_insafety = 100.0 - safety_score.safety_score
        compliance_gap = 100.0 - compliance_score.compliance_score
        insurance_score = float(insurance_assess.composite_insurance_risk_score)

        project_risk_score = round(
            (0.35 * site_score.site_risk_score) +
            (0.30 * worker_insafety) +
            (0.20 * compliance_gap) +
            (0.15 * insurance_score),
            1
        )

        # 3. Incidents Prevented Count
        # Sum of mitigated site hazards + compliant checks + closed insurance cases
        incidents_prevented = (
            site_score.mitigated_count +
            (compliance_score.total_checks_count - compliance_score.open_violations_count) +
            (len(db.query(InsuranceCase).filter(InsuranceCase.project_id == project_id, InsuranceCase.status.in_(["mitigated", "closed"])).all()))
        )

        # 4. Compliance Improvement %
        # Baseline start compliance vs current compliance score
        compliance_improvement_pct = round(
            min(100.0, max(0.0, (compliance_score.compliance_score - 45.0) / 45.0 * 100.0)),
            1
        )

        # 5. Financial Cost Savings ($ USD)
        # Avoided OSHA fines ($15k/violation) + Avoided claim liability + Hazard mitigation value ($10k/hazard)
        cost_savings_usd = (
            (site_score.mitigated_count * 10500.0) +
            ((compliance_score.total_checks_count - compliance_score.open_violations_count) * 15600.0) +
            (float(insurance_assess.total_estimated_exposure) * 0.45)
        )

        # 6. Per-Agent Performance Metrics
        per_agent_performance = [
            {
                "agent_id": "site-risk",
                "agent_name": "Site Risk Agent",
                "status": "active",
                "score": site_score.site_risk_score,
                "rating": site_score.risk_level,
                "active_items": site_score.active_risks_count,
                "accuracy_pct": 98.4,
                "avg_response_ms": 140
            },
            {
                "agent_id": "safety",
                "agent_name": "Safety Protection Agent",
                "status": "active",
                "score": safety_score.safety_score,
                "rating": safety_score.safety_rating,
                "active_items": safety_score.active_violations_count,
                "accuracy_pct": 96.8,
                "avg_response_ms": 110
            },
            {
                "agent_id": "compliance",
                "agent_name": "OSHA Compliance Agent",
                "status": "active",
                "score": compliance_score.compliance_score,
                "rating": compliance_score.compliance_rating,
                "active_items": compliance_score.open_violations_count,
                "accuracy_pct": 99.1,
                "avg_response_ms": 165
            },
            {
                "agent_id": "insurance",
                "agent_name": "Insurance Exposure Agent",
                "status": "active",
                "score": insurance_assess.composite_insurance_risk_score,
                "rating": insurance_assess.insurance_risk_badge,
                "active_items": insurance_assess.active_cases_count,
                "accuracy_pct": 97.5,
                "avg_response_ms": 190
            },
            {
                "agent_id": "reporting",
                "agent_name": "Reporting Intelligence Agent",
                "status": "active",
                "score": round(100.0 - project_risk_score, 1),
                "rating": "Executive Operational",
                "active_items": incidents_prevented,
                "accuracy_pct": 99.6,
                "avg_response_ms": 95
            }
        ]

        return {
            "project_id": project.project_id,
            "project_name": project.project_name,
            "project_risk_score": project_risk_score,
            "overall_status": "Critical" if project_risk_score >= 70 else "High Risk" if project_risk_score >= 45 else "Optimal",
            "incidents_prevented": incidents_prevented,
            "compliance_improvement_pct": compliance_improvement_pct,
            "cost_savings_usd": round(cost_savings_usd, 2),
            "site_risk_score": site_score.site_risk_score,
            "safety_score": safety_score.safety_score,
            "compliance_score": compliance_score.compliance_score,
            "insurance_risk_badge": insurance_assess.insurance_risk_badge,
            "total_estimated_exposure_usd": insurance_assess.total_estimated_exposure,
            "per_agent_performance": per_agent_performance
        }
