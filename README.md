# BuildSure AI — Agentic Construction Risk Intelligence Platform

**BuildSure AI** is an enterprise-grade Agentic Construction Risk Intelligence Platform. Specialized AI agents continuously monitor construction site activities, worker safety compliance, regulatory adherence, and insurance exposure, collaborating to produce proactive risk scores, alerts, and executive reporting.

---

## Milestone Status

- **Milestone 1: Site Risk Monitoring & Hazard Detection** ✅
  - **Site Risk Agent**: Implemented (`backend/agents/site_risk_agent.py`) with weighted risk scoring engine ($0-100$), hazard categorization, and 5x5 Probability × Impact risk matrix logic.
- **Milestone 2: Safety Intelligence & Worker Protection** ✅ *(Verified & Upgraded)*
  - **Safety Agent**: Implemented (`backend/agents/safety_agent.py`) with Computer Vision PPE detection ingestion (hard hat, vest, boots, gloves), 24h rolling repeat violator tracking, dynamic data-driven accident-prone zone identification, and contextual AI safety recommendations.
  - **Notification Module**: Implemented (`backend/notifications/notifier.py`) supporting Email (SMTP), SMS (Twilio format), and Slack/Teams webhooks with automated incident escalation workflows and persistent audit logging.
  - **Safety Dashboard**: Interactive React frontend (`frontend/src/pages/SafetyDashboard.tsx`) with dark/light mode support, PPE compliance breakdown bars, safety score gauge, accident-prone zones analytics, live notification escalation feed, and modals for both CV camera simulation and near-miss/incident reporting.
  - **Test Suite**: Automated Pytest suite (`backend/tests/test_safety.py`) verifying repeat violator escalation, critical incident notifications, dynamic zone clustering, and API responses.

---

## Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, PostgreSQL / SQLite fallback, Pytest.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Infrastructure**: Docker & Docker Compose (`docker-compose.yml`).

---

## Quickstart — Running in VS Code

### Option A: One-Click Run Task in VS Code
1. Open the project folder in **Visual Studio Code**.
2. Press `Ctrl + Shift + B` (or open Command Palette with `Ctrl + Shift + P` and select **Tasks: Run Build Task**).
3. Select **BuildSure AI: Run Full Application**.
4. VS Code will automatically seed the DB, launch the backend and frontend servers, and pop up the dashboard in your web browser!

---

## Quickstart — Running via Terminal

### 1. Backend & Web Dashboard (Single Command)

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run launcher (Seeds DB, starts FastAPI backend & React frontend web app)
python run.py
```
- Web App UI: `http://localhost:5173`
- API Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/`

### 2. Frontend Setup & Run

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- Dashboard UI: `http://localhost:5173`

---

## Running with Docker Compose

To launch the full stack (FastAPI Backend, React Frontend, PostgreSQL 15, and Redis 7):

```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## Running Backend Unit Tests

```bash
python -m pytest backend/tests/ -v
```

---

## Monorepo Directory Structure

```
/
├── backend/
│   ├── agents/
│   │   ├── site_risk_agent.py      # Site Risk Agent scoring & heatmap logic (M1)
│   │   └── safety_agent.py         # Safety Agent PPE tracking & zone analytics (M2)
│   ├── database/
│   │   ├── connection.py           # DB engine & automatic schema upgrades
│   │   └── models.py               # Complete SQLAlchemy ORM models (M1 & M2)
│   ├── notifications/
│   │   └── notifier.py             # Multi-channel notification service (SMS, Email, Webhook)
│   ├── routers/
│   │   ├── site_risk.py            # Site Risk Agent REST endpoints
│   │   ├── safety.py               # Safety Agent & Notification REST endpoints
│   │   └── projects.py             # Projects management REST endpoints
│   ├── schemas/
│   │   ├── site_risk_schemas.py    # Pydantic v2 site risk schemas
│   │   └── safety_schemas.py       # Pydantic v2 safety & alert schemas
│   ├── tests/
│   │   ├── test_site_risk.py       # Milestone 1 unit tests
│   │   └── test_safety.py          # Milestone 2 comprehensive unit tests
│   ├── seed.py                     # Demo seed script (Projects, hazards, PPE breaches, alerts)
│   ├── main.py                     # FastAPI application entrypoint
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Header with project selector & theme toggle
│   │   │   ├── MetricCard.tsx      # KPI cards with dynamic trend badges
│   │   │   ├── RiskHeatmap.tsx     # 5x5 Probability x Impact Risk Matrix (M1)
│   │   │   ├── RiskCharts.tsx      # Recharts visualizations (M1)
│   │   │   ├── ActiveRisksTable.tsx# Hazard register table with toggle switch (M1)
│   │   │   ├── IngestDataModal.tsx # Site risk ingestion modal (M1)
│   │   │   ├── PPETypeBreakdown.tsx# PPE compliance breakdown bars (M2)
│   │   │   ├── AccidentZonesAnalytics.tsx # Dynamic accident zones & AI advice (M2)
│   │   │   ├── SimulatePPEModal.tsx# CV camera PPE detection simulation modal (M2)
│   │   │   ├── ReportIncidentModal.tsx # Safety incident / near-miss modal (M2)
│   │   │   └── NotificationFeed.tsx# Real-time escalation log & test buttons (M2)
│   │   ├── pages/
│   │   │   ├── SiteRiskDashboard.tsx # Milestone 1 Dashboard
│   │   │   └── SafetyDashboard.tsx   # Milestone 2 Dashboard
│   │   ├── api/
│   │   │   └── api.ts              # Axios API client
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docs/
│   ├── architecture.md             # System architecture & mathematical scoring formulas
│   └── api_reference.md            # Complete API spec with request/response examples
├── docker-compose.yml              # Container orchestration spec
├── .env.example
└── README.md
```
