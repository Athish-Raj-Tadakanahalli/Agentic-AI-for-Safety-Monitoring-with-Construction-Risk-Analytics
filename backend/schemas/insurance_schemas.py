from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field, ConfigDict

class InsuranceCaseIngest(BaseModel):
    project_id: int
    claim_type: str = Field(..., description="Workers Compensation, General Liability, Property Damage, Equipment Breakdown, Environmental")
    severity: Optional[str] = Field("medium", description="low, medium, high, critical")
    estimated_exposure: Optional[float] = Field(0.0, description="Estimated financial exposure in USD")
    risk_score: Optional[float] = Field(50.0, description="0-100 risk score")
    claim_probability: Optional[float] = Field(50.0, description="0-100% estimated claim likelihood")
    status: Optional[str] = Field("open", description="open, under_investigation, mitigated, closed")
    description: Optional[str] = None

class InsuranceCaseResponse(BaseModel):
    case_id: int
    project_id: int
    claim_type: str
    severity: Optional[str] = "medium"
    estimated_exposure: Optional[float] = 0.0
    risk_score: Optional[float] = 0.0
    claim_probability: Optional[float] = 0.0
    status: str = "open"
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InsuranceCaseStatusUpdate(BaseModel):
    status: str = Field(..., description="open, under_investigation, mitigated, closed")

class ClaimRiskAnalysis(BaseModel):
    claim_type: str
    risk_level: str = Field(..., description="Low, Medium, High, Critical")
    claim_probability: float = Field(..., description="0-100% likelihood")
    estimated_exposure: float = Field(..., description="USD exposure")
    active_cases_count: int
    driving_factors: List[str]

class InsuranceAssessmentResponse(BaseModel):
    project_id: int
    project_name: str
    composite_insurance_risk_score: float = Field(..., description="0-100 risk score (higher is higher risk)")
    insurance_risk_badge: str = Field(..., description="Preferred / Low Risk, Moderate Risk, High Exposure, Critical Risk")
    badge_variant: str = Field(..., description="low, medium, high, critical UI variant")
    total_estimated_exposure: float = Field(..., description="Total financial exposure USD")
    active_cases_count: int
    claim_risk_breakdown: List[ClaimRiskAnalysis]
    risk_reduction_recommendations: List[str]
