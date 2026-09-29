import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.agents.site_risk_agent import SiteRiskAgent
from backend.database.connection import SessionLocal

client = TestClient(app)

def test_digital_twin_backend_agent_calculation():
    db = SessionLocal()
    try:
        agent = SiteRiskAgent()
        res = agent.get_digital_twin_spatial_data(db, project_id=1)
        assert res.project_id == 1
        assert res.project_name is not None
        assert isinstance(res.zones, list)
        assert len(res.zones) == 8
        
        # Check zone structure
        zone_ids = [z.zone_id for z in res.zones]
        assert "tower_slab_high" in zone_ids
        assert "scaffolding_tower" in zone_ids
        assert "excavation_pit" in zone_ids
        
        # Check zone attributes
        for z in res.zones:
            assert z.color_status in ["red", "amber", "green"]
            assert z.risk_level in ["Low", "Medium", "High", "Critical"]
            assert z.assigned_supervisor is not None
            assert z.cctv_camera_id is not None
    finally:
        db.close()

def test_digital_twin_api_endpoint():
    response = client.get("/api/site-risk/1/digital-twin")
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == 1
    assert "total_active_hazards" in data
    assert "critical_zones_count" in data
    assert len(data["zones"]) == 8
