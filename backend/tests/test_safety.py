import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from backend.database.connection import Base, get_db
from backend.database.models import Project, PPEViolation, SafetyIncident, Alert
from backend.agents.safety_agent import SafetyAgent
from backend.schemas.safety_schemas import PPEViolationIngest, SafetyIncidentIngest
from backend.main import app

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

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_safety_agent_flow(db):
    agent = SafetyAgent()

    # 1. Create project
    proj = Project(project_name="Safety Test Project", location="Test Site", status="active")
    db.add(proj)
    db.commit()
    db.refresh(proj)

    # 2. Ingest PPE violation
    v_data = PPEViolationIngest(
        project_id=proj.project_id,
        worker_id="W-999",
        violation_type="hard hat",
        zone="Scaffolding Tower"
    )
    v1 = agent.ingest_ppe_violation(db, v_data)
    assert v1.violation_id is not None
    assert v1.violation_type == "hard hat"
    assert v1.zone == "Scaffolding Tower"

    # 3. Log Safety Incident
    inc_data = SafetyIncidentIngest(
        project_id=proj.project_id,
        incident_type="near_miss",
        severity="critical",
        zone="Excavation Zone",
        description="Ground collapse near trench edge"
    )
    inc = agent.log_safety_incident(db, inc_data)
    assert inc.incident_id is not None
    assert inc.severity == "critical"
    assert inc.zone == "Excavation Zone"

    # Check alert escalation logged
    alerts = db.query(Alert).filter(Alert.project_id == proj.project_id).all()
    assert len(alerts) >= 1
    assert alerts[0].message is not None

    # 4. Compliance rate & Safety Score
    compliance = agent.calculate_ppe_compliance_rate(db, proj.project_id)
    assert compliance.total_violations_count == 1
    assert "Hard Hat" in [b.ppe_type for b in compliance.breakdown_by_type.values()]

    score_data = agent.calculate_safety_score(db, proj.project_id)
    assert score_data.safety_score > 0.0

    # 5. Analytics
    analytics = agent.generate_safety_analytics(db, proj.project_id)
    assert len(analytics.repeat_violators) >= 1
    assert len(analytics.safety_recommendations) >= 1


def test_repeat_violator_escalation(db):
    agent = SafetyAgent()
    proj = Project(project_name="Repeat Violator Site", location="Sector 4", status="active")
    db.add(proj)
    db.commit()
    db.refresh(proj)

    # Ingest 3 violations for worker W-800 within 24h
    for v_type in ["hard hat", "vest", "hard hat"]:
        agent.ingest_ppe_violation(
            db,
            PPEViolationIngest(
                project_id=proj.project_id,
                worker_id="W-800",
                violation_type=v_type,
                zone="Scaffolding Tower B"
            )
        )

    # Verify escalation alert was triggered for repeat violator
    alerts = db.query(Alert).filter(
        Alert.project_id == proj.project_id,
        Alert.alert_type == "Repeat PPE Violator"
    ).all()
    assert len(alerts) >= 1
    assert "W-800" in alerts[0].message


def test_dynamic_accident_zones(db):
    agent = SafetyAgent()
    proj = Project(project_name="Zonal Analytics Project", location="Zone C", status="active")
    db.add(proj)
    db.commit()
    db.refresh(proj)

    # Ingest critical incidents and violations in Scaffolding Tower
    agent.log_safety_incident(db, SafetyIncidentIngest(
        project_id=proj.project_id,
        incident_type="near_miss",
        severity="critical",
        zone="Scaffolding Tower",
        description="Wrench dropped from high elevation"
    ))
    agent.ingest_ppe_violation(db, PPEViolationIngest(
        project_id=proj.project_id,
        worker_id="W-101",
        violation_type="hard hat",
        zone="Scaffolding Tower"
    ))

    analytics = agent.generate_safety_analytics(db, proj.project_id)
    zones = {z.zone: z for z in analytics.accident_prone_zones}
    assert "Scaffolding Tower" in zones
    assert zones["Scaffolding Tower"].incident_count == 1
    assert zones["Scaffolding Tower"].violation_count == 1
    assert zones["Scaffolding Tower"].risk_level in ["High", "Medium"]


def test_notification_endpoints_and_log(client, db):
    # 1. Create project
    proj = Project(project_name="Notification Test Site", location="Downtown", status="active")
    db.add(proj)
    db.commit()
    db.refresh(proj)

    # 2. Test notification dispatch
    res = client.post(f"/api/notifications/test?channel=sms&message=Emergency+Evac&project_id={proj.project_id}")
    assert res.status_code == 200
    assert res.json()["status"] == "success"
    assert res.json()["channel"] == "sms"

    # 3. Retrieve notification log
    log_res = client.get(f"/api/notifications/{proj.project_id}/log")
    assert log_res.status_code == 200
    alerts = log_res.json()
    assert len(alerts) >= 1
    assert alerts[0]["project_id"] == proj.project_id
    assert "Emergency Evac" in alerts[0]["message"]
