import React, { useState } from 'react';
import { IngestIncidentPayload } from '../types';
import { X, AlertTriangle, ShieldAlert, Zap } from 'lucide-react';

interface ReportIncidentModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onReport: (payload: IngestIncidentPayload) => Promise<void>;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onReport,
}) => {
  const [incidentType, setIncidentType] = useState('near_miss');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [zone, setZone] = useState('Scaffolding Tower B');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onReport({
        project_id: projectId,
        incident_type: incidentType,
        severity,
        zone,
        description: description || undefined,
      });
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Failed to log safety incident:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="theme-card-bg border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/80 bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white">Log Site Safety Incident / Near-Miss</h3>
              <p className="text-xs text-slate-400">Triggers multi-channel escalation alerts for High/Critical severities</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-300">Incident Category</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full theme-input rounded-xl p-2.5 font-medium border"
              >
                <option value="near_miss">Near Miss (Close Call)</option>
                <option value="slip_trip">Slip, Trip & Fall</option>
                <option value="falling_object">Falling Object Breach</option>
                <option value="equipment_contact">Heavy Machinery / Vehicle Contact</option>
                <option value="electrical_hazard">Electrical / Energized Exposure</option>
                <option value="structural_instability">Excavation / Trench Cave-in</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-300">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full theme-input rounded-xl p-2.5 font-medium border"
              >
                <option value="critical">🚨 Critical (SMS + Email + Webhook)</option>
                <option value="high">⚠️ High (Email + Webhook)</option>
                <option value="medium">⚡ Medium (Webhook Notification)</option>
                <option value="low">ℹ️ Low (Shift Audit Log)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-300">Site Zone / Camera Location</label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="e.g. Scaffolding Tower B, Excavation Shaft #3"
              className="w-full theme-input rounded-xl p-2.5 font-medium border"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-300">Incident Description & Observation Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, immediate actions taken, and machinery or personnel involved..."
              rows={3}
              className="w-full theme-input rounded-xl p-2.5 font-medium border"
            />
          </div>

          {/* Escalation Policy Banner */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start space-x-2">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>BuildSure Escalation Engine</strong>: Critical severity instantly pages the Safety Officer via Twilio SMS and sends executive SMTP alert emails.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-700/80 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold hover:from-rose-400 hover:to-red-500 shadow-md shadow-rose-500/25 flex items-center space-x-2 transition"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{loading ? 'Dispatching...' : 'Log & Escalate Incident'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
