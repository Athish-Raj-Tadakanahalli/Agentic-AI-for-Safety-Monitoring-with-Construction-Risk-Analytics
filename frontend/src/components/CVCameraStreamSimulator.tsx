import React, { useState, useEffect } from 'react';
import { Camera, Video, Play, Pause, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, Radio, Layers, HardHat } from 'lucide-react';
import { IngestPPEPayload } from '../types';

interface CVCameraStreamSimulatorProps {
  projectId: number;
  onIngestViolation: (payload: IngestPPEPayload) => Promise<void>;
}

interface WorkerDetection {
  id: string;
  workerName: string;
  status: 'compliant' | 'violation' | 'warning';
  x: number; // percentage
  y: number; // percentage
  w: number; // percentage
  h: number; // percentage
  confidence: number;
  items: { label: string; ok: boolean }[];
}

export const CVCameraStreamSimulator: React.FC<CVCameraStreamSimulatorProps> = ({
  projectId,
  onIngestViolation
}) => {
  const [selectedCam, setSelectedCam] = useState<string>('cam1');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [isSnapshotting, setIsSnapshotting] = useState<boolean>(false);
  const [timeString, setTimeString] = useState<string>('');

  // Update clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const cameraFeeds = [
    {
      id: 'cam1',
      name: 'CAM-01: High-Altitude Slab (Floor 14F)',
      zone: 'High-Altitude Slab',
      workers: [
        {
          id: 'W-104',
          workerName: 'Marcus Vance',
          status: 'compliant' as const,
          x: 25,
          y: 20,
          w: 22,
          h: 55,
          confidence: 98.6,
          items: [
            { label: 'Hardhat', ok: true },
            { label: 'Safety Vest', ok: true },
            { label: 'Tether Harness', ok: true }
          ]
        },
        {
          id: 'W-209',
          workerName: 'Dave Miller',
          status: 'violation' as const,
          x: 62,
          y: 25,
          w: 24,
          h: 58,
          confidence: 96.4,
          items: [
            { label: 'Hardhat', ok: false },
            { label: 'Safety Vest', ok: true },
            { label: 'Tether Harness', ok: false }
          ]
        }
      ]
    },
    {
      id: 'cam2',
      name: 'CAM-02: North Scaffolding Elevation',
      zone: 'Scaffolding Tower',
      workers: [
        {
          id: 'W-312',
          workerName: 'Sarah Jenkins',
          status: 'compliant' as const,
          x: 35,
          y: 22,
          w: 22,
          h: 56,
          confidence: 99.1,
          items: [
            { label: 'Hardhat', ok: true },
            { label: 'High-Vis Vest', ok: true },
            { label: 'Steel Boots', ok: true }
          ]
        },
        {
          id: 'W-405',
          workerName: 'Unidentified Worker',
          status: 'warning' as const,
          x: 68,
          y: 30,
          w: 20,
          h: 52,
          confidence: 94.2,
          items: [
            { label: 'Hardhat', ok: true },
            { label: 'Cut Gloves', ok: false },
            { label: 'Edge Proximity', ok: false }
          ]
        }
      ]
    },
    {
      id: 'cam3',
      name: 'CAM-03: Foundation Excavation Pit -2B',
      zone: 'Excavation Zone',
      workers: [
        {
          id: 'W-118',
          workerName: 'Elena Rostova',
          status: 'compliant' as const,
          x: 42,
          y: 28,
          w: 23,
          h: 54,
          confidence: 97.8,
          items: [
            { label: 'Hardhat', ok: true },
            { label: 'Safety Vest', ok: true },
            { label: 'Respirator Mask', ok: true }
          ]
        }
      ]
    },
    {
      id: 'cam4',
      name: 'CAM-04: Tower Crane & Rigging Yard',
      zone: 'Crane & Rigging Yard',
      workers: [
        {
          id: 'W-501',
          workerName: 'Tom Hayes',
          status: 'violation' as const,
          x: 30,
          y: 22,
          w: 25,
          h: 60,
          confidence: 95.8,
          items: [
            { label: 'Hardhat', ok: false },
            { label: 'Steel Boots', ok: false },
            { label: 'High-Vis Vest', ok: true }
          ]
        }
      ]
    }
  ];

  const activeCamObj = cameraFeeds.find((c) => c.id === selectedCam) || cameraFeeds[0];

  const triggerInstantSnapshot = async (workerId: string, violationType: 'hard hat' | 'vest' | 'boots' | 'gloves') => {
    setIsSnapshotting(true);
    try {
      await onIngestViolation({
        project_id: projectId,
        worker_id: workerId,
        violation_type: violationType,
        zone: activeCamObj.zone
      });
    } finally {
      setIsSnapshotting(false);
    }
  };

  return (
    <div className="theme-card-bg border rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Radio className="w-5 h-5 animate-pulse text-rose-500" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>YOLO Computer Vision Surveillance Feed</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500 text-white rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE REC
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time object detection overlay for hardhats, vests, tether harnesses & edge proximity breaches.
            </p>
          </div>
        </div>

        {/* Camera Feed Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80">
          {cameraFeeds.map((cam) => (
            <button
              key={cam.id}
              onClick={() => setSelectedCam(cam.id)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition ${
                selectedCam === cam.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cam.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stream Player Frame */}
      <div className="relative bg-slate-950 rounded-xl border-2 border-slate-800 overflow-hidden min-h-[380px] flex flex-col justify-between p-4 shadow-2xl">
        {/* Background Video Grid Shader Simulation */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

        {/* Simulated Camera Video Environment Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/80 pointer-events-none" />

        {/* Top HUD Overlay Info */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-3">
            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded font-bold flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              <span>{activeCamObj.name}</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">{timeString}</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              30.0 FPS
            </span>
            <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              1080p AI-HUD
            </span>
          </div>
        </div>

        {/* Center YOLO AI Bounding Box HUD Layer */}
        <div className="relative z-10 flex-1 my-6 relative min-h-[260px]">
          {showBoundingBoxes &&
            activeCamObj.workers.map((worker: WorkerDetection) => {
              const isViolation = worker.status === 'violation';
              const isWarning = worker.status === 'warning';

              const boxBorder = isViolation
                ? 'border-rose-500 bg-rose-500/10'
                : isWarning
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-emerald-500 bg-emerald-500/10';

              const textBadge = isViolation
                ? 'bg-rose-500 text-slate-950'
                : isWarning
                ? 'bg-amber-500 text-slate-950'
                : 'bg-emerald-500 text-slate-950';

              return (
                <div
                  key={worker.id}
                  style={{
                    left: `${worker.x}%`,
                    top: `${worker.y}%`,
                    width: `${worker.w}%`,
                    height: `${worker.h}%`
                  }}
                  className={`absolute border-2 rounded-lg p-2 flex flex-col justify-between transition-all duration-300 shadow-xl backdrop-blur-xs ${boxBorder} ${
                    isPlaying ? 'animate-in fade-in duration-200' : 'opacity-80'
                  }`}
                >
                  {/* Top Detection Tag */}
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                    <span className={`px-1.5 py-0.5 rounded ${textBadge}`}>
                      {worker.id} ({worker.confidence}%)
                    </span>

                    {isViolation && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>

                  {/* Worker Name & Items */}
                  <div className="space-y-1 my-auto">
                    <span className="text-xs font-bold text-white block truncate">
                      {worker.workerName}
                    </span>

                    <div className="space-y-0.5 text-[10px]">
                      {worker.items.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between px-1 rounded ${
                            item.ok ? 'bg-slate-900/60 text-emerald-300' : 'bg-rose-950/80 text-rose-300 font-bold'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span>{item.ok ? '✓' : '✗ MISSING'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instant Ingest Button for Violation */}
                  {isViolation && (
                    <button
                      onClick={() => triggerInstantSnapshot(worker.id, 'hard hat')}
                      disabled={isSnapshotting}
                      className="w-full mt-1 py-0.5 text-[9px] font-bold uppercase rounded bg-rose-500 hover:bg-rose-400 text-slate-950 transition flex items-center justify-center gap-1"
                    >
                      <ShieldAlert className="w-2.5 h-2.5" />
                      <span>{isSnapshotting ? 'Logging...' : 'Log Breach'}</span>
                    </button>
                  )}
                </div>
              );
            })}
        </div>

        {/* Bottom Stream Control Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center space-x-1.5 border border-slate-700"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pause Motion</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Resume Stream</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 border ${
                showBoundingBoxes
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showBoundingBoxes ? 'YOLO HUD: ON' : 'YOLO HUD: OFF'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400">
            <span className="flex items-center space-x-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Model: YOLOv8-PPE-v2</span>
            </span>
            <span className="hidden md:inline">• Inference Latency: 12ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
