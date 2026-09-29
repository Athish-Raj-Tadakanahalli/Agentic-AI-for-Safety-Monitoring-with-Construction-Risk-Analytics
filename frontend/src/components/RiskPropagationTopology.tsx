import React, { useState } from 'react';
import { ExecutiveDashboardResponse, LangGraphOrchestrationResponse } from '../types';
import {
  Layers,
  ShieldAlert,
  HardHat,
  FileCheck2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';

interface RiskPropagationTopologyProps {
  execData: ExecutiveDashboardResponse | null;
  orchestrationResult: LangGraphOrchestrationResponse | null;
}

export const RiskPropagationTopology: React.FC<RiskPropagationTopologyProps> = ({
  execData,
  orchestrationResult
}) => {
  const [selectedNode, setSelectedNode] = useState<string>('site');

  const nodes = [
    {
      id: 'site',
      name: 'Site Risk Agent',
      code: 'MODULE 4.1',
      x: 100,
      y: 110,
      color: '#ef4444',
      score: execData ? `${execData.site_risk_score}/100` : '38.5/100',
      status: 'Active Monitoring',
      icon: ShieldAlert,
      details: 'Evaluates CCTV, sensor feeds, fall hazards, scaffolding stability & structural risk scores.',
      propagation: 'High-altitude fall hazards propagate mandatory OSHA compliance audit flags.'
    },
    {
      id: 'safety',
      name: 'Safety Protection Agent',
      code: 'MODULE 4.2',
      x: 100,
      y: 290,
      color: '#f59e0b',
      score: execData ? `${execData.safety_score}/100` : '92.4/100',
      status: 'PPE Engine Active',
      icon: HardHat,
      details: 'Monitors worker PPE compliance, repeat violator badges, hardhat/vest detection & accident zones.',
      propagation: 'PPE compliance drops below 85% elevate Workers Compensation claim probability factor.'
    },
    {
      id: 'compliance',
      name: 'OSHA Compliance Agent',
      code: 'MODULE 4.3',
      x: 400,
      y: 110,
      color: '#3b82f6',
      score: execData ? `${execData.compliance_score}/100` : '85.0/100',
      status: 'Audit Ready',
      icon: FileCheck2,
      details: 'Tracks OSHA 1926 construction regulations, safety stand-downs, and regulatory audit readiness.',
      propagation: 'Open non-compliance findings flag project for C-Suite Executive Escalation Workflow.'
    },
    {
      id: 'insurance',
      name: 'Insurance Exposure Agent',
      code: 'MODULE 4.4',
      x: 400,
      y: 290,
      color: '#10b981',
      score: execData ? execData.insurance_risk_badge : 'LOW RISK',
      status: 'Underwriting Active',
      icon: ShieldCheck,
      details: 'Calculates composite underwriting risk badges, total financial claim exposure & premium surcharges.',
      propagation: 'Unmitigated claim cases feed into net financial loss prevention metrics.'
    },
    {
      id: 'reporting',
      name: 'Reporting Intelligence Engine',
      code: 'MODULE 4.5',
      x: 700,
      y: 200,
      color: '#06b6d4',
      score: execData ? `${execData.project_risk_score}/100` : '24.2/100',
      status: 'LangGraph Hub',
      icon: Zap,
      details: 'Synthesizes multi-agent state into C-Suite executive dashboards, automated PDF reports & WebSockets alerts.',
      propagation: 'Aggregates all 4 domain agents into executive risk score & financial cost savings.'
    }
  ];

  const activeNode = nodes.find((n) => n.id === selectedNode) || nodes[0];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Interactive Multi-Agent Risk Propagation Topology</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 rounded-full">
                5-AGENT MESH
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Visualizes cross-domain hazard propagation paths across Site Risk, Safety, OSHA Compliance & Insurance agents.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-800/50 flex items-center gap-1.5 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Click any Agent Node to inspect triggers</span>
        </span>
      </div>

      {/* Main Grid Layout: Left Network Canvas + Right Agent Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Interactive SVG Network Graph (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950/90 rounded-xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
          {/* Background Shader */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          <svg
            viewBox="0 0 800 400"
            className="w-full h-auto max-h-[360px] drop-shadow-2xl relative z-10"
          >
            <defs>
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Animated Data Paths */}
            {/* 1. Site Risk -> Compliance */}
            <path
              d="M 170 110 L 330 110"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="6,6"
              className="animate-pulse opacity-80"
            />
            {/* 2. Safety -> Insurance */}
            <path
              d="M 170 290 L 330 290"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="6,6"
              className="animate-pulse opacity-80"
            />
            {/* 3. Site Risk -> Safety */}
            <path
              d="M 100 155 L 100 245"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              className="opacity-50"
            />
            {/* 4. Compliance -> Insurance */}
            <path
              d="M 400 155 L 400 245"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              className="opacity-50"
            />
            {/* 5. Compliance -> Reporting Engine */}
            <path
              d="M 470 110 L 630 200"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeDasharray="6,6"
              className="animate-pulse opacity-80"
            />
            {/* 6. Insurance -> Reporting Engine */}
            <path
              d="M 470 290 L 630 200"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="6,6"
              className="animate-pulse opacity-80"
            />

            {/* Flow Indicator Labels */}
            <text x="250" y="98" fill="#f87171" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">
              OSHA Audit Trigger
            </text>
            <text x="250" y="278" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">
              Claim Exposure Factor
            </text>
            <text x="550" y="145" fill="#60a5fa" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">
              Compliance Feed
            </text>
            <text x="550" y="260" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">
              Underwriting Feed
            </text>

            {/* Render 5 Agent Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const NodeIcon = node.icon;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className="cursor-pointer transition-all duration-300"
                >
                  {/* Outer Pulsing Aura Ring if Selected */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="48"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Node Outer Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="38"
                    fill="#0f172a"
                    stroke={isSelected ? '#06b6d4' : node.color}
                    strokeWidth={isSelected ? '3.5' : '2'}
                    filter={isSelected ? 'url(#glow-cyan)' : undefined}
                    className="hover:scale-105 transition-transform"
                  />

                  {/* Node Label Text */}
                  <text
                    x={node.x}
                    y={node.y - 48}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {node.name}
                  </text>

                  {/* Node Score Subtext */}
                  <text
                    x={node.x}
                    y={node.y + 54}
                    fill={node.color}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {node.score}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Bottom Topology Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            <span>🔴 Site Risk ➔ 🟡 Safety ➔ 🔵 Compliance ➔ 🟢 Insurance ➔ 🌐 LangGraph Hub</span>
            <span>Dashed lines represent live risk propagation</span>
          </div>
        </div>

        {/* Right Agent Node Inspector Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 rounded-xl border border-slate-700/80 p-4 flex flex-col justify-between space-y-3">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  {activeNode.code}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{activeNode.name}</h4>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {activeNode.status}
              </span>
            </div>

            {/* Score & Rating Metric */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 my-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Domain Metric Score</span>
                <span className="text-lg font-black text-white">{activeNode.score}</span>
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {/* Description */}
            <div className="space-y-2 text-xs text-slate-300">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 block mb-0.5">Agent Operational Scope:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  {activeNode.details}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-amber-400 block mb-0.5">Cross-Agent Propagation Trigger:</span>
                <p className="text-[11px] text-amber-200/90 leading-relaxed bg-amber-950/20 p-2.5 rounded-lg border border-amber-800/40">
                  {activeNode.propagation}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Node Selector Tabs */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1 font-mono">SELECT AGENT NODE:</span>
            <div className="grid grid-cols-5 gap-1">
              {nodes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSelectedNode(n.id)}
                  className={`py-1 text-[10px] font-mono font-bold rounded transition border truncate px-0.5 ${
                    selectedNode === n.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-xs'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                  title={n.name}
                >
                  {n.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
