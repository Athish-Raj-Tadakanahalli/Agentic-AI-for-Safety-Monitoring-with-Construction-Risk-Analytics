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
  AlertLogItem
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
