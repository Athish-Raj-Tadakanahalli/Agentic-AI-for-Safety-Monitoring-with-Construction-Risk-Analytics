import io
import csv
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from backend.database.models import Project, SiteRisk, PPEViolation, SafetyIncident, ComplianceCheck, InsuranceCase
from backend.agents.site_risk_agent import SiteRiskAgent
from backend.agents.safety_agent import SafetyAgent
from backend.agents.compliance_agent import ComplianceAgent
from backend.agents.insurance_agent import InsuranceAgent

def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

class ReportGenerator:
    """
    Automated PDF & CSV Executive Reporting Service
    Generates PDF audit documents (Compliance, Insurance, Executive Digest)
    and exports tabular CSV data files.
    """

    def __init__(self):
        self.site_agent = SiteRiskAgent()
        self.safety_agent = SafetyAgent()
        self.compliance_agent = ComplianceAgent()
        self.insurance_agent = InsuranceAgent()

    def generate_compliance_pdf(self, db: Session, project_id: int) -> bytes:
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project {project_id} not found.")

        comp_score = self.compliance_agent.calculate_compliance_score(db, project_id)
        cat_breakdown = self.compliance_agent.get_compliance_by_category(db, project_id)
        open_viols = self.compliance_agent.get_open_violations(db, project_id)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0F172A')
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=colors.HexColor('#0284C7')
        )
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#334155')
        )
        bold_body = ParagraphStyle(
            'BoldBody',
            parent=body_style,
            fontName='Helvetica-Bold'
        )

        elements = []

        # Header
        elements.append(Paragraph("BUILDSURE AI — REGULATORY COMPLIANCE REPORT", title_style))
        elements.append(Paragraph(f"Project: <b>{project.project_name}</b> | Location: {project.location or 'N/A'} | Generated: {utc_now().strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceAfter=15))

        # Metrics Summary Box
        summary_data = [
            [
                Paragraph("<b>Compliance Score</b>", body_style),
                Paragraph("<b>Audit Readiness</b>", body_style),
                Paragraph("<b>Audit Status</b>", body_style),
                Paragraph("<b>Open Violations</b>", body_style)
            ],
            [
                Paragraph(f"<font size=14 color='#0284C7'><b>{comp_score.compliance_score}/100</b></font>", body_style),
                Paragraph(f"<font size=14 color='#10B981'><b>{comp_score.audit_readiness_pct}%</b></font>", body_style),
                Paragraph(f"<b>{comp_score.audit_status}</b>", body_style),
                Paragraph(f"<font size=14 color='#EF4444'><b>{comp_score.open_violations_count}</b></font>", body_style)
            ]
        ]
        t_summary = Table(summary_data, colWidths=[130, 130, 140, 140])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(t_summary)
        elements.append(Spacer(1, 15))

        # Category Breakdown Table
        elements.append(Paragraph("<b>Compliance Rates by Category</b>", subtitle_style))
        elements.append(Spacer(1, 6))

        cat_rows = [["Regulatory Category", "Compliance Rate", "Pass Checks", "Open Violations"]]
        for cat in cat_breakdown:
            cat_rows.append([
                cat.category,
                f"{cat.compliance_rate}%",
                f"{cat.compliant_checks}/{cat.total_checks}",
                str(cat.non_compliant_checks)
            ])

        t_cat = Table(cat_rows, colWidths=[200, 110, 110, 120])
        t_cat.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F1F5F9')]),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(t_cat)
        elements.append(Spacer(1, 15))

        # Open Findings Table
        elements.append(Paragraph("<b>Active Regulatory Non-Compliance Findings</b>", subtitle_style))
        elements.append(Spacer(1, 6))

        viol_rows = [["Standard / Regulation", "Category", "Severity", "Remediation Plan"]]
        if not open_viols:
            viol_rows.append(["None", "All Compliant", "Low", "No active OSHA non-compliance flags."])
        else:
            for v in open_viols:
                viol_rows.append([
                    Paragraph(v.regulation_name, body_style),
                    Paragraph(v.category or "N/A", body_style),
                    Paragraph((v.severity or "medium").upper(), bold_body),
                    Paragraph(v.remediation_plan or "Standard protocol.", body_style)
                ])

        t_viol = Table(viol_rows, colWidths=[150, 100, 70, 220])
        t_viol.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#FEF2F2')]),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(t_viol)

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_insurance_pdf(self, db: Session, project_id: int) -> bytes:
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project {project_id} not found.")

        ins_data = self.insurance_agent.calculate_insurance_metrics(db, project_id)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle('T', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=colors.HexColor('#0F172A'))
        subtitle_style = ParagraphStyle('ST', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=colors.HexColor('#10B981'))
        body_style = ParagraphStyle('B', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor('#334155'))

        elements = []
        elements.append(Paragraph("BUILDSURE AI — INSURANCE UNDERWRITING CERTIFICATE", title_style))
        elements.append(Paragraph(f"Project: <b>{project.project_name}</b> | Location: {project.location or 'N/A'} | Date: {utc_now().strftime('%Y-%m-%d')}", subtitle_style))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#10B981'), spaceAfter=15))

        # Risk Badge Summary Table
        summary_rows = [
            [Paragraph("<b>Risk Badge Classification</b>", body_style), Paragraph("<b>Composite Risk Score</b>", body_style), Paragraph("<b>Total Est. Financial Exposure</b>", body_style)],
            [
                Paragraph(f"<font size=13 color='#10B981'><b>{ins_data.insurance_risk_badge}</b></font>", body_style),
                Paragraph(f"<font size=13 color='#F59E0B'><b>{ins_data.composite_insurance_risk_score}/100</b></font>", body_style),
                Paragraph(f"<font size=13 color='#EF4444'><b>${ins_data.total_estimated_exposure:,.2f}</b></font>", body_style)
            ]
        ]
        t_summary = Table(summary_rows, colWidths=[180, 180, 180])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(t_summary)
        elements.append(Spacer(1, 15))

        # Claim Risk Breakdown Table
        elements.append(Paragraph("<b>Claim Risk Breakdown by Commercial Line</b>", subtitle_style))
        elements.append(Spacer(1, 6))

        claim_rows = [["Insurance Claim Line", "Risk Level", "Claim Likelihood %", "Estimated Exposure ($)"]]
        for c in ins_data.claim_risk_breakdown:
            claim_rows.append([
                c.claim_type,
                c.risk_level,
                f"{c.claim_probability}%",
                f"${c.estimated_exposure:,.2f}"
            ])

        t_claims = Table(claim_rows, colWidths=[180, 100, 120, 140])
        t_claims.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F1F5F9')]),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(t_claims)
        elements.append(Spacer(1, 15))

        # Risk Reduction Recommendations
        elements.append(Paragraph("<b>Underwriting Risk Reduction Strategy</b>", subtitle_style))
        elements.append(Spacer(1, 6))
        for r in ins_data.risk_reduction_recommendations:
            elements.append(Paragraph(f"• {r}", body_style))
            elements.append(Spacer(1, 4))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_executive_pdf(self, db: Session, project_id: int) -> bytes:
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project {project_id} not found.")

        site_score = self.site_agent.calculate_site_risk_score(db, project_id)
        safety_score = self.safety_agent.calculate_safety_score(db, project_id)
        comp_score = self.compliance_agent.calculate_compliance_score(db, project_id)
        ins_data = self.insurance_agent.calculate_insurance_metrics(db, project_id)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle('ET', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=colors.HexColor('#0F172A'))
        subtitle_style = ParagraphStyle('EST', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=colors.HexColor('#0284C7'))
        body_style = ParagraphStyle('EB', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor('#334155'))

        elements = []
        elements.append(Paragraph("BUILDSURE AI — EXECUTIVE SITE RISK DIGEST", title_style))
        elements.append(Paragraph(f"Project: <b>{project.project_name}</b> | Location: {project.location or 'N/A'} | Date: {utc_now().strftime('%Y-%m-%d')}", subtitle_style))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceAfter=15))

        # Quad Metric Summary
        quad_data = [
            [Paragraph("<b>Site Risk Score</b>", body_style), Paragraph("<b>Safety Rating Score</b>", body_style), Paragraph("<b>Compliance Score</b>", body_style), Paragraph("<b>Insurance Badge</b>", body_style)],
            [
                Paragraph(f"<font size=14 color='#EF4444'><b>{site_score.site_risk_score}/100</b></font>", body_style),
                Paragraph(f"<font size=14 color='#10B981'><b>{safety_score.safety_score}/100</b></font>", body_style),
                Paragraph(f"<font size=14 color='#0284C7'><b>{comp_score.compliance_score}/100</b></font>", body_style),
                Paragraph(f"<b>{ins_data.insurance_risk_badge}</b>", body_style)
            ]
        ]
        t_quad = Table(quad_data, colWidths=[135, 135, 135, 135])
        t_quad.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(t_quad)
        elements.append(Spacer(1, 15))

        # Top Hazardous Zones
        elements.append(Paragraph("<b>Top Hazardous Site Zones</b>", subtitle_style))
        elements.append(Spacer(1, 6))

        zone_rows = [["Zone Location", "Active Risk Count", "Max Severity Level"]]
        for z in site_score.top_hazardous_zones[:5]:
            zone_rows.append([z.zone, str(z.risk_count), z.max_severity.upper()])

        t_zones = Table(zone_rows, colWidths=[240, 150, 150])
        t_zones.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F1F5F9')]),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(t_zones)

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def export_csv(self, db: Session, project_id: int, data_type: str) -> str:
        """
        Exports tabular CSV data for hazards, PPE violations, compliance checks, or insurance cases.
        """
        output = io.StringIO()
        writer = csv.writer(output)

        dt = data_type.lower()
        if dt == "hazards":
            writer.writerow(["Risk ID", "Project ID", "Category", "Severity", "Zone", "Probability", "Impact", "Mitigated", "Description", "Detected At"])
            risks = db.query(SiteRisk).filter(SiteRisk.project_id == project_id).all()
            for r in risks:
                writer.writerow([r.risk_id, r.project_id, r.risk_type, r.severity, r.zone, r.probability, r.impact, r.mitigated, r.description, r.detected_at])
        elif dt == "ppe":
            writer.writerow(["Violation ID", "Project ID", "Worker ID", "Gear Type", "Zone", "Timestamp"])
            ppe = db.query(PPEViolation).filter(PPEViolation.project_id == project_id).all()
            for p in ppe:
                writer.writerow([p.violation_id, p.project_id, p.worker_id, p.violation_type, p.zone, p.timestamp])
        elif dt == "compliance":
            writer.writerow(["Check ID", "Project ID", "Regulation Standard", "Category", "Status", "Severity", "Remediation Plan", "Checked At"])
            chks = db.query(ComplianceCheck).filter(ComplianceCheck.project_id == project_id).all()
            for c in chks:
                writer.writerow([c.compliance_id, c.project_id, c.regulation_name, c.category, c.compliance_status, c.severity, c.remediation_plan, c.checked_at])
        elif dt == "insurance":
            writer.writerow(["Case ID", "Project ID", "Claim Line", "Severity", "Estimated Exposure ($)", "Risk Score", "Claim Probability %", "Status", "Description", "Created At"])
            cases = db.query(InsuranceCase).filter(InsuranceCase.project_id == project_id).all()
            for cs in cases:
                writer.writerow([cs.case_id, cs.project_id, cs.claim_type, cs.severity, float(cs.estimated_exposure or 0), float(cs.risk_score or 0), float(cs.claim_probability or 0), cs.status, cs.description, cs.created_at])
        else:
            raise ValueError(f"Invalid export data_type '{data_type}'.")

        return output.getvalue()
