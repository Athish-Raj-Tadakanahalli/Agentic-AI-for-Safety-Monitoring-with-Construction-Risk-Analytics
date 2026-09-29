import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.connection import Base
from backend.database.models import Project, SiteRisk
from backend.services.report_generator import ReportGenerator
from backend.services.ai_copilot import AICopilotService, CopilotQueryRequest

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

def test_pdf_and_csv_generation(db):
    report_gen = ReportGenerator()

    project = Project(project_name="Reporting Test Site", location="Zone 1", status="active")
    db.add(project)
    db.commit()
    db.refresh(project)

    db.add(SiteRisk(project_id=project.project_id, risk_type="fall", severity="high", zone="Scaffold"))
    db.commit()

    # 1. PDF Reports
    compliance_pdf = report_gen.generate_compliance_pdf(db, project.project_id)
    assert len(compliance_pdf) > 0
    assert compliance_pdf.startswith(b'%PDF')

    insurance_pdf = report_gen.generate_insurance_pdf(db, project.project_id)
    assert len(insurance_pdf) > 0
    assert insurance_pdf.startswith(b'%PDF')

    exec_pdf = report_gen.generate_executive_pdf(db, project.project_id)
    assert len(exec_pdf) > 0
    assert exec_pdf.startswith(b'%PDF')

    # 2. CSV Exports
    csv_hazards = report_gen.export_csv(db, project.project_id, "hazards")
    assert "Risk ID,Project ID" in csv_hazards
    assert "fall" in csv_hazards

def test_ai_copilot_service(db):
    copilot = AICopilotService()

    project = Project(project_name="AI Copilot Site", location="Zone 2", status="active")
    db.add(project)
    db.commit()
    db.refresh(project)

    req = CopilotQueryRequest(project_id=project.project_id, query="What is our OSHA compliance score and risk summary?")
    res = copilot.process_query(db, req)

    assert res.project_id == project.project_id
    assert "Compliance Score" in res.answer
    assert "site_risk_score" in res.key_metrics
    assert len(res.recommended_actions) >= 1
    assert len(res.related_standards) >= 1
