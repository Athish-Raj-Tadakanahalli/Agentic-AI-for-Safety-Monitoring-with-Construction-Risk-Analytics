from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.database.models import ComplianceCheck, SiteRisk, PPEViolation, SafetyIncident, Project
from backend.schemas.compliance_schemas import (
    ComplianceCheckIngest,
    ComplianceCheckResponse,
    CategoryComplianceBreakdown,
    ComplianceScoreResponse,
    RegulatoryReportResponse
)

def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

class ComplianceAgent:
    """
    Compliance Agent (Module 4.3)
    Monitors regulatory compliance, performs automated OSHA / ISO 45001 validation workflows,
    tracks regulatory non-compliance events, computes audit readiness scores,
    aggregates compliance by category, and generates regulatory audit reports.
    """

    CATEGORIES = [
        "Fall Protection",
        "PPE Adherence",
        "Structural & Scaffold",
        "Environmental & Hazmat",
        "Electrical Safety"
    ]

    SEVERITY_DEDUCTIONS = {
        "critical": 25.0,
        "high": 15.0,
        "medium": 8.0,
        "low": 3.0
    }

    def __init__(self):
        pass

    def ingest_compliance_check(self, db: Session, data: ComplianceCheckIngest) -> ComplianceCheck:
        """
        Ingests a manual or audited regulatory compliance inspection record.
        """
        project = db.query(Project).filter(Project.project_id == data.project_id).first()
        if not project:
            raise ValueError(f"Project with ID {data.project_id} not found.")

        check = ComplianceCheck(
            project_id=data.project_id,
            regulation_name=data.regulation_name,
            category=data.category or "Fall Protection",
            compliance_status=data.compliance_status.lower(),
            severity=data.severity.lower() if data.severity else "medium",
            description=data.description,
            remediation_plan=data.remediation_plan,
            checked_at=data.checked_at or utc_now()
        )

        db.add(check)
        db.commit()
        db.refresh(check)
        return check

    def run_regulatory_validation_workflow(self, db: Session, project_id: int) -> List[ComplianceCheck]:
        """
        Automated Regulatory Validation Workflow:
        Scans active site risks, PPE violations, and safety incidents in the database and automatically
        generates or updates regulatory compliance checks based on real-time site hazards.
        """
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} not found.")

        # Query site conditions
        unmitigated_risks = db.query(SiteRisk).filter(
            SiteRisk.project_id == project_id,
            SiteRisk.mitigated == False
        ).all()

        ppe_violations = db.query(PPEViolation).filter(
            PPEViolation.project_id == project_id
        ).all()

        incidents = db.query(SafetyIncident).filter(
            SafetyIncident.project_id == project_id
        ).all()

        new_checks: List[ComplianceCheck] = []

        # 1. Fall Protection (OSHA 1926.501)
        fall_risks = [r for r in unmitigated_risks if r.risk_type.lower() == "fall"]
        if fall_risks:
            max_sev = "critical" if any(r.severity == "critical" for r in fall_risks) else "high"
            desc_text = f"Detected {len(fall_risks)} unmitigated fall hazard(s) on site: " + "; ".join(r.description or "" for r in fall_risks[:2])
            check_fall = ComplianceCheck(
                project_id=project_id,
                regulation_name="OSHA 1926.501 - Fall Protection Standard",
                category="Fall Protection",
                compliance_status="non_compliant",
                severity=max_sev,
                description=desc_text,
                remediation_plan="Install compliant guardrails, perimeter safety nets, and enforce 100% harness tie-off.",
                checked_at=utc_now()
            )
            new_checks.append(check_fall)
        else:
            check_fall = ComplianceCheck(
                project_id=project_id,
                regulation_name="OSHA 1926.501 - Fall Protection Standard",
                category="Fall Protection",
                compliance_status="compliant",
                severity="low",
                description="Perimeter protection and anchorage systems verified compliant.",
                remediation_plan="Maintain daily pre-shift fall hazard inspections.",
                checked_at=utc_now()
            )
            new_checks.append(check_fall)

        # 2. PPE Adherence (OSHA 1926.100 & ISO 45001)
        if len(ppe_violations) >= 5:
            check_ppe = ComplianceCheck(
                project_id=project_id,
                regulation_name="OSHA 1926.100 - Head & PPE Mandatory Usage Standard",
                category="PPE Adherence",
                compliance_status="non_compliant",
                severity="high" if len(ppe_violations) >= 10 else "medium",
                description=f"Automated CV feed detected {len(ppe_violations)} total PPE non-compliance events.",
                remediation_plan="Issue mandatory safety stand-down, restock PPE supplies, and penalize repeat violator zones.",
                checked_at=utc_now()
            )
            new_checks.append(check_ppe)
        else:
            check_ppe = ComplianceCheck(
                project_id=project_id,
                regulation_name="OSHA 1926.100 - Head & PPE Mandatory Usage Standard",
                category="PPE Adherence",
                compliance_status="compliant",
                severity="low",
                description="Worker PPE compliance rate within acceptable OSHA tolerance limits.",
                remediation_plan="Continue continuous CV camera monitoring at gate turnstiles.",
                checked_at=utc_now()
            )
            new_checks.append(check_ppe)

        # 3. Structural & Scaffold (OSHA 1926.451)
        struct_risks = [r for r in unmitigated_risks if r.risk_type.lower() in ["structural", "equipment"] or "scaffold" in (r.zone or "").lower()]
        if struct_risks:
            check_struct = ComplianceCheck(
                project_id=project_id,
                regulation_name="OSHA 1926.451 - Scaffolding & Structural Integrity",
                category="Structural & Scaffold",
                compliance_status="non_compliant",
                severity="high",
                description=f"Identified {len(struct_risks)} structural/scaffold risk(s): " + "; ".join(r.description or "" for r in struct_risks[:2]),
                remediation_plan="Perform certified structural engineering inspection before load placement.",
                checked_at=utc_now()
            )
            new_checks.append(check_struct)
        else:
            check_struct = ComplianceCheck(
                project_id=project_id,
                regulation_name="OSHA 1926.451 - Scaffolding & Structural Integrity",
                category="Structural & Scaffold",
                compliance_status="compliant",
                severity="low",
                description="Scaffolding footings and tie-backs verified green-tagged.",
                remediation_plan="Schedule weekly competent person scaffold re-certification.",
                checked_at=utc_now()
            )
            new_checks.append(check_struct)

        # 4. Environmental & Hazmat (EPA & OSHA 1926.55)
        env_risks = [r for r in unmitigated_risks if r.risk_type.lower() == "environmental"]
        if env_risks:
            check_env = ComplianceCheck(
                project_id=project_id,
                regulation_name="EPA & OSHA 1926.55 - Environmental Hazards & Ventilation",
                category="Environmental & Hazmat",
                compliance_status="non_compliant",
                severity="medium",
                description=f"Environmental hazards detected: " + "; ".join(r.description or "" for r in env_risks[:2]),
                remediation_plan="Deploy active mechanical ventilation and dust containment curtains.",
                checked_at=utc_now()
            )
            new_checks.append(check_env)
        else:
            check_env = ComplianceCheck(
                project_id=project_id,
                regulation_name="EPA & OSHA 1926.55 - Environmental Hazards & Ventilation",
                category="Environmental & Hazmat",
                compliance_status="compliant",
                severity="low",
                description="Site air quality and water runoff controls meet environmental standards.",
                remediation_plan="Maintain stormwater silt fencing and air particulate monitoring.",
                checked_at=utc_now()
            )
            new_checks.append(check_env)

        # 5. Electrical Safety (OSHA 1926.404)
        elec_risks = [r for r in unmitigated_risks if r.risk_type.lower() == "electrical"]
        if elec_risks:
            check_elec = ComplianceCheck(
                project_id=project_id,
                regulation_name="OSHA 1926.404 - Electrical Grounding & Wiring Safety",
                category="Electrical Safety",
                compliance_status="non_compliant",
                severity="high",
                description="Exposed temporary wiring or ungrounded equipment detected on site.",
                remediation_plan="Install GFCI breakers and inspect temporary power distribution boxes.",
                checked_at=utc_now()
            )
            new_checks.append(check_elec)
        else:
            check_elec = ComplianceCheck(
                project_id=project_id,
                regulation_name="OSHA 1926.404 - Electrical Grounding & Wiring Safety",
                category="Electrical Safety",
                compliance_status="compliant",
                severity="low",
                description="GFCI protection active across all temporary distribution boards.",
                remediation_plan="Conduct monthly push-button GFCI testing protocol.",
                checked_at=utc_now()
            )
            new_checks.append(check_elec)

        db.add_all(new_checks)
        db.commit()
        for c in new_checks:
            db.refresh(c)

        return new_checks

    def calculate_compliance_score(self, db: Session, project_id: int) -> ComplianceScoreResponse:
        """
        Calculates 0-100 Regulatory Compliance Score & Audit Readiness Index.
        Score starts at 100.0 and deducts points per active non-compliant check.
        """
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} not found.")

        checks = db.query(ComplianceCheck).filter(ComplianceCheck.project_id == project_id).all()

        if not checks:
            # Run automated validation if no records exist yet
            checks = self.run_regulatory_validation_workflow(db, project_id)

        total_checks = len(checks)
        open_violations = [c for c in checks if c.compliance_status == "non_compliant"]
        compliant_checks = [c for c in checks if c.compliance_status == "compliant"]

        # Deductions based on non-compliant severity
        total_deduction = 0.0
        for v in open_violations:
            sev = (v.severity or "medium").lower()
            ded = self.SEVERITY_DEDUCTIONS.get(sev, 8.0)
            total_deduction += ded

        score = round(max(0.0, min(100.0, 100.0 - total_deduction)), 1)

        # Rating categorization
        if score >= 90.0:
            rating = "Compliant"
        elif score >= 75.0:
            rating = "Substantial Compliance"
        elif score >= 50.0:
            rating = "Moderate Non-Compliance"
        else:
            rating = "Severe Violation"

        # Audit Readiness calculation (% of compliant checks - penalty for critical violations)
        raw_readiness = (len(compliant_checks) / total_checks * 100.0) if total_checks > 0 else 100.0
        critical_count = len([v for v in open_violations if v.severity == "critical"])
        readiness_pct = round(max(0.0, min(100.0, raw_readiness - (critical_count * 15.0))), 1)

        if readiness_pct >= 85.0 and critical_count == 0:
            audit_status = "Audit Ready"
        elif readiness_pct >= 60.0:
            audit_status = "Needs Review"
        else:
            audit_status = "High Audit Risk"

        unique_regulations = len(set(c.regulation_name for c in checks))

        return ComplianceScoreResponse(
            project_id=project.project_id,
            project_name=project.project_name,
            compliance_score=score,
            compliance_rating=rating,
            audit_readiness_pct=readiness_pct,
            audit_status=audit_status,
            open_violations_count=len(open_violations),
            total_checks_count=total_checks,
            regulations_monitored_count=unique_regulations
        )

    def get_compliance_by_category(self, db: Session, project_id: int) -> List[CategoryComplianceBreakdown]:
        """
        Groups checks by regulatory category and calculates category compliance rates.
        """
        checks = db.query(ComplianceCheck).filter(ComplianceCheck.project_id == project_id).all()
        if not checks:
            self.run_regulatory_validation_workflow(db, project_id)
            checks = db.query(ComplianceCheck).filter(ComplianceCheck.project_id == project_id).all()

        cat_map: Dict[str, Dict[str, int]] = {c: {"total": 0, "compliant": 0, "non_compliant": 0} for c in self.CATEGORIES}

        for chk in checks:
            cat = chk.category or "Fall Protection"
            if cat not in cat_map:
                cat_map[cat] = {"total": 0, "compliant": 0, "non_compliant": 0}
            
            cat_map[cat]["total"] += 1
            if chk.compliance_status == "compliant":
                cat_map[cat]["compliant"] += 1
            else:
                cat_map[cat]["non_compliant"] += 1

        result: List[CategoryComplianceBreakdown] = []
        for cat_name, stats in cat_map.items():
            tot = stats["total"]
            comp = stats["compliant"]
            rate = round((comp / tot * 100.0), 1) if tot > 0 else 100.0
            result.append(CategoryComplianceBreakdown(
                category=cat_name,
                compliance_rate=rate,
                total_checks=tot,
                compliant_checks=comp,
                non_compliant_checks=stats["non_compliant"]
            ))

        return result

    def get_open_violations(self, db: Session, project_id: int) -> List[ComplianceCheck]:
        """
        Returns list of active non-compliant checks requiring remediation.
        """
        return db.query(ComplianceCheck).filter(
            ComplianceCheck.project_id == project_id,
            ComplianceCheck.compliance_status == "non_compliant"
        ).order_by(ComplianceCheck.checked_at.desc()).all()

    def generate_regulatory_report(self, db: Session, project_id: int) -> RegulatoryReportResponse:
        """
        Generates full regulatory compliance audit report payload.
        """
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} not found.")

        score_res = self.calculate_compliance_score(db, project_id)
        cat_breakdown = self.get_compliance_by_category(db, project_id)
        open_viols = self.get_open_violations(db, project_id)
        open_viol_responses = [ComplianceCheckResponse.model_validate(v) for v in open_viols]

        summary_text = (
            f"Regulatory Compliance Assessment for '{project.project_name}'. "
            f"Overall Compliance Score is {score_res.compliance_score}/100 ({score_res.compliance_rating}) "
            f"with an Audit Readiness Index of {score_res.audit_readiness_pct}% ({score_res.audit_status}). "
            f"There are currently {score_res.open_violations_count} open regulatory non-compliance findings across "
            f"{score_res.regulations_monitored_count} monitored safety standards."
        )

        return RegulatoryReportResponse(
            project_id=project.project_id,
            project_name=project.project_name,
            generated_at=utc_now(),
            compliance_score=score_res.compliance_score,
            audit_readiness_pct=score_res.audit_readiness_pct,
            audit_status=score_res.audit_status,
            total_regulations_monitored=score_res.regulations_monitored_count,
            open_violations_count=score_res.open_violations_count,
            category_breakdown=cat_breakdown,
            open_violations=open_viol_responses,
            executive_summary=summary_text
        )
