"""Initial schema for BuildSure AI

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-18

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Projects Table
    op.create_table(
        'projects',
        sa.Column('project_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_name', sa.String(255), nullable=False),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(50), server_default='active')
    )

    # Site Risks Table
    op.create_table(
        'site_risks',
        sa.Column('risk_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.project_id', ondelete='CASCADE'), nullable=False),
        sa.Column('risk_type', sa.String(100), nullable=False),
        sa.Column('severity', sa.String(50), nullable=False),
        sa.Column('zone', sa.String(100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('probability', sa.Integer(), server_default='3'),
        sa.Column('impact', sa.Integer(), server_default='3'),
        sa.Column('mitigated', sa.Boolean(), server_default='false'),
        sa.Column('detected_at', sa.DateTime(), nullable=True)
    )

    # Safety Incidents Table
    op.create_table(
        'safety_incidents',
        sa.Column('incident_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.project_id', ondelete='CASCADE'), nullable=False),
        sa.Column('incident_type', sa.String(100), nullable=False),
        sa.Column('severity', sa.String(50), nullable=False),
        sa.Column('zone', sa.String(100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('incident_date', sa.DateTime(), nullable=True)
    )

    # PPE Violations Table
    op.create_table(
        'ppe_violations',
        sa.Column('violation_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.project_id', ondelete='CASCADE'), nullable=False),
        sa.Column('worker_id', sa.String(100), nullable=True),
        sa.Column('violation_type', sa.String(100), nullable=False),
        sa.Column('zone', sa.String(100), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True)
    )

    # Compliance Checks Table
    op.create_table(
        'compliance_checks',
        sa.Column('compliance_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.project_id', ondelete='CASCADE'), nullable=False),
        sa.Column('regulation_name', sa.String(255), nullable=False),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('compliance_status', sa.String(50), nullable=False),
        sa.Column('severity', sa.String(50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('remediation_plan', sa.Text(), nullable=True),
        sa.Column('checked_at', sa.DateTime(), nullable=True)
    )

    # Insurance Cases Table
    op.create_table(
        'insurance_cases',
        sa.Column('case_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.project_id', ondelete='CASCADE'), nullable=False),
        sa.Column('claim_type', sa.String(100), nullable=False),
        sa.Column('severity', sa.String(50), nullable=True),
        sa.Column('estimated_exposure', sa.Numeric(12, 2), nullable=True),
        sa.Column('risk_score', sa.Numeric(5, 2), nullable=True),
        sa.Column('claim_probability', sa.Numeric(5, 2), nullable=True),
        sa.Column('status', sa.String(50), server_default='open'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )

    # Reports Table
    op.create_table(
        'reports',
        sa.Column('report_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.project_id', ondelete='CASCADE'), nullable=False),
        sa.Column('report_type', sa.String(100), nullable=False),
        sa.Column('generated_at', sa.DateTime(), nullable=True)
    )

    # Alerts Table
    op.create_table(
        'alerts',
        sa.Column('alert_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.project_id', ondelete='CASCADE'), nullable=False),
        sa.Column('alert_type', sa.String(100), nullable=False),
        sa.Column('severity', sa.String(50), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )

def downgrade() -> None:
    op.drop_table('alerts')
    op.drop_table('reports')
    op.drop_table('insurance_cases')
    op.drop_table('compliance_checks')
    op.drop_table('ppe_violations')
    op.drop_table('safety_incidents')
    op.drop_table('site_risks')
    op.drop_table('projects')
