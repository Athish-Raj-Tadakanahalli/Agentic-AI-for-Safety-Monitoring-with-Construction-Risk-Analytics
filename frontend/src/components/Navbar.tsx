import React from 'react';
import { ShieldAlert, HardHat, FileCheck2, ShieldCheck, LayoutDashboard, Radio, Sun, Moon, Bot } from 'lucide-react';
import { Project } from '../types';
import { useTheme } from '../context/ThemeContext';
import { BuildSureLogo } from './BuildSureLogo';

interface NavbarProps {
  projects: Project[];
  selectedProjectId: number;
  onSelectProject: (id: number) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenIngestModal: () => void;
  onOpenCopilot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  activeTab,
  onTabChange,
  onOpenIngestModal,
  onOpenCopilot,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const tabs = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, badge: 'Unified' },
    { id: 'site-risk', label: 'Site Risk Agent', icon: ShieldAlert, badge: 'Live' },
    { id: 'safety', label: 'Safety Agent', icon: HardHat, badge: 'CV' },
    { id: 'compliance', label: 'Compliance Agent', icon: FileCheck2, badge: 'OSHA' },
    { id: 'insurance', label: 'Insurance Agent', icon: ShieldCheck, badge: 'Risk' },
  ];

  return (
    <header className="border-b theme-header-bg sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced BuildSure AI Logo Component */}
          <BuildSureLogo size="md" showSubtext={true} />

          {/* Right Action Bar: Live Stream Badge, Project Select, Theme Toggle, Copilot & Ingest Button */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Live Indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
              <span>Live Site Stream</span>
            </div>

            {/* Project Select Dropdown */}
            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                Project:
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => onSelectProject(Number(e.target.value))}
                className="theme-input text-xs sm:text-sm rounded-xl px-3 py-1.5 font-semibold cursor-pointer border shadow-sm"
              >
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id} className="bg-slate-900 text-slate-100 dark:bg-slate-900">
                    {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Copilot Button */}
            {onOpenCopilot && (
              <button
                onClick={onOpenCopilot}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition flex items-center space-x-1.5"
                title="Open AI Safety Copilot Assistant"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">AI Copilot</span>
              </button>
            )}

            {/* Simple Clean Theme Toggle: Dark Mode <-> Light/White Mode */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border theme-input hover:border-cyan-500/50 transition-all duration-300 shadow-sm flex items-center justify-center group"
              title={isDark ? 'Switch to White / Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Ingest Hazard Button */}
            <button
              onClick={onOpenIngestModal}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl theme-accent-btn transition flex items-center space-x-1.5 shrink-0 shadow-md"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ingest Hazard</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-slate-200 dark:border-slate-800/80 pt-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
                  isSelected
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono border border-slate-300 dark:border-slate-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
