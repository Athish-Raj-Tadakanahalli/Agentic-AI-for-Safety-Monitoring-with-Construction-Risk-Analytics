from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# Project Schemas
class ProjectBase(BaseModel):
    project_name: str
    location: Optional[str] = "Default Location"
    start_date: Optional[date] = None
    status: Optional[str] = "active"

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    project_id: int

    model_config = ConfigDict(from_attributes=True)


# Site Risk Schemas
class SiteRiskIngest(BaseModel):
    project_id: int
    risk_type: str = Field(..., description="e.g. fall, equipment, electrical, environmental, structural")
    severity: str = Field(..., description="low, medium, high, critical")
    zone: Optional[str] = Field("Zone A", description="Specific site zone or area")
    description: Optional[str] = Field(None, description="Hazard description or CCTV notes")
    probability: int = Field(3, ge=1, le=5, description="1 (Rare) to 5 (Almost Certain)")
    impact: int = Field(3, ge=1, le=5, description="1 (Negligible) to 5 (Catastrophic)")
    mitigated: bool = Field(False, description="Whether hazard is mitigated")

class SiteRiskUpdateStatus(BaseModel):
    mitigated: bool

class SiteRiskResponse(BaseModel):
    risk_id: int
    project_id: int
    risk_type: str
    severity: str
    zone: Optional[str]
    description: Optional[str]
    probability: int
    impact: int
    mitigated: bool
    detected_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Score and Heatmap Responses
class ZoneRiskSummary(BaseModel):
    zone: str
    risk_count: int
    max_severity: str

class SiteRiskScoreResponse(BaseModel):
    project_id: int
    project_name: str
    site_risk_score: float = Field(..., description="Normalized 0 - 100 site risk score")
    risk_level: str = Field(..., description="Low, Medium, High, Critical")
    active_risks_count: int
    high_risk_zones_count: int
    hazards_detected_count: int
    mitigated_count: int
    top_hazardous_zones: List[ZoneRiskSummary]
    distribution_by_type: Dict[str, int]
    distribution_by_severity: Dict[str, int]

class HeatmapCell(BaseModel):
    probability: int  # 1 to 5 (Rare to Almost Certain)
    impact: int       # 1 to 5 (Negligible to Catastrophic)
    count: int
    risk_ids: List[int]
    risk_level: str   # Low, Medium, High, Extreme

class HeatmapMatrixResponse(BaseModel):
    project_id: int
    project_name: str
    probability_labels: List[str] = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"]
    impact_labels: List[str] = ["Negligible", "Minor", "Moderate", "Major", "Catastrophic"]
    inherent_grid: List[List[int]]   # 5x5 matrix counts [probability_idx][impact_idx]
    residual_grid: List[List[int]]   # 5x5 matrix counts after mitigation
    inherent_cells: List[HeatmapCell]
    residual_cells: List[HeatmapCell]

# Digital Twin Schemas
class DigitalTwinZoneItem(BaseModel):
    zone_id: str
    zone_name: str
    category: str
    risk_score: float
    risk_level: str
    color_status: str  # "red", "amber", "green"
    active_hazards_count: int
    active_risks: List[SiteRiskResponse]
    assigned_supervisor: str
    cctv_camera_id: str
    floor_level: Optional[str] = None

class DigitalTwinResponse(BaseModel):
    project_id: int
    project_name: str
    total_active_hazards: int
    critical_zones_count: int
    zones: List[DigitalTwinZoneItem]
