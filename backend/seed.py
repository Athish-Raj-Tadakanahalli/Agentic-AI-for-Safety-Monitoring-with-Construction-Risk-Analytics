import os
import sys
from datetime import date, datetime, timedelta

# Ensure backend root is in Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database.connection import engine, Base, SessionLocal, ensure_schema_migrations
from backend.database.models import Project, SiteRisk, PPEViolation, SafetyIncident, Alert, ComplianceCheck, InsuranceCase

def seed_database():
    """Seed database with realistic construction project data, site risks, PPE events, and safety incidents"""
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    ensure_schema_migrations()

    db = SessionLocal()
    try:
        # 1. Projects
        p1 = db.query(Project).filter(Project.project_name == "Skyline Commercial Tower").first()
        p2 = db.query(Project).filter(Project.project_name == "Metro Line 4 - Underground Extension").first()
        p3 = db.query(Project).filter(Project.project_name == "Harbor Logistics Hub - Phase 2").first()

        if not p1 or not p2 or not p3:
            print("Seeding demo projects...")
            if not p1:
                p1 = Project(
                    project_name="Skyline Commercial Tower",
                    location="Downtown Metropolitan Center, Block 14",
                    start_date=date.today() - timedelta(days=90),
                    status="active"
                )
                db.add(p1)
            if not p2:
                p2 = Project(
                    project_name="Metro Line 4 - Underground Extension",
                    location="Subterranean Corridor, Sector B",
                    start_date=date.today() - timedelta(days=120),
                    status="active"
                )
                db.add(p2)
            if not p3:
                p3 = Project(
                    project_name="Harbor Logistics Hub - Phase 2",
                    location="Port Terminal Zone, Dock 8",
                    start_date=date.today() - timedelta(days=45),
                    status="active"
                )
                db.add(p3)

            db.commit()
            db.refresh(p1)
            db.refresh(p2)
            db.refresh(p3)
            print(f"Created Projects: ID {p1.project_id}, ID {p2.project_id}, ID {p3.project_id}")
        else:
            print(f"Found existing projects: ID {p1.project_id}, ID {p2.project_id}, ID {p3.project_id}")

        # 2. Site Risks (Milestone 1)
        existing_risks = db.query(SiteRisk).count()
        if existing_risks == 0:
            print("Seeding Milestone 1 site hazards...")
            risks_p1 = [
                SiteRisk(
                    project_id=p1.project_id,
                    risk_type="fall",
                    severity="critical",
                    zone="Scaffolding Tower",
                    description="Unsecured perimeter safety netting at 32nd floor level during high wind exposure.",
                    probability=4,
                    impact=5,
                    mitigated=False,
                    detected_at=datetime.utcnow() - timedelta(hours=2)
                ),
                SiteRisk(
                    project_id=p1.project_id,
                    risk_type="equipment",
                    severity="high",
                    zone="Crane & Rigging Yard",
                    description="Tower Crane #2 hydraulic fluid leak detected near main hoisting winch.",
                    probability=3,
                    impact=4,
                    mitigated=False,
                    detected_at=datetime.utcnow() - timedelta(hours=5)
                ),
                SiteRisk(
                    project_id=p1.project_id,
                    risk_type="fall",
                    severity="high",
                    zone="High-Altitude Slab",
                    description="Open floor edge missing standard double guardrails on Level 18 West Wing.",
                    probability=4,
                    impact=4,
                    mitigated=False,
                    detected_at=datetime.utcnow() - timedelta(hours=8)
                ),
                SiteRisk(
                    project_id=p1.project_id,
                    risk_type="electrical",
                    severity="medium",
                    zone="Electrical Room",
                    description="Exposed temporary 440V distribution wiring near wet concrete curing area.",
                    probability=3,
                    impact=3,
                    mitigated=False,
                    detected_at=datetime.utcnow() - timedelta(hours=14)
                ),
                SiteRisk(
                    project_id=p1.project_id,
                    risk_type="environmental",
                    severity="medium",
                    zone="Perimeter Fencing",
                    description="Debris accumulation restricting primary emergency egress walkway.",
                    probability=3,
                    impact=2,
                    mitigated=True,
                    detected_at=datetime.utcnow() - timedelta(days=1)
                ),
                SiteRisk(
                    project_id=p1.project_id,
                    risk_type="fall",
                    severity="critical",
                    zone="Scaffolding Tower",
                    description="Missing toe-boards on exterior hoist staging platform.",
                    probability=5,
                    impact=4,
                    mitigated=False,
                    detected_at=datetime.utcnow() - timedelta(minutes=45)
                )
            ]

            risks_p2 = [
                SiteRisk(
                    project_id=p2.project_id,
                    risk_type="environmental",
                    severity="critical",
                    zone="Excavation Zone",
                    description="Severe groundwater infiltration detected near Tunnel Shaft #3 retaining wall.",
                    probability=5,
                    impact=5,
                    mitigated=False,
                    detected_at=datetime.utcnow() - timedelta(hours=1)
                ),
                SiteRisk(
                    project_id=p2.project_id,
                    risk_type="equipment",
                    severity="critical",
                    zone="Excavation Zone",
                    description="Subterranean excavator operating with faulty backup warning beacon in low visibility.",
                    probability=4,
                    impact=4,
                    mitigated=False,
                    detected_at=datetime.utcnow() - timedelta(hours=4)
                ),
                SiteRisk(
                    project_id=p2.project_id,
                    risk_type="environmental",
                    severity="high",
                    zone="Excavation Zone",
                    description="Inadequate mechanical ventilation flow rate in deep tunnel section B-4.",
                    probability=4,
                    impact=4,
                    mitigated=False,
                    detected_at=datetime.utcnow() - timedelta(hours=6)
                )
            ]

            risks_p3 = [
                SiteRisk(
                    project_id=p3.project_id,
                    risk_type="equipment",
                    severity="medium",
                    zone="Crane & Rigging Yard",
                    description="Mobile forklift operating in pedestrian loading lane without spotter.",
                    probability=3,
                    impact=3,
                    mitigated=False,
                    detected_at=datetime.utcnow() - timedelta(hours=3)
                ),
                SiteRisk(
                    project_id=p3.project_id,
                    risk_type="fall",
                    severity="low",
                    zone="High-Altitude Slab",
                    description="Step ladder placed on uneven gravel surface near loading bay.",
                    probability=2,
                    impact=2,
                    mitigated=True,
                    detected_at=datetime.utcnow() - timedelta(hours=12)
                )
            ]

            db.add_all(risks_p1 + risks_p2 + risks_p3)
            db.commit()
            print("Milestone 1 hazards seeded.")

        # 3. PPE Violations (Milestone 2)
        existing_ppe = db.query(PPEViolation).count()
        if existing_ppe < 5:
            print("Seeding rich Milestone 2 PPE violations...")
            ppe_events = [
                # Project 1 PPE Events (Skyline Tower)
                PPEViolation(project_id=p1.project_id, worker_id="W-104", violation_type="hard hat", zone="Scaffolding Tower B", timestamp=datetime.utcnow() - timedelta(hours=1)),
                PPEViolation(project_id=p1.project_id, worker_id="W-104", violation_type="hard hat", zone="Scaffolding Tower B", timestamp=datetime.utcnow() - timedelta(hours=5)),
                PPEViolation(project_id=p1.project_id, worker_id="W-104", violation_type="gloves", zone="Material Staging Area", timestamp=datetime.utcnow() - timedelta(hours=12)),
                PPEViolation(project_id=p1.project_id, worker_id="W-209", violation_type="vest", zone="Crane Loading Bay", timestamp=datetime.utcnow() - timedelta(hours=3)),
                PPEViolation(project_id=p1.project_id, worker_id="W-209", violation_type="vest", zone="Crane Loading Bay", timestamp=datetime.utcnow() - timedelta(hours=8)),
                PPEViolation(project_id=p1.project_id, worker_id="W-301", violation_type="boots", zone="High-Altitude Slab", timestamp=datetime.utcnow() - timedelta(hours=16)),
                PPEViolation(project_id=p1.project_id, worker_id="W-305", violation_type="gloves", zone="Fabrication Yard", timestamp=datetime.utcnow() - timedelta(days=1)),
                PPEViolation(project_id=p1.project_id, worker_id="W-112", violation_type="hard hat", zone="Scaffolding Tower B", timestamp=datetime.utcnow() - timedelta(days=1, hours=4)),
                PPEViolation(project_id=p1.project_id, worker_id="W-104", violation_type="hard hat", zone="Scaffolding Tower B", timestamp=datetime.utcnow() - timedelta(days=2)),

                # Project 2 PPE Events (Metro Tunnel)
                PPEViolation(project_id=p2.project_id, worker_id="W-401", violation_type="boots", zone="Excavation Shaft #3", timestamp=datetime.utcnow() - timedelta(hours=2)),
                PPEViolation(project_id=p2.project_id, worker_id="W-401", violation_type="hard hat", zone="Excavation Shaft #3", timestamp=datetime.utcnow() - timedelta(hours=6)),
                PPEViolation(project_id=p2.project_id, worker_id="W-405", violation_type="gloves", zone="Subterranean Tunnel B", timestamp=datetime.utcnow() - timedelta(hours=10)),
                PPEViolation(project_id=p2.project_id, worker_id="W-410", violation_type="vest", zone="Excavation Shaft #3", timestamp=datetime.utcnow() - timedelta(days=1)),

                # Project 3 PPE Events (Harbor Hub)
                PPEViolation(project_id=p3.project_id, worker_id="W-502", violation_type="vest", zone="Dock Loading Crane", timestamp=datetime.utcnow() - timedelta(hours=4)),
                PPEViolation(project_id=p3.project_id, worker_id="W-508", violation_type="gloves", zone="Container Storage Zone", timestamp=datetime.utcnow() - timedelta(days=1)),
            ]
            db.add_all(ppe_events)
            db.commit()
            print(f"Seeded {len(ppe_events)} PPE violations.")

        # 4. Safety Incidents (Milestone 2)
        existing_incidents = db.query(SafetyIncident).count()
        if existing_incidents == 0:
            print("Seeding Milestone 2 safety incidents...")
            incidents = [
                # Project 1 Incidents
                SafetyIncident(
                    project_id=p1.project_id,
                    incident_type="near_miss",
                    severity="high",
                    zone="Scaffolding Tower B",
                    description="Scaffold wrench dropped from Level 24 caught by safety containment net.",
                    incident_date=datetime.utcnow() - timedelta(hours=8)
                ),
                SafetyIncident(
                    project_id=p1.project_id,
                    incident_type="slip_trip",
                    severity="medium",
                    zone="Material Staging Area",
                    description="Worker tripped over unsecured electrical umbilical cable on access walkway.",
                    incident_date=datetime.utcnow() - timedelta(days=2)
                ),

                # Project 2 Incidents
                SafetyIncident(
                    project_id=p2.project_id,
                    incident_type="falling_object",
                    severity="critical",
                    zone="Excavation Shaft #3",
                    description="Loose rock fragment displaced from tunnel ceiling during drilling cycle.",
                    incident_date=datetime.utcnow() - timedelta(hours=3)
                ),
                SafetyIncident(
                    project_id=p2.project_id,
                    incident_type="near_miss",
                    severity="medium",
                    zone="Subterranean Tunnel B",
                    description="Haul truck proximity alert sounded when worker entered blind spot envelope.",
                    incident_date=datetime.utcnow() - timedelta(days=1)
                ),

                # Project 3 Incidents
                SafetyIncident(
                    project_id=p3.project_id,
                    incident_type="equipment_contact",
                    severity="low",
                    zone="Dock Loading Crane",
                    description="Forklift tire scuffed guide rail barrier during pallet turnaround.",
                    incident_date=datetime.utcnow() - timedelta(days=3)
                )
            ]
            db.add_all(incidents)
            db.commit()
            print(f"Seeded {len(incidents)} safety incidents.")

        # 5. Alert History & Escalation Logs (Milestone 2)
        existing_alerts = db.query(Alert).count()
        if existing_alerts == 0:
            print("Seeding Milestone 2 notification escalation audit logs...")
            alerts = [
                Alert(
                    project_id=p1.project_id,
                    alert_type="Repeat PPE Violator",
                    severity="high",
                    message=f"Worker W-104 committed 3 PPE violations (hard hat) in Zone 'Scaffolding Tower B' within 24 hours. Email notification dispatched to site-manager@buildsure.ai.",
                    created_at=datetime.utcnow() - timedelta(hours=1)
                ),
                Alert(
                    project_id=p1.project_id,
                    alert_type="Safety Incident (near_miss)",
                    severity="high",
                    message="High severity near-miss reported in Zone 'Scaffolding Tower B': Scaffold wrench dropped from Level 24. Dispatched via Email & Webhook.",
                    created_at=datetime.utcnow() - timedelta(hours=8)
                ),
                Alert(
                    project_id=p2.project_id,
                    alert_type="Safety Incident (falling_object)",
                    severity="critical",
                    message="CRITICAL ALERT: Falling rock fragment in Excavation Shaft #3. Emergency Twilio SMS dispatched to Safety Officer (+1-555-SAFE-911) and SMTP Email dispatched.",
                    created_at=datetime.utcnow() - timedelta(hours=3)
                ),
                Alert(
                    project_id=p3.project_id,
                    alert_type="Notification Check (WEBHOOK)",
                    severity="low",
                    message="Automated shift safety digest dispatched to Slack channel #site-safety.",
                    created_at=datetime.utcnow() - timedelta(days=1)
                )
            ]
            db.add_all(alerts)
            db.commit()
            print(f"Seeded {len(alerts)} notification escalation logs.")

        # 6. Compliance Checks (Milestone 3)
        existing_compliance = db.query(ComplianceCheck).count()
        if existing_compliance == 0:
            print("Seeding Milestone 3 compliance checks...")
            checks = [
                # Project 1
                ComplianceCheck(
                    project_id=p1.project_id,
                    regulation_name="OSHA 1926.501 - Fall Protection Standard",
                    category="Fall Protection",
                    compliance_status="non_compliant",
                    severity="critical",
                    description="Unsecured perimeter safety netting at 32nd floor level.",
                    remediation_plan="Install compliant guardrails and safety containment netting.",
                    checked_at=datetime.utcnow() - timedelta(hours=3)
                ),
                ComplianceCheck(
                    project_id=p1.project_id,
                    regulation_name="OSHA 1926.100 - Head & PPE Mandatory Usage Standard",
                    category="PPE Adherence",
                    compliance_status="non_compliant",
                    severity="high",
                    description="CV stream detected 9 PPE violations in Scaffolding Tower B.",
                    remediation_plan="Mandate hard hat tethering and conduct shift safety briefing.",
                    checked_at=datetime.utcnow() - timedelta(hours=6)
                ),
                ComplianceCheck(
                    project_id=p1.project_id,
                    regulation_name="OSHA 1926.451 - Scaffolding & Structural Integrity",
                    category="Structural & Scaffold",
                    compliance_status="compliant",
                    severity="low",
                    description="Scaffold staging platform verified green-tagged by competent person.",
                    remediation_plan="Maintain weekly scaffold inspection log.",
                    checked_at=datetime.utcnow() - timedelta(days=1)
                ),
                ComplianceCheck(
                    project_id=p1.project_id,
                    regulation_name="OSHA 1926.404 - Electrical Grounding Safety",
                    category="Electrical Safety",
                    compliance_status="compliant",
                    severity="low",
                    description="GFCI breakers operational across main distribution panels.",
                    remediation_plan="Conduct monthly push-button testing.",
                    checked_at=datetime.utcnow() - timedelta(days=2)
                ),

                # Project 2
                ComplianceCheck(
                    project_id=p2.project_id,
                    regulation_name="OSHA 1926.55 - Environmental & Tunnel Ventilation",
                    category="Environmental & Hazmat",
                    compliance_status="non_compliant",
                    severity="critical",
                    description="Subterranean airflow below mandatory OSHA CFM threshold.",
                    remediation_plan="Deploy auxiliary high-powered exhaust fans in Shaft 3.",
                    checked_at=datetime.utcnow() - timedelta(hours=2)
                ),
                ComplianceCheck(
                    project_id=p2.project_id,
                    regulation_name="OSHA 1926.651 - Excavation & Trenching Safety",
                    category="Structural & Scaffold",
                    compliance_status="non_compliant",
                    severity="high",
                    description="Groundwater infiltration threatening trench wall stability.",
                    remediation_plan="Install dewatering pumps and trench shoring shields.",
                    checked_at=datetime.utcnow() - timedelta(hours=5)
                ),

                # Project 3
                ComplianceCheck(
                    project_id=p3.project_id,
                    regulation_name="OSHA 1926.602 - Heavy Equipment Operations",
                    category="Structural & Scaffold",
                    compliance_status="compliant",
                    severity="low",
                    description="Forklift and yard crane backup alarms fully operational.",
                    remediation_plan="Continue daily pre-shift equipment check sheets.",
                    checked_at=datetime.utcnow() - timedelta(days=1)
                )
            ]
            db.add_all(checks)
            db.commit()
            print(f"Seeded {len(checks)} regulatory compliance checks.")

        # 7. Insurance Cases (Milestone 3)
        existing_insurance = db.query(InsuranceCase).count()
        if existing_insurance == 0:
            print("Seeding Milestone 3 insurance cases & exposures...")
            cases = [
                # Project 1
                InsuranceCase(
                    project_id=p1.project_id,
                    claim_type="General Liability",
                    severity="critical",
                    estimated_exposure=250000.0,
                    risk_score=78.5,
                    claim_probability=72.0,
                    status="open",
                    description="High altitude perimeter fall hazard exposure on 32nd floor staging.",
                    created_at=datetime.utcnow() - timedelta(hours=4)
                ),
                InsuranceCase(
                    project_id=p1.project_id,
                    claim_type="Workers Compensation",
                    severity="high",
                    estimated_exposure=85000.0,
                    risk_score=64.0,
                    claim_probability=58.0,
                    status="under_investigation",
                    description="Repeat PPE violations and near-miss scaffold wrench drop event.",
                    created_at=datetime.utcnow() - timedelta(hours=8)
                ),

                # Project 2
                InsuranceCase(
                    project_id=p2.project_id,
                    claim_type="Property Damage",
                    severity="critical",
                    estimated_exposure=320000.0,
                    risk_score=85.0,
                    claim_probability=81.0,
                    status="open",
                    description="Subterranean tunnel shaft groundwater infiltration and retaining wall collapse risk.",
                    created_at=datetime.utcnow() - timedelta(hours=2)
                ),
                InsuranceCase(
                    project_id=p2.project_id,
                    claim_type="Workers Compensation",
                    severity="high",
                    estimated_exposure=110000.0,
                    risk_score=70.0,
                    claim_probability=65.0,
                    status="open",
                    description="Falling rock fragment incident in Tunnel Shaft #3.",
                    created_at=datetime.utcnow() - timedelta(hours=6)
                ),

                # Project 3
                InsuranceCase(
                    project_id=p3.project_id,
                    claim_type="Equipment Breakdown",
                    severity="low",
                    estimated_exposure=15000.0,
                    risk_score=22.0,
                    claim_probability=18.0,
                    status="mitigated",
                    description="Dock forklift barrier scuffing event.",
                    created_at=datetime.utcnow() - timedelta(days=2)
                )
            ]
            db.add_all(cases)
            db.commit()
            print(f"Seeded {len(cases)} insurance exposure cases.")

        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
