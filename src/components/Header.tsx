import React from 'react';
import { ShieldCheck, Play, Upload, Server, FileText, Activity, AlertTriangle, Layers } from 'lucide-react';
import { ClusterMetrics } from '../types/storage';

export type ActiveTab = 'dashboard' | 'objects' | 'nodes' | 'activity' | 'chaos' | 'architecture';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  metrics: ClusterMetrics;
  onOpenUpload: () => void;
  onStartDemo: () => void;
  isDemoRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  onOpenUpload,
  onStartDemo,
  isDemoRunning,
}) => {
  const isHealthy = metrics.activeNodes === metrics.totalNodes && metrics.replicationHealthPercent === 100;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F5F3EF]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 border-b border-[#E6E2DA] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-2xl bg-[#6C63FF] text-white flex items-center justify-center shadow-md shadow-[#6C63FF]/30 transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-[#25252D]">
                VAULT
              </span>
              <span className="text-[11px] font-medium text-[#777784] -mt-0.5 hidden sm:inline">
                Storage that keeps working
              </span>
            </div>
          </button>

          {/* Friendly Status Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold pl-4 ml-1 border-l border-[#E2DED6]">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isHealthy ? 'bg-[#62C49A] shadow-xs' : 'bg-[#F4B860] animate-ping'
              }`}
            />
            <span className={isHealthy ? 'text-[#3FA97E]' : 'text-[#D88D23]'}>
              {isHealthy ? 'All systems safe' : 'Self-healing in progress'}
            </span>
          </div>
        </div>

        {/* Simplified Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-white/80 rounded-2xl border border-[#E6E2DA] shadow-xs text-xs font-bold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#6C63FF] text-white shadow-xs'
                : 'text-[#777784] hover:text-[#25252D]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('objects')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'objects'
                ? 'bg-[#6C63FF] text-white shadow-xs'
                : 'text-[#777784] hover:text-[#25252D]'
            }`}
          >
            Files ({metrics.totalObjects})
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'nodes'
                ? 'bg-[#6C63FF] text-white shadow-xs'
                : 'text-[#777784] hover:text-[#25252D]'
            }`}
          >
            Servers ({metrics.activeNodes}/{metrics.totalNodes})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'activity'
                ? 'bg-[#6C63FF] text-white shadow-xs'
                : 'text-[#777784] hover:text-[#25252D]'
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab('chaos')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'chaos'
                ? 'bg-[#EF7B7B] text-white shadow-xs'
                : 'text-[#EF7B7B] hover:bg-[#EF7B7B]/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Chaos Lab</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'bg-[#6C63FF] text-white shadow-xs'
                : 'text-[#777784] hover:text-[#25252D]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onStartDemo}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-2xl transition-all ${
              isDemoRunning
                ? 'bg-[#F4B860] text-[#25252D] shadow-md animate-pulse'
                : 'clay-button-primary'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">See VAULT Protect a File</span>
            <span className="sm:hidden">Demo</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="clay-button-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-2xl"
          >
            <Upload className="w-3.5 h-3.5 text-[#6C63FF]" />
            <span className="hidden sm:inline">Upload File</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav row */}
      <div className="flex lg:hidden items-center justify-between gap-1 overflow-x-auto pt-2.5 mt-2 border-t border-[#E6E2DA] text-xs font-bold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1 rounded-xl whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-[#6C63FF] text-white' : 'text-[#777784]'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('objects')}
          className={`px-3 py-1 rounded-xl whitespace-nowrap ${
            activeTab === 'objects' ? 'bg-[#6C63FF] text-white' : 'text-[#777784]'
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveTab('nodes')}
          className={`px-3 py-1 rounded-xl whitespace-nowrap ${
            activeTab === 'nodes' ? 'bg-[#6C63FF] text-white' : 'text-[#777784]'
          }`}
        >
          Servers
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3 py-1 rounded-xl whitespace-nowrap ${
            activeTab === 'activity' ? 'bg-[#6C63FF] text-white' : 'text-[#777784]'
          }`}
        >
          Activity
        </button>
        <button
          onClick={() => setActiveTab('chaos')}
          className={`px-3 py-1 rounded-xl whitespace-nowrap text-[#EF7B7B] ${
            activeTab === 'chaos' ? 'bg-[#EF7B7B] text-white' : ''
          }`}
        >
          Chaos
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-1 rounded-xl whitespace-nowrap ${
            activeTab === 'architecture' ? 'bg-[#6C63FF] text-white' : 'text-[#777784]'
          }`}
        >
          Arch
        </button>
      </div>
    </header>
  );
};
