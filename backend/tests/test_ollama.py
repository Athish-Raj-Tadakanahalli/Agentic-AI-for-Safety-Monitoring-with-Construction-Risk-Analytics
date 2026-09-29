import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.ollama_service import OllamaLLMService, ollama_service
from backend.services.ai_copilot import AICopilotService, CopilotQueryRequest

client = TestClient(app)

def test_ollama_service_check_availability():
    service = OllamaLLMService(base_url="http://invalid-localhost-test:11434")
    res = service.check_availability()
    assert isinstance(res, dict)
    assert "available" in res
    assert res["available"] is False
    assert "selected_model" in res

def test_copilot_status_endpoint():
    response = client.get("/api/copilot/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "active_tier" in data
    assert "llm_provider" in data
    assert "ollama" in data

@patch("backend.services.ollama_service.ollama_service.check_availability")
def test_copilot_fallback_tier_3(mock_check):
    mock_check.return_value = {
        "available": False,
        "base_url": "http://localhost:11434",
        "models": [],
        "selected_model": "llama3"
    }
    
    # Query project 1 (seeded)
    payload = {
        "project_id": 1,
        "query": "What are the OSHA compliance requirements for fall protection?"
    }
    response = client.post("/api/copilot/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["llm_provider"] == "buildsure-local-engine"
    assert "OSHA" in data["answer"] or "Regulatory Compliance" in data["answer"]

@patch("backend.services.ollama_service.ollama_service.generate_response")
@patch("backend.services.ollama_service.ollama_service.check_availability")
def test_copilot_ollama_tier_1_mock(mock_check, mock_gen):
    mock_check.return_value = {
        "available": True,
        "base_url": "http://localhost:11434",
        "models": ["llama3", "mistral"],
        "selected_model": "llama3"
    }
    mock_gen.return_value = "Local Ollama Llama-3 AI Advice: Site fall hazards must be tied off immediately."

    payload = {
        "project_id": 1,
        "query": "Give me safety advice for high-altitude scaffolding."
    }
    response = client.post("/api/copilot/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["llm_provider"] == "ollama:llama3"
    assert "Ollama Llama-3 AI Advice" in data["answer"]
