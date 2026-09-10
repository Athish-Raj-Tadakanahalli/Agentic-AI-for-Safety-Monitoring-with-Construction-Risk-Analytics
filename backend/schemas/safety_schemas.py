from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field, ConfigDict

# PPE Violation Schemas
class PPEViolationIngest(BaseModel):
    project_id: int
    worker_id: Optional[str] = Field("W-101", description="Worker ID badge or tracking code")
    violation_type: str = Field(..., description="hard hat, vest, boots, gloves")
    zone: Optional[str] = Field("General Site", description="Site zone where violation occurred")
    timestamp: Optional[datetime] = None

class PPEViolationResponse(BaseModel):
    violation_id: int
    project_id: int
    worker_id: Optional[str]
    violation_type: str
    zone: Optional[str] = "General Site"
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# Safety Incident Schemas
class SafetyIncidentIngest(BaseModel):
    project_id: int
    incident_type: str = Field(..., description="e.g. slip_trip, near_miss, falling_object, machinery_contact")
    severity: str = Field(..., description="low, medium, high, critical")
    zone: Optional[str] = Field("General Site", description="Zone location")
    description: Optional[str] = None
    incident_date: Optional[datetime] = None

class SafetyIncidentResponse(BaseModel):
    incident_id: int
    project_id: int
    incident_type: str
    severity: str
    zone: Optional[str] = "General Site"
    description: Optional[str] = None
    incident_date: datetime

    model_config = ConfigDict(from_attributes=True)


# Alert Schemas
class AlertResponse(BaseModel):
    alert_id: int
    project_id: int
    alert_type: str
    severity: str
    message: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Analytics and Metrics Responses
class PPETypeBreakdown(BaseModel):
    ppe_type: str
    compliance_rate: float
    total_checks: int
    violations_count: int

class PPEComplianceResponse(BaseModel):
    project_id: int
    overall_compliance_rate: float
    total_violations_count: int
    workers_monitored_count: int
    breakdown_by_type: Dict[str, PPETypeBreakdown]

class AccidentProneZone(BaseModel):
    zone: str
    incident_count: int
    violation_count: int
    risk_level: str

class RepeatViolator(BaseModel):
    worker_id: str
    violations_count: int
    frequent_type: str

class SafetyScoreResponse(BaseModel):
    project_id: int
    project_name: str
    safety_score: float = Field(..., description="0-100 overall safety score (higher is safer)")
    safety_rating: str = Field(..., description="Excellent, Good, Fair, Poor, Critical")
    ppe_compliance_rate: float
    active_violations_count: int
    total_incidents_count: int
    workers_monitored: int

class SafetyAnalyticsResponse(BaseModel):
    project_id: int
    accident_prone_zones: List[AccidentProneZone]
    repeat_violators: List[RepeatViolator]
    safety_recommendations: List[str]
