import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.connection import SessionLocal
from backend.seed import seed_database
from backend.agents.reporting_agent import ReportingAgent
from backend.agents.intelligence_engine import ConstructionRiskIntelligenceEngine

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    seed_database()

def test_reporting_agent_executive_metrics():
    db = SessionLocal()
    try:
        agent = ReportingAgent()
        metrics = agent.generate_executive_metrics(db, 1)
        assert metrics["project_id"] == 1
        assert "project_risk_score" in metrics
        assert "incidents_prevented" in metrics
        assert "compliance_improvement_pct" in metrics
        assert "cost_savings_usd" in metrics
        assert len(metrics["per_agent_performance"]) == 5
    finally:
        db.close()

def test_langgraph_intelligence_engine_orchestration():
    db = SessionLocal()
    try:
        engine = ConstructionRiskIntelligenceEngine()
        result = engine.run_multi_agent_pipeline(db, 1)
        assert result["pipeline_status"] == "completed"
        assert len(result["langgraph_execution_path"]) == 7
        assert "executive_summary" in result
        assert "site_risk" in result
        assert "safety" in result
        assert "compliance" in result
        assert "insurance" in result
    finally:
        db.close()

def test_engine_api_endpoints():
    response = client.get("/api/engine/executive-dashboard/1")
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == 1
    assert "project_risk_score" in data

    orch_response = client.post("/api/engine/orchestrate/1")
    assert orch_response.status_code == 200
    orch_data = orch_response.json()
    assert orch_data["pipeline_status"] == "completed"
