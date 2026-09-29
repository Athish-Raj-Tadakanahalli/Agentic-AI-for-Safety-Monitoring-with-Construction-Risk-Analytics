# BuildSure AI — Agentic Construction Risk Intelligence Platform

**BuildSure AI** is an enterprise-grade Agentic Construction Risk Intelligence Platform. Specialized autonomous AI agents continuously monitor construction site activities, worker safety compliance, regulatory adherence, and commercial insurance exposure, collaborating via a LangGraph state graph engine to produce proactive risk scores, multi-channel alerts, executive reporting, and cost savings analytics.

---

## 🌟 Architecture & Multi-Agent Design

```
+-----------------------------------------------------------------------------------+
|                        BUILDSURE AI EXECUTIVE COMMAND CENTER                      |
|                     (React 18 + TypeScript + Tailwind CSS Frontend)              |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|               LANGGRAPH CONSTRUCTION RISK INTELLIGENCE ENGINE (FastAPI)            |
|                     State Graph Orchestrator & Risk Propagation                   |
+--------+------------------+-------------------+-------------------+---------------+
         |                  |                   |                   |
         v                  v                   v                   v
+------------------+ +---------------+ +-----------------+ +-----------------+
| Site Risk Agent  | | Safety Agent  | | Compliance Agent| | Insurance Agent |
| (Hazard Engine)  | | (CV Protection| | (OSHA/ISO Audit)| | (Underwriting)  |
+------------------+ +---------------+ +-----------------+ +-----------------+
         |                  |                   |                   |
         +------------------+---------+---------+-------------------+
                                      |
                                      v
                        +---------------------------+
                        |  Reporting Intelligence   |
                        |      (Module 4.5)         |
                        +---------------------------+
                                      |
       +------------------------------+------------------------------+
       |                              |                              |
       v                              v                              v
+---------------+            +------------------+          +-------------------+
| PDF Engine    |            | Multi-Channel    |          | PostgreSQL /      |
| & CSV Exports |            | Alert Escalation |          | SQLAlchemy ORM    |
+---------------+            +------------------+          +-------------------+
```

---

## 🚀 Completed Milestones & Feature Matrix

- **Milestone 1: Site Risk Monitoring & Hazard Detection** ✅
  - **Site Risk Agent**: Weighted rule engine ($0-100$), hazard categorization, zonal monitoring, and 5x5 Probability × Impact risk heatmaps.
- **Milestone 2: Safety Intelligence & Worker Protection** ✅
  - **Safety Agent**: Computer Vision PPE detection ingestion, 24h repeat violator tracking, dynamic accident-prone zone analytics, and emergency escalation feeds.
- **Milestone 3: Compliance & Insurance Intelligence** ✅
  - **Compliance Agent**: Automated OSHA 1926 & ISO 45001 regulatory validation workflows, audit readiness scoring, and remediation tracking.
  - **Insurance Agent**: Underwriting risk classification, financial claim exposure estimation ($ USD), and risk reduction strategies.
- **Milestone 4: Reporting Intelligence & Enterprise Deployment** ✅
  - **Reporting Agent**: Executive metrics (Project Risk Score, Incidents Prevented, Compliance Improvement %, Cost Savings $).
  - **LangGraph Risk Intelligence Engine**: State graph multi-agent orchestrator executing cross-agent risk propagation.
  - **Executive Command Center**: Unified dashboard featuring LangGraph execution pipeline triggers and per-agent performance grids.
  - **Enterprise Infrastructure**: Docker Compose, Alembic database migrations, seed data script, and Viva demo script.

---

## 💻 Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, PostgreSQL 15, Redis 7, Alembic, ReportLab PDF, Pytest.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Orchestration & AI**: LangGraph / State Graph Multi-Agent pattern, Context-aware AI Copilot.
- **Infrastructure**: Docker & Docker Compose (`docker-compose.yml`).

---

## ⚡ Quickstart Setup Guide

### Option 1: Single-Command Quick Launch (Local Python + Node)

```bash
# 1. Install Backend Dependencies
pip install -r backend/requirements.txt

# 2. Run Single Launcher (Seeds DB, starts FastAPI & React Frontend Web App)
python run.py
```
- **Web App Dashboard**: `http://localhost:5173`
- **FastAPI Documentation**: `http://localhost:8000/docs`
- **Root Status API**: `http://localhost:8000/`

---

### Option 2: Enterprise Containerized Deployment (Docker Compose)

Launch the full production stack (FastAPI Backend, React Frontend, PostgreSQL 15, and Redis 7):

```bash
docker-compose up --build
```
- **Frontend Dashboard**: `http://localhost:5173`
- **FastAPI API**: `http://localhost:8000`
- **PostgreSQL Database**: `localhost:5432` (db: `buildsure_db`, user: `buildsure`)

---

### Option 3: Alembic Database Migrations

```bash
# Run database migrations using Alembic
cd backend
alembic upgrade head
```

---

## 🧪 Running Automated Tests

```bash
python -m pytest backend/tests/ -v
```

---

## 📡 API Reference Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/projects` | `GET` | List active construction projects |
| `/api/engine/orchestrate/{project_id}` | `POST` | Execute LangGraph Multi-Agent Construction Risk Pipeline |
| `/api/engine/executive-dashboard/{project_id}` | `GET` | Get Executive KPIs (Risk Score, Cost Savings $, Incidents Prevented) |
| `/api/site-risk/{project_id}/score` | `GET` | Get Site Risk Score & 5x5 Heatmap data |
| `/api/safety/{project_id}/compliance-rate` | `GET` | Get Worker PPE Compliance Breakdown |
| `/api/compliance/{project_id}/validate` | `POST` | Execute Automated OSHA 1926 Regulatory Validation |
| `/api/insurance/{project_id}/assessment` | `GET` | Get Commercial Insurance Underwriting Exposure |
| `/api/reports/{project_id}/pdf` | `GET` | Generate official executive PDF report |
| `/api/reports/{project_id}/export/csv` | `GET` | Export CSV data spreadsheet |
| `/api/copilot/query` | `POST` | Query BuildSure AI Copilot Assistant |

---

## 🎬 Viva & Project Review Demo Walkthrough

A complete step-by-step presentation script is available in [DEMO_SCRIPT.md](file:///d:/Infosys%20Internship/Agentic%20AI%20for%20Safety%20Monitoring%20with%20Construction%20Risk%20Analytics/Agentic-AI-for-Safety-Monitoring-with-Construction-Risk-Analytics/DEMO_SCRIPT.md).
