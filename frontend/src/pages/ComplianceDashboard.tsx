import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { MetricCard } from '../components/MetricCard';
import { IngestComplianceModal } from '../components/IngestComplianceModal';
import { IngestDataModal } from '../components/IngestDataModal';
import { AICopilotDrawer } from '../components/AICopilotDrawer';
import { LiveAlertToast } from '../components/LiveAlertToast';
import {
  Project,
  ComplianceScoreResponse,
  CategoryComplianceBreakdown,
  ComplianceCheck,
  RegulatoryReportResponse,
  IngestCompliancePayload,
  IngestSiteRiskPayload
} from '../types';
import {
  getProjects,
  getComplianceScore,
  getComplianceByCategory,
  getOpenComplianceViolations,
  getRegulatoryReport,
  runRegulatoryValidation,
  ingestComplianceCheck,
  ingestSiteRisk,
  downloadPDFReport,
  downloadCSVExport
} from '../api/api';
import {
  FileCheck2,
  AlertTriangle,
  ClipboardCheck,
  ShieldAlert,
  Play,
  Download,
  PlusCircle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  FileSpreadsheet,
  Bot
} from 'lucide-react';

interface ComplianceDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);

  const [scoreData, setScoreData] = useState<ComplianceScoreResponse | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryComplianceBreakdown[]>([]);
  const [openViolations, setOpenViolations] = useState<ComplianceCheck[]>([]);
  const [reportData, setReportData] = useState<RegulatoryReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [isSiteIngestOpen, setIsSiteIngestOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadDashboardData(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].project_id);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const loadDashboardData = async (projectId: number) => {
    setLoading(true);
    try {
      const [scoreRes, catRes, violRes] = await Promise.all([
        getComplianceScore(projectId),
        getComplianceByCategory(projectId),
        getOpenComplianceViolations(projectId),
      ]);
      setScoreData(scoreRes);
      setCategoryBreakdown(catRes);
      setOpenViolations(violRes);
    } catch (err) {
      console.error('Error loading compliance dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunValidation = async () => {
    setActionLoading(true);
    try {
      await runRegulatoryValidation(selectedProjectId);
      await loadDashboardData(selectedProjectId);
      setToastMessage('Automated regulatory validation completed successfully.');
    } catch (err) {
      console.error('Error running validation:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleIngestCheck = async (payload: IngestCompliancePayload) => {
    await ingestComplianceCheck(payload);
    await loadDashboardData(selectedProjectId);
    setToastMessage(`Logged inspection check: ${payload.regulation_name}`);
  };

  const handleSiteIngest = async (payload: IngestSiteRiskPayload) => {
    await ingestSiteRisk(payload);
    await loadDashboardData(selectedProjectId);
    setToastMessage(`Ingested ${payload.severity} ${payload.risk_type} hazard.`);
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadPDFReport(selectedProjectId, 'compliance');
      setToastMessage('Compliance Audit Report PDF downloaded successfully.');
    } catch (err) {
      console.error('PDF download error:', err);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      await downloadCSVExport(selectedProjectId, 'compliance');
      setToastMessage('Compliance Data CSV spreadsheet exported.');
    } catch (err) {
      console.error('CSV export error:', err);
    }
  };

  const handleGenerateReport = async () => {
    setActionLoading(true);
    try {
      const rep = await getRegulatoryReport(selectedProjectId);
      setReportData(rep);
      setReportModalOpen(true);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Compliant</span>
          </span>
        );
      case 'non_compliant':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>Non-Compliant</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  const getSeverityBadge = (severity?: string) => {
    const sev = (severity || 'medium').toLowerCase();
    switch (sev) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Low</span>;
    }
  };

  return (
    <div className="min-h-screen theme-bg text-slate-900 dark:text-slate-100 font-sans pb-12 transition-colors duration-300">
      {/* Navigation Header */}
      <Navbar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onOpenIngestModal={() => setIsSiteIngestOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Page Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
                Compliance Intelligence Platform
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Compliance Agent Intelligence
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Autonomous OSHA & ISO 45001 regulatory validation workflows, audit readiness tracking, and compliance remediation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsIngestModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl theme-input border hover:border-cyan-500/50 transition flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Log Check</span>
            </button>

            <button
              onClick={handleRunValidation}
              disabled={actionLoading}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition flex items-center space-x-2 shadow-md"
            >
              <Play className="w-4 h-4" />
              <span>{actionLoading ? 'Validating...' : 'Auto Validate'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition flex items-center space-x-2"
              title="Download official OSHA Regulatory Compliance PDF Report"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition flex items-center space-x-2"
              title="Export compliance checks data as CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 1. Top Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Compliance Score"
            value={scoreData ? `${scoreData.compliance_score}` : '--'}
            subtitle="0-100 Regulatory Adherence Index"
            badgeText={scoreData?.compliance_rating || 'Loading'}
            badgeVariant={
              scoreData && scoreData.compliance_score >= 90
                ? 'low'
                : scoreData && scoreData.compliance_score >= 75
                ? 'medium'
                : 'critical'
            }
            icon={FileCheck2}
            trend="+1.8% vs last audit"
          />

          <MetricCard
            title="Open Regulatory Violations"
            value={scoreData ? `${scoreData.open_violations_count}` : '--'}
            subtitle="Active OSHA non-compliance items"
            badgeText={scoreData && scoreData.open_violations_count === 0 ? 'Compliant' : 'Remediation Required'}
            badgeVariant={scoreData && scoreData.open_violations_count === 0 ? 'low' : 'critical'}
            icon={AlertTriangle}
          />

          <MetricCard
            title="Audit Readiness Index"
            value={scoreData ? `${scoreData.audit_readiness_pct}%` : '--'}
            subtitle="Inspection readiness rating"
            badgeText={scoreData?.audit_status || 'Checking'}
            badgeVariant={
              scoreData && scoreData.audit_readiness_pct >= 85
                ? 'low'
                : scoreData && scoreData.audit_readiness_pct >= 60
                ? 'medium'
                : 'critical'
            }
            icon={ClipboardCheck}
          />

          <MetricCard
            title="Monitored Standards"
            value={scoreData ? `${scoreData.regulations_monitored_count}` : '--'}
            subtitle="OSHA & ISO frameworks active"
            badgeText="OSHA / ISO 45001"
            badgeVariant="low"
            icon={ShieldAlert}
          />
        </div>

        {/* 2. Category Compliance Breakdown */}
        <div className="glass-panel rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-cyan-500" />
                <span>Compliance by Regulatory Category</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Breakdown of pass/fail inspection rates across standard safety categories
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full theme-card-bg border text-slate-700 dark:text-slate-300">
              5 Primary Categories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {categoryBreakdown.map((cat) => {
              const isHigh = cat.compliance_rate >= 85;
              const isMid = cat.compliance_rate >= 60;
              const barColor = isHigh ? 'bg-emerald-500' : isMid ? 'bg-amber-500' : 'bg-rose-500';
              const textColor = isHigh ? 'text-emerald-500' : isMid ? 'text-amber-500' : 'text-rose-500';

              return (
                <div
                  key={cat.category}
                  className="theme-card-bg rounded-xl p-4 border hover:border-cyan-500/50 transition"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={cat.category}>
                    {cat.category}
                  </p>

                  <div className="mt-2 flex items-baseline justify-between">
                    <span className={`text-2xl font-black ${textColor}`}>{cat.compliance_rate}%</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {cat.compliant_checks}/{cat.total_checks} Pass
                    </span>
                  </div>

                  <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.max(5, cat.compliance_rate)}%` }}
                    />
                  </div>

                  {cat.non_compliant_checks > 0 && (
                    <div className="mt-2 text-[10px] text-rose-500 font-semibold flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{cat.non_compliant_checks} open finding(s)</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Open Regulatory Violations & Inspections Table */}
        <div className="glass-panel rounded-2xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Open Regulatory Findings & Remediation Workflows</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active OSHA non-compliance flags generated from automated workflow and site inspections
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
              {openViolations.length} Active Findings
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs font-medium">
              Loading regulatory compliance records...
            </div>
          ) : openViolations.length === 0 ? (
            <div className="text-center py-12 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-emerald-500">Full Regulatory Compliance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No open OSHA non-compliance flags detected for this project.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Standard & Regulation</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Severity</th>
                    <th className="py-3 px-3">Finding Description</th>
                    <th className="py-3 px-3">Required Remediation Plan</th>
                    <th className="py-3 px-3 text-right">Logged At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {openViolations.map((v) => (
                    <tr key={v.compliance_id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-cyan-500 shrink-0" />
                        <span>{v.regulation_name}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{v.category}</td>
                      <td className="py-3 px-3">{getStatusBadge(v.compliance_status)}</td>
                      <td className="py-3 px-3">{getSeverityBadge(v.severity)}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={v.description}>
                        {v.description || 'No detailed description provided.'}
                      </td>
                      <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400 font-medium max-w-xs truncate" title={v.remediation_plan}>
                        {v.remediation_plan || 'Standard remediation protocol.'}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(v.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Regulatory Report Modal */}
      {reportModalOpen && reportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="theme-card-bg border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-700/80 flex items-center justify-between bg-slate-900">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-base text-white">Regulatory Audit Report Payload</h3>
                  <p className="text-xs text-slate-400">Generated for {reportData.project_name}</p>
                </div>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                <p className="font-bold text-cyan-400 text-sm mb-1">Executive Summary</p>
                <p className="text-slate-300 leading-relaxed">{reportData.executive_summary}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Compliance Score</span>
                  <span className="text-xl font-black text-cyan-400">{reportData.compliance_score}/100</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Audit Readiness</span>
                  <span className="text-xl font-black text-emerald-400">{reportData.audit_readiness_pct}%</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Open Violations</span>
                  <span className="text-xl font-black text-rose-400">{reportData.open_violations_count}</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-200 mb-2">Monitored Standards Category Breakdown</p>
                <div className="space-y-2">
                  {reportData.category_breakdown.map((cat: CategoryComplianceBreakdown) => (
                    <div key={cat.category} className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded border border-slate-800">
                      <span className="font-medium text-slate-300">{cat.category}</span>
                      <span className="font-mono font-bold text-cyan-400">{cat.compliance_rate}% Pass ({cat.compliant_checks}/{cat.total_checks})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-700/80 flex justify-end space-x-3 bg-slate-900">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <IngestComplianceModal
        projectId={selectedProjectId}
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onIngest={handleIngestCheck}
        onRunWorkflow={handleRunValidation}
      />

      <IngestDataModal
        projectId={selectedProjectId}
        isOpen={isSiteIngestOpen}
        onClose={() => setIsSiteIngestOpen(false)}
        onIngest={handleSiteIngest}
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
    </div>
  );
};
