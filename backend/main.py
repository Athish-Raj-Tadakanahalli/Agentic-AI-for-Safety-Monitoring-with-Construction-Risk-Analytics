import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.connection import engine, Base, ensure_schema_migrations
from backend.routers import projects, site_risk, safety, compliance, insurance, reports, copilot_router, engine_router, websocket_router

# Create database tables automatically on startup and apply schema upgrades
Base.metadata.create_all(bind=engine)
ensure_schema_migrations()

app = FastAPI(
    title="BuildSure AI - Construction Risk Intelligence Platform",
    description="Agentic AI platform for site risk monitoring, safety analytics, compliance, and insurance exposure.",
    version="1.0.0"
)

# Configure CORS for React frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(projects.router)
app.include_router(site_risk.router)
app.include_router(safety.router)
app.include_router(compliance.router)
app.include_router(insurance.router)
app.include_router(reports.router)
app.include_router(copilot_router.router)
app.include_router(engine_router.router)
app.include_router(websocket_router.router)

@app.get("/")
def root_status():
    return {
        "status": "online",
        "system": "BuildSure AI Intelligence Platform",
        "active_milestone": "Milestone 4 - Reporting Intelligence & Enterprise Deployment",
        "milestones_completed": [
            "Milestone 1: Site Risk Monitoring & Hazard Detection",
            "Milestone 2: Safety Intelligence & Worker Protection",
            "Milestone 3: Compliance & Insurance Intelligence",
            "Milestone 4: Reporting Intelligence & Enterprise Deployment (LangGraph Multi-Agent Engine)"
        ],
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
