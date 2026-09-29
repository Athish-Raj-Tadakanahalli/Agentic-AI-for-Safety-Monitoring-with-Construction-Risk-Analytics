from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.database.models import InsuranceCase, Project, SiteRisk, PPEViolation, SafetyIncident
from backend.agents.site_risk_agent import SiteRiskAgent
from backend.agents.safety_agent import SafetyAgent
from backend.agents.compliance_agent import ComplianceAgent
from backend.schemas.insurance_schemas import (
    InsuranceCaseIngest,
    InsuranceCaseResponse,
    ClaimRiskAnalysis,
    InsuranceAssessmentResponse
)

def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

class InsuranceAgent:
    """
    Insurance Agent (Module 4.4)
    Evaluates project insurance risk exposure, calculates composite insurance risk scores,
    generates insurance risk badges, assesses financial exposure ($), breaks down claim risk by line
    (Workers Comp, General Liability, Property Damage, Equipment Breakdown, Environmental),
    and provides actionable risk mitigation recommendations.
    """

    CLAIM_TYPES = [
        "Workers Compensation",
        "General Liability",
        "Property Damage",
        "Equipment Breakdown",
        "Environmental Liability"
    ]

    def __init__(self):
        self.site_risk_agent = SiteRiskAgent()
        self.safety_agent = SafetyAgent()
        self.compliance_agent = ComplianceAgent()

    def ingest_insurance_case(self, db: Session, data: InsuranceCaseIngest) -> InsuranceCase:
        """
        Ingests a manual or evaluated insurance claim/exposure case.
        """
        project = db.query(Project).filter(Project.project_id == data.project_id).first()
        if not project:
            raise ValueError(f"Project with ID {data.project_id} not found.")

        case = InsuranceCase(
            project_id=data.project_id,
            claim_type=data.claim_type,
            severity=data.severity.lower() if data.severity else "medium",
            estimated_exposure=data.estimated_exposure or 0.0,
            risk_score=data.risk_score or 50.0,
            claim_probability=data.claim_probability or 50.0,
            status=data.status.lower() if data.status else "open",
            description=data.description,
            created_at=utc_now()
        )

        db.add(case)
        db.commit()
        db.refresh(case)
        return case

    def run_insurance_risk_assessment(self, db: Session, project_id: int) -> List[InsuranceCase]:
        """
        Automated Insurance Risk Assessment Logic:
        Fuses site hazards, safety incident records, repeat PPE violations, and compliance scores
        to automatically create/update insurance cases with estimated financial exposures ($).
        """
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} not found.")

        # Gather agent metrics
        site_metrics = self.site_risk_agent.calculate_site_risk_score(db, project_id)
        safety_metrics = self.safety_agent.calculate_safety_score(db, project_id)
        compliance_metrics = self.compliance_agent.calculate_compliance_score(db, project_id)

        unmitigated_risks = db.query(SiteRisk).filter(
            SiteRisk.project_id == project_id,
            SiteRisk.mitigated == False
        ).all()

        ppe_violations = db.query(PPEViolation).filter(PPEViolation.project_id == project_id).all()
        incidents = db.query(SafetyIncident).filter(SafetyIncident.project_id == project_id).all()

        cases: List[InsuranceCase] = []

        # 1. Workers Compensation (Safety incidents + PPE violations)
        wc_prob = min(95.0, max(10.0, (100.0 - safety_metrics.safety_score) * 0.9 + len(ppe_violations) * 2.0))
        wc_exposure = 50000.0 + (len(incidents) * 75000.0) + (len(ppe_violations) * 5000.0)
        wc_case = InsuranceCase(
            project_id=project_id,
            claim_type="Workers Compensation",
            severity="high" if wc_prob > 60 else "medium",
            estimated_exposure=wc_exposure,
            risk_score=round(wc_prob, 1),
            claim_probability=round(wc_prob, 1),
            status="open",
            description=f"Risk of worker injury claims driven by {safety_metrics.active_violations_count} active PPE violations and {safety_metrics.total_incidents_count} site incidents.",
            created_at=utc_now()
        )
        cases.append(wc_case)

        # 2. General Liability (Fall hazards + Site structural hazards)
        fall_count = len([r for r in unmitigated_risks if r.risk_type == "fall"])
        gl_prob = min(95.0, max(15.0, (site_metrics.site_risk_score * 0.5) + (fall_count * 12.0)))
        gl_exposure = 120000.0 + (fall_count * 100000.0)
        gl_case = InsuranceCase(
            project_id=project_id,
            claim_type="General Liability",
            severity="critical" if fall_count >= 2 else ("high" if gl_prob > 50 else "medium"),
            estimated_exposure=gl_exposure,
            risk_score=round(gl_prob, 1),
            claim_probability=round(gl_prob, 1),
            status="open",
            description=f"Third-party liability exposure driven by {fall_count} active perimeter fall hazards and unmitigated site elevation risks.",
            created_at=utc_now()
        )
        cases.append(gl_case)

        # 3. Property Damage & Equipment Breakdown
        equip_risks = [r for r in unmitigated_risks if r.risk_type in ["equipment", "electrical"]]
        pd_prob = min(90.0, max(10.0, len(equip_risks) * 20.0 + site_metrics.site_risk_score * 0.3))
        pd_exposure = 85000.0 + (len(equip_risks) * 60000.0)
        pd_case = InsuranceCase(
            project_id=project_id,
            claim_type="Property Damage",
            severity="high" if len(equip_risks) >= 2 else "medium",
            estimated_exposure=pd_exposure,
            risk_score=round(pd_prob, 1),
            claim_probability=round(pd_prob, 1),
            status="open",
            description=f"Structural or physical asset damage risk driven by {len(equip_risks)} unmitigated heavy machinery and electrical hazards.",
            created_at=utc_now()
        )
        cases.append(pd_case)

        db.add_all(cases)
        db.commit()
        for c in cases:
            db.refresh(c)

        return cases

    def calculate_insurance_metrics(self, db: Session, project_id: int) -> InsuranceAssessmentResponse:
        """
        Computes composite insurance risk score, badge, total financial exposure, and claim risk breakdown.
        """
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} not found.")

        # Get base scores
        site_res = self.site_risk_agent.calculate_site_risk_score(db, project_id)
        safety_res = self.safety_agent.calculate_safety_score(db, project_id)
        compliance_res = self.compliance_agent.calculate_compliance_score(db, project_id)

        # Formula for Composite Insurance Risk Score (0 - 100, where 100 = high insurance risk)
        # 35% Site Risk + 35% Safety Inverse + 30% Compliance Inverse
        site_component = site_res.site_risk_score * 0.35
        safety_component = (100.0 - safety_res.safety_score) * 0.35
        compliance_component = (100.0 - compliance_res.compliance_score) * 0.30

        composite_score = round(min(100.0, max(0.0, site_component + safety_component + compliance_component)), 1)

        # Insurance Risk Badge Determination
        if composite_score < 30.0:
            badge = "Preferred / Low Risk"
            badge_variant = "low"
        elif composite_score < 55.0:
            badge = "Moderate Risk"
            badge_variant = "medium"
        elif composite_score < 78.0:
            badge = "High Exposure"
            badge_variant = "high"
        else:
            badge = "Critical Risk"
            badge_variant = "critical"

        # Query insurance cases from DB
        cases = db.query(InsuranceCase).filter(InsuranceCase.project_id == project_id).all()
        if not cases:
            cases = self.run_insurance_risk_assessment(db, project_id)

        open_cases = [c for c in cases if (c.status or "open").lower() in ["open", "under_investigation"]]
        total_exposure = sum(float(c.estimated_exposure or 0.0) for c in open_cases)

        # Build claim risk analysis per category
        claim_analyses: List[ClaimRiskAnalysis] = []
        for ctype in self.CLAIM_TYPES:
            type_cases = [c for c in cases if c.claim_type == ctype]
            if type_cases:
                avg_prob = sum(float(c.claim_probability or 50.0) for c in type_cases) / len(type_cases)
                tot_exp = sum(float(c.estimated_exposure or 0.0) for c in type_cases)
                cnt = len(type_cases)
            else:
                # Default baseline estimation if case doesn't exist
                if ctype == "Workers Compensation":
                    avg_prob = round(max(10.0, (100.0 - safety_res.safety_score) * 0.8), 1)
                    tot_exp = 45000.0
                elif ctype == "General Liability":
                    avg_prob = round(max(15.0, site_res.site_risk_score * 0.6), 1)
                    tot_exp = 90000.0
                elif ctype == "Property Damage":
                    avg_prob = round(max(10.0, site_res.site_risk_score * 0.4), 1)
                    tot_exp = 60000.0
                else:
                    avg_prob = 20.0
                    tot_exp = 30000.0
                cnt = 0

            if avg_prob >= 70.0:
                lvl = "Critical"
            elif avg_prob >= 45.0:
                lvl = "High"
            elif avg_prob >= 25.0:
                lvl = "Medium"
            else:
                lvl = "Low"

            factors = []
            if ctype == "Workers Compensation":
                factors = [f"Safety Score: {safety_res.safety_score}/100", f"Active Violations: {safety_res.active_violations_count}"]
            elif ctype == "General Liability":
                factors = [f"Site Risk Score: {site_res.site_risk_score}/100", f"High Risk Zones: {site_res.high_risk_zones_count}"]
            elif ctype == "Property Damage":
                factors = [f"Unmitigated Hazards: {site_res.active_risks_count}"]
            elif ctype == "Equipment Breakdown":
                factors = ["Machinery inspection intervals", "Hydraulic / electrical hazard count"]
            else:
                factors = [f"Compliance Score: {compliance_res.compliance_score}/100"]

            claim_analyses.append(ClaimRiskAnalysis(
                claim_type=ctype,
                risk_level=lvl,
                claim_probability=round(avg_prob, 1),
                estimated_exposure=round(tot_exp, 2),
                active_cases_count=cnt,
                driving_factors=factors
            ))

        # Risk reduction recommendations
        recommendations = []
        if composite_score >= 60.0:
            recommendations.append("Immediate Underwriter Review: Execute site safety remediation plan to prevent policy premium surcharge.")
        if site_res.site_risk_score > 50.0:
            recommendations.append(f"Mitigate top high-altitude fall risks to reduce General Liability financial exposure by up to $150,000.")
        if safety_res.ppe_compliance_rate < 90.0:
            recommendations.append("Enforce strict PPE compliance protocols to lower Workers Compensation claim frequency.")
        if compliance_res.compliance_score < 75.0:
            recommendations.append("Address open OSHA non-compliance findings to eliminate regulatory penalty exposure.")

        if not recommendations:
            recommendations.append("Site risk metrics within premium incentive parameters. Maintain existing safety controls.")

        return InsuranceAssessmentResponse(
            project_id=project.project_id,
            project_name=project.project_name,
            composite_insurance_risk_score=composite_score,
            insurance_risk_badge=badge,
            badge_variant=badge_variant,
            total_estimated_exposure=round(total_exposure, 2),
            active_cases_count=len(open_cases),
            claim_risk_breakdown=claim_analyses,
            risk_reduction_recommendations=recommendations
        )

    def update_case_status(self, db: Session, case_id: int, status: str) -> InsuranceCase:
        """
        Updates the status of an insurance case (open, under_investigation, mitigated, closed).
        """
        case = db.query(InsuranceCase).filter(InsuranceCase.case_id == case_id).first()
        if not case:
            raise ValueError(f"Insurance Case with ID {case_id} not found.")

        case.status = status.lower()
        db.commit()
        db.refresh(case)
        return case
