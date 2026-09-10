# BuildSure AI API Reference — Milestones 1 & 2

Base URL: `http://localhost:8000`

---

## 1. Projects Endpoints

### 1.1 List All Projects
`GET /api/projects`

**Response `200 OK`**:
```json
[
  {
    "project_id": 1,
    "project_name": "Skyline Commercial Tower",
    "location": "Downtown Metropolitan Center, Block 14",
    "start_date": "2026-06-01",
    "status": "active"
  }
]
```

### 1.2 Create Project
`POST /api/projects`

---

## 2. Site Risk Agent Endpoints (Milestone 1)

### 2.1 Ingest Hazard Event
`POST /api/site-risk/ingest`

Simulates external CCTV / sensor / inspection feed ingestion into the Site Risk Agent.

**Request Body**:
```json
{
  "project_id": 1,
  "risk_type": "fall",
  "severity": "critical",
  "zone": "Scaffolding Tower",
  "description": "Missing safety harness anchorage point on 30th floor staging platform.",
  "probability": 4,
  "impact": 5,
  "mitigated": false
}
```

### 2.2 Get Project Site Risk Score & Metrics
`GET /api/site-risk/{project_id}/score`

### 2.3 Get 5x5 Risk Heatmap Matrix
`GET /api/site-risk/{project_id}/heatmap`

### 2.4 Get Active Site Hazards Log
`GET /api/site-risk/{project_id}/risks?severity=&risk_type=&mitigated=`

### 2.5 Update Risk Mitigation Status
`PATCH /api/site-risk/{risk_id}/status`

---

## 3. Safety Agent Endpoints (Milestone 2)

### 3.1 Ingest Computer Vision PPE Event
`POST /api/safety/ppe-event`

Simulates edge CV camera PPE violation detection. Automatically tracks repeat violators over rolling 24 hours.

**Request Body**:
```json
{
  "project_id": 1,
  "worker_id": "W-104",
  "violation_type": "hard hat",
  "zone": "Scaffolding Tower B"
}
```

**Response `201 Created`**:
```json
{
  "violation_id": 17,
  "project_id": 1,
  "worker_id": "W-104",
  "violation_type": "hard hat",
  "zone": "Scaffolding Tower B",
  "timestamp": "2026-09-05T04:45:00"
}
```

---

### 3.2 Log Site Safety Incident / Near-Miss
`POST /api/safety/incident`

Logs a safety incident or near-miss. Incidents with `high` or `critical` severity trigger automated multi-channel escalation alerts.

**Request Body**:
```json
{
  "project_id": 1,
  "incident_type": "near_miss",
  "severity": "high",
  "zone": "Scaffolding Tower B",
  "description": "Scaffold wrench dropped from Level 24 caught by safety containment net."
}
```

**Response `201 Created`**:
```json
{
  "incident_id": 6,
  "project_id": 1,
  "incident_type": "near_miss",
  "severity": "high",
  "zone": "Scaffolding Tower B",
  "description": "Scaffold wrench dropped from Level 24 caught by safety containment net.",
  "incident_date": "2026-09-05T04:45:30"
}
```

---

### 3.3 Get PPE Compliance Rate & Breakdown
`GET /api/safety/{project_id}/compliance-rate`

Returns overall compliance % and breakdown by individual gear categories (Hard Hat, Safety Vest, Work Boots, Cut Gloves).

**Response `200 OK`**:
```json
{
  "project_id": 1,
  "overall_compliance_rate": 95.8,
  "total_violations_count": 10,
  "workers_monitored_count": 6,
  "breakdown_by_type": {
    "hard hat": {
      "ppe_type": "Hard Hat",
      "compliance_rate": 91.7,
      "total_checks": 60,
      "violations_count": 5
    },
    "vest": {
      "ppe_type": "Vest",
      "compliance_rate": 96.7,
      "total_checks": 60,
      "violations_count": 2
    },
    "boots": {
      "ppe_type": "Boots",
      "compliance_rate": 98.3,
      "total_checks": 60,
      "violations_count": 1
    },
    "gloves": {
      "ppe_type": "Gloves",
      "compliance_rate": 96.7,
      "total_checks": 60,
      "violations_count": 2
    }
  }
}
```

---

### 3.4 Get Project Safety Score
`GET /api/safety/{project_id}/score`

Calculates 0-100 overall safety score and safety rating category.

**Response `200 OK`**:
```json
{
  "project_id": 1,
  "project_name": "Skyline Commercial Tower",
  "safety_score": 91.5,
  "safety_rating": "Excellent",
  "ppe_compliance_rate": 95.8,
  "active_violations_count": 10,
  "total_incidents_count": 2,
  "workers_monitored": 6
}
```

---

### 3.5 Get PPE Event History
`GET /api/safety/{project_id}/violations?since=`

---

### 3.6 Get Safety Analytics & AI Recommendations
`GET /api/safety/{project_id}/analytics`

Calculates dynamically aggregated accident-prone zones, repeat violator workers, and context-specific AI safety recommendations.

**Response `200 OK`**:
```json
{
  "project_id": 1,
  "accident_prone_zones": [
    {
      "zone": "Scaffolding Tower B",
      "incident_count": 1,
      "violation_count": 5,
      "risk_level": "High"
    },
    {
      "zone": "Crane Loading Bay",
      "incident_count": 0,
      "violation_count": 2,
      "risk_level": "Low"
    }
  ],
  "repeat_violators": [
    {
      "worker_id": "W-104",
      "violations_count": 4,
      "frequent_type": "Hard Hat"
    }
  ],
  "safety_recommendations": [
    "Deploy supervisor presence and inspect perimeter edge barriers immediately in: Scaffolding Tower B.",
    "Issue safety stand-down and mandatory retraining for repeat violators: Worker W-104 (4x Hard Hat).",
    "Mandate hard hat tethering for all high-altitude crews working above 15 meters."
  ]
}
```

---

## 4. Notification & Escalation Endpoints (Module 6)

### 4.1 Test Notification Dispatch Channel
`POST /api/notifications/test?channel=sms&message=Emergency+Alert&project_id=1`

Simulates sending an alert through the multi-channel notification engine (Twilio SMS, SMTP Email, Slack/Teams incoming webhook).

**Parameters**:
- `channel`: `email` | `sms` | `webhook`
- `message`: Alert message text
- `project_id`: (Optional) Associates the test event with project audit logs

**Response `200 OK`**:
```json
{
  "status": "success",
  "channel": "sms",
  "message": "Emergency Alert",
  "dispatched_at": "2026-09-05T04:47:00.123456"
}
```

---

### 4.2 Get Project Notification Escalation Logs
`GET /api/notifications/{project_id}/log`

Returns the audit history of dispatched alerts for the project.

**Response `200 OK`**:
```json
[
  {
    "alert_id": 1,
    "project_id": 1,
    "alert_type": "Repeat PPE Violator",
    "severity": "high",
    "message": "Worker W-104 committed 3 PPE violations (hard hat) in Zone 'Scaffolding Tower B' within 24 hours.",
    "created_at": "2026-09-05T03:45:00"
  }
]
```
