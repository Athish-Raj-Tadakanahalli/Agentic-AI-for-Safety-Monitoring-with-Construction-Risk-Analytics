import os
import sys
import pandas as pd
from typing import Optional
from sqlalchemy.orm import Session

# Ensure backend root is in Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database.connection import engine, SessionLocal
from backend.database.models import Project, SiteRisk
from backend.agents.site_risk_agent import SiteRiskAgent
from backend.schemas.site_risk_schemas import SiteRiskIngest

def load_kaggle_csv(
    csv_file_path: str,
    project_id: int = 1,
    db: Optional[Session] = None
) -> int:
    """
    Kaggle Dataset Importer for BuildSure AI
    Reads any Construction Safety/Hazard CSV downloaded from Kaggle
    and ingests it into the Site Risk Agent database.
    
    Expected/Flexible CSV column names:
    - 'hazard_type' or 'risk_type' or 'category'
    - 'severity' or 'severity_level' or 'priority'
    - 'zone' or 'location' or 'area'
    - 'description' or 'notes' or 'details'
    - 'probability' (1-5, optional)
    - 'impact' (1-5, optional)
    """
    if not os.path.exists(csv_file_path):
        raise FileNotFoundError(f"Kaggle CSV file not found at: {csv_file_path}")

    close_db_on_exit = False
    if db is None:
        db = SessionLocal()
        close_db_on_exit = True

    try:
        df = pd.read_csv(csv_file_path)
        print(f"Reading Kaggle dataset '{csv_file_path}' ({len(df)} rows)...")

        agent = SiteRiskAgent()
        ingested_count = 0

        # Severity mapping helper
        def map_severity(val) -> str:
            val_str = str(val).strip().lower()
            if any(k in val_str for k in ['critical', 'fatal', 'catastrophic', '4']):
                return 'critical'
            elif any(k in val_str for k in ['high', 'severe', '3']):
                return 'high'
            elif any(k in val_str for k in ['medium', 'moderate', '2']):
                return 'medium'
            return 'low'

        # Risk type mapping helper
        def map_risk_type(val) -> str:
            val_str = str(val).strip().lower()
            if any(k in val_str for k in ['fall', 'height', 'scaffold', 'ladder']):
                return 'fall'
            elif any(k in val_str for k in ['equipment', 'crane', 'machinery', 'forklift', 'vehicle']):
                return 'equipment'
            elif any(k in val_str for k in ['electric', 'wiring', 'power']):
                return 'electrical'
            elif any(k in val_str for k in ['environment', 'weather', 'flood', 'chemical', 'gas', 'dust']):
                return 'environmental'
            return 'structural'

        for idx, row in df.iterrows():
            # Flexible column lookup
            risk_type_val = row.get('hazard_type') or row.get('risk_type') or row.get('category') or 'fall'
            severity_val = row.get('severity') or row.get('severity_level') or row.get('priority') or 'medium'
            zone_val = row.get('zone') or row.get('location') or row.get('area') or 'General Site'
            desc_val = row.get('description') or row.get('notes') or row.get('details') or f"Kaggle record #{idx+1}"
            prob_val = int(row.get('probability', 3)) if pd.notnull(row.get('probability')) else 3
            imp_val = int(row.get('impact', 3)) if pd.notnull(row.get('impact')) else 3

            risk_data = SiteRiskIngest(
                project_id=project_id,
                risk_type=map_risk_type(risk_type_val),
                severity=map_severity(severity_val),
                zone=str(zone_val),
                description=str(desc_val),
                probability=min(max(prob_val, 1), 5),
                impact=min(max(imp_val, 1), 5),
                mitigated=False
            )

            agent.ingest_risk_event(db, risk_data)
            ingested_count += 1

        print(f"Successfully ingested {ingested_count} hazards from Kaggle CSV into Project ID {project_id}!")
        return ingested_count

    finally:
        if close_db_on_exit:
            db.close()


def generate_sample_kaggle_csv(output_path: str = "backend/data/sample_kaggle_construction_risks.csv"):
    """Generates a sample Kaggle-formatted construction safety dataset CSV file"""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    sample_data = [
        {"hazard_type": "Fall Hazard", "severity": "Critical", "zone": "Scaffolding Tower", "description": "Unanchored lifeline wire on 22nd floor.", "probability": 4, "impact": 5},
        {"hazard_type": "Machinery Failure", "severity": "High", "zone": "Crane & Rigging Yard", "description": "Tower Crane cable fraying detected during inspection.", "probability": 3, "impact": 4},
        {"hazard_type": "Electrical Exposure", "severity": "High", "zone": "Electrical Room", "description": "Open high-voltage junction box without lock-out tag.", "probability": 4, "impact": 4},
        {"hazard_type": "Flooding & Mudslide", "severity": "Critical", "zone": "Excavation Zone", "description": "Rainstorm runoff flooding deep trench wall.", "probability": 5, "impact": 5},
        {"hazard_type": "Structural Formwork", "severity": "Medium", "zone": "High-Altitude Slab", "description": "Loose joist support pins on level 12 slab pouring.", "probability": 3, "impact": 3},
        {"hazard_type": "Environmental Dust", "severity": "Low", "zone": "Perimeter Fencing", "description": "Silica dust cloud near concrete grinding zone.", "probability": 2, "impact": 2},
    ]
    df = pd.DataFrame(sample_data)
    df.to_csv(output_path, index=False)
    print(f"Sample Kaggle dataset generated at: {output_path}")

if __name__ == "__main__":
    sample_csv = "backend/data/sample_kaggle_construction_risks.csv"
    generate_sample_kaggle_csv(sample_csv)
    load_kaggle_csv(sample_csv, project_id=1)
