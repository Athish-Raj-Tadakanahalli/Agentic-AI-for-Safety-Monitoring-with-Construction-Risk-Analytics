import React, { useState } from 'react';
import { IngestPPEPayload } from '../types';
import { X, HardHat, Camera } from 'lucide-react';

interface SimulatePPEModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onIngest: (payload: IngestPPEPayload) => Promise<void>;
}

export const SimulatePPEModal: React.FC<SimulatePPEModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onIngest,
}) => {
  const [workerId, setWorkerId] = useState('W-104');
  const [violationType, setViolationType] = useState<'hard hat' | 'vest' | 'boots' | 'gloves'>('hard hat');
  const [zone, setZone] = useState('Scaffolding Tower');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onIngest({
        project_id: projectId,
        worker_id: workerId,
        violation_type: violationType,
        zone,
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
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-slate-850">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Simulate CV Camera PPE Detector</h3>
              <p className="text-xs text-slate-400">Ingest Computer Vision PPE detection event</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Worker Badge / Tracking ID</label>
            <input
              type="text"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="e.g. W-104, W-209"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2.5 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Missing PPE Category</label>
            <select
              value={violationType}
              onChange={(e) => setViolationType(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2.5 font-medium"
            >
              <option value="hard hat">Missing Hard Hat</option>
              <option value="vest">Missing High-Vis Safety Vest</option>
              <option value="boots">Missing Steel-Toe Work Boots</option>
              <option value="gloves">Missing Protective Cut Gloves</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Site Zone / Camera Location</label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="e.g. Scaffolding Tower, Excavation Zone"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2.5 font-medium"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:from-amber-400 hover:to-orange-500 shadow-md shadow-amber-500/20 flex items-center space-x-2"
            >
              <HardHat className="w-4 h-4" />
              <span>{loading ? 'Ingesting...' : 'Simulate PPE Detection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
