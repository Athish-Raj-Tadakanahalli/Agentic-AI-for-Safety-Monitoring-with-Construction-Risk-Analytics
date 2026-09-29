import React, { useEffect, useState, useCallback } from 'react';
import {
  Project,
  SafetyScoreResponse,
  PPEComplianceResponse,
  SafetyAnalyticsResponse,
  PPEViolation,
  IngestPPEPayload,
  IngestIncidentPayload,
  AlertLogItem
} from '../types';
import {
  getProjects,
  getSafetyScore,
  getPPECompliance,
  getSafetyAnalytics,
  getSafetyViolations,
  ingestPPEViolation,
  logSafetyIncident,
  getNotificationLogs,
  testNotificationChannel,
  downloadPDFReport,
  downloadCSVExport
} from '../api/api';
import { Navbar } from '../components/Navbar';
import { MetricCard } from '../components/MetricCard';
import { CVCameraStreamSimulator } from '../components/CVCameraStreamSimulator';
import { PPETypeBreakdown } from '../components/PPETypeBreakdown';
import { AccidentZonesAnalytics } from '../components/AccidentZonesAnalytics';
import { SimulatePPEModal } from '../components/SimulatePPEModal';
import { ReportIncidentModal } from '../components/ReportIncidentModal';
import { NotificationFeed } from '../components/NotificationFeed';
import { AICopilotDrawer } from '../components/AICopilotDrawer';
import { LiveAlertToast } from '../components/LiveAlertToast';
import { HardHat, ShieldCheck, AlertTriangle, Users, Camera, Clock, RefreshCw, ShieldAlert, Radio, Download, FileSpreadsheet } from 'lucide-react';

interface SafetyDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ activeTab, onTabChange }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);

  const [scoreData, setScoreData] = useState<SafetyScoreResponse | null>(null);
  const [complianceData, setComplianceData] = useState<PPEComplianceResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<SafetyAnalyticsResponse | null>(null);
  const [violations, setViolations] = useState<PPEViolation[]>([]);
  const [alerts, setAlerts] = useState<AlertLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

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

  const fetchDashboardData = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      const [scoreRes, compRes, analyticsRes, violationsRes, alertsRes] = await Promise.all([
        getSafetyScore(selectedProjectId),
        getPPECompliance(selectedProjectId),
        getSafetyAnalytics(selectedProjectId),
        getSafetyViolations(selectedProjectId),
        getNotificationLogs(selectedProjectId)
      ]);
      setScoreData(scoreRes);
      setComplianceData(compRes);
      setAnalyticsData(analyticsRes);
      setViolations(violationsRes);
      setAlerts(alertsRes);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch safety dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData();

    const timer = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  const handleIngestPPE = async (payload: IngestPPEPayload) => {
    try {
      await ingestPPEViolation(payload);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to ingest PPE violation:', err);
    }
  };

  const handleReportIncident = async (payload: IngestIncidentPayload) => {
    try {
      await logSafetyIncident(payload);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to log safety incident:', err);
    }
  };

  const handleTestNotificationChannel = async (channel: 'email' | 'sms' | 'webhook', message: string) => {
    try {
      await testNotificationChannel(channel, message, selectedProjectId);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to test notification channel:', err);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadPDFReport(selectedProjectId, 'executive');
      setToastMessage('Worker Safety Audit PDF downloaded successfully.');
    } catch (err) {
      console.error('PDF download error:', err);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      await downloadCSVExport(selectedProjectId, 'ppe');
      setToastMessage('Safety Violation Data CSV exported.');
    } catch (err) {
      console.error('CSV export error:', err);
    }
  };

  const getRatingBadge = (rating?: string) => {
    switch (rating?.toLowerCase()) {
      case 'excellent':
      case 'good':
        return 'low';
      case 'fair':
        return 'medium';
      case 'poor':
        return 'high';
      default:
        return 'critical';
    }
  };

  return (
    <div className="min-h-screen theme-bg flex flex-col transition-colors duration-300">
      <Navbar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onOpenIngestModal={() => setIsSimulateModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Safety Agent — Worker Protection Engine</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 font-mono uppercase">
                CV PPE Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Active Project: <strong className="text-slate-800 dark:text-slate-200">{scoreData?.project_name || 'Loading...'}</strong> • 
              Automated Computer Vision PPE tracking, repeat violator detection & multi-channel emergency escalations
            </p>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden md:flex items-center space-x-1">
              <RefreshCw className={`w-3 h-3 text-slate-400 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
              <span>Refreshed: {lastRefreshed.toLocaleTimeString()}</span>
            </span>

            {/* Simulate CV Detection */}
            <button
              onClick={() => setIsSimulateModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20 flex items-center space-x-1.5 hover:from-amber-400 hover:to-orange-500 transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Simulate CV Camera</span>
            </button>

            {/* Report Safety Incident */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25 flex items-center space-x-1.5 hover:from-rose-400 hover:to-red-500 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Incident</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 text-xs font-bold rounded-xl theme-card-bg border hover:border-emerald-500/50 transition flex items-center space-x-1.5 shadow-sm"
              title="Download Worker Safety PDF Report"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 text-xs font-bold rounded-xl theme-card-bg border hover:border-cyan-500/50 transition flex items-center space-x-1.5 shadow-sm"
              title="Export Safety Data CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-500" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* 1. Top KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Overall Safety Score"
            value={`${scoreData?.safety_score ?? '--'} / 100`}
            subtitle="Combined PPE compliance (60%) & incident history (40%)"
            icon={ShieldCheck}
            badgeText={scoreData?.safety_rating || 'Good'}
            badgeVariant={getRatingBadge(scoreData?.safety_rating)}
          />

          <MetricCard
            title="PPE Compliance Rate"
            value={`${scoreData?.ppe_compliance_rate ?? '--'}%`}
            subtitle="Hard hat, vest, boots & cut gloves verification"
            icon={HardHat}
            badgeText={`${scoreData?.ppe_compliance_rate ?? 0}% Compliance`}
            badgeVariant={scoreData && scoreData.ppe_compliance_rate >= 90 ? 'low' : 'medium'}
          />

          <MetricCard
            title="Active PPE Breaches"
            value={scoreData?.active_violations_count ?? 0}
            subtitle="Non-compliance events logged in last 30 days"
            icon={AlertTriangle}
            badgeText={`${scoreData?.active_violations_count ?? 0} Events`}
            badgeVariant={scoreData && scoreData.active_violations_count > 5 ? 'high' : 'medium'}
          />

          <MetricCard
            title="Workers Monitored"
            value={scoreData?.workers_monitored ?? 0}
            subtitle="Active badge tracking on site"
            icon={Users}
            badgeText="Live CV Feed"
            badgeVariant="neutral"
          />
        </div>

        {/* 2. YOLO Computer Vision Camera Stream Simulator */}
        <CVCameraStreamSimulator
          projectId={selectedProjectId}
          onIngestViolation={handleIngestPPE}
        />

        {/* 3. PPE Category Compliance Breakdown */}
        <PPETypeBreakdown complianceData={complianceData} />

        {/* 3. Accident Zones & Behavioral Analytics */}
        <AccidentZonesAnalytics analytics={analyticsData} />

        {/* 4. Notification & Escalation Audit Log (Milestone 2 Module 6) */}
        <NotificationFeed
          alerts={alerts}
          onTestChannel={handleTestNotificationChannel}
        />

        {/* 5. Computer Vision PPE Event Log */}
        <div className="glass-panel p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <Camera className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">
                  Computer Vision PPE Violation Event Log
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Live sensor stream of detected worker PPE non-compliance events across site zones
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">
              {violations.length} Events Ingested
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Worker Badge ID</th>
                  <th className="py-3 px-4">Violation Category</th>
                  <th className="py-3 px-4">Site Zone</th>
                  <th className="py-3 px-4">Detection Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {violations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No PPE violations detected. Full worker compliance maintained.
                    </td>
                  </tr>
                ) : (
                  violations.map((v) => (
                    <tr key={v.violation_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                        #PPE-{v.violation_id}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-amber-600 dark:text-amber-300">
                        {v.worker_id || 'W-UNIDENTIFIED'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          Missing {v.violation_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {v.zone || 'General Site'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          CV Camera Verified
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(v.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* CV Camera Ingest Simulation Modal */}
      <SimulatePPEModal
        projectId={selectedProjectId}
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onIngest={handleIngestPPE}
      />

      {/* Safety Incident & Near-Miss Escalation Modal */}
      <ReportIncidentModal
        projectId={selectedProjectId}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReport={handleReportIncident}
      />

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        projectId={selectedProjectId}
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Live Alert Toast */}
      {toastMessage && (
        <LiveAlertToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 mt-auto">
        BuildSure AI — Agentic Construction Risk Intelligence Platform
      </footer>
    </div>
  );
};
