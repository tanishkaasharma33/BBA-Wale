import React from 'react';
import { Copy, Eye, RefreshCw } from 'lucide-react';

export const SimpleStepsExplainer: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-xl sm:text-2xl font-bold text-[#25252D]">
          VAULT in 3 simple steps
        </h3>
        <p className="text-sm text-[#777784]">
          Zero setup. Zero complex configuration. Self-healing storage by default.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Step 1 */}
        <div className="clay-card p-6 space-y-3 relative overflow-hidden transition-all hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#6C63FF]/15 text-[#6C63FF] flex items-center justify-center shadow-sm">
            <Copy className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#6C63FF]">Step 01</div>
          <h4 className="text-lg font-bold text-[#25252D]">1. Make copies</h4>
          <p className="text-sm text-[#777784] leading-relaxed">
            Your file is safely copied to multiple storage nodes across different locations so no single point of failure exists.
          </p>
        </div>

        {/* Step 2 */}
        <div className="clay-card p-6 space-y-3 relative overflow-hidden transition-all hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#F4B860]/20 text-[#D88D23] flex items-center justify-center shadow-sm">
            <Eye className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#D88D23]">Step 02</div>
          <h4 className="text-lg font-bold text-[#25252D]">2. Detect problems</h4>
          <p className="text-sm text-[#777784] leading-relaxed">
            If a server shuts down or a file copy gets damaged by silent hardware glitches, VAULT detects the issue within seconds.
          </p>
        </div>

        {/* Step 3 */}
        <div className="clay-card p-6 space-y-3 relative overflow-hidden transition-all hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#62C49A]/20 text-[#3FA97E] flex items-center justify-center shadow-sm">
            <RefreshCw className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#3FA97E]">Step 03</div>
          <h4 className="text-lg font-bold text-[#25252D]">3. Fix it automatically</h4>
          <p className="text-sm text-[#777784] leading-relaxed">
            VAULT immediately creates a fresh copy on another healthy server and restores full protection without human intervention.
          </p>
        </div>
      </div>
    </div>
  );
};
