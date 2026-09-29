from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.services.ai_copilot import AICopilotService, CopilotQueryRequest, CopilotQueryResponse

router = APIRouter(tags=["BuildSure AI Safety Copilot Assistant"])
copilot_service = AICopilotService()

@router.get("/api/copilot/status")
def get_copilot_status():
    """
    GET /api/copilot/status
    Returns the operational status, active inference tier, and local Ollama model availability.
    """
    return copilot_service.get_status()

@router.post("/api/copilot/query", response_model=CopilotQueryResponse)
def query_ai_copilot(request: CopilotQueryRequest, db: Session = Depends(get_db)):
    """
    POST /api/copilot/query
    Processes natural language query from user about site risk, safety, compliance, or insurance context.
    """
    try:
        response = copilot_service.process_query(db, request)
        return response
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
