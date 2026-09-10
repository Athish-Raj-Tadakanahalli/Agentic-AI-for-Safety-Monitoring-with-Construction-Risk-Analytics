import React from 'react';

interface BuildSureLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtext?: boolean;
}

export const BuildSureLogo: React.FC<BuildSureLogoProps> = ({ size = 'md', showSubtext = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center space-x-3 group cursor-pointer select-none">
      {/* Dynamic Shield & AI Safety Crest Icon */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        {/* Ambient Glow behind icon */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-85 transition-opacity duration-300" />

        {/* Shield Container */}
        <div className="relative w-full h-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 p-0.5 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
          <div className="w-full h-full bg-slate-950/90 rounded-[10px] flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
            {/* Background Grid Pattern inside logo */}
            <svg className="absolute inset-0 w-full h-full opacity-30 text-cyan-400" fill="none" viewBox="0 0 40 40">
              <path d="M0 10h40M0 20h40M0 30h40M10 0v40M20 0v40M30 0v40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            </svg>

            {/* Custom SVG Emblem: Shield + Hard Hat + AI Neural Nodes */}
            <svg className="w-3/5 h-3/5 text-cyan-400 z-10 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {/* Outer Shield */}
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="stroke-cyan-400" />
              {/* Construction Hard Hat Arch */}
              <path d="M7 13a5 5 0 0 1 10 0" className="stroke-amber-400" strokeWidth="2.2" />
              <path d="M6 14h12" className="stroke-amber-400" strokeWidth="2" />
              {/* Central AI Node Dot */}
              <circle cx="12" cy="10" r="1.5" className="fill-cyan-300 stroke-none animate-pulse" />
              <line x1="12" y1="11.5" x2="12" y2="14" className="stroke-cyan-300" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Brand Name & Tagline */}
      <div>
        <div className="flex items-center space-x-2">
          <span className={`font-black tracking-tight ${textSizes[size]} flex items-center`}>
            <span className="text-slate-900 dark:text-white transition-colors duration-300">Build</span>
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent ml-0.5">
              Sure
            </span>
          </span>

          {/* AI Badge */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/30 text-[10px] font-extrabold text-cyan-500 dark:text-cyan-400 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>AI</span>
          </div>
        </div>

        {showSubtext && (
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-normal transition-colors duration-300 hidden sm:block">
            Safety Monitoring & Risk Intelligence
          </p>
        )}
      </div>
    </div>
  );
};
