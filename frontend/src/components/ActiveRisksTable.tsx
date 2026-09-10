import React, { useState } from 'react';
import { SiteRisk } from '../types';
import { ShieldAlert, CheckCircle2, XCircle, Search, Clock } from 'lucide-react';

interface ActiveRisksTableProps {
  risks: SiteRisk[];
  onToggleMitigation: (riskId: number, currentMitigated: boolean) => void;
}

export const ActiveRisksTable: React.FC<ActiveRisksTableProps> = ({ risks, onToggleMitigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredRisks = risks.filter((r) => {
    const matchesSearch =
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.zone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.risk_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSev = selectedSeverity === 'all' || r.severity.toLowerCase() === selectedSeverity;
    const matchesType = selectedType === 'all' || r.risk_type.toLowerCase() === selectedType;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'unmitigated' && !r.mitigated) ||
      (selectedStatus === 'mitigated' && r.mitigated);

    return matchesSearch && matchesSev && matchesType && matchesStatus;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold tracking-wide">Active Hazards Log</h3>
            <p className="text-xs text-slate-400">Live monitoring stream detected by Site Risk Agent</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search zone or hazard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="theme-input border pl-8 pr-3 py-1.5 rounded-lg focus:ring-1 focus:ring-cyan-500 text-xs w-44 font-medium"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="theme-input border px-2.5 py-1.5 rounded-lg cursor-pointer font-medium"
          >
            <option value="all" className="bg-slate-900 text-slate-100">All Severities</option>
            <option value="critical" className="bg-slate-900 text-slate-100">Critical</option>
            <option value="high" className="bg-slate-900 text-slate-100">High</option>
            <option value="medium" className="bg-slate-900 text-slate-100">Medium</option>
            <option value="low" className="bg-slate-900 text-slate-100">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="theme-input border px-2.5 py-1.5 rounded-lg cursor-pointer font-medium"
          >
            <option value="all" className="bg-slate-900 text-slate-100">All Statuses</option>
            <option value="unmitigated" className="bg-slate-900 text-slate-100">Active Unmitigated</option>
            <option value="mitigated" className="bg-slate-900 text-slate-100">Mitigated</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="theme-card-bg text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700/60">
            <tr>
              <th className="py-3 px-4">Risk ID & Type</th>
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">Description / CCTV Note</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">P × I Matrix</th>
              <th className="py-3 px-4">Detected At</th>
              <th className="py-3 px-4 text-center">Status Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRisks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No site risks found matching the filter criteria.
                </td>
              </tr>
            ) : (
              filteredRisks.map((risk) => (
                <tr key={risk.risk_id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono font-semibold">
                    <span className="text-cyan-400">#SR-{risk.risk_id}</span>
                    <span className="ml-2 uppercase text-[10px] px-1.5 py-0.5 rounded theme-badge font-sans">
                      {risk.risk_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{risk.zone}</td>
                  <td className="py-3 px-4 max-w-xs truncate text-slate-400" title={risk.description}>
                    {risk.description || 'No notes available'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getSeverityBadge(risk.severity)}`}>
                      {risk.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    <span className="text-amber-400">P{risk.probability}</span> × <span className="text-rose-400">I{risk.impact}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(risk.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onToggleMitigation(risk.risk_id, risk.mitigated)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center justify-center space-x-1 mx-auto transition ${
                        risk.mitigated
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                      }`}
                    >
                      {risk.mitigated ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mitigated</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Mark Mitigated</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
