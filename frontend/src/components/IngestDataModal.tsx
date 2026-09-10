import React, { useState } from 'react';
import { IngestSiteRiskPayload } from '../types';
import { X, ShieldAlert, Video } from 'lucide-react';

interface IngestDataModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onIngest: (payload: IngestSiteRiskPayload) => Promise<void>;
}

export const IngestDataModal: React.FC<IngestDataModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onIngest,
}) => {
  const [riskType, setRiskType] = useState('fall');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [zone, setZone] = useState('Scaffolding Tower');
  const [description, setDescription] = useState('');
  const [probability, setProbability] = useState(4);
  const [impact, setImpact] = useState(4);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onIngest({
        project_id: projectId,
        risk_type: riskType,
        severity,
        zone,
        description: description || `Simulated ${severity} ${riskType} hazard detected in ${zone}.`,
        probability,
        impact,
        mitigated: false,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="theme-card-bg border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg theme-badge">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Simulate CCTV Hazard Stream</h3>
              <p className="text-xs text-slate-400">Ingest real-time site monitoring payload into Site Risk Agent</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Hazard Category</label>
              <select
                value={riskType}
                onChange={(e) => setRiskType(e.target.value)}
                className="w-full theme-input border rounded-lg p-2.5 font-medium cursor-pointer"
              >
                <option value="fall" className="bg-slate-900 text-slate-100">Fall Hazard</option>
                <option value="equipment" className="bg-slate-900 text-slate-100">Equipment & Machinery</option>
                <option value="electrical" className="bg-slate-900 text-slate-100">Electrical Exposure</option>
                <option value="environmental" className="bg-slate-900 text-slate-100">Environmental Hazard</option>
                <option value="structural" className="bg-slate-900 text-slate-100">Structural Bracing</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Severity Rating</label>
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
            <label className="block font-semibold mb-1">Site Zone Location</label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="e.g. Scaffolding Tower, Excavation Zone"
              className="w-full theme-input border rounded-lg p-2.5 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">
                Probability (1-5): <span className="text-cyan-400 font-mono font-bold">{probability}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Impact Severity (1-5): <span className="text-rose-400 font-mono font-bold">{impact}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={impact}
                onChange={(e) => setImpact(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Hazard Description / CCTV Notes</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe detected hazard condition..."
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
              <span>{loading ? 'Ingesting...' : 'Ingest Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
