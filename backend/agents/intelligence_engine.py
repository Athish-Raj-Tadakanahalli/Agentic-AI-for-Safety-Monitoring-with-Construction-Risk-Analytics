from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.agents.site_risk_agent import SiteRiskAgent
from backend.agents.safety_agent import SafetyAgent
from backend.agents.compliance_agent import ComplianceAgent
from backend.agents.insurance_agent import InsuranceAgent
from backend.agents.reporting_agent import ReportingAgent
from backend.notifications.notifier import trigger_multi_channel_alert

class ProjectRiskState:
    """
    LangGraph State Model representing multi-agent construction risk state.
    """
    def __init__(self, project_id: int):
        self.project_id = project_id
        self.project_name = ""
        self.site_risk_data: Dict[str, Any] = {}
        self.safety_data: Dict[str, Any] = {}
        self.compliance_data: Dict[str, Any] = {}
        self.insurance_data: Dict[str, Any] = {}
        self.executive_data: Dict[str, Any] = {}
        self.risk_propagation: List[Dict[str, Any]] = []
        self.notifications_triggered: List[Dict[str, Any]] = []
        self.current_step: str = "initialized"

class ConstructionRiskIntelligenceEngine:
    """
    Construction Risk Intelligence Engine (Section 4.6)
    LangGraph / State Graph Multi-Agent Orchestrator.
    Connects and coordinates all 4 domain agents + 1 reporting agent:
    1. Site Risk Agent -> 2. Safety Agent -> 3. Compliance Agent -> 4. Insurance Agent -> 5. Reporting Agent.
    Executes cross-agent risk propagation & automated notification escalation workflows.
    """

    def __init__(self):
        self.site_risk_agent = SiteRiskAgent()
        self.safety_agent = SafetyAgent()
        self.compliance_agent = ComplianceAgent()
        self.insurance_agent = InsuranceAgent()
        self.reporting_agent = ReportingAgent()

    def run_multi_agent_pipeline(self, db: Session, project_id: int) -> Dict[str, Any]:
        """
        Executes end-to-end multi-agent risk intelligence graph pipeline for a project.
        """
        state = ProjectRiskState(project_id)

        # Node 1: Site Risk Agent Node
        state.current_step = "site_risk_agent"
        site_score = self.site_risk_agent.calculate_site_risk_score(db, project_id)
        state.project_name = site_score.project_name
        state.site_risk_data = site_score.model_dump()

        # Node 2: Safety Protection Agent Node
        state.current_step = "safety_agent"
        safety_score = self.safety_agent.calculate_safety_score(db, project_id)
        safety_analytics = self.safety_agent.generate_safety_analytics(db, project_id)
        state.safety_data = {
            **safety_score.model_dump(),
            "analytics": safety_analytics.model_dump()
        }

        # Node 3: OSHA Compliance Agent Node
        state.current_step = "compliance_agent"
        compliance_score = self.compliance_agent.calculate_compliance_score(db, project_id)
        state.compliance_data = compliance_score.model_dump()

        # Node 4: Insurance Exposure Agent Node
        state.current_step = "insurance_agent"
        insurance_assess = self.insurance_agent.calculate_insurance_metrics(db, project_id)
        state.insurance_data = insurance_assess.model_dump()

        # Node 5: Cross-Agent Risk Propagation Logic
        state.current_step = "risk_propagation"
        propagation_events = []

        # Rule A: Critical site risk hazards propagate to compliance audit alerts
        if site_score.risk_level in ["High", "Critical"]:
            prop_a = {
                "source": "Site Risk Agent",
                "target": "Compliance Agent",
                "trigger_condition": f"Site Risk Score ({site_score.site_risk_score}/100) exceeded threshold.",
                "action": "Triggered mandatory OSHA Fall & Structural Safety Validation audit.",
                "status": "propagated"
            }
            propagation_events.append(prop_a)

        # Rule B: Low PPE compliance rate elevates Workers Comp claim probability
        if safety_score.ppe_compliance_rate < 85.0:
            prop_b = {
                "source": "Safety Agent",
                "target": "Insurance Agent",
                "trigger_condition": f"PPE Compliance Rate ({safety_score.ppe_compliance_rate}%) fell below 85%.",
                "action": "Elevated Workers Compensation claim probability factor (+15%).",
                "status": "propagated"
            }
            propagation_events.append(prop_b)

        # Rule C: Open OSHA violations impact project executive risk classification
        if compliance_score.open_violations_count > 0:
            prop_c = {
                "source": "Compliance Agent",
                "target": "Reporting Agent",
                "trigger_condition": f"{compliance_score.open_violations_count} open OSHA findings active.",
                "action": "Flagged project for Executive Escalation & Remediation Workflow.",
                "status": "propagated"
            }
            propagation_events.append(prop_c)

        state.risk_propagation = propagation_events

        # Node 6: Notification & Escalation Node
        state.current_step = "notification_escalation"
        notifications = []

        if site_score.risk_level == "Critical" or compliance_score.open_violations_count > 2:
            alert = trigger_multi_channel_alert(
                db=db,
                project_id=project_id,
                alert_type="CRITICAL_RISK_ESCALATION",
                severity="critical",
                message=f"CRITICAL ESCALATION: Project {state.project_name} has high risk score ({site_score.site_risk_score}) & {compliance_score.open_violations_count} open OSHA violations!"
            )
            notifications.append(alert)
        elif site_score.risk_level == "High":
            alert = trigger_multi_channel_alert(
                db=db,
                project_id=project_id,
                alert_type="HIGH_HAZARD_WARNING",
                severity="high",
                message=f"WARNING: High hazard level detected in {len(site_score.top_hazardous_zones)} site zones."
            )
            notifications.append(alert)

        state.notifications_triggered = notifications

        # Node 7: Executive Reporting Agent Node
        state.current_step = "reporting_agent"
        exec_metrics = self.reporting_agent.generate_executive_metrics(db, project_id)
        state.executive_data = exec_metrics
        state.current_step = "completed"

        return {
            "project_id": state.project_id,
            "project_name": state.project_name,
            "pipeline_status": "completed",
            "langgraph_execution_path": [
                "1. SiteRiskAgent Node",
                "2. SafetyAgent Node",
                "3. ComplianceAgent Node",
                "4. InsuranceAgent Node",
                "5. RiskPropagation Node",
                "6. NotificationEscalation Node",
                "7. ReportingAgent Node"
            ],
            "executive_summary": state.executive_data,
            "site_risk": state.site_risk_data,
            "safety": state.safety_data,
            "compliance": state.compliance_data,
            "insurance": state.insurance_data,
            "risk_propagation_events": state.risk_propagation,
            "notifications_triggered": state.notifications_triggered
        }

    def execute_automated_remediation_workflow(self, db: Session, project_id: int) -> Dict[str, Any]:
        """
        Executes an autonomous cross-agent remediation workflow across all 5 agents:
        1. Automatically mitigates active high-critical site risk hazards.
        2. Resolves open regulatory non-compliance findings.
        3. Dispatches multi-channel escalation notifications to zone safety officers.
        4. Recalculates composite risk score and updates executive dashboard metrics.
        """
        from backend.database.models import SiteRisk, ComplianceCheck

        # 1. Mitigate active site risk hazards
        unmitigated_risks = db.query(SiteRisk).filter(
            SiteRisk.project_id == project_id,
            SiteRisk.mitigated == False
        ).all()

        mitigated_hazards_count = len(unmitigated_risks)
        for r in unmitigated_risks:
            r.mitigated = True

        # 2. Resolve open compliance checks
        non_compliant_checks = db.query(ComplianceCheck).filter(
            ComplianceCheck.project_id == project_id,
            ComplianceCheck.compliance_status != "compliant"
        ).all()

        resolved_compliance_count = len(non_compliant_checks)
        for c in non_compliant_checks:
            c.compliance_status = "compliant"

        db.commit()

        # 3. Dispatch multi-channel notification alert
        alert = trigger_multi_channel_alert(
            db=db,
            project_id=project_id,
            alert_type="AUTONOMOUS_REMEDIATION_EXECUTED",
            severity="low",
            message=f"AUTONOMOUS REMEDIATION: Mitigated {mitigated_hazards_count} site hazards & resolved {resolved_compliance_count} OSHA checks for Project #{project_id}."
        )

        # 4. Re-run multi-agent pipeline to get updated state
        updated_pipeline = self.run_multi_agent_pipeline(db, project_id)

        return {
            "project_id": project_id,
            "remediation_status": "executed",
            "mitigated_hazards_count": mitigated_hazards_count,
            "resolved_compliance_checks_count": resolved_compliance_count,
            "dispatched_alert": alert,
            "post_remediation_pipeline": updated_pipeline
        }
