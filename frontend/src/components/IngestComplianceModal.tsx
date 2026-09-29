import React, { useState } from 'react';
import { IngestCompliancePayload } from '../types';
import { X, FileCheck2, ShieldAlert } from 'lucide-react';

interface IngestComplianceModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onIngest: (payload: IngestCompliancePayload) => Promise<void>;
  onRunWorkflow: () => Promise<void>;
}

export const IngestComplianceModal: React.FC<IngestComplianceModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onIngest,
  onRunWorkflow,
}) => {
  const [regulationName, setRegulationName] = useState('OSHA 1926.501 - Fall Protection Standard');
  const [category, setCategory] = useState('Fall Protection');
  const [status, setStatus] = useState<'compliant' | 'non_compliant' | 'pending_review'>('non_compliant');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [description, setDescription] = useState('');
  const [remediationPlan, setRemediationPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onIngest({
        project_id: projectId,
        regulation_name: regulationName,
        category,
        compliance_status: status,
        severity,
        description: description || `Inspection check for ${regulationName} (${category}).`,
        remediation_plan: remediationPlan || 'Execute standard site remediation protocol.',
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowClick = async () => {
    setWorkflowLoading(true);
    try {
      await onRunWorkflow();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setWorkflowLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="theme-card-bg border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg theme-badge">
              <FileCheck2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Regulatory Compliance Inspection</h3>
              <p className="text-xs text-slate-400">Log manual OSHA check or trigger AI regulatory workflow</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Banner */}
        <div className="p-4 bg-cyan-500/10 border-b border-cyan-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-cyan-300">Automated Regulatory Validation</p>
            <p className="text-[11px] text-slate-400">Scan active hazards and auto-generate compliance checks</p>
          </div>
          <button
            type="button"
            onClick={handleWorkflowClick}
            disabled={workflowLoading}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition"
          >
            {workflowLoading ? 'Validating...' : 'Run Auto Validation'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Regulation Standard Name</label>
            <input
              type="text"
              value={regulationName}
              onChange={(e) => setRegulationName(e.target.value)}
              placeholder="e.g. OSHA 1926.501 - Fall Protection Standard"
              className="w-full theme-input border rounded-lg p-2.5 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Regulatory Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full theme-input border rounded-lg p-2.5 font-medium cursor-pointer"
              >
                <option value="Fall Protection" className="bg-slate-900 text-slate-100">Fall Protection</option>
                <option value="PPE Adherence" className="bg-slate-900 text-slate-100">PPE Adherence</option>
                <option value="Structural & Scaffold" className="bg-slate-900 text-slate-100">Structural & Scaffold</option>
                <option value="Environmental & Hazmat" className="bg-slate-900 text-slate-100">Environmental & Hazmat</option>
                <option value="Electrical Safety" className="bg-slate-900 text-slate-100">Electrical Safety</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Compliance Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full theme-input border rounded-lg p-2.5 font-medium cursor-pointer"
              >
                <option value="compliant" className="bg-slate-900 text-slate-100">Compliant</option>
                <option value="non_compliant" className="bg-slate-900 text-slate-100">Non-Compliant</option>
                <option value="pending_review" className="bg-slate-900 text-slate-100">Pending Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Severity Assessment</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full theme-input border rounded-lg p-2.5 font-medium cursor-pointer"
            >
              <option value="low" className="bg-slate-900 text-slate-100">Low</option>
              <option value="medium" className="bg-slate-900 text-slate-100">Medium</option>
              <option value="high" className="bg-slate-900 text-slate-100">High</option>
              <option value="critical" className="bg-slate-900 text-slate-100">Critical</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Finding Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of regulatory check or violation..."
              className="w-full theme-input border rounded-lg p-2.5 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Recommended Remediation Action</label>
            <textarea
              rows={2}
              value={remediationPlan}
              onChange={(e) => setRemediationPlan(e.target.value)}
              placeholder="Action plan required to resolve non-compliance..."
              className="w-full theme-input border rounded-lg p-2.5 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-700/80 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg theme-input font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg theme-accent-btn font-bold flex items-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Log Inspection Check'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
