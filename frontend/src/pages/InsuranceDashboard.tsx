import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { MetricCard } from '../components/MetricCard';
import { LogInsuranceCaseModal } from '../components/LogInsuranceCaseModal';
import { IngestDataModal } from '../components/IngestDataModal';
import {
  Project,
  InsuranceAssessmentResponse,
  InsuranceCase,
  IngestInsuranceCasePayload,
  IngestSiteRiskPayload
} from '../types';
import { AICopilotDrawer } from '../components/AICopilotDrawer';
import { LiveAlertToast } from '../components/LiveAlertToast';
import {
  getProjects,
  getInsuranceAssessment,
  getInsuranceCases,
  runInsuranceAssessment,
  ingestInsuranceCase,
  updateInsuranceCaseStatus,
  ingestSiteRisk,
  downloadPDFReport,
  downloadCSVExport
} from '../api/api';
import {
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  FileCheck2,
  Play,
  PlusCircle,
  TrendingDown,
  Building2,
  HardHat,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet
} from 'lucide-react';

interface InsuranceDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const InsuranceDashboard: React.FC<InsuranceDashboardProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);

  const [assessmentData, setAssessmentData] = useState<InsuranceAssessmentResponse | null>(null);
  const [casesList, setCasesList] = useState<InsuranceCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [isCaseModalOpen, setIsCaseModalOpen] = useState<boolean>(false);
  const [isSiteIngestOpen, setIsSiteIngestOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      const [assessRes, casesRes] = await Promise.all([
        getInsuranceAssessment(projectId),
        getInsuranceCases(projectId),
      ]);
      setAssessmentData(assessRes);
      setCasesList(casesRes);
    } catch (err) {
      console.error('Error loading insurance dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAssessment = async () => {
    setActionLoading(true);
    try {
      await runInsuranceAssessment(selectedProjectId);
      await loadDashboardData(selectedProjectId);
      setToastMessage('Underwriting risk assessment completed.');
    } catch (err) {
      console.error('Error running insurance assessment:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleIngestCase = async (payload: IngestInsuranceCasePayload) => {
    await ingestInsuranceCase(payload);
    await loadDashboardData(selectedProjectId);
    setToastMessage(`Registered claim exposure case: ${payload.claim_type}`);
  };

  const handleSiteIngest = async (payload: IngestSiteRiskPayload) => {
    await ingestSiteRisk(payload);
    await loadDashboardData(selectedProjectId);
    setToastMessage(`Ingested ${payload.severity} ${payload.risk_type} hazard.`);
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadPDFReport(selectedProjectId, 'insurance');
      setToastMessage('Insurance Underwriting Certificate PDF downloaded.');
    } catch (err) {
      console.error('PDF download error:', err);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      await downloadCSVExport(selectedProjectId, 'insurance');
      setToastMessage('Insurance Exposure Cases CSV exported.');
    } catch (err) {
      console.error('CSV export error:', err);
    }
  };

  const handleStatusChange = async (caseId: number, currentStatus: string) => {
    const statusCycle: Record<string, string> = {
      open: 'under_investigation',
      under_investigation: 'mitigated',
      mitigated: 'closed',
      closed: 'open',
    };
    const nextStatus = statusCycle[currentStatus.toLowerCase()] || 'open';
    try {
      await updateInsuranceCaseStatus(caseId, nextStatus);
      await loadDashboardData(selectedProjectId);
    } catch (err) {
      console.error('Error updating case status:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'closed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <CheckCircle2 className="w-3 h-3" />
            <span>Closed</span>
          </span>
        );
      case 'mitigated':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Mitigated</span>
          </span>
        );
      case 'under_investigation':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Under Investigation</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            <span>Open Case</span>
          </span>
        );
    }
  };

  const getClaimIcon = (claimType: string) => {
    switch (claimType) {
      case 'Workers Compensation':
        return <HardHat className="w-4 h-4 text-cyan-400" />;
      case 'General Liability':
        return <Building2 className="w-4 h-4 text-indigo-400" />;
      case 'Property Damage':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'Equipment Breakdown':
        return <Zap className="w-4 h-4 text-rose-400" />;
      default:
        return <Activity className="w-4 h-4 text-emerald-400" />;
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
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
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                Insurance Risk Intelligence
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Insurance Agent Exposure Intelligence
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Underwriting risk scoring, composite claim probability modeling, financial exposure analysis, and premium reduction strategy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsCaseModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl theme-input border hover:border-emerald-500/50 transition flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              <span>Register Claim</span>
            </button>

            <button
              onClick={handleRunAssessment}
              disabled={actionLoading}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center space-x-2 shadow-md"
            >
              <Play className="w-4 h-4" />
              <span>{actionLoading ? 'Assessing...' : 'Auto Underwrite'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 text-xs font-bold rounded-xl theme-card-bg border hover:border-emerald-500/50 transition flex items-center space-x-2"
              title="Download official Insurance Underwriting Certificate PDF"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 text-xs font-bold rounded-xl theme-card-bg border hover:border-cyan-500/50 transition flex items-center space-x-2"
              title="Export insurance cases data as CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 1. Top Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Insurance Risk Badge"
            value={assessmentData?.insurance_risk_badge || 'Loading...'}
            subtitle="Underwriter Risk Classification"
            badgeText={assessmentData?.badge_variant.toUpperCase() || 'EVALUATING'}
            badgeVariant={assessmentData?.badge_variant || 'low'}
            icon={ShieldCheck}
          />

          <MetricCard
            title="Composite Risk Score"
            value={assessmentData ? `${assessmentData.composite_insurance_risk_score}` : '--'}
            subtitle="Combined Site, Safety & Compliance Index"
            badgeText={assessmentData && assessmentData.composite_insurance_risk_score < 40 ? 'Low Risk' : 'High Exposure'}
            badgeVariant={assessmentData && assessmentData.composite_insurance_risk_score < 40 ? 'low' : 'critical'}
            icon={Activity}
          />

          <MetricCard
            title="Total Financial Exposure"
            value={assessmentData ? formatCurrency(assessmentData.total_estimated_exposure) : '--'}
            subtitle="Potential claim liability ($ USD)"
            badgeText="Estimated Exposure"
            badgeVariant="medium"
            icon={DollarSign}
          />

          <MetricCard
            title="Active Exposure Cases"
            value={assessmentData ? `${assessmentData.active_cases_count}` : '--'}
            subtitle="Open insurance claims"
            badgeText={assessmentData && assessmentData.active_cases_count === 0 ? 'Zero Open Claims' : 'Active Cases'}
            badgeVariant={assessmentData && assessmentData.active_cases_count === 0 ? 'low' : 'critical'}
            icon={AlertTriangle}
          />
        </div>

        {/* 2. Claim Risk Analysis Cards (By Claim Line) */}
        <div className="glass-panel rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <span>Claim Risk Analysis by Insurance Line</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Likelihood % and estimated financial exposure broken down across primary commercial insurance coverages
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full theme-card-bg border text-slate-700 dark:text-slate-300">
              5 Insurance Coverages
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {(assessmentData?.claim_risk_breakdown || []).map((claim) => {
              const isHigh = claim.claim_probability >= 60;
              const isMid = claim.claim_probability >= 35;
              const probColor = isHigh ? 'text-rose-500' : isMid ? 'text-amber-500' : 'text-emerald-500';

              return (
                <div
                  key={claim.claim_type}
                  className="theme-card-bg rounded-xl p-4 border hover:border-emerald-500/50 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="p-1.5 rounded-lg theme-input border">
                        {getClaimIcon(claim.claim_type)}
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={claim.claim_type}>
                        {claim.claim_type}
                      </p>
                    </div>

                    <div className="mt-3">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">Claim Likelihood</span>
                      <span className={`text-2xl font-black ${probColor}`}>{claim.claim_probability}%</span>
                    </div>

                    <div className="mt-2">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">Est. Exposure</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {formatCurrency(claim.estimated_exposure)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold mb-1">Key Factors:</span>
                    <ul className="text-[10px] text-slate-700 dark:text-slate-300 space-y-0.5">
                      {claim.driving_factors.slice(0, 2).map((factor, idx) => (
                        <li key={idx} className="truncate" title={factor}>
                          • {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Plain Language Risk Reduction Recommendations */}
        {assessmentData?.risk_reduction_recommendations && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingDown className="w-5 h-5 text-emerald-500" />
              <h3 className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">Underwriting Risk Reduction Strategy</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {assessmentData.risk_reduction_recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start space-x-2 theme-card-bg p-3 rounded-xl border">
                  <span className="text-emerald-500 font-bold font-mono">0{idx + 1}.</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Active Insurance Cases Table */}
        <div className="glass-panel rounded-2xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Insurance Exposure Claims & Case History</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active claim records, financial exposures, and underwriting investigation status
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full theme-card-bg border text-slate-700 dark:text-slate-300">
              {casesList.length} Registered Cases
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs font-medium">
              Loading insurance exposure cases...
            </div>
          ) : casesList.length === 0 ? (
            <div className="text-center py-12 theme-card-bg rounded-xl border">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Open Insurance Claims</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Execute automated underwriting assessment to evaluate site exposure.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Claim Line</th>
                    <th className="py-3 px-3">Estimated Exposure ($)</th>
                    <th className="py-3 px-3">Risk Score</th>
                    <th className="py-3 px-3">Claim Likelihood</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Underwriting Notes</th>
                    <th className="py-3 px-3 text-right">Action / Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {casesList.map((c) => (
                    <tr key={c.case_id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                        {getClaimIcon(c.claim_type)}
                        <span>{c.claim_type}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(c.estimated_exposure)}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {c.risk_score ? `${c.risk_score}/100` : '--'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {c.claim_probability ? `${c.claim_probability}%` : '--'}
                      </td>
                      <td className="py-3 px-3">{getStatusBadge(c.status)}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={c.description}>
                        {c.description || 'No detailed underwriting notes provided.'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleStatusChange(c.case_id, c.status)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg theme-card-bg hover:border-cyan-500 text-cyan-600 dark:text-cyan-400 border transition"
                          title="Cycle status: Open -> Investigation -> Mitigated -> Closed"
                        >
                          Cycle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <LogInsuranceCaseModal
        projectId={selectedProjectId}
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onIngest={handleIngestCase}
        onRunAssessment={handleRunAssessment}
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
