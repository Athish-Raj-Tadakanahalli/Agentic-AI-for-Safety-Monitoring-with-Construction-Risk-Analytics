import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.notifications.websocket_manager import ws_manager

client = TestClient(app)

def test_websocket_connection_and_handshake():
    """Test connecting to FastAPI WebSocket endpoint /ws/alerts/1"""
    with client.websocket_connect("/ws/alerts/1") as websocket:
        data = websocket.receive_json()
        assert data["type"] == "SYSTEM_CONNECTED"
        assert data["project_id"] == 1

        # Test ping/pong
        websocket.send_text("ping")
        pong = websocket.receive_json()
        assert pong["type"] == "PONG"

def test_websocket_broadcast_to_project():
    """Test broadcasting message to connected WebSocket client"""
    with client.websocket_connect("/ws/alerts/1") as websocket:
        # Handshake
        init_data = websocket.receive_json()
        assert init_data["type"] == "SYSTEM_CONNECTED"

        # Trigger sync broadcast
        test_alert = {
            "type": "ALERT",
            "alert": {
                "alert_id": 999,
                "project_id": 1,
                "alert_type": "TEST_SAFETY_ALERT",
                "severity": "high",
                "message": "Test WebSocket Emergency Alert Push",
                "created_at": "2026-09-18T23:30:00"
            }
        }
        ws_manager.sync_broadcast_to_project(1, test_alert)

        # Receive broadcasted message
        received = websocket.receive_json()
        assert received["type"] == "ALERT"
        assert received["alert"]["alert_id"] == 999
        assert received["alert"]["alert_type"] == "TEST_SAFETY_ALERT"
