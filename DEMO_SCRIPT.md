# BuildSure AI — Viva & Project Review Demo Script

**Project Title**: Agentic AI for Safety Monitoring with Construction Risk Analytics  
**Platform Name**: BuildSure AI  
**Version**: 1.0.0 (Milestone 4 Enterprise Release)

---

## 📋 Viva Presentation & Walkthrough Guide (5-7 Minutes)

### 1. Introduction & Problem Statement (1 Min)
- **Presenter**: "BuildSure AI is an agentic construction risk intelligence platform designed to replace legacy manual safety inspections with an autonomous, multi-agent AI framework."
- **Key Objective**: Connect computer vision worker PPE monitoring, site hazard detection, OSHA & ISO 45001 compliance auditing, and commercial insurance exposure into a unified executive decision engine.

---

### 2. Architecture & Multi-Agent Design (1.5 Mins)
- **Architecture Overview**:
  - **FastAPI Python Backend**: Houses 5 autonomous domain agents + LangGraph intelligence engine.
  - **5 Multi-Agent System**:
    1. **Site Risk Agent (Module 4.1)**: Weighted rule engine & 5x5 Probability x Impact Risk Heatmaps.
    2. **Safety Protection Agent (Module 4.2)**: Simulated CCTV worker PPE tracking, repeat violator analytics & hazard zone mapping.
    3. **Compliance Agent (Module 4.3)**: Autonomous OSHA 1926 & ISO 45001 regulatory validation workflows & remediation.
    4. **Insurance Agent (Module 4.4)**: Underwriting risk scoring ($ Exposure, Workers Comp & General Liability claim probability).
    5. **Reporting Agent (Module 4.5)**: Executive metrics (Incidents Prevented, Cost Savings $, Compliance Improvement %).
  - **LangGraph Risk Intelligence Engine (Module 4.6)**: Multi-agent State Graph orchestrating cross-agent risk propagation & emergency notifications.
  - **React 18 + TypeScript + Tailwind Frontend**: 5 interactive dashboards + AI Copilot assistant + PDF/CSV export engine.

---

### 3. Step-by-Step Live Demo Execution (3 Mins)

#### Step A: Single-Click Platform Startup
- **Action**: Run `python run.py` (or `docker-compose up`).
- **Explanation**: Automatically seeds PostgreSQL/SQLite database with sample projects ("Skyline Commercial Tower", "Metro Line 4"), verifies dependencies, and launches React Vite Web App (`http://localhost:5173`) and FastAPI Uvicorn Server (`http://localhost:8000/docs`).

#### Step B: Executive Command Center Dashboard
- **Navigation**: Open `http://localhost:5173` (defaults to Command Center).
- **Highlights to Show**:
  - **Executive KPIs**: Project Risk Score (0-100), Incidents Prevented, Compliance Improvement (+%), Financial Cost Savings ($).
  - **LangGraph Execution Trigger**: Click **"Execute LangGraph Pipeline"** button and observe the live state execution flow (Site Risk -> Safety -> Compliance -> Insurance -> Propagation -> Notification -> Reporting).
  - **Per-Agent Performance Grid**: Scores, ratings, accuracy %, and latency for all 5 agents.

#### Step C: Domain Agent Deep Dives
1. **Site Risk Agent**:
   - Demonstrate the interactive **5x5 Risk Heatmap Matrix** (Inherent vs Residual Risk).
   - Ingest a new hazard via the **"Ingest Hazard"** modal.
2. **Safety Agent**:
   - Click **"Simulate CV Camera"** to log a worker missing a hard hat or vest.
   - Observe worker badge tracking, repeat violator alerts, and emergency notification logs.
3. **Compliance Agent**:
   - Click **"Auto Validate"** to execute automated OSHA 1926 regulatory validation.
   - View open regulatory findings and required remediation plans.
4. **Insurance Agent**:
   - View claim probability breakdown across 5 commercial insurance coverages.
   - Show the plain-language **Underwriting Risk Reduction Strategy**.

#### Step D: AI Copilot & Universal Reporting
- Click **"AI Copilot"** button in header:
  - Ask: *"What are our top OSHA compliance risks?"* or click a quick prompt.
  - Observe context-aware answer with key project metrics.
- Click **"PDF Report"** or **"Export CSV"** in any tab to download official audit documentation.

---

### 4. Technical Summary & Conclusion (0.5 Mins)
- **Key Deliverables Met**:
  - `/backend`: FastAPI with 5 agents + LangGraph intelligence engine.
  - `/frontend`: 5 working dashboards.
  - `PostgreSQL schema` + Alembic migrations.
  - `Multi-channel Notification module` (Email, SMS, Webhooks, Escalation).
  - `docker-compose.yml` (Backend + Frontend + Postgres + Redis).
- **Conclusion**: "BuildSure AI provides enterprise construction firms with an agentic safety shield that reduces site hazards, prevents costly OSHA violations, and lowers insurance premiums."
