from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from backend.database.connection import get_db
from backend.agents.intelligence_engine import ConstructionRiskIntelligenceEngine
from backend.agents.reporting_agent import ReportingAgent

router = APIRouter(
    prefix="/api/engine",
    tags=["Risk Intelligence Engine & Executive Dashboard"]
)

engine_service = ConstructionRiskIntelligenceEngine()
reporting_agent = ReportingAgent()

@router.post("/orchestrate/{project_id}")
def orchestrate_project_risk_pipeline(
    project_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Triggers the LangGraph Construction Risk Intelligence Multi-Agent Pipeline.
    Coordinates Site Risk -> Safety -> Compliance -> Insurance -> Reporting agents,
    evaluates cross-agent risk propagation, and dispatches automated alerts.
    """
    try:
        result = engine_service.run_multi_agent_pipeline(db, project_id)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration pipeline failure: {str(e)}")

@router.post("/remediate/{project_id}")
def execute_autonomous_remediation(
    project_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    POST /api/engine/remediate/{project_id}
    Executes autonomous cross-agent multi-hazard remediation:
    Resolves active critical site hazards, resolves open OSHA violations,
    dispatches multi-channel alerts to supervisors, and returns post-remediation metrics.
    """
    try:
        result = engine_service.execute_automated_remediation_workflow(db, project_id)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Autonomous remediation failure: {str(e)}")

@router.get("/executive-dashboard/{project_id}")
def get_executive_dashboard_data(
    project_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns executive multi-agent dashboard metrics:
    Project overall risk score (0-100), incidents prevented, compliance improvement %,
    financial cost savings ($ USD), and per-agent performance metrics.
    """
    try:
        metrics = reporting_agent.generate_executive_metrics(db, project_id)
        return metrics
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load executive metrics: {str(e)}")
