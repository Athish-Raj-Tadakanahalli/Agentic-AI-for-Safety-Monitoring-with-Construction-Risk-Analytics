"""
Ollama Local LLM Service
Provides native offline LLM inference via Ollama or vLLM compatible REST endpoints.
Supports standard models like llama3, mistral, phi-3, llama3.2, etc.
"""

import os
import logging
import httpx
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class OllamaLLMService:
    def __init__(self, base_url: Optional[str] = None, default_model: Optional[str] = None):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
        self.default_model = default_model or os.getenv("OLLAMA_MODEL", "llama3")
        self.timeout = float(os.getenv("OLLAMA_TIMEOUT", "15.0"))

    def check_availability(self) -> Dict[str, Any]:
        """
        Checks if the Ollama service is active and lists available models.
        """
        try:
            with httpx.Client(timeout=3.0) as client:
                res = client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name") for m in data.get("models", [])]
                    selected = self.default_model
                    if models and self.default_model not in models:
                        selected = models[0]
                    return {
                        "available": True,
                        "base_url": self.base_url,
                        "models": models,
                        "selected_model": selected
                    }
        except Exception as e:
            logger.debug(f"Ollama local service check failed: {e}")
            
        return {
            "available": False,
            "base_url": self.base_url,
            "models": [],
            "selected_model": self.default_model
        }

    def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.3
    ) -> Optional[str]:
        """
        Synchronously generates text completion using Ollama's /api/generate endpoint.
        """
        target_model = model or self.default_model
        full_system = system_prompt or "You are BuildSure AI Copilot, an expert construction safety and risk intelligence assistant."

        payload = {
            "model": target_model,
            "prompt": f"System: {full_system}\n\nUser Question: {prompt}\n\nAssistant:",
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(f"{self.base_url}/api/generate", json=payload)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("response", "").strip()
                else:
                    logger.warning(f"Ollama generation failed with status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Error communicating with Ollama service at {self.base_url}: {e}")

        return None

# Singleton instance for direct import
ollama_service = OllamaLLMService()
