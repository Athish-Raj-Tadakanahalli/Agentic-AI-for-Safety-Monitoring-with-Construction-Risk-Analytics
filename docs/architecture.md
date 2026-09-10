# BuildSure AI Architecture & System Specifications

BuildSure AI is an Agentic Construction Risk Intelligence Platform that continuously monitors construction site activities, worker safety conditions, regulatory compliance, and insurance exposure.

## Monorepo Architecture Overview

```
                          ┌────────────────────────────────────────┐
                          │    Construction Site Data Ingestion    │
                          │   (CCTV feeds, Sensors, Inspections)   │
                          └───────────────────┬────────────────────┘
                                              │
                                              ▼
                          ┌────────────────────────────────────────┐
                          │       FastAPI Data Validation &        │
                          │            Ingestion API               │
                          └───────────────────┬────────────────────┘
                                              │
                                              ▼
                      ┌───────────────────────┴───────────────────────┐
                      │                                               │
                      ▼                                               ▼
        ┌────────────────────────────┐                 ┌────────────────────────────┐
        │   Site Risk Agent (M1)     │                 │     Safety Agent (M2)      │
        │ • Severity × Zone × P×I    │                 │ • Computer Vision PPE Ingest│
        │ • 5x5 ISO Heatmap Matrix   │                 │ • Repeat Violator Tracker  │
        │ • Score Normalization      │                 │ • Dynamic Zone Exposure    │
        └─────────────┬──────────────┘                 └──────────────┬─────────────┘
                      │                                               │
                      │               ┌───────────────────────────────┤
                      │               ▼                               ▼
                      │   ┌────────────────────────┐     ┌─────────────────────────┐
                      │   │  Notification Service  │     │ Database Storage        │
                      │   │ • Twilio SMS           │     │ (PostgreSQL / SQLite)   │
                      │   │ • SMTP Email Alerts    │     └────────────┬────────────┘
                      │   │ • Slack/Teams Webhooks │                  │
                      │   └────────────────────────┘                  │
                      ▼                                               ▼
        ┌───────────────────────────────────────────────────────────────────────────┐
        │                       React Web Application                              │
        │           (Vite + TypeScript + Tailwind CSS + Recharts)                   │
        │ • Site Risk Dashboard (Heatmaps, Hazard Table, Inherent/Residual View)    │
        │ • Safety Dashboard (PPE Compliance Bars, Zone Analytics, Alert Log)       │
        └───────────────────────────────────────────────────────────────────────────┘
```

---

## Milestone 1 Implementation: Site Risk Monitoring

The Site Risk Agent operates as an autonomous risk evaluation engine with the following mathematical scoring formulation:

$$\text{Project Risk Score} = \min\left(100.0, \frac{\sum_{\text{active}} (\text{Prob} \times \text{Impact}) \times \frac{\text{SevWeight}}{2} \times \text{ZoneCrit}}{150.0} \times 100\right)$$

### Key Components

1. **Rule Engine & Weights**:
   - **Severity Weights**: Low (1.0), Medium (2.5), High (5.0), Critical (10.0)
   - **Zone Criticality**: Scaffolding Tower (1.6), Excavation Zone (1.5), Crane Yard (1.4), High-Altitude Slab (1.6), General Site (1.0)
2. **5x5 Matrix (ISO 31000)**:
   - **Probability**: 1 (Rare), 2 (Unlikely), 3 (Possible), 4 (Likely), 5 (Almost Certain)
   - **Impact**: 1 (Negligible), 2 (Minor), 3 (Moderate), 4 (Major), 5 (Catastrophic)
3. **Heatmap Views**:
   - **Inherent Risk**: Total hazard occurrences detected on site before mitigation controls.
   - **Residual Risk**: Active unmitigated hazards remaining after safety officer intervention.

---

## Milestone 2 Implementation: Safety Intelligence & Worker Protection

The Safety Agent provides continuous, real-time worker safety tracking by fusing Computer Vision (CV) detection streams, worker behavior history, site incident records, and multi-channel notification dispatch.

### 1. Mathematical Safety Scoring Formulation

Overall Site Safety Score ($0 - 100$) quantifies worker protection where 100 represents full PPE compliance and zero incident record:

$$\text{Overall Safety Score} = (\text{PPE Compliance Rate} \times 0.60) + (\text{Incident Record Score} \times 0.40)$$

Where:
- **PPE Compliance Rate**:
  $$\text{Compliance Rate} = \max\left(0, \min\left(100, \frac{\text{Total Monitored Checks} - \text{Total Violations}}{\text{Total Monitored Checks}} \times 100\right)\right)$$
- **Incident Record Score**:
  $$\text{Incident Record Score} = \max(0, 100.0 - \sum \text{Deductions})$$
  - Deductions: Critical = $-20.0$, High = $-10.0$, Medium = $-5.0$, Low = $-2.0$.

### 2. Monitored PPE Categories
The CV edge detection model verifies four mandatory PPE classes:
- **Hard Hats**: High-altitude falling object & head impact protection.
- **Safety Vests**: High-visibility retroreflective vests for plant/vehicle zones.
- **Steel-Toe Boots**: Puncture & crushing resistance in active excavation areas.
- **Cut-Resistant Gloves**: Hand injury prevention in fabrication yards.

### 3. Repeat Violator Detection Engine
Worker identification badges (`W-104`, `W-209`, etc.) are monitored over a rolling 24-hour window. If any worker accumulates $\ge 3$ PPE breaches within 24 hours, the agent triggers an **Incident Escalation Alert** requiring mandatory retraining and supervisor intervention.

### 4. Dynamic Accident-Prone Zone Analytics
Site zones are dynamically aggregated by evaluating both incident frequency and PPE non-compliance density:
$$\text{Zone Weighted Score} = \sum_{\text{incidents}} \text{Severity Weight} + (1.5 \times \text{Violation Count})$$
- $\text{Weighted Score} \ge 12.0$ or $\ge 2$ incidents $\rightarrow$ **High Exposure Zone**
- $\text{Weighted Score} \ge 5.0$ or $\ge 1$ incident $\rightarrow$ **Medium Exposure Zone**
- Below $5.0$ $\rightarrow$ **Low Exposure Zone**

### 5. Multi-Channel Notification & Escalation Architecture (Module 6)
BuildSure AI integrates multi-channel dispatch with escalation protocols:

| Severity Level | Channels Dispatched | Target Stakeholder | SLA Dispatch Window |
| :--- | :--- | :--- | :--- |
| **Critical** | 📱 Twilio SMS + 📧 SMTP Email + 💬 Slack/Teams Webhook | Site Safety Director & Emergency Response | Immediate (< 30 seconds) |
| **High** | 📧 SMTP Email + 💬 Slack/Teams Webhook | Site Area Manager & Shift Supervisor | < 15 minutes |
| **Medium** | 💬 Slack/Teams Webhook | Safety Officer Daily Feed | Shift Summary / Real-Time |
| **Low** | 📋 Audit Database Table Log | System Audit History | Logged on Event |
