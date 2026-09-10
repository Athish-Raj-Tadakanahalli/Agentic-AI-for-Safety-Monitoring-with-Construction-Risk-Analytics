import React, { useState } from 'react';
import { HeatmapMatrixResponse, HeatmapCell } from '../types';
import { Layers, ShieldCheck, AlertCircle, Info } from 'lucide-react';

interface RiskHeatmapProps {
  data: HeatmapMatrixResponse | null;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'inherent' | 'residual'>('residual');
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  if (!data) {
    return (
      <div className="glass-panel p-6 rounded-2xl animate-pulse text-slate-400 text-center text-sm">
        Loading 5x5 Site Risk Heatmap...
      </div>
    );
  }

  const cells = viewMode === 'inherent' ? data.inherent_cells : data.residual_cells;
  const grid = viewMode === 'inherent' ? data.inherent_grid : data.residual_grid;

  // Probability rows (5 = Almost Certain down to 1 = Rare)
  const probabilityIndices = [4, 3, 2, 1, 0]; // 5 to 1
  const impactIndices = [0, 1, 2, 3, 4];      // 1 to 5

  const getCellColor = (prob: number, imp: number, count: number) => {
    if (count === 0) {
      return 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40 text-slate-400 dark:text-slate-500';
    }

    const severityScore = prob * imp; // Max 25
    if (severityScore >= 16) {
      return 'bg-red-600/90 dark:bg-red-900/80 border-red-500/80 text-white shadow-lg shadow-red-500/20';
    } else if (severityScore >= 10) {
      return 'bg-orange-500/90 dark:bg-orange-600/80 border-orange-400/80 text-white shadow-md shadow-orange-500/20';
    } else if (severityScore >= 5) {
      return 'bg-amber-400/90 dark:bg-amber-500/70 border-amber-300/70 text-slate-950 dark:text-slate-900 font-bold shadow-sm';
    } else {
      return 'bg-emerald-500/90 dark:bg-emerald-600/60 border-emerald-400/60 text-white dark:text-emerald-100';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl">
      {/* Heatmap Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-500" />
            <h3 className="text-base font-extrabold tracking-wide text-slate-900 dark:text-white">
              5×5 Risk Heatmap — Probability × Impact Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Visualization matching standard ISO 31000 matrix. Select cells to inspect hazards.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 theme-input rounded-xl border text-xs font-bold self-start sm:self-auto shadow-sm">
          <button
            onClick={() => {
              setViewMode('inherent');
              setSelectedCell(null);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'inherent'
                ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Inherent Risk</span>
          </button>
          <button
            onClick={() => {
              setViewMode('residual');
              setSelectedCell(null);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'residual'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Residual Risk (After Mitigation)</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-6 gap-2 text-xs">
        {/* Y-Axis Header / Top Left Corner */}
        <div className="flex items-center justify-center font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider">
          PROBABILITY
        </div>
        {/* Impact Column Headers */}
        {data.impact_labels.map((lbl, idx) => (
          <div key={idx} className="text-center font-bold text-slate-700 dark:text-slate-300 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
            {idx + 1}. {lbl}
          </div>
        ))}

        {/* 5 Rows */}
        {probabilityIndices.map((pIdx) => {
          const probNum = pIdx + 1;
          const probLabel = data.probability_labels[pIdx];

          return (
            <React.Fragment key={pIdx}>
              {/* Row Label */}
              <div className="flex items-center justify-end pr-2 font-bold text-slate-700 dark:text-slate-300 text-right">
                <span className="truncate">{probNum}. {probLabel}</span>
              </div>

              {/* 5 Columns for this row */}
              {impactIndices.map((iIdx) => {
                const impNum = iIdx + 1;
                const count = grid[pIdx][iIdx];

                // Find matching cell object
                const cellObj = cells.find((c) => c.probability === probNum && c.impact === impNum);
                const isSelected = selectedCell?.probability === probNum && selectedCell?.impact === impNum;

                return (
                  <button
                    key={iIdx}
                    onClick={() => setSelectedCell(cellObj || null)}
                    className={`h-16 rounded-xl border p-1.5 flex flex-col justify-between items-center heatmap-cell cursor-pointer relative ${getCellColor(
                      probNum,
                      impNum,
                      count
                    )} ${isSelected ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900 scale-105 z-10' : ''}`}
                  >
                    <span className="text-[10px] opacity-80 self-start font-mono">
                      P{probNum}×I{impNum}
                    </span>
                    <span className="text-xl font-black">{count}</span>
                    <span className="text-[9px] uppercase tracking-tighter opacity-90 font-extrabold">
                      {cellObj?.risk_level || 'Low'}
                    </span>
                  </button>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      {/* X-Axis Label */}
      <div className="mt-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        IMPACT SEVERITY →
      </div>

      {/* Legend & Selected Cell Info */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs gap-3">
        {/* Legend */}
        <div className="flex items-center space-x-3 font-semibold">
          <span className="text-slate-500 dark:text-slate-400 font-bold">Severity Scale:</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">Low (1-4)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-amber-400 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">Medium (5-9)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-orange-500 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">High (10-15)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-red-600 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">Extreme (16-25)</span>
          </div>
        </div>

        {/* Selected Cell Banner */}
        {selectedCell && (
          <div className="theme-input border border-slate-300 dark:border-slate-700 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 text-slate-800 dark:text-slate-200 shadow-sm">
            <Info className="w-4 h-4 text-cyan-500" />
            <span>
              Cell <strong>P{selectedCell.probability} × I{selectedCell.impact}</strong> ({selectedCell.risk_level}):{' '}
              <strong>{selectedCell.count}</strong> {selectedCell.count === 1 ? 'hazard' : 'hazards'} linked.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
