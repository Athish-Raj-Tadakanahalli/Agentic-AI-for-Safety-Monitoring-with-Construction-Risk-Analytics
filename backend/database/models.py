from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Numeric, DateTime, Date, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True, default=date.today)
    status = Column(String(50), default="active")

    # Relationships
    site_risks = relationship("SiteRisk", back_populates="project", cascade="all, delete-orphan")
    safety_incidents = relationship("SafetyIncident", back_populates="project", cascade="all, delete-orphan")
    ppe_violations = relationship("PPEViolation", back_populates="project", cascade="all, delete-orphan")
    compliance_checks = relationship("ComplianceCheck", back_populates="project", cascade="all, delete-orphan")
    insurance_cases = relationship("InsuranceCase", back_populates="project", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="project", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="project", cascade="all, delete-orphan")


class SiteRisk(Base):
    __tablename__ = "site_risks"

    risk_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    risk_type = Column(String(100), nullable=False)  # fall, equipment, electrical, environmental, structural
    severity = Column(String(50), nullable=False)    # low, medium, high, critical
    zone = Column(String(100), nullable=True, default="General Site") # Zone A, Zone B, Scaffolding, Excavation
    description = Column(Text, nullable=True)
    probability = Column(Integer, default=3) # 1 (Rare) to 5 (Almost Certain)
    impact = Column(Integer, default=3)      # 1 (Negligible) to 5 (Catastrophic)
    mitigated = Column(Boolean, default=False)
    detected_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="site_risks")


class SafetyIncident(Base):
    __tablename__ = "safety_incidents"

    incident_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    incident_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    zone = Column(String(100), nullable=True, default="General Site")
    description = Column(Text, nullable=True)
    incident_date = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="safety_incidents")


class PPEViolation(Base):
    __tablename__ = "ppe_violations"

    violation_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    worker_id = Column(String(100), nullable=True)
    violation_type = Column(String(100), nullable=False) # hard hat, vest, boots, gloves
    zone = Column(String(100), nullable=True, default="General Site")
    timestamp = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="ppe_violations")


class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"

    compliance_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    regulation_name = Column(String(255), nullable=False) # OSHA 1926.501, ISO 45001, etc.
    category = Column(String(100), nullable=True, default="Fall Protection") # Fall Protection, PPE, Structural, Environmental, Electrical
    compliance_status = Column(String(50), nullable=False) # compliant, non_compliant, pending_review
    severity = Column(String(50), nullable=True, default="medium") # low, medium, high, critical
    description = Column(Text, nullable=True)
    remediation_plan = Column(Text, nullable=True)
    checked_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="compliance_checks")


class InsuranceCase(Base):
    __tablename__ = "insurance_cases"

    case_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    claim_type = Column(String(100), nullable=False) # Workers Compensation, General Liability, Property Damage, Equipment Breakdown, Environmental
    severity = Column(String(50), nullable=True, default="medium") # low, medium, high, critical
    estimated_exposure = Column(Numeric(12, 2), nullable=True, default=0.0)
    risk_score = Column(Numeric(5, 2), nullable=True) # 0-100 score
    claim_probability = Column(Numeric(5, 2), nullable=True, default=50.0) # 0-100%
    status = Column(String(50), default="open") # open, under_investigation, mitigated, closed
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="insurance_cases")


class Report(Base):
    __tablename__ = "reports"

    report_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    report_type = Column(String(100), nullable=False) # daily, executive, audit, project_health
    generated_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="reports")


class Alert(Base):
    __tablename__ = "alerts"

    alert_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    alert_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="alerts")
