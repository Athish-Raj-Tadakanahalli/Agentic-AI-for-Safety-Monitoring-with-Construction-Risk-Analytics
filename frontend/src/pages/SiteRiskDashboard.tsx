import React, { useEffect, useState, useCallback } from 'react';
import {
  Project,
  SiteRisk,
  SiteRiskScoreResponse,
  HeatmapMatrixResponse,
  IngestSiteRiskPayload
} from '../types';
import {
  getProjects,
  getSiteRiskScore,
  getSiteRiskHeatmap,
  getSiteRisks,
  ingestSiteRisk,
  updateRiskMitigationStatus
} from '../api/api';
import { Navbar } from '../components/Navbar';
import { MetricCard } from '../components/MetricCard';
import { RiskHeatmap } from '../components/RiskHeatmap';
import { RiskCharts } from '../components/RiskCharts';
import { ActiveRisksTable } from '../components/ActiveRisksTable';
import { IngestDataModal } from '../components/IngestDataModal';
import { AlertTriangle, ShieldCheck, MapPin, Gauge, RefreshCw } from 'lucide-react';

interface SiteRiskDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SiteRiskDashboard: React.FC<SiteRiskDashboardProps> = ({ activeTab, onTabChange }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);

  const [scoreData, setScoreData] = useState<SiteRiskScoreResponse | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapMatrixResponse | null>(null);
  const [risks, setRisks] = useState<SiteRisk[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Load project list on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].project_id);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    loadProjects();
  }, []);

  // Fetch Site Risk data for selected project
  const fetchDashboardData = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      const [scoreRes, heatmapRes, risksRes] = await Promise.all([
        getSiteRiskScore(selectedProjectId),
        getSiteRiskHeatmap(selectedProjectId),
        getSiteRisks(selectedProjectId)
      ]);
      setScoreData(scoreRes);
      setHeatmapData(heatmapRes);
      setRisks(risksRes);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch site risk data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData();

    // Auto-refresh interval every 10 seconds for live stream simulation
    const timer = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  // Handle hazard mitigation toggle
  const handleToggleMitigation = async (riskId: number, currentMitigated: boolean) => {
    try {
      await updateRiskMitigationStatus(riskId, !currentMitigated);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to update mitigation status:', err);
    }
  };

  // Handle new hazard ingestion
  const handleIngestHazard = async (payload: IngestSiteRiskPayload) => {
    try {
      await ingestSiteRisk(payload);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to ingest hazard payload:', err);
    }
  };

  const getScoreBadgeVariant = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
      />

      {/* Tab Notice for Future Milestones */}
      {activeTab !== 'site-risk' && (
        <div className="bg-cyan-500/10 border-b border-cyan-500/30 py-2.5 px-4 text-center text-xs text-cyan-600 dark:text-cyan-300 font-semibold">
          Note: You are currently viewing a tab placeholder. <strong>Site Risk Agent (Milestone 1)</strong> is active below.
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center space-x-2 text-slate-900 dark:text-white">
              <span>Site Risk Agent — Hazard Detection Engine</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Active Project: <strong className="text-slate-800 dark:text-slate-200">{scoreData?.project_name || 'Loading...'}</strong> • 
              Automated CCTV, sensor & inspection risk analytics
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center space-x-1">
              <RefreshCw className={`w-3 h-3 text-slate-400 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
              <span>Refreshed: {lastRefreshed.toLocaleTimeString()}</span>
            </span>
            <button
              onClick={() => fetchDashboardData()}
              className="p-2 rounded-xl theme-input border transition-all duration-200 hover:border-cyan-500 shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4 text-cyan-500" />
            </button>
          </div>
        </div>

        {/* 1. Top KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Site Risk Score"
            value={`${scoreData?.site_risk_score ?? '--'} / 100`}
            subtitle="Weighted rule engine score (0-100)"
            icon={Gauge}
            badgeText={scoreData?.risk_level || 'Low'}
            badgeVariant={getScoreBadgeVariant(scoreData?.risk_level)}
          />

          <MetricCard
            title="Active Unmitigated Hazards"
            value={scoreData?.active_risks_count ?? 0}
            subtitle={`${scoreData?.mitigated_count ?? 0} risks successfully mitigated`}
            icon={AlertTriangle}
            badgeText={`${scoreData?.active_risks_count ?? 0} Active`}
            badgeVariant={scoreData?.active_risks_count ? 'high' : 'low'}
          />

          <MetricCard
            title="High-Risk Site Zones"
            value={scoreData?.high_risk_zones_count ?? 0}
            subtitle="Zones with High/Critical severity exposure"
            icon={MapPin}
            badgeText="Zonal Monitoring"
            badgeVariant="medium"
          />

          <MetricCard
            title="Total Hazards Detected"
            value={scoreData?.hazards_detected_count ?? 0}
            subtitle="CCTV & Sensor events ingested"
            icon={ShieldCheck}
            badgeText="Full Audit Feed"
            badgeVariant="neutral"
          />
        </div>

        {/* 2. 5x5 Probability x Impact Risk Heatmap */}
        <RiskHeatmap data={heatmapData} />

        {/* 3. Recharts Visualizations */}
        <RiskCharts scoreData={scoreData} />

        {/* 4. Active Hazards Log Table */}
        <ActiveRisksTable risks={risks} onToggleMitigation={handleToggleMitigation} />
      </main>

      {/* Ingest Simulation Modal */}
      <IngestDataModal
        projectId={selectedProjectId}
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onIngest={handleIngestHazard}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-4 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
        BuildSure AI — Agentic Construction Risk Intelligence Platform • Milestone 1 (Site Risk Agent)
      </footer>
    </div>
  );
};
