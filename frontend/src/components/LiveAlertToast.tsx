import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface LiveAlertToastProps {
  message: string;
  type?: 'hazard' | 'compliance' | 'insurance';
  onClose: () => void;
}

export const LiveAlertToast: React.FC<LiveAlertToastProps> = ({
  message,
  type = 'hazard',
  onClose,
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 border border-rose-500/50 rounded-2xl shadow-2xl p-4 flex items-start space-x-3 text-slate-100 animate-in slide-in-from-bottom duration-300">
      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
        <ShieldAlert className="w-5 h-5 animate-pulse" />
      </div>
      <div className="flex-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-rose-400 text-xs uppercase tracking-wider">Live Agent Trigger</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="mt-1 font-medium leading-relaxed text-slate-300">{message}</p>
      </div>
    </div>
  );
};
