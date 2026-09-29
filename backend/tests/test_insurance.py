import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.connection import Base
from backend.database.models import Project, InsuranceCase, SiteRisk, PPEViolation
from backend.agents.insurance_agent import InsuranceAgent
from backend.schemas.insurance_schemas import InsuranceCaseIngest

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

def test_insurance_agent_flow(db):
    agent = InsuranceAgent()

    # 1. Create test project
    project = Project(project_name="Insurance Test Hub", location="Dock 4", status="active")
    db.add(project)
    db.commit()
    db.refresh(project)

    # 2. Ingest manual insurance case
    case_data = InsuranceCaseIngest(
        project_id=project.project_id,
        claim_type="General Liability",
        severity="high",
        estimated_exposure=150000.0,
        risk_score=68.0,
        claim_probability=60.0,
        status="open",
        description="Perimeter fall hazard liability exposure"
    )
    case = agent.ingest_insurance_case(db, case_data)

    assert case.case_id is not None
    assert case.claim_type == "General Liability"
    assert float(case.estimated_exposure) == 150000.0

    # 3. Update status
    updated = agent.update_case_status(db, case.case_id, "under_investigation")
    assert updated.status == "under_investigation"

    # 4. Calculate insurance metrics & badge
    metrics = agent.calculate_insurance_metrics(db, project.project_id)
    assert metrics.project_id == project.project_id
    assert metrics.composite_insurance_risk_score >= 0.0
    assert metrics.insurance_risk_badge in ["Preferred / Low Risk", "Moderate Risk", "High Exposure", "Critical Risk"]
    assert len(metrics.claim_risk_breakdown) >= 4

def test_automated_insurance_assessment_logic(db):
    agent = InsuranceAgent()

    project = Project(project_name="Risk Exposure Project", location="Zone B", status="active")
    db.add(project)
    db.commit()
    db.refresh(project)

    # Ingest multiple PPE violations & unmitigated site risks
    db.add(PPEViolation(project_id=project.project_id, worker_id="W-90", violation_type="hard hat", zone="Scaffold Tower"))
    db.add(PPEViolation(project_id=project.project_id, worker_id="W-90", violation_type="hard hat", zone="Scaffold Tower"))
    db.add(SiteRisk(project_id=project.project_id, risk_type="fall", severity="critical", zone="Scaffold Tower", probability=4, impact=5, mitigated=False))
    db.commit()

    cases = agent.run_insurance_risk_assessment(db, project.project_id)
    assert len(cases) >= 3

    wc_case = next((c for c in cases if c.claim_type == "Workers Compensation"), None)
    assert wc_case is not None
    assert float(wc_case.estimated_exposure) > 0.0

    assessment = agent.calculate_insurance_metrics(db, project.project_id)
    assert assessment.total_estimated_exposure > 0.0
    assert len(assessment.risk_reduction_recommendations) >= 1
