import React, { useState } from 'react';
import { IngestInsuranceCasePayload } from '../types';
import { X, ShieldCheck, DollarSign } from 'lucide-react';

interface LogInsuranceCaseModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onIngest: (payload: IngestInsuranceCasePayload) => Promise<void>;
  onRunAssessment: () => Promise<void>;
}

export const LogInsuranceCaseModal: React.FC<LogInsuranceCaseModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onIngest,
  onRunAssessment,
}) => {
  const [claimType, setClaimType] = useState('General Liability');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [estimatedExposure, setEstimatedExposure] = useState(150000);
  const [riskScore, setRiskScore] = useState(65);
  const [claimProbability, setClaimProbability] = useState(60);
  const [status, setStatus] = useState<'open' | 'under_investigation' | 'mitigated' | 'closed'>('open');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onIngest({
        project_id: projectId,
        claim_type: claimType,
        severity,
        estimated_exposure: Number(estimatedExposure),
        risk_score: Number(riskScore),
        claim_probability: Number(claimProbability),
        status,
        description: description || `Insurance claim analysis for ${claimType} exposure.`,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentClick = async () => {
    setAssessmentLoading(true);
    try {
      await onRunAssessment();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setAssessmentLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="theme-card-bg border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg theme-badge">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Insurance Exposure Analysis</h3>
              <p className="text-xs text-slate-400">Register claim risk case or run automated AI underwriting assessment</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Banner */}
        <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-300">Automated Risk Assessment</p>
            <p className="text-[11px] text-slate-400">Fuse site hazard, safety, & compliance data to compute exposures</p>
          </div>
          <button
            type="button"
            onClick={handleAssessmentClick}
            disabled={assessmentLoading}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
          >
            {assessmentLoading ? 'Assessing...' : 'Run Auto Assessment'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Claim Type Line</label>
              <select
                value={claimType}
                onChange={(e) => setClaimType(e.target.value)}
                className="w-full theme-input border rounded-lg p-2.5 font-medium cursor-pointer"
              >
                <option value="Workers Compensation" className="bg-slate-900 text-slate-100">Workers Compensation</option>
                <option value="General Liability" className="bg-slate-900 text-slate-100">General Liability</option>
                <option value="Property Damage" className="bg-slate-900 text-slate-100">Property Damage</option>
                <option value="Equipment Breakdown" className="bg-slate-900 text-slate-100">Equipment Breakdown</option>
                <option value="Environmental Liability" className="bg-slate-900 text-slate-100">Environmental Liability</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Exposure Severity</label>
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
          </div>

          <div>
            <label className="block font-semibold mb-1">Estimated Financial Exposure ($ USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">$</span>
              <input
                type="number"
                min={0}
                step={5000}
                value={estimatedExposure}
                onChange={(e) => setEstimatedExposure(Number(e.target.value))}
                className="w-full theme-input border rounded-lg p-2.5 pl-7 font-medium font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">
                Risk Score (0-100): <span className="text-amber-400 font-mono font-bold">{riskScore}</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={riskScore}
                onChange={(e) => setRiskScore(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Claim Likelihood (%): <span className="text-rose-400 font-mono font-bold">{claimProbability}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={claimProbability}
                onChange={(e) => setClaimProbability(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full theme-input border rounded-lg p-2.5 font-medium cursor-pointer"
            >
              <option value="open" className="bg-slate-900 text-slate-100">Open</option>
              <option value="under_investigation" className="bg-slate-900 text-slate-100">Under Investigation</option>
              <option value="mitigated" className="bg-slate-900 text-slate-100">Mitigated</option>
              <option value="closed" className="bg-slate-900 text-slate-100">Closed</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Case Description & Notes</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Underwriting assessment notes and financial impact factors..."
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
              <DollarSign className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Register Exposure Case'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
