import axios from 'axios';
import {
  Project,
  SiteRisk,
  SiteRiskScoreResponse,
  HeatmapMatrixResponse,
  IngestSiteRiskPayload,
  SafetyScoreResponse,
  PPEComplianceResponse,
  SafetyAnalyticsResponse,
  PPEViolation,
  IngestPPEPayload,
  SafetyIncident,
  IngestIncidentPayload,
  AlertLogItem,
  ComplianceCheck,
  IngestCompliancePayload,
  CategoryComplianceBreakdown,
  ComplianceScoreResponse,
  RegulatoryReportResponse,
  InsuranceCase,
  IngestInsuranceCasePayload,
  InsuranceAssessmentResponse,
  CopilotQueryResponse,
  DigitalTwinResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Projects API
export const getProjects = async (): Promise<Project[]> => {
  const response = await client.get('/api/projects');
  return response.data;
};

// Site Risk Agent API (Milestone 1)
export const getSiteRiskScore = async (projectId: number): Promise<SiteRiskScoreResponse> => {
  const response = await client.get(`/api/site-risk/${projectId}/score`);
  return response.data;
};

export const getSiteRiskHeatmap = async (projectId: number): Promise<HeatmapMatrixResponse> => {
  const response = await client.get(`/api/site-risk/${projectId}/heatmap`);
  return response.data;
};

export const getDigitalTwinData = async (projectId: number): Promise<DigitalTwinResponse> => {
  const response = await client.get(`/api/site-risk/${projectId}/digital-twin`);
  return response.data;
};

export const getSiteRisks = async (
  projectId: number,
  severity?: string,
  riskType?: string,
  mitigated?: boolean
): Promise<SiteRisk[]> => {
  const params: Record<string, any> = {};
  if (severity) params.severity = severity;
  if (riskType) params.risk_type = riskType;
  if (mitigated !== undefined) params.mitigated = mitigated;

  const response = await client.get(`/api/site-risk/${projectId}/risks`, { params });
  return response.data;
};

export const ingestSiteRisk = async (payload: IngestSiteRiskPayload): Promise<SiteRisk> => {
  const response = await client.post('/api/site-risk/ingest', payload);
  return response.data;
};

export const updateRiskMitigationStatus = async (riskId: number, mitigated: boolean): Promise<SiteRisk> => {
  const response = await client.patch(`/api/site-risk/${riskId}/status`, { mitigated });
  return response.data;
};

// Safety Agent API (Milestone 2)
export const getSafetyScore = async (projectId: number): Promise<SafetyScoreResponse> => {
  const response = await client.get(`/api/safety/${projectId}/score`);
  return response.data;
};

export const getPPECompliance = async (projectId: number): Promise<PPEComplianceResponse> => {
  const response = await client.get(`/api/safety/${projectId}/compliance-rate`);
  return response.data;
};

export const getSafetyAnalytics = async (projectId: number): Promise<SafetyAnalyticsResponse> => {
  const response = await client.get(`/api/safety/${projectId}/analytics`);
  return response.data;
};

export const getSafetyViolations = async (projectId: number): Promise<PPEViolation[]> => {
  const response = await client.get(`/api/safety/${projectId}/violations`);
  return response.data;
};

export const ingestPPEViolation = async (payload: IngestPPEPayload): Promise<PPEViolation> => {
  const response = await client.post('/api/safety/ppe-event', payload);
  return response.data;
};

export const logSafetyIncident = async (payload: IngestIncidentPayload): Promise<SafetyIncident> => {
  const response = await client.post('/api/safety/incident', payload);
  return response.data;
};

// Notification Module API (Milestone 2)
export const getNotificationLogs = async (projectId: number): Promise<AlertLogItem[]> => {
  const response = await client.get(`/api/notifications/${projectId}/log`);
  return response.data;
};

export const testNotificationChannel = async (
  channel: 'email' | 'sms' | 'webhook',
  message: string,
  projectId?: number
): Promise<any> => {
  const params: Record<string, any> = { channel, message };
  if (projectId) params.project_id = projectId;
  const response = await client.post('/api/notifications/test', null, { params });
  return response.data;
};

// Compliance Agent API (Milestone 3)
export const getComplianceScore = async (projectId: number): Promise<ComplianceScoreResponse> => {
  const response = await client.get(`/api/compliance/${projectId}/score`);
  return response.data;
};

export const getComplianceByCategory = async (projectId: number): Promise<CategoryComplianceBreakdown[]> => {
  const response = await client.get(`/api/compliance/${projectId}/by-category`);
  return response.data;
};

export const getOpenComplianceViolations = async (projectId: number): Promise<ComplianceCheck[]> => {
  const response = await client.get(`/api/compliance/${projectId}/violations`);
  return response.data;
};

export const getRegulatoryReport = async (projectId: number): Promise<RegulatoryReportResponse> => {
  const response = await client.get(`/api/compliance/${projectId}/report`);
  return response.data;
};

export const runRegulatoryValidation = async (projectId: number): Promise<ComplianceCheck[]> => {
  const response = await client.post(`/api/compliance/${projectId}/validate`);
  return response.data;
};

export const ingestComplianceCheck = async (payload: IngestCompliancePayload): Promise<ComplianceCheck> => {
  const response = await client.post('/api/compliance/check', payload);
  return response.data;
};

// Insurance Agent API (Milestone 3)
export const getInsuranceAssessment = async (projectId: number): Promise<InsuranceAssessmentResponse> => {
  const response = await client.get(`/api/insurance/${projectId}/assessment`);
  return response.data;
};

export const getInsuranceCases = async (projectId: number): Promise<InsuranceCase[]> => {
  const response = await client.get(`/api/insurance/${projectId}/cases`);
  return response.data;
};

export const runInsuranceAssessment = async (projectId: number): Promise<InsuranceCase[]> => {
  const response = await client.post(`/api/insurance/${projectId}/assess`);
  return response.data;
};

export const ingestInsuranceCase = async (payload: IngestInsuranceCasePayload): Promise<InsuranceCase> => {
  const response = await client.post('/api/insurance/case', payload);
  return response.data;
};

export const updateInsuranceCaseStatus = async (caseId: number, status: string): Promise<InsuranceCase> => {
  const response = await client.patch(`/api/insurance/case/${caseId}/status`, { status });
  return response.data;
};

// Automated Executive PDF & CSV Reporting API
export const downloadPDFReport = async (projectId: number, reportType: 'compliance' | 'insurance' | 'executive'): Promise<void> => {
  const response = await client.get(`/api/reports/${projectId}/pdf?report_type=${reportType}`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `BuildSure_${reportType.toUpperCase()}_P${projectId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadCSVExport = async (projectId: number, dataType: 'hazards' | 'ppe' | 'compliance' | 'insurance'): Promise<void> => {
  const response = await client.get(`/api/reports/${projectId}/export/csv?data_type=${dataType}`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `BuildSure_${dataType.toUpperCase()}_P${projectId}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// BuildSure AI Copilot API
export const queryAICopilot = async (projectId: number, query: string): Promise<CopilotQueryResponse> => {
  const response = await client.post('/api/copilot/query', { project_id: projectId, query });
  return response.data;
};

// Milestone 4: Risk Intelligence Engine & Executive Dashboard API
export const getExecutiveDashboardData = async (projectId: number): Promise<any> => {
  const response = await client.get(`/api/engine/executive-dashboard/${projectId}`);
  return response.data;
};

export const runOrchestrationPipeline = async (projectId: number): Promise<any> => {
  const response = await client.post(`/api/engine/orchestrate/${projectId}`);
  return response.data;
};

export const executeAutomatedRemediation = async (projectId: number): Promise<any> => {
  const response = await client.post(`/api/engine/remediate/${projectId}`);
  return response.data;
};
