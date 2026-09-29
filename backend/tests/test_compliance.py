import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.connection import Base
from backend.database.models import Project, ComplianceCheck, SiteRisk
from backend.agents.compliance_agent import ComplianceAgent
from backend.schemas.compliance_schemas import ComplianceCheckIngest

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

def test_compliance_agent_flow(db):
    agent = ComplianceAgent()

    # 1. Create test project
    project = Project(project_name="Compliance Test Tower", location="Sector 7", status="active")
    db.add(project)
    db.commit()
    db.refresh(project)

    # 2. Ingest manual compliance check
    check_data = ComplianceCheckIngest(
        project_id=project.project_id,
        regulation_name="OSHA 1926.501 - Fall Protection",
        category="Fall Protection",
        compliance_status="non_compliant",
        severity="high",
        description="Missing guardrails on 10th floor edge",
        remediation_plan="Install double guardrails"
    )
    check = agent.ingest_compliance_check(db, check_data)

    assert check.compliance_id is not None
    assert check.compliance_status == "non_compliant"
    assert check.severity == "high"

    # 3. Calculate score & audit readiness
    score_resp = agent.calculate_compliance_score(db, project.project_id)
    assert score_resp.project_id == project.project_id
    assert score_resp.open_violations_count >= 1
    assert score_resp.compliance_score < 100.0

    # 4. Category breakdown
    breakdown = agent.get_compliance_by_category(db, project.project_id)
    assert len(breakdown) >= 1
    fall_cat = next((b for b in breakdown if b.category == "Fall Protection"), None)
    assert fall_cat is not None
    assert fall_cat.non_compliant_checks >= 1

    # 5. Regulatory Report
    report = agent.generate_regulatory_report(db, project.project_id)
    assert report.project_id == project.project_id
    assert len(report.open_violations) >= 1
    assert "Regulatory Compliance Assessment" in report.executive_summary

def test_automated_regulatory_validation_workflow(db):
    agent = ComplianceAgent()

    project = Project(project_name="Validation Test Project", location="Site A", status="active")
    db.add(project)
    db.commit()
    db.refresh(project)

    # Add unmitigated fall hazard
    risk = SiteRisk(
        project_id=project.project_id,
        risk_type="fall",
        severity="critical",
        zone="Scaffolding Tower",
        description="Unattached safety harness line at high altitude",
        probability=5,
        impact=5,
        mitigated=False
    )
    db.add(risk)
    db.commit()

    # Execute automated validation
    validated_checks = agent.run_regulatory_validation_workflow(db, project.project_id)
    assert len(validated_checks) >= 4
    fall_check = next((c for c in validated_checks if c.category == "Fall Protection"), None)
    assert fall_check is not None
    assert fall_check.compliance_status == "non_compliant"
    assert fall_check.severity == "critical"
