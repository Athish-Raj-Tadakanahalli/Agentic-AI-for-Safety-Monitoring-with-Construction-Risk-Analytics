import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.connection import Base
from backend.database.models import Project, SiteRisk
from backend.agents.site_risk_agent import SiteRiskAgent
from backend.schemas.site_risk_schemas import SiteRiskIngest

# In-memory SQLite for testing
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

def test_site_risk_agent_flow(db):
    agent = SiteRiskAgent()

    # 1. Create dummy project
    project = Project(project_name="Test Tower Project", location="Test Site", status="active")
    db.add(project)
    db.commit()
    db.refresh(project)

    # 2. Ingest hazard
    ingest_data = SiteRiskIngest(
        project_id=project.project_id,
        risk_type="fall",
        severity="critical",
        zone="Scaffolding Tower",
        description="Missing safety harness attachment point",
        probability=4,
        impact=5,
        mitigated=False
    )
    risk = agent.ingest_risk_event(db, ingest_data)

    assert risk.risk_id is not None
    assert risk.severity == "critical"
    assert risk.probability == 4
    assert risk.impact == 5

    # 3. Calculate score
    score_resp = agent.calculate_site_risk_score(db, project.project_id)
    assert score_resp.project_id == project.project_id
    assert score_resp.active_risks_count == 1
    assert score_resp.site_risk_score > 0.0

    # 4. Generate Heatmap
    heatmap = agent.generate_heatmap(db, project.project_id)
    assert len(heatmap.probability_labels) == 5
    assert len(heatmap.impact_labels) == 5
    # Probability=4 (idx 3), Impact=5 (idx 4) count should be 1
    assert heatmap.inherent_grid[3][4] == 1
    assert heatmap.residual_grid[3][4] == 1
