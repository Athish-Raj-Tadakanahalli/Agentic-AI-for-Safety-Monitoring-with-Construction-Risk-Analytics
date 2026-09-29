import React, { useState } from 'react';
import { DigitalTwinResponse, DigitalTwinZoneItem, SiteRisk } from '../types';
import {
  Layers,
  Box,
  MapPin,
  Camera,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ChevronRight,
  Eye,
  Filter,
  Activity,
  Zap,
  HardHat
} from 'lucide-react';

interface SiteDigitalTwinMapProps {
  data: DigitalTwinResponse | null;
  onToggleMitigation: (riskId: number, currentMitigated: boolean) => Promise<void>;
}

export const SiteDigitalTwinMap: React.FC<SiteDigitalTwinMapProps> = ({
  data,
  onToggleMitigation
}) => {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('tower_slab_high');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'red' | 'amber' | 'green'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [mitigatingId, setMitigatingId] = useState<number | null>(null);

  if (!data) {
    return (
      <div className="theme-card-bg border rounded-2xl p-8 text-center text-slate-400 animate-pulse">
        <Activity className="w-8 h-8 text-cyan-500 mx-auto mb-2 animate-spin" />
        <p className="text-xs font-mono">Loading Site Digital Twin Spatial Model...</p>
      </div>
    );
  }

  // Helper to determine if a zone matches current filters
  const isZoneMatchingFilter = (zone: DigitalTwinZoneItem) => {
    const matchesSev = filterSeverity === 'all' || zone.color_status === filterSeverity;
    const matchesCat = filterCategory === 'all' || zone.category === filterCategory;
    return matchesSev && matchesCat;
  };

  const matchingZones = data.zones.filter(isZoneMatchingFilter);

  // Fallback to first zone if selected one isn't in matching set
  const selectedZone =
    data.zones.find((z) => z.zone_id === selectedZoneId) ||
    matchingZones[0] ||
    data.zones[0];

  const handleSeverityFilterChange = (sev: 'all' | 'red' | 'amber' | 'green') => {
    setFilterSeverity(sev);
    const newMatches = data.zones.filter((z) => {
      const matchesSev = sev === 'all' || z.color_status === sev;
      const matchesCat = filterCategory === 'all' || z.category === filterCategory;
      return matchesSev && matchesCat;
    });
    if (newMatches.length > 0 && !newMatches.some((z) => z.zone_id === selectedZoneId)) {
      setSelectedZoneId(newMatches[0].zone_id);
    }
  };

  const handleCategoryFilterChange = (cat: string) => {
    setFilterCategory(cat);
    const newMatches = data.zones.filter((z) => {
      const matchesSev = filterSeverity === 'all' || z.color_status === filterSeverity;
      const matchesCat = cat === 'all' || z.category === cat;
      return matchesSev && matchesCat;
    });
    if (newMatches.length > 0 && !newMatches.some((z) => z.zone_id === selectedZoneId)) {
      setSelectedZoneId(newMatches[0].zone_id);
    }
  };

  const handleMitigate = async (riskId: number) => {
    setMitigatingId(riskId);
    try {
      await onToggleMitigation(riskId, false);
    } finally {
      setMitigatingId(null);
    }
  };

  // 2D Blueprint Coordinates Map by zone_id (Fixed spatial placement)
  const spatialBlueprintCoords: Record<
    string,
    { x: number; y: number; w: number; h: number; label: string }
  > = {
    tower_slab_high: { x: 300, y: 60, w: 200, h: 120, label: 'HIGH-ALTITUDE TOWER 14F-18F' },
    scaffolding_tower: { x: 80, y: 60, w: 180, h: 110, label: 'NORTH SCAFFOLDING' },
    excavation_pit: { x: 80, y: 200, w: 220, h: 140, label: 'FOUNDATION EXCAVATION PIT' },
    crane_yard: { x: 530, y: 60, w: 190, h: 130, label: 'TOWER CRANE YARD' },
    electrical_plant: { x: 330, y: 200, w: 170, h: 100, label: 'ELEC PLANT ROOM B1' },
    gate_turnstile: { x: 80, y: 360, w: 200, h: 60, label: 'MAIN TURNSTILE GATE' },
    storage_bay: { x: 530, y: 220, w: 190, h: 90, label: 'HAZMAT STORAGE BAY' },
    perimeter_wall: { x: 330, y: 320, w: 390, h: 100, label: 'EAST PERIMETER WALL' }
  };

  const getZoneColorStyle = (color: string, isSelected: boolean, isDimmed: boolean) => {
    if (isDimmed) {
      return 'fill-slate-800/20 stroke-slate-700/40 opacity-25';
    }
    if (color === 'red') {
      return isSelected
        ? 'fill-rose-500/50 stroke-rose-400 stroke-[3]'
        : 'fill-rose-500/25 stroke-rose-500/80 stroke-2 hover:fill-rose-500/40';
    } else if (color === 'amber') {
      return isSelected
        ? 'fill-amber-500/50 stroke-amber-400 stroke-[3]'
        : 'fill-amber-500/25 stroke-amber-500/80 stroke-2 hover:fill-amber-500/40';
    } else {
      return isSelected
        ? 'fill-emerald-500/50 stroke-emerald-400 stroke-[3]'
        : 'fill-emerald-500/25 stroke-emerald-500/80 stroke-2 hover:fill-emerald-500/40';
    }
  };

  return (
    <div className="theme-card-bg border rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Site Digital Twin — Spatial BIM Map</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 rounded-full">
                  LIVE SPATIAL MODEL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Interactive spatial digital twin for {data.project_name}. Click any building floor or zone to inspect active hazards.
              </p>
            </div>
          </div>
        </div>

        {/* Filters & View Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80">
            <span className="text-[10px] font-mono text-slate-400 px-1 font-bold">CATEGORY:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'high_altitude', label: '🏗️ High Alt' },
              { id: 'excavation', label: '⛏️ Pit' },
              { id: 'heavy_equipment', label: '🚜 Crane' },
              { id: 'electrical', label: '⚡ Elec' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilterChange(cat.id)}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                  filterCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {(['all', 'red', 'amber', 'green'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => handleSeverityFilterChange(sev)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition ${
                  filterSeverity === sev
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev === 'red' ? '🔴 High' : sev === 'amber' ? '🟡 Med' : sev === 'green' ? '🟢 Low' : 'All'}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center space-x-1 px-3 py-1 text-xs font-bold rounded-lg transition ${
                viewMode === '3d'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D BIM</span>
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center space-x-1 px-3 py-1 text-xs font-bold rounded-lg transition ${
                viewMode === '2d'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>2D Blueprint</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Canvas + Right Zone Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Interactive SVG Map (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950/90 rounded-xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between min-h-[440px]">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Top Status Indicators */}
          <div className="relative z-10 flex flex-wrap items-center justify-between text-xs text-slate-400 mb-2 gap-2">
            <div className="flex items-center space-x-3 font-mono">
              <span className="flex items-center space-x-1 text-rose-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>{data.critical_zones_count} High-Risk Zones</span>
              </span>
              <span>•</span>
              <span>{data.total_active_hazards} Active Hazards</span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">{matchingZones.length} Zones Visible</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              FILTER: {filterSeverity.toUpperCase()} | CAT: {filterCategory.toUpperCase()}
            </span>
          </div>

          {/* SVG Canvas Rendering */}
          <div className="relative z-10 flex-1 flex items-center justify-center py-2">
            <svg
              viewBox="0 0 800 480"
              className="w-full h-auto max-h-[400px] drop-shadow-2xl transition-all duration-300"
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {viewMode === '3d' ? (
                /* ================= 3D ISOMETRIC BIM VIEW ================= */
                <g className="animate-in fade-in duration-300">
                  {/* Site Ground Base Polygon */}
                  <polygon
                    points="400,60 760,200 400,380 40,200"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="2"
                  />
                  <polygon
                    points="40,200 400,380 400,410 40,230"
                    fill="#020617"
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="400,380 760,200 760,230 400,410"
                    fill="#090d16"
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />

                  {/* Render 8 Isometric 3D Zones dynamically */}
                  {data.zones.map((zone) => {
                    const isSelected = selectedZoneId === zone.zone_id;
                    const matchesFilter = isZoneMatchingFilter(zone);
                    const isDimmed = !matchesFilter;

                    // Zone polygons definition
                    if (zone.zone_id === 'tower_slab_high') {
                      return (
                        <g
                          key={zone.zone_id}
                          onClick={() => setSelectedZoneId(zone.zone_id)}
                          className="cursor-pointer transition-all duration-300"
                          style={{ opacity: isDimmed ? 0.2 : 1 }}
                        >
                          <polygon points="340,140 440,90 440,220 340,270" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                          <polygon points="440,90 520,130 520,260 440,220" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                          <polygon
                            points="340,140 440,90 520,130 420,180"
                            className={getZoneColorStyle(zone.color_status, isSelected, isDimmed)}
                            filter={isSelected ? 'url(#glow)' : undefined}
                          />
                          <text x="420" y="140" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">
                            TOWER 14F-18F
                          </text>
                        </g>
                      );
                    } else if (zone.zone_id === 'scaffolding_tower') {
                      return (
                        <g
                          key={zone.zone_id}
                          onClick={() => setSelectedZoneId(zone.zone_id)}
                          className="cursor-pointer transition-all duration-300"
                          style={{ opacity: isDimmed ? 0.2 : 1 }}
                        >
                          <polygon
                            points="220,120 300,80 340,100 260,140"
                            className={getZoneColorStyle(zone.color_status, isSelected, isDimmed)}
                            filter={isSelected ? 'url(#glow)' : undefined}
                          />
                          <line x1="240" y1="130" x2="320" y2="90" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1="260" y1="140" x2="340" y2="100" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
                          <text x="280" y="110" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">
                            SCAFFOLDING
                          </text>
                        </g>
                      );
                    } else if (zone.zone_id === 'excavation_pit') {
                      return (
                        <g
                          key={zone.zone_id}
                          onClick={() => setSelectedZoneId(zone.zone_id)}
                          className="cursor-pointer transition-all duration-300"
                          style={{ opacity: isDimmed ? 0.2 : 1 }}
                        >
                          <polygon
                            points="120,230 260,160 340,200 200,270"
                            className={getZoneColorStyle(zone.color_status, isSelected, isDimmed)}
                            filter={isSelected ? 'url(#glow)' : undefined}
                          />
                          <polygon points="150,235 250,185 300,210 200,260" fill="#020617" stroke="#ef4444" strokeWidth="1" />
                          <text x="220" y="220" fill="#f87171" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">
                            EXCAVATION PIT -2B
                          </text>
                        </g>
                      );
                    } else if (zone.zone_id === 'crane_yard') {
                      return (
                        <g
                          key={zone.zone_id}
                          onClick={() => setSelectedZoneId(zone.zone_id)}
                          className="cursor-pointer transition-all duration-300"
                          style={{ opacity: isDimmed ? 0.2 : 1 }}
                        >
                          <polygon
                            points="520,180 640,120 700,150 580,210"
                            className={getZoneColorStyle(zone.color_status, isSelected, isDimmed)}
                            filter={isSelected ? 'url(#glow)' : undefined}
                          />
                          <line x1="610" y1="150" x2="610" y2="50" stroke="#06b6d4" strokeWidth="4" />
                          <line x1="610" y1="50" x2="680" y2="50" stroke="#06b6d4" strokeWidth="3" />
                          <text x="610" y="170" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">
                            CRANE YARD
                          </text>
                        </g>
                      );
                    } else if (zone.zone_id === 'electrical_plant') {
                      return (
                        <g
                          key={zone.zone_id}
                          onClick={() => setSelectedZoneId(zone.zone_id)}
                          className="cursor-pointer transition-all duration-300"
                          style={{ opacity: isDimmed ? 0.2 : 1 }}
                        >
                          <polygon
                            points="400,290 500,240 560,270 460,320"
                            className={getZoneColorStyle(zone.color_status, isSelected, isDimmed)}
                            filter={isSelected ? 'url(#glow)' : undefined}
                          />
                          <text x="480" y="280" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">
                            ELEC PLANT B1
                          </text>
                        </g>
                      );
                    } else if (zone.zone_id === 'gate_turnstile') {
                      return (
                        <g
                          key={zone.zone_id}
                          onClick={() => setSelectedZoneId(zone.zone_id)}
                          className="cursor-pointer transition-all duration-300"
                          style={{ opacity: isDimmed ? 0.2 : 1 }}
                        >
                          <polygon
                            points="260,320 340,280 390,305 310,345"
                            className={getZoneColorStyle(zone.color_status, isSelected, isDimmed)}
                            filter={isSelected ? 'url(#glow)' : undefined}
                          />
                          <text x="325" y="315" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">
                            GATE TURNSTILE
                          </text>
                        </g>
                      );
                    } else if (zone.zone_id === 'storage_bay') {
                      return (
                        <g
                          key={zone.zone_id}
                          onClick={() => setSelectedZoneId(zone.zone_id)}
                          className="cursor-pointer transition-all duration-300"
                          style={{ opacity: isDimmed ? 0.2 : 1 }}
                        >
                          <polygon
                            points="540,260 620,220 670,245 590,285"
                            className={getZoneColorStyle(zone.color_status, isSelected, isDimmed)}
                            filter={isSelected ? 'url(#glow)' : undefined}
                          />
                          <text x="605" y="255" fill="#fde047" fontSize="9" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">
                            HAZMAT STORAGE
                          </text>
                        </g>
                      );
                    } else {
                      // perimeter_wall
                      return (
                        <g
                          key={zone.zone_id}
                          onClick={() => setSelectedZoneId(zone.zone_id)}
                          className="cursor-pointer transition-all duration-300"
                          style={{ opacity: isDimmed ? 0.2 : 1 }}
                        >
                          <polygon
                            points="460,340 540,300 580,320 500,360"
                            className={getZoneColorStyle(zone.color_status, isSelected, isDimmed)}
                            filter={isSelected ? 'url(#glow)' : undefined}
                          />
                          <text x="520" y="330" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">
                            PERIMETER WALL
                          </text>
                        </g>
                      );
                    }
                  })}

                  {/* Pulsing Hazard Rings for Filter-Matching High-Risk Zones */}
                  {data.zones
                    .filter((z) => z.color_status === 'red' && isZoneMatchingFilter(z))
                    .map((z) => {
                      const pos =
                        z.zone_id === 'tower_slab_high'
                          ? { x: 420, y: 135 }
                          : z.zone_id === 'excavation_pit'
                          ? { x: 220, y: 215 }
                          : { x: 280, y: 110 };

                      return (
                        <g key={'pulse-' + z.zone_id} className="pointer-events-none">
                          <circle cx={pos.x} cy={pos.y} r="20" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping opacity-75" />
                          <circle cx={pos.x} cy={pos.y} r="7" fill="#ef4444" />
                        </g>
                      );
                    })}
                </g>
              ) : (
                /* ================= 2D BLUEPRINT VIEW ================= */
                <g className="animate-in fade-in duration-300">
                  {/* Grid Lines */}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line key={'h-' + i} x1="40" y1={50 + i * 45} x2="760" y2={50 + i * 45} stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
                  ))}
                  {Array.from({ length: 15 }).map((_, i) => (
                    <line key={'v-' + i} x1={40 + i * 48} y1="40" x2={40 + i * 48} y2="440" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
                  ))}

                  {/* 2D Blueprint Zones */}
                  {data.zones.map((z) => {
                    const gridCoords = spatialBlueprintCoords[z.zone_id] || {
                      x: 100,
                      y: 100,
                      w: 150,
                      h: 100,
                      label: z.zone_name
                    };

                    const isSelected = selectedZoneId === z.zone_id;
                    const matchesFilter = isZoneMatchingFilter(z);
                    const isDimmed = !matchesFilter;

                    const strokeColor =
                      z.color_status === 'red'
                        ? '#ef4444'
                        : z.color_status === 'amber'
                        ? '#f59e0b'
                        : '#10b981';
                    const fillColor =
                      z.color_status === 'red'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : z.color_status === 'amber'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(16, 185, 129, 0.2)';

                    return (
                      <g
                        key={z.zone_id}
                        onClick={() => setSelectedZoneId(z.zone_id)}
                        className="cursor-pointer transition-all duration-300"
                        style={{ opacity: isDimmed ? 0.2 : 1 }}
                      >
                        <rect
                          x={gridCoords.x}
                          y={gridCoords.y}
                          width={gridCoords.w}
                          height={gridCoords.h}
                          rx="8"
                          fill={isDimmed ? '#0f172a' : fillColor}
                          stroke={isDimmed ? '#334155' : strokeColor}
                          strokeWidth={isSelected ? '3.5' : '1.5'}
                          strokeDasharray={z.category === 'high_altitude' ? '4,4' : undefined}
                          filter={isSelected ? 'url(#glow)' : undefined}
                        />

                        {/* Zone Header Bar */}
                        <rect
                          x={gridCoords.x}
                          y={gridCoords.y}
                          width={gridCoords.w}
                          height="24"
                          rx="8"
                          fill={strokeColor}
                          fillOpacity={isDimmed ? '0.1' : '0.3'}
                        />

                        <text
                          x={gridCoords.x + 10}
                          y={gridCoords.y + 16}
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          className="font-mono"
                        >
                          {gridCoords.label}
                        </text>

                        {/* Hazard Counter Badge */}
                        <circle
                          cx={gridCoords.x + gridCoords.w - 18}
                          cy={gridCoords.y + 12}
                          r="9"
                          fill={strokeColor}
                        />
                        <text
                          x={gridCoords.x + gridCoords.w - 18}
                          y={gridCoords.y + 15}
                          fill="#020617"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="font-mono"
                        >
                          {z.active_hazards_count}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>

          {/* Bottom Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs shadow-rose-500" />
                <span>High/Critical Risk (&ge;50)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500" />
                <span>Medium Risk (20-49)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500" />
                <span>Low Risk (&lt;20)</span>
              </span>
            </div>
            <span className="font-mono text-slate-400">Dimmed zones do not match active filter</span>
          </div>
        </div>

        {/* Right Zone Hazard Inspector Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 rounded-xl border border-slate-700/80 p-4 flex flex-col justify-between space-y-4">
          <div>
            {/* Zone Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider">
                  ZONE INSPECTOR
                </span>
                <h3 className="text-sm font-bold text-white leading-tight mt-0.5">
                  {selectedZone.zone_name}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400 inline" />
                  <span>{selectedZone.floor_level || 'Ground Level'}</span>
                </p>
              </div>

              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                  selectedZone.color_status === 'red'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : selectedZone.color_status === 'amber'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {selectedZone.risk_level} Risk
              </span>
            </div>

            {/* Zone Metadata Cards */}
            <div className="grid grid-cols-2 gap-2 my-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Zone Risk Score</span>
                <span
                  className={`text-base font-extrabold ${
                    selectedZone.color_status === 'red'
                      ? 'text-rose-400'
                      : selectedZone.color_status === 'amber'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {selectedZone.risk_score} / 100
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Unmitigated Hazards</span>
                <span className="text-base font-extrabold text-white">
                  {selectedZone.active_hazards_count} Active
                </span>
              </div>
            </div>

            {/* Safety Supervisor & Camera Stream Info */}
            <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Safety Officer:</span>
                </span>
                <span className="font-semibold text-white">{selectedZone.assigned_supervisor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CCTV Stream ID:</span>
                </span>
                <span className="font-mono text-cyan-300 font-bold">{selectedZone.cctv_camera_id}</span>
              </div>
            </div>

            {/* Active Hazard List */}
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center justify-between">
                <span>Active Unmitigated Hazards</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedZone.active_risks.length} recorded
                </span>
              </h4>

              {selectedZone.active_risks.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 text-center border border-slate-800 text-xs text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span>No active hazards detected in this spatial zone.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                  {selectedZone.active_risks.map((hazard: SiteRisk) => (
                    <div
                      key={hazard.risk_id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 capitalize flex items-center gap-1.5 text-xs">
                          <AlertTriangle
                            className={`w-3.5 h-3.5 ${
                              hazard.severity === 'critical' ? 'text-rose-500' : 'text-amber-500'
                            }`}
                          />
                          <span>{hazard.risk_type} Hazard</span>
                        </span>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                            hazard.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : hazard.severity === 'high'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {hazard.severity}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-snug">
                        {hazard.description || 'Hazard detected via site surveillance feed.'}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] font-mono text-slate-400">
                          P:{hazard.probability} • I:{hazard.impact}
                        </span>

                        <button
                          onClick={() => handleMitigate(hazard.risk_id)}
                          disabled={mitigatingId === hazard.risk_id}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 transition flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{mitigatingId === hazard.risk_id ? 'Mitigating...' : 'Mitigate'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Zone Selector Buttons */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1.5 font-mono">QUICK ZONE SELECTOR:</span>
            <div className="grid grid-cols-4 gap-1">
              {data.zones.map((z) => {
                const isSelected = selectedZoneId === z.zone_id;
                const matchesFilter = isZoneMatchingFilter(z);

                return (
                  <button
                    key={z.zone_id}
                    onClick={() => setSelectedZoneId(z.zone_id)}
                    className={`py-1 text-[10px] font-mono font-bold rounded transition border truncate px-1 ${
                      !matchesFilter
                        ? 'opacity-30 bg-slate-950 text-slate-600 border-slate-800'
                        : isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-xs'
                        : z.color_status === 'red'
                        ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                        : z.color_status === 'amber'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                    title={z.zone_name}
                  >
                    {z.zone_id.replace('_', ' ').slice(0, 8)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
