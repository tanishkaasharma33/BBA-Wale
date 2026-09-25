import React, { useState } from 'react';
import { DecisionExplanation } from '../types/storage';
import { HelpCircle, ShieldCheck, AlertOctagon, RefreshCw, Zap, Cpu, CheckCircle2 } from 'lucide-react';
import { formatTimeAgo } from '../utils/crypto';

interface ExplainabilityPanelProps {
  explanations: DecisionExplanation[];
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ explanations }) => {
  const [selectedExplId, setSelectedExplId] = useState<string | null>(explanations[0]?.id || null);

  const activeExplanation = explanations.find((e) => e.id === selectedExplId) || explanations[0];

  const getCategoryTheme = (category: DecisionExplanation['category']) => {
    switch (category) {
      case 'FAILOVER':
        return {
          icon: <AlertOctagon className="w-4 h-4 text-[#EF7B7B]" />,
          badgeBg: 'bg-[#FFF5F5]',
          badgeText: 'text-[#EF7B7B]',
          label: 'Failover',
        };
      case 'SELF_HEAL':
        return {
          icon: <RefreshCw className="w-4 h-4 text-[#62C49A]" />,
          badgeBg: 'bg-[#F0FDF4]',
          badgeText: 'text-[#3FA97E]',
          label: 'Self-Heal',
        };
      case 'CORRUPTION':
        return {
          icon: <Zap className="w-4 h-4 text-[#F4B860]" />,
          badgeBg: 'bg-[#FFFDF5]',
          badgeText: 'text-[#D88D23]',
          label: 'Corruption Fixed',
        };
      case 'REBALANCE':
        return {
          icon: <Cpu className="w-4 h-4 text-[#6C63FF]" />,
          badgeBg: 'bg-[#F8F7FF]',
          badgeText: 'text-[#6C63FF]',
          label: 'Rebalanced',
        };
      default:
        return {
          icon: <ShieldCheck className="w-4 h-4 text-[#6C63FF]" />,
          badgeBg: 'bg-[#F8F7FF]',
          badgeText: 'text-[#6C63FF]',
          label: 'Invariant Guard',
        };
    }
  };

  return (
    <div className="clay-card p-6 sm:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE7DF] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#6C63FF] text-xs font-bold uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Autonomous Logic & Explainability</span>
          </div>
          <h2 className="text-xl font-bold text-[#25252D]">
            Why did VAULT do this?
          </h2>
          <p className="text-xs text-[#777784] mt-0.5">
            Transparent explanations of every automated intervention and recovery decision.
          </p>
        </div>
      </div>

      {explanations.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#777784] bg-[#FAF8F5] rounded-3xl border border-[#EBE7DF]">
          No automated interventions logged yet. Perform an action or trigger Chaos to observe decisions.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Decision List */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {explanations.map((exp) => {
              const isSelected = activeExplanation?.id === exp.id;
              const theme = getCategoryTheme(exp.category);

              return (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExplId(exp.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#F9F8FF] border-[#6C63FF] shadow-xs'
                      : 'bg-white border-[#EBE7DF] hover:border-[#6C63FF]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#25252D] truncate">
                      {theme.icon}
                      {exp.title}
                    </span>
                    <span className="text-[10px] text-[#777784] shrink-0">
                      {formatTimeAgo(exp.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#777784] line-clamp-1">
                    {exp.trigger}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep Explainability Card */}
          {activeExplanation && (
            <div className="lg:col-span-7 rounded-3xl border border-[#EBE7DF] bg-[#FAF8F5] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
                <span className="text-sm font-bold text-[#25252D] flex items-center gap-2">
                  {getCategoryTheme(activeExplanation.category).icon}
                  {activeExplanation.title}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  getCategoryTheme(activeExplanation.category).badgeBg
                } ${getCategoryTheme(activeExplanation.category).badgeText} border-current/20`}>
                  {activeExplanation.category}
                </span>
              </div>

              {/* Trigger */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#777784]">
                  1. What Triggered This?
                </div>
                <div className="text-xs font-medium text-[#25252D] bg-white p-3 rounded-2xl border border-[#EBE7DF]">
                  {activeExplanation.trigger}
                </div>
              </div>

              {/* Safety Invariant */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#D88D23]">
                  2. Safety Rule Evaluated
                </div>
                <div className="text-xs font-medium text-[#25252D] bg-[#FFFDF5] p-3 rounded-2xl border border-[#F4B860]/40">
                  {activeExplanation.invariant}
                </div>
              </div>

              {/* Reasoning */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6C63FF]">
                  3. System Decision & Reasoning
                </div>
                <p className="text-xs text-[#25252D] leading-relaxed bg-white p-3 rounded-2xl border border-[#EBE7DF]">
                  {activeExplanation.reasoning}
                </p>
              </div>

              {/* Action & Outcome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EBE7DF]">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#777784]">Action Taken</div>
                  <div className="text-xs font-bold text-[#25252D] mt-0.5">{activeExplanation.action}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#3FA97E]">Outcome</div>
                  <div className="text-xs font-bold text-[#3FA97E] mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{activeExplanation.outcome}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
