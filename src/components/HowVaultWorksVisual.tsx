import React, { useState } from 'react';
import { FileText, Check, X, ArrowRight, ShieldCheck, RefreshCw, Server, Sparkles } from 'lucide-react';

export const HowVaultWorksVisual: React.FC = () => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  return (
    <div className="clay-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE7DF] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#6C63FF] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Visual Guide</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#25252D]">
            How VAULT protects your files
          </h2>
          <p className="text-sm text-[#777784] mt-0.5">
            Click the stages below to see how VAULT survives server crashes automatically.
          </p>
        </div>

        {/* Interactive Step Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#FAF8F5] rounded-2xl border border-[#EBE7DF]">
          <button
            onClick={() => setActiveStep(1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeStep === 1
                ? 'bg-white text-[#6C63FF] shadow-sm'
                : 'text-[#777784] hover:text-[#25252D]'
            }`}
          >
            1. Safe Copies
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeStep === 2
                ? 'bg-white text-[#EF7B7B] shadow-sm'
                : 'text-[#777784] hover:text-[#25252D]'
            }`}
          >
            2. A Server Fails
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeStep === 3
                ? 'bg-white text-[#62C49A] shadow-sm'
                : 'text-[#777784] hover:text-[#25252D]'
            }`}
          >
            3. Self-Healing
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Display */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-8">
        {/* Top File Icon */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-[#6C63FF] border border-[#EBE7DF]">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#777784]">YOUR FILE</div>
            <div className="text-base font-bold text-[#25252D]">project.zip (250 MB)</div>
          </div>
        </div>

        {/* Narrative Arrow Indicator */}
        <div className="flex items-center justify-center">
          <div className="px-4 py-1.5 rounded-full bg-white text-xs font-bold text-[#6C63FF] shadow-sm border border-[#EBE7DF] flex items-center gap-2">
            {activeStep === 1 && <span>VAULT makes 3 separate copies</span>}
            {activeStep === 2 && <span className="text-[#EF7B7B]">Server 2 suddenly goes offline</span>}
            {activeStep === 3 && <span className="text-[#62C49A]">VAULT creates a fresh replacement copy</span>}
          </div>
        </div>

        {/* 3 Server Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {/* Node 1 */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2DED6] shadow-sm text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#62C49A]/15 text-[#62C49A] flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="font-bold text-[#25252D] text-sm">Server 1</div>
            <div className="text-xs text-[#62C49A] font-semibold">Copy #1 · Safe</div>
          </div>

          {/* Node 2 or Replacement Node 4 */}
          {activeStep === 1 && (
            <div className="bg-white rounded-2xl p-5 border border-[#E2DED6] shadow-sm text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#62C49A]/15 text-[#62C49A] flex items-center justify-center mx-auto">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="font-bold text-[#25252D] text-sm">Server 2</div>
              <div className="text-xs text-[#62C49A] font-semibold">Copy #2 · Safe</div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="bg-[#FFF5F5] rounded-2xl p-5 border border-[#EF7B7B]/50 shadow-sm text-center space-y-2 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[#EF7B7B]/20 text-[#EF7B7B] flex items-center justify-center mx-auto">
                <X className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="font-bold text-[#EF7B7B] text-sm">Server 2 (Crashed)</div>
              <div className="text-xs text-[#EF7B7B] font-semibold">Copy offline · Fixing...</div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="bg-[#F0FDF4] rounded-2xl p-5 border-2 border-[#62C49A] shadow-md text-center space-y-2 animate-in zoom-in-95">
              <div className="w-10 h-10 rounded-xl bg-[#62C49A] text-white flex items-center justify-center mx-auto">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="font-bold text-[#25252D] text-sm">Server 4 (New Host)</div>
              <div className="text-xs text-[#62C49A] font-bold">Copy restored ✓</div>
            </div>
          )}

          {/* Node 3 */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2DED6] shadow-sm text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#62C49A]/15 text-[#62C49A] flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="font-bold text-[#25252D] text-sm">Server 3</div>
            <div className="text-xs text-[#62C49A] font-semibold">Copy #3 · Safe</div>
          </div>
        </div>

        {/* Bottom Takeaway Message */}
        <div className="text-center pt-2">
          {activeStep === 1 && (
            <p className="text-sm text-[#777784] max-w-md mx-auto">
              Your file is spread across 3 independent servers. Even if any single machine goes down, you won't lose a single byte.
            </p>
          )}
          {activeStep === 2 && (
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#25252D]">
                Don't worry — your file is still 100% accessible from Server 1 and Server 3!
              </p>
              <p className="text-xs text-[#777784]">
                VAULT immediately notices the offline server and schedules an automatic replacement.
              </p>
            </div>
          )}
          {activeStep === 3 && (
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#62C49A] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>You're protected! 3 healthy copies are back in place.</span>
              </p>
              <p className="text-xs text-[#777784]">
                VAULT automatically copied the file to Server 4 without anyone lifting a finger.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
