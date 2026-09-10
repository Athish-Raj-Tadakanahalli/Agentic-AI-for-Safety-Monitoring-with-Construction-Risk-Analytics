from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import Project
from backend.schemas.site_risk_schemas import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    """Fetch list of all active construction projects"""
    projects = db.query(Project).all()
    return projects

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_data: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new construction project"""
    project = Project(
        project_name=project_data.project_name,
        location=project_data.location,
        start_date=project_data.start_date,
        status=project_data.status or "active"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project_by_id(project_id: int, db: Session = Depends(get_db)):
    """Fetch details of a single project"""
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    return project
