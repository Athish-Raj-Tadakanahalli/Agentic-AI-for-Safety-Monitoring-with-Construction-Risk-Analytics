export interface Project {
  project_id: number;
  project_name: string;
  location?: string;
  start_date?: string;
  status: string;
}

// Site Risk Types
export interface SiteRisk {
  risk_id: number;
  project_id: number;
  risk_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone?: string;
  description?: string;
  probability: number;
  impact: number;
  mitigated: boolean;
  detected_at: string;
}

export interface ZoneRiskSummary {
  zone: string;
  risk_count: number;
  max_severity: string;
}

export interface SiteRiskScoreResponse {
  project_id: number;
  project_name: string;
  site_risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  active_risks_count: number;
  high_risk_zones_count: number;
  hazards_detected_count: number;
  mitigated_count: number;
  top_hazardous_zones: ZoneRiskSummary[];
  distribution_by_type: Record<string, number>;
  distribution_by_severity: Record<string, number>;
}

export interface HeatmapCell {
  probability: number;
  impact: number;
  count: number;
  risk_ids: number[];
  risk_level: 'Low' | 'Medium' | 'High' | 'Extreme';
}

export interface HeatmapMatrixResponse {
  project_id: number;
  project_name: string;
  probability_labels: string[];
  impact_labels: string[];
  inherent_grid: number[][];
  residual_grid: number[][];
  inherent_cells: HeatmapCell[];
  residual_cells: HeatmapCell[];
}

export interface DigitalTwinZoneItem {
  zone_id: string;
  zone_name: string;
  category: string;
  risk_score: number;
  risk_level: string;
  color_status: 'red' | 'amber' | 'green';
  active_hazards_count: number;
  active_risks: SiteRisk[];
  assigned_supervisor: string;
  cctv_camera_id: string;
  floor_level?: string;
}

export interface DigitalTwinResponse {
  project_id: number;
  project_name: string;
  total_active_hazards: number;
  critical_zones_count: number;
  zones: DigitalTwinZoneItem[];
}

export interface IngestSiteRiskPayload {
  project_id: number;
  risk_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone: string;
  description: string;
  probability: number;
  impact: number;
  mitigated: boolean;
}

// Safety Agent Types (Milestone 2)
export interface PPETypeBreakdownItem {
  ppe_type: string;
  compliance_rate: number;
  total_checks: number;
  violations_count: number;
}

export interface PPEComplianceResponse {
  project_id: number;
  overall_compliance_rate: number;
  total_violations_count: number;
  workers_monitored_count: number;
  breakdown_by_type: Record<string, PPETypeBreakdownItem>;
}

export interface SafetyScoreResponse {
  project_id: number;
  project_name: string;
  safety_score: number;
  safety_rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  ppe_compliance_rate: number;
  active_violations_count: number;
  total_incidents_count: number;
  workers_monitored: number;
}

export interface AccidentProneZone {
  zone: string;
  incident_count: number;
  violation_count: number;
  risk_level: string;
}

export interface RepeatViolator {
  worker_id: string;
  violations_count: number;
  frequent_type: string;
}

export interface SafetyAnalyticsResponse {
  project_id: number;
  accident_prone_zones: AccidentProneZone[];
  repeat_violators: RepeatViolator[];
  safety_recommendations: string[];
}

export interface PPEViolation {
  violation_id: number;
  project_id: number;
  worker_id: string;
  violation_type: string;
  zone?: string;
  timestamp: string;
}

export interface IngestPPEPayload {
  project_id: number;
  worker_id: string;
  violation_type: 'hard hat' | 'vest' | 'boots' | 'gloves';
  zone: string;
}

export interface SafetyIncident {
  incident_id: number;
  project_id: number;
  incident_type: string;
  severity: string;
  zone?: string;
  description?: string;
  incident_date: string;
}

export interface IngestIncidentPayload {
  project_id: number;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone: string;
  description?: string;
}

export interface AlertLogItem {
  alert_id: number;
  project_id: number;
  alert_type: string;
  severity: string;
  message?: string;
  created_at: string;
}

// Compliance Agent Types (Milestone 3)
export interface ComplianceCheck {
  compliance_id: number;
  project_id: number;
  regulation_name: string;
  category?: string;
  compliance_status: 'compliant' | 'non_compliant' | 'pending_review';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  remediation_plan?: string;
  checked_at: string;
}

export interface IngestCompliancePayload {
  project_id: number;
  regulation_name: string;
  category: string;
  compliance_status: 'compliant' | 'non_compliant' | 'pending_review';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  remediation_plan?: string;
}

export interface CategoryComplianceBreakdown {
  category: string;
  compliance_rate: number;
  total_checks: number;
  compliant_checks: number;
  non_compliant_checks: number;
}

export interface ComplianceScoreResponse {
  project_id: number;
  project_name: string;
  compliance_score: number;
  compliance_rating: string;
  audit_readiness_pct: number;
  audit_status: string;
  open_violations_count: number;
  total_checks_count: number;
  regulations_monitored_count: number;
}

export interface RegulatoryReportResponse {
  project_id: number;
  project_name: string;
  generated_at: string;
  compliance_score: number;
  audit_readiness_pct: number;
  audit_status: string;
  total_regulations_monitored: number;
  open_violations_count: number;
  category_breakdown: CategoryComplianceBreakdown[];
  open_violations: ComplianceCheck[];
  executive_summary: string;
}

// Insurance Agent Types (Milestone 3)
export interface InsuranceCase {
  case_id: number;
  project_id: number;
  claim_type: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  estimated_exposure?: number;
  risk_score?: number;
  claim_probability?: number;
  status: 'open' | 'under_investigation' | 'mitigated' | 'closed';
  description?: string;
  created_at: string;
}

export interface IngestInsuranceCasePayload {
  project_id: number;
  claim_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimated_exposure: number;
  risk_score: number;
  claim_probability: number;
  status: 'open' | 'under_investigation' | 'mitigated' | 'closed';
  description?: string;
}

export interface ClaimRiskAnalysis {
  claim_type: string;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  claim_probability: number;
  estimated_exposure: number;
  active_cases_count: number;
  driving_factors: string[];
}

export interface InsuranceAssessmentResponse {
  project_id: number;
  project_name: string;
  composite_insurance_risk_score: number;
  insurance_risk_badge: string;
  badge_variant: 'low' | 'medium' | 'high' | 'critical';
  total_estimated_exposure: number;
  active_cases_count: number;
  claim_risk_breakdown: ClaimRiskAnalysis[];
  risk_reduction_recommendations: string[];
}

// AI Copilot Assistant Types
export interface CopilotQueryResponse {
  project_id: number;
  project_name: string;
  query: string;
  answer: string;
  key_metrics: Record<string, any>;
  recommended_actions: string[];
  related_standards: string[];
  llm_provider?: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  data?: CopilotQueryResponse;
}

// Milestone 4: Executive Dashboard & LangGraph Orchestration Types
export interface AgentPerformanceItem {
  agent_id: string;
  agent_name: string;
  status: 'active' | 'warning' | 'error';
  score: number;
  rating: string;
  active_items: number;
  accuracy_pct: number;
  avg_response_ms: number;
}

export interface ExecutiveDashboardResponse {
  project_id: number;
  project_name: string;
  project_risk_score: number;
  overall_status: string;
  incidents_prevented: number;
  compliance_improvement_pct: number;
  cost_savings_usd: number;
  site_risk_score: number;
  safety_score: number;
  compliance_score: number;
  insurance_risk_badge: string;
  total_estimated_exposure_usd: number;
  per_agent_performance: AgentPerformanceItem[];
}

export interface RiskPropagationEvent {
  source: string;
  target: string;
  trigger_condition: string;
  action: string;
  status: string;
}

export interface LangGraphOrchestrationResponse {
  project_id: number;
  project_name: string;
  pipeline_status: string;
  langgraph_execution_path: string[];
  executive_summary: ExecutiveDashboardResponse;
  site_risk: Record<string, any>;
  safety: Record<string, any>;
  compliance: Record<string, any>;
  insurance: Record<string, any>;
  risk_propagation_events: RiskPropagationEvent[];
  notifications_triggered: AlertLogItem[];
}
