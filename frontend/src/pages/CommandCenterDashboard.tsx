import React, { useEffect, useState, useCallback } from 'react';
import {
  Project,
  ExecutiveDashboardResponse,
  LangGraphOrchestrationResponse,
  AlertLogItem,
  IngestSiteRiskPayload
} from '../types';
import {
  getProjects,
  getExecutiveDashboardData,
  runOrchestrationPipeline,
  executeAutomatedRemediation,
  getNotificationLogs,
  ingestSiteRisk,
  downloadPDFReport,
  downloadCSVExport
} from '../api/api';
import { Navbar } from '../components/Navbar';
import { MetricCard } from '../components/MetricCard';
import { RiskPropagationTopology } from '../components/RiskPropagationTopology';
import { AICopilotDrawer } from '../components/AICopilotDrawer';
import { IngestDataModal } from '../components/IngestDataModal';
import { LiveAlertToast } from '../components/LiveAlertToast';
import {
  LayoutDashboard,
  ShieldAlert,
  HardHat,
  FileCheck2,
  ShieldCheck,
  Bot,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Clock,
  Radio,
  Sparkles,
  Play,
  DollarSign,
  TrendingDown,
  Cpu,
  Layers,
  Zap
} from 'lucide-react';

import { useWebSocketAlerts } from '../hooks/useWebSocketAlerts';

interface CommandCenterDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const CommandCenterDashboard: React.FC<CommandCenterDashboardProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);

  const [execData, setExecData] = useState<ExecutiveDashboardResponse | null>(null);
  const [orchestrationResult, setOrchestrationResult] = useState<LangGraphOrchestrationResponse | null>(null);
  const [alerts, setAlerts] = useState<AlertLogItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [pipelineRunning, setPipelineRunning] = useState<boolean>(false);
  const [remediationRunning, setRemediationRunning] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Real-Time WebSockets Integration
  const handleNewWsAlert = useCallback((newAlert: AlertLogItem) => {
    setAlerts((prev) => [newAlert, ...prev]);
    setToastMessage(`⚡ REAL-TIME ALERT [${newAlert.severity.toUpperCase()}]: ${newAlert.message || newAlert.alert_type}`);
  }, []);

  const { isConnected: wsConnected } = useWebSocketAlerts({
    projectId: selectedProjectId,
    onNewAlert: handleNewWsAlert,
    enableSound: true,
  });

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
      const [execRes, alertsRes] = await Promise.all([
        getExecutiveDashboardData(selectedProjectId),
        getNotificationLogs(selectedProjectId)
      ]);
      setExecData(execRes);
      setAlerts(alertsRes);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch Command Center data:', err);
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

  const handleRunLangGraph = async () => {
    setPipelineRunning(true);
    try {
      const result = await runOrchestrationPipeline(selectedProjectId);
      setOrchestrationResult(result);
      await fetchDashboardData();
      setToastMessage('LangGraph Multi-Agent Construction Risk Pipeline executed successfully!');
    } catch (err) {
      console.error('LangGraph orchestration failure:', err);
      setToastMessage('Failed to execute LangGraph pipeline. Ensure backend is active.');
    } finally {
      setPipelineRunning(false);
    }
  };

  const handleExecuteRemediation = async () => {
    setRemediationRunning(true);
    try {
      const res = await executeAutomatedRemediation(selectedProjectId);
      if (res.post_remediation_pipeline) {
        setOrchestrationResult(res.post_remediation_pipeline);
      }
      await fetchDashboardData();
      setToastMessage(`AUTONOMOUS REMEDIATION COMPLETE: Mitigated ${res.mitigated_hazards_count} site hazards & resolved ${res.resolved_compliance_checks_count} compliance findings!`);
    } catch (err) {
      console.error('Autonomous remediation failure:', err);
      setToastMessage('Failed to execute autonomous remediation.');
    } finally {
      setRemediationRunning(false);
    }
  };

  const handleIngestHazard = async (payload: IngestSiteRiskPayload) => {
    try {
      await ingestSiteRisk(payload);
      await fetchDashboardData();
      setToastMessage(`Hazard Ingested: ${payload.severity} ${payload.risk_type}`);
    } catch (err) {
      console.error('Failed to ingest hazard payload:', err);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadPDFReport(selectedProjectId, 'executive');
      setToastMessage('Executive Risk Intelligence PDF Report downloaded.');
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      await downloadCSVExport(selectedProjectId, 'compliance');
      setToastMessage('Executive Data CSV Spreadsheet exported.');
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen theme-bg flex flex-col transition-colors duration-300">
      {/* Navigation Header */}
      <Navbar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Executive Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel shadow-md">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 flex items-center space-x-1">
                <Radio className="w-3 h-3 animate-pulse text-cyan-500" />
                <span>LangGraph Mission Control</span>
              </span>
              <span className={`text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${
                wsConnected
                  ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span>{wsConnected ? 'WebSocket Stream Connected (0ms)' : 'Connecting Stream...'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Autonomous orchestration across 5 AI agents: <strong>Site Risk</strong>, <strong>Safety Protection</strong>, <strong>OSHA Compliance</strong>, <strong>Insurance Exposure</strong> & <strong>Reporting Intelligence</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleExecuteRemediation}
              disabled={remediationRunning}
              className="px-4 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2"
            >
              <Zap className={`w-4 h-4 ${remediationRunning ? 'animate-bounce' : ''}`} />
              <span>{remediationRunning ? 'Remediating...' : 'Autonomous Remediation'}</span>
            </button>

            <button
              onClick={handleRunLangGraph}
              disabled={pipelineRunning}
              className="px-4 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition flex items-center space-x-2"
            >
              <Cpu className={`w-4 h-4 ${pipelineRunning ? 'animate-spin' : ''}`} />
              <span>{pipelineRunning ? 'Orchestrating...' : 'Execute LangGraph Pipeline'}</span>
            </button>

            <button
              onClick={() => setIsCopilotOpen(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 transition flex items-center space-x-1.5 shadow-sm"
            >
              <Bot className="w-4 h-4" />
              <span>AI Copilot</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 text-xs font-bold rounded-xl theme-card-bg border hover:border-emerald-500/50 transition flex items-center space-x-1.5 shadow-sm"
              title="Download Executive Risk Summary PDF"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">PDF Report</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 text-xs font-bold rounded-xl theme-card-bg border hover:border-cyan-500/50 transition flex items-center space-x-1.5 shadow-sm"
              title="Export Multi-Agent Data CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* 1. Executive Key Performance Indicators (Milestone 4 Required Metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Project Risk Score"
            value={execData ? `${execData.project_risk_score} / 100` : '--'}
            subtitle="Combined multi-agent weighted risk index"
            icon={ShieldAlert}
            badgeText={execData?.overall_status || 'Optimal'}
            badgeVariant={
              execData?.overall_status === 'Critical'
                ? 'critical'
                : execData?.overall_status === 'High Risk'
                ? 'high'
                : 'low'
            }
          />

          <MetricCard
            title="Incidents Prevented"
            value={execData ? `${execData.incidents_prevented}` : '--'}
            subtitle="Model-mitigated hazards & resolved checks"
            icon={CheckCircle2}
            badgeText={`${execData?.incidents_prevented ?? 0} Mitigated`}
            badgeVariant="low"
          />

          <MetricCard
            title="Compliance Improvement"
            value={execData ? `+${execData.compliance_improvement_pct}%` : '--'}
            subtitle="Adherence vs baseline OSHA inspection rate"
            icon={TrendingUp}
            badgeText="OSHA & ISO 45001"
            badgeVariant="low"
            trend={`+${execData?.compliance_improvement_pct ?? 0}%`}
            trendPositive={true}
          />

          <MetricCard
            title="Financial Cost Savings"
            value={execData ? formatCurrency(execData.cost_savings_usd) : '--'}
            subtitle="Avoided OSHA penalties & claim exposure"
            icon={DollarSign}
            badgeText="Estimated Savings"
            badgeVariant="low"
          />
        </div>

        {/* 2. Interactive Multi-Agent Risk Propagation Topology Graph */}
        <RiskPropagationTopology
          execData={execData}
          orchestrationResult={orchestrationResult}
        />

        {/* 2. LangGraph Pipeline Execution State Flow */}
        {orchestrationResult && (
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 shadow-xl bg-gradient-to-r from-cyan-950/20 to-blue-950/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-cyan-400 animate-bounce" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  LangGraph Orchestration State Timeline
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                {orchestrationResult.pipeline_status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {orchestrationResult.langgraph_execution_path.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl theme-card-bg border border-cyan-500/30 text-[11px] font-bold text-center text-slate-800 dark:text-cyan-300 shadow-sm flex flex-col justify-between"
                >
                  <span className="text-[10px] text-slate-400 block font-mono">Step 0{idx + 1}</span>
                  <span className="mt-1 leading-tight">{step.replace(/^\d+\.\s*/, '')}</span>
                </div>
              ))}
            </div>

            {/* Risk Propagation Events */}
            {orchestrationResult.risk_propagation_events.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2 text-xs">
                <span className="font-extrabold text-cyan-400 block text-xs">
                  Cross-Agent Risk Propagation Events Triggered:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {orchestrationResult.risk_propagation_events.map((evt, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/80 flex items-start space-x-2">
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-200 block">{evt.source} → {evt.target}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{evt.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Per-Agent Performance Grid (Milestone 4 Requirement) */}
        <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Per-Agent Performance & Operational Status Grid
              </h2>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
              5 Autonomous AI Agents Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(execData?.per_agent_performance || []).map((ag) => (
              <div
                key={ag.agent_id}
                className="p-4 rounded-xl theme-card-bg border hover:border-cyan-500/50 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate" title={ag.agent_name}>
                      {ag.agent_name}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{ag.score}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-bold border border-cyan-500/20">
                      {ag.rating}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Active Items:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{ag.active_items}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Accuracy Rating:</span>
                    <span className="font-bold text-emerald-500">{ag.accuracy_pct}%</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Avg Latency:</span>
                    <span className="font-bold font-mono text-cyan-500">{ag.avg_response_ms}ms</span>
                  </div>
                </div>

                <button
                  onClick={() => onTabChange(ag.agent_id === 'reporting' ? 'command-center' : ag.agent_id)}
                  className="w-full mt-2 py-1.5 text-xs font-bold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 transition flex items-center justify-center space-x-1"
                >
                  <span>Agent View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Live System Activity & Escalation Log */}
        <div className="glass-panel p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Live Multi-Agent Audit Log & Escalation Stream
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {alerts.length} Events Ingested
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-72">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No active notifications logged. System operations nominal.
              </div>
            ) : (
              alerts.map((item) => (
                <div
                  key={item.alert_id}
                  className="p-3 rounded-xl theme-card-bg border flex items-center justify-between text-xs transition hover:border-slate-400 dark:hover:border-slate-600"
                >
                  <div className="flex items-center space-x-3">
                    <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.message || item.alert_type}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        Type: {item.alert_type.toUpperCase()} • Severity: {item.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Ingest Hazard Modal */}
      <IngestDataModal
        projectId={selectedProjectId}
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onIngest={handleIngestHazard}
      />

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        projectId={selectedProjectId}
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Live Toast Alert */}
      {toastMessage && (
        <LiveAlertToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 mt-auto">
        BuildSure AI — Agentic Construction Risk Intelligence Platform
      </footer>
    </div>
  );
};
