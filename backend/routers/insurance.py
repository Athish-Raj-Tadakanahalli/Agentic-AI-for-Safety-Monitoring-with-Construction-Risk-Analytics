from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import InsuranceCase
from backend.agents.insurance_agent import InsuranceAgent
from backend.schemas.insurance_schemas import (
    InsuranceCaseIngest,
    InsuranceCaseResponse,
    InsuranceCaseStatusUpdate,
    InsuranceAssessmentResponse
)

router = APIRouter(tags=["Insurance Agent (Module 4.4)"])
agent = InsuranceAgent()

@router.post("/api/insurance/case", response_model=InsuranceCaseResponse, status_code=status.HTTP_201_CREATED)
def ingest_insurance_case(data: InsuranceCaseIngest, db: Session = Depends(get_db)):
    """
    POST /api/insurance/case
    Logs an insurance case or claim risk evaluation.
    """
    try:
        case = agent.ingest_insurance_case(db, data)
        return case
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.post("/api/insurance/{project_id}/assess", response_model=List[InsuranceCaseResponse])
def run_insurance_assessment(project_id: int, db: Session = Depends(get_db)):
    """
    POST /api/insurance/{project_id}/assess
    Executes automated insurance risk assessment logic fusing site risk, safety, and compliance scores.
    """
    try:
        cases = agent.run_insurance_risk_assessment(db, project_id)
        return cases
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/api/insurance/{project_id}/assessment", response_model=InsuranceAssessmentResponse)
def get_insurance_assessment(project_id: int, db: Session = Depends(get_db)):
    """
    GET /api/insurance/{project_id}/assessment
    Returns insurance risk badge, composite risk score, estimated financial exposure ($), and claim risk breakdown.
    """
    try:
        assessment = agent.calculate_insurance_metrics(db, project_id)
        return assessment
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/api/insurance/{project_id}/cases", response_model=List[InsuranceCaseResponse])
def get_insurance_cases(project_id: int, db: Session = Depends(get_db)):
    """
    GET /api/insurance/{project_id}/cases
    Lists active and historical insurance cases for a project.
    """
    cases = db.query(InsuranceCase).filter(InsuranceCase.project_id == project_id).order_by(InsuranceCase.created_at.desc()).all()
    return cases


@router.patch("/api/insurance/case/{case_id}/status", response_model=InsuranceCaseResponse)
def update_insurance_case_status(case_id: int, payload: InsuranceCaseStatusUpdate, db: Session = Depends(get_db)):
    """
    PATCH /api/insurance/case/{case_id}/status
    Updates insurance case status (open, under_investigation, mitigated, closed).
    """
    try:
        updated = agent.update_case_status(db, case_id, payload.status)
        return updated
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
