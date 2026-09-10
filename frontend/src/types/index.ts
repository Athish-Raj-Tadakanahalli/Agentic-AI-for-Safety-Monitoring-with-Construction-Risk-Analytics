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
