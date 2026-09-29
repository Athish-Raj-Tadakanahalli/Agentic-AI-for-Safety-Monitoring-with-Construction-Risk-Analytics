from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.agents.compliance_agent import ComplianceAgent
from backend.schemas.compliance_schemas import (
    ComplianceCheckIngest,
    ComplianceCheckResponse,
    CategoryComplianceBreakdown,
    ComplianceScoreResponse,
    RegulatoryReportResponse
)

router = APIRouter(tags=["Compliance Agent (Module 4.3)"])
agent = ComplianceAgent()

@router.post("/api/compliance/check", response_model=ComplianceCheckResponse, status_code=status.HTTP_201_CREATED)
def ingest_compliance_check(data: ComplianceCheckIngest, db: Session = Depends(get_db)):
    """
    POST /api/compliance/check
    Ingests a manual or audited regulatory inspection check.
    """
    try:
        check = agent.ingest_compliance_check(db, data)
        return check
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.post("/api/compliance/{project_id}/validate", response_model=List[ComplianceCheckResponse])
def run_regulatory_validation(project_id: int, db: Session = Depends(get_db)):
    """
    POST /api/compliance/{project_id}/validate
    Executes automated regulatory validation workflow against active site risks & PPE events.
    """
    try:
        checks = agent.run_regulatory_validation_workflow(db, project_id)
        return checks
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/api/compliance/{project_id}/score", response_model=ComplianceScoreResponse)
def get_compliance_score(project_id: int, db: Session = Depends(get_db)):
    """
    GET /api/compliance/{project_id}/score
    Returns 0-100 compliance score, rating, and audit readiness index (%).
    """
    try:
        score_data = agent.calculate_compliance_score(db, project_id)
        return score_data
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/api/compliance/{project_id}/by-category", response_model=List[CategoryComplianceBreakdown])
def get_compliance_by_category(project_id: int, db: Session = Depends(get_db)):
    """
    GET /api/compliance/{project_id}/by-category
    Returns compliance breakdown by regulatory category (Fall Protection, PPE, Structural, Environmental, Electrical).
    """
    try:
        breakdown = agent.get_compliance_by_category(db, project_id)
        return breakdown
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/api/compliance/{project_id}/violations", response_model=List[ComplianceCheckResponse])
def get_open_regulatory_violations(project_id: int, db: Session = Depends(get_db)):
    """
    GET /api/compliance/{project_id}/violations
    Returns active non-compliant regulatory findings requiring remediation.
    """
    try:
        violations = agent.get_open_violations(db, project_id)
        return violations
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/api/compliance/{project_id}/report", response_model=RegulatoryReportResponse)
def get_regulatory_report(project_id: int, db: Session = Depends(get_db)):
    """
    GET /api/compliance/{project_id}/report
    Generates structured regulatory compliance audit report.
    """
    try:
        report = agent.generate_regulatory_report(db, project_id)
        return report
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
