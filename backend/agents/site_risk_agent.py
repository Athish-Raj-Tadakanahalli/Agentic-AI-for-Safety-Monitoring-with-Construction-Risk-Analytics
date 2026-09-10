from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database.models import SiteRisk, Project
from backend.schemas.site_risk_schemas import (
    SiteRiskIngest,
    SiteRiskScoreResponse,
    HeatmapMatrixResponse,
    HeatmapCell,
    ZoneRiskSummary
)

class SiteRiskAgent:
    """
    Site Risk Agent (Module 4.1)
    Monitors construction site hazards (CCTV/inspection inputs), assesses environmental,
    equipment, and site structural risks, computes weighted project risk score (0-100),
    and generates 5x5 Risk Heatmap matrices (Probability x Impact).
    """

    # Configurable weights for rule engine
    SEVERITY_WEIGHTS = {
        "low": 1.0,
        "medium": 2.5,
        "high": 5.0,
        "critical": 10.0
    }

    ZONE_CRITICALITY = {
        "Excavation Zone": 1.5,
        "Scaffolding Tower": 1.6,
        "Crane & Rigging Yard": 1.4,
        "High-Altitude Slab": 1.6,
        "Electrical Room": 1.3,
        "Perimeter Fencing": 1.1,
        "General Site": 1.0
    }

    PROBABILITY_LABELS = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"]
    IMPACT_LABELS = ["Negligible", "Minor", "Moderate", "Major", "Catastrophic"]

    def __init__(self, severity_weights: Dict[str, float] = None, zone_weights: Dict[str, float] = None):
        if severity_weights:
            self.SEVERITY_WEIGHTS.update(severity_weights)
        if zone_weights:
            self.ZONE_CRITICALITY.update(zone_weights)

    def ingest_risk_event(self, db: Session, data: SiteRiskIngest) -> SiteRisk:
        """
        Ingests a detected site hazard event (from CCTV feed simulator, safety inspection log, or sensor)
        """
        # Ensure project exists
        project = db.query(Project).filter(Project.project_id == data.project_id).first()
        if not project:
            raise ValueError(f"Project with ID {data.project_id} not found.")

        site_risk = SiteRisk(
            project_id=data.project_id,
            risk_type=data.risk_type.lower(),
            severity=data.severity.lower(),
            zone=data.zone or "General Site",
            description=data.description,
            probability=min(max(data.probability, 1), 5),
            impact=min(max(data.impact, 1), 5),
            mitigated=data.mitigated
        )

        db.add(site_risk)
        db.commit()
        db.refresh(site_risk)
        return site_risk

    def ingest_batch_feed(self, db: Session, feed_data: List[Dict[str, Any]]) -> List[SiteRisk]:
        """
        Ingest batch JSON/CSV dataset representing external CCTV/Inspection logs
        """
        ingested = []
        for item in feed_data:
            risk_schema = SiteRiskIngest(**item)
            ingested.append(self.ingest_risk_event(db, risk_schema))
        return ingested

    def calculate_site_risk_score(self, db: Session, project_id: int) -> SiteRiskScoreResponse:
        """
        Calculates a numeric site risk score (0-100) per project using weighted rule engine:
        Score = sum(severity_weight * zone_criticality * unmitigated_multiplier)
        Normalized to 0 - 100 range.
        """
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} not found.")

        risks = db.query(SiteRisk).filter(SiteRisk.project_id == project_id).all()

        total_weighted_risk = 0.0
        active_risks_count = 0
        mitigated_count = 0
        dist_by_type: Dict[str, int] = {}
        dist_by_severity: Dict[str, int] = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        zone_map: Dict[str, Dict[str, Any]] = {}

        for r in risks:
            sev_key = r.severity.lower()
            dist_by_severity[sev_key] = dist_by_severity.get(sev_key, 0) + 1
            dist_by_type[r.risk_type] = dist_by_type.get(r.risk_type, 0) + 1

            if r.mitigated:
                mitigated_count += 1
                continue  # Mitigated risks do not contribute to active score

            active_risks_count += 1
            sev_wt = self.SEVERITY_WEIGHTS.get(sev_key, 1.0)
            zone_crit = self.ZONE_CRITICALITY.get(r.zone, 1.0)

            # Risk contribution = probability * impact * severity_wt * zone_crit
            risk_contrib = (r.probability * r.impact) * (sev_wt / 2.0) * zone_crit
            total_weighted_risk += risk_contrib

            # Track zone criticality summary
            if r.zone not in zone_map:
                zone_map[r.zone] = {"count": 0, "max_sev": sev_key}
            zone_map[r.zone]["count"] += 1
            # Update max severity
            if self.SEVERITY_WEIGHTS.get(sev_key, 0) > self.SEVERITY_WEIGHTS.get(zone_map[r.zone]["max_sev"], 0):
                zone_map[r.zone]["max_sev"] = sev_key

        # Calculate normalized score 0 - 100
        # Benchmark max active risk load = 150 points for 100% risk score
        raw_score = (total_weighted_risk / 150.0) * 100.0
        normalized_score = round(min(100.0, max(0.0, raw_score)), 1)

        # Determine Risk Level Category
        if normalized_score >= 75.0:
            risk_level = "Critical"
        elif normalized_score >= 50.0:
            risk_level = "High"
        elif normalized_score >= 25.0:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Format top hazardous zones
        top_zones = [
            ZoneRiskSummary(zone=z, risk_count=info["count"], max_severity=info["max_sev"])
            for z, info in sorted(zone_map.items(), key=lambda x: x[1]["count"], reverse=True)
        ]

        high_risk_zones_count = len([z for z in top_zones if z.max_severity in ["high", "critical"]])

        return SiteRiskScoreResponse(
            project_id=project.project_id,
            project_name=project.project_name,
            site_risk_score=normalized_score,
            risk_level=risk_level,
            active_risks_count=active_risks_count,
            high_risk_zones_count=high_risk_zones_count,
            hazards_detected_count=len(risks),
            mitigated_count=mitigated_count,
            top_hazardous_zones=top_zones,
            distribution_by_type=dist_by_type,
            distribution_by_severity=dist_by_severity
        )

    def generate_heatmap(self, db: Session, project_id: int) -> HeatmapMatrixResponse:
        """
        Generates 5x5 Heatmap Matrix (Probability x Impact) matching 5x5 grid:
        Probability [1..5]: Rare, Unlikely, Possible, Likely, Almost Certain
        Impact [1..5]: Negligible, Minor, Moderate, Major, Catastrophic

        Computes both Inherent Risk (all detected hazards) and Residual Risk (unmitigated hazards).
        """
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} not found.")

        risks = db.query(SiteRisk).filter(SiteRisk.project_id == project_id).all()

        # Initialize 5x5 grids (0-indexed: [prob - 1][impact - 1])
        inherent_grid = [[0 for _ in range(5)] for _ in range(5)]
        residual_grid = [[0 for _ in range(5)] for _ in range(5)]

        inherent_cell_dict: Dict[Tuple[int, int], List[int]] = {}
        residual_cell_dict: Dict[Tuple[int, int], List[int]] = {}

        for r in risks:
            p_idx = min(max(r.probability - 1, 0), 4)
            i_idx = min(max(r.impact - 1, 0), 4)

            # Inherent grid includes all hazards
            inherent_grid[p_idx][i_idx] += 1
            key = (p_idx + 1, i_idx + 1)
            inherent_cell_dict.setdefault(key, []).append(r.risk_id)

            # Residual grid includes only unmitigated hazards
            if not r.mitigated:
                residual_grid[p_idx][i_idx] += 1
                residual_cell_dict.setdefault(key, []).append(r.risk_id)

        def build_cell_list(grid_matrix, cell_dict) -> List[HeatmapCell]:
            cells = []
            for p in range(1, 6):
                for i in range(1, 6):
                    cnt = grid_matrix[p - 1][i - 1]
                    prod = p * i
                    if prod >= 16:
                        lvl = "Extreme"
                    elif prod >= 10:
                        lvl = "High"
                    elif prod >= 5:
                        lvl = "Medium"
                    else:
                        lvl = "Low"
                    
                    cells.append(HeatmapCell(
                        probability=p,
                        impact=i,
                        count=cnt,
                        risk_ids=cell_dict.get((p, i), []),
                        risk_level=lvl
                    ))
            return cells

        return HeatmapMatrixResponse(
            project_id=project.project_id,
            project_name=project.project_name,
            probability_labels=self.PROBABILITY_LABELS,
            impact_labels=self.IMPACT_LABELS,
            inherent_grid=inherent_grid,
            residual_grid=residual_grid,
            inherent_cells=build_cell_list(inherent_grid, inherent_cell_dict),
            residual_cells=build_cell_list(residual_grid, residual_cell_dict)
        )
