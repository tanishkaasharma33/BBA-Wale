import React, { useState } from 'react';
import { FileText, Copy, Server, ShieldCheck, ChevronDown, ChevronUp, Sliders, RefreshCw, HardDrive } from 'lucide-react';
import { ClusterMetrics, DurabilityPolicyId } from '../types/storage';
import { DURABILITY_POLICIES } from '../data/initialData';

interface ClusterStatsProps {
  metrics: ClusterMetrics;
  selectedPolicy: DurabilityPolicyId;
  onSelectPolicy: (id: DurabilityPolicyId) => void;
  isAutoRepairEnabled: boolean;
  onToggleAutoRepair: () => void;
}

export const ClusterStats: React.FC<ClusterStatsProps> = ({
  metrics,
  selectedPolicy,
  onSelectPolicy,
  isAutoRepairEnabled,
  onToggleAutoRepair,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const activePolicy = DURABILITY_POLICIES.find((p) => p.id === selectedPolicy) || DURABILITY_POLICIES[1];
  const totalCopies = metrics.totalObjects * activePolicy.replicas;
  const storagePercent = Math.round((metrics.usedStorageGB / metrics.totalStorageGB) * 100);

  return (
    <div className="space-y-4">
      {/* 4 Clean Friendly Clay Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Files */}
        <div className="clay-card p-5 space-y-2 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-[#777784]">
            <span className="text-xs font-bold uppercase tracking-wider">Files</span>
            <div className="w-8 h-8 rounded-xl bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#25252D] tabular-nums">
            {metrics.totalObjects}
          </div>
          <div className="text-xs text-[#777784]">
            Stored safely in the cluster
          </div>
        </div>

        {/* Card 2: Copies */}
        <div className="clay-card p-5 space-y-2 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-[#777784]">
            <span className="text-xs font-bold uppercase tracking-wider">Copies</span>
            <div className="w-8 h-8 rounded-xl bg-[#8B7CF6]/15 text-[#8B7CF6] flex items-center justify-center">
              <Copy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#25252D] tabular-nums">
            {totalCopies}
          </div>
          <div className="text-xs text-[#777784]">
            {activePolicy.replicas} copies of every file
          </div>
        </div>

        {/* Card 3: Healthy Servers */}
        <div className="clay-card p-5 space-y-2 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-[#777784]">
            <span className="text-xs font-bold uppercase tracking-wider">Healthy Servers</span>
            <div className="w-8 h-8 rounded-xl bg-[#62C49A]/15 text-[#62C49A] flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#25252D] tabular-nums">
            {metrics.activeNodes} <span className="text-lg font-bold text-[#777784]">/ {metrics.totalNodes}</span>
          </div>
          <div className="text-xs font-medium">
            {metrics.activeNodes === metrics.totalNodes ? (
              <span className="text-[#3FA97E] flex items-center gap-1 font-semibold">
                <span>●</span> All servers responding
              </span>
            ) : (
              <span className="text-[#D88D23] flex items-center gap-1 font-semibold">
                <span>⚠</span> {metrics.totalNodes - metrics.activeNodes} server offline (healing)
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Protection Level */}
        <div className="clay-card p-5 space-y-2 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-[#777784]">
            <span className="text-xs font-bold uppercase tracking-wider">Protection</span>
            <div className="w-8 h-8 rounded-xl bg-[#62C49A]/15 text-[#62C49A] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-extrabold tabular-nums ${
            metrics.replicationHealthPercent >= 100 ? 'text-[#3FA97E]' : 'text-[#D88D23]'
          }`}>
            {metrics.replicationHealthPercent}%
          </div>
          <div className="text-xs text-[#777784]">
            {metrics.replicationHealthPercent >= 100
              ? 'All files fully protected'
              : 'Re-creating missing copies...'}
          </div>
        </div>
      </div>

      {/* Advanced / System Details Expandable Drawer */}
      <div className="clay-card p-4 transition-all">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#777784] hover:text-[#25252D] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#6C63FF]" />
            <span>Policy & System Details (For Judges & Administrators)</span>
          </span>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6C63FF]">
            <span>{showAdvanced ? 'Hide details' : 'View details'}</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-[#EBE7DF] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in">
            {/* Policy Selector */}
            <div className="space-y-2 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EBE7DF]">
              <div className="font-bold text-[#25252D]">Copies Per File (Durability)</div>
              <div className="flex items-center gap-1.5">
                {DURABILITY_POLICIES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectPolicy(p.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      selectedPolicy === p.id
                        ? 'bg-[#6C63FF] text-white shadow-xs'
                        : 'bg-white text-[#777784] border border-[#EBE7DF] hover:text-[#25252D]'
                    }`}
                  >
                    {p.replicas} copies
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-[#777784] pt-0.5">
                {activePolicy.faultTolerance} · {activePolicy.storageOverhead}
              </div>
            </div>

            {/* Storage Utilization */}
            <div className="space-y-2 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EBE7DF]">
              <div className="flex items-center justify-between font-bold text-[#25252D]">
                <span>Storage Capacity</span>
                <span className="text-[#777784]">{metrics.usedStorageGB} / {metrics.totalStorageGB} GB</span>
              </div>
              <div className="w-full bg-[#EBE7DF] h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6C63FF] rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(4, storagePercent)}%` }}
                />
              </div>
              <div className="text-[11px] text-[#777784]">
                {storagePercent}% cluster disk space utilized
              </div>
            </div>

            {/* Self-Healing Switch */}
            <div className="space-y-2 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EBE7DF] flex flex-col justify-between">
              <div>
                <div className="font-bold text-[#25252D]">Automatic Self-Healing</div>
                <div className="text-[11px] text-[#777784] mt-0.5">
                  Recreates lost copies immediately without human intervention.
                </div>
              </div>

              <button
                onClick={onToggleAutoRepair}
                className={`self-start px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isAutoRepairEnabled
                    ? 'bg-[#62C49A]/20 text-[#3FA97E] border border-[#62C49A]/40'
                    : 'bg-[#F4B860]/20 text-[#D88D23] border border-[#F4B860]/40'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isAutoRepairEnabled ? 'bg-[#62C49A]' : 'bg-[#F4B860]'}`} />
                <span>Auto-Repair: {isAutoRepairEnabled ? 'Active' : 'Paused'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
