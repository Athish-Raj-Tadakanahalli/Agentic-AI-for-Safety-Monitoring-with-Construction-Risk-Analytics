from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field, ConfigDict

class ComplianceCheckIngest(BaseModel):
    project_id: int
    regulation_name: str = Field(..., description="e.g. OSHA 1926.501 - Fall Protection, ISO 45001")
    category: Optional[str] = Field("Fall Protection", description="Fall Protection, PPE, Structural, Environmental, Electrical")
    compliance_status: str = Field(..., description="compliant, non_compliant, pending_review")
    severity: Optional[str] = Field("medium", description="low, medium, high, critical")
    description: Optional[str] = None
    remediation_plan: Optional[str] = None
    checked_at: Optional[datetime] = None

class ComplianceCheckResponse(BaseModel):
    compliance_id: int
    project_id: int
    regulation_name: str
    category: Optional[str] = "Fall Protection"
    compliance_status: str
    severity: Optional[str] = "medium"
    description: Optional[str] = None
    remediation_plan: Optional[str] = None
    checked_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CategoryComplianceBreakdown(BaseModel):
    category: str
    compliance_rate: float
    total_checks: int
    compliant_checks: int
    non_compliant_checks: int

class ComplianceScoreResponse(BaseModel):
    project_id: int
    project_name: str
    compliance_score: float = Field(..., description="0-100 overall regulatory compliance score")
    compliance_rating: str = Field(..., description="Compliant, Substantial Compliance, Moderate Non-Compliance, Severe Violation")
    audit_readiness_pct: float = Field(..., description="0-100% audit readiness index")
    audit_status: str = Field(..., description="Audit Ready, Needs Review, High Audit Risk")
    open_violations_count: int
    total_checks_count: int
    regulations_monitored_count: int

class RegulatoryReportResponse(BaseModel):
    project_id: int
    project_name: str
    generated_at: datetime
    compliance_score: float
    audit_readiness_pct: float
    audit_status: str
    total_regulations_monitored: int
    open_violations_count: int
    category_breakdown: List[CategoryComplianceBreakdown]
    open_violations: List[ComplianceCheckResponse]
    executive_summary: str
