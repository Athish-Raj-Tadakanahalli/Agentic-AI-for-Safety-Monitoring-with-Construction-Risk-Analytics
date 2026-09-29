import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.agents.intelligence_engine import ConstructionRiskIntelligenceEngine
from backend.database.connection import SessionLocal

client = TestClient(app)

def test_autonomous_remediation_engine_method():
    db = SessionLocal()
    try:
        engine = ConstructionRiskIntelligenceEngine()
        res = engine.execute_automated_remediation_workflow(db, project_id=1)
        assert res["project_id"] == 1
        assert res["remediation_status"] == "executed"
        assert "mitigated_hazards_count" in res
        assert "resolved_compliance_checks_count" in res
        assert "dispatched_alert" in res
        assert "post_remediation_pipeline" in res
    finally:
        db.close()

def test_autonomous_remediation_api_endpoint():
    response = client.post("/api/engine/remediate/1")
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == 1
    assert data["remediation_status"] == "executed"
    assert "post_remediation_pipeline" in data
