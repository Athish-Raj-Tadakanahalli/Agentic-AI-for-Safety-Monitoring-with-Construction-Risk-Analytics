from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import SiteRisk
from backend.agents.site_risk_agent import SiteRiskAgent
from backend.schemas.site_risk_schemas import (
    SiteRiskIngest,
    SiteRiskResponse,
    SiteRiskScoreResponse,
    HeatmapMatrixResponse,
    SiteRiskUpdateStatus
)

router = APIRouter(prefix="/api/site-risk", tags=["Site Risk Agent"])
agent = SiteRiskAgent()

@router.post("/ingest", response_model=SiteRiskResponse, status_code=status.HTTP_201_CREATED)
def ingest_site_risk(data: SiteRiskIngest, db: Session = Depends(get_db)):
    """
    POST /api/site-risk/ingest
    Ingests site monitoring data (CCTV / Sensor feed / Inspection log)
    Detects unsafe site conditions, environmental hazards, equipment risks.
    """
    try:
        site_risk = agent.ingest_risk_event(db, data)
        return site_risk
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest risk event: {str(e)}")


@router.get("/{project_id}/score", response_model=SiteRiskScoreResponse)
def get_site_risk_score(project_id: int, db: Session = Depends(get_db)):
    """
    GET /api/site-risk/{project_id}/score
    Returns numeric site risk score (0-100), risk level, top hazardous zones,
    and distribution metrics computed by the Site Risk Agent rule engine.
    """
    try:
        score_data = agent.calculate_site_risk_score(db, project_id)
        return score_data
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/{project_id}/heatmap", response_model=HeatmapMatrixResponse)
def get_site_risk_heatmap(project_id: int, db: Session = Depends(get_db)):
    """
    GET /api/site-risk/{project_id}/heatmap
    Returns 5x5 Probability x Impact Risk Heatmap matrix for both Inherent and Residual risk.
    Grid axes:
    Probability: Almost Certain, Likely, Possible, Unlikely, Rare
    Impact: Negligible, Minor, Moderate, Major, Catastrophic
    """
    try:
        heatmap_data = agent.generate_heatmap(db, project_id)
        return heatmap_data
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/{project_id}/risks", response_model=List[SiteRiskResponse])
def get_project_site_risks(
    project_id: int,
    severity: Optional[str] = Query(None, description="Filter by severity: low, medium, high, critical"),
    risk_type: Optional[str] = Query(None, description="Filter by risk type: fall, equipment, electrical, environmental, structural"),
    mitigated: Optional[bool] = Query(None, description="Filter by mitigation status"),
    db: Session = Depends(get_db)
):
    """
    GET /api/site-risk/{project_id}/risks
    Returns detailed list of site risks detected for a project with optional filters.
    """
    query = db.query(SiteRisk).filter(SiteRisk.project_id == project_id)
    if severity:
        query = query.filter(SiteRisk.severity == severity.lower())
    if risk_type:
        query = query.filter(SiteRisk.risk_type == risk_type.lower())
    if mitigated is not None:
        query = query.filter(SiteRisk.mitigated == mitigated)

    risks = query.order_by(SiteRisk.detected_at.desc()).all()
    return risks


@router.patch("/{risk_id}/status", response_model=SiteRiskResponse)
def update_risk_status(risk_id: int, update_data: SiteRiskUpdateStatus, db: Session = Depends(get_db)):
    """
    PATCH /api/site-risk/{risk_id}/status
    Updates risk mitigation status (e.g. mark hazard as mitigated by site manager).
    """
    risk = db.query(SiteRisk).filter(SiteRisk.risk_id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=404, detail=f"Site risk {risk_id} not found")

    risk.mitigated = update_data.mitigated
    db.commit()
    db.refresh(risk)
    return risk
