import React from 'react';
import { Play, Upload, Flame, ShieldCheck, ArrowRight } from 'lucide-react';
import { HowVaultWorksVisual } from './HowVaultWorksVisual';

interface LandingHeroProps {
  onOpenVault: () => void;
  onRunLiveDemo: () => void;
  onOpenUpload: () => void;
  onOpenChaos: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenVault,
  onRunLiveDemo,
  onOpenUpload,
  onOpenChaos,
}) => {
  return (
    <div className="space-y-8">
      {/* Hero Header Card */}
      <div className="clay-card p-8 sm:p-12 text-center space-y-5 relative overflow-hidden">
        {/* Soft background decorative glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#6C63FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF8F5] text-xs font-bold text-[#6C63FF] border border-[#EBE7DF] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#6C63FF]" />
          <span>Storage that keeps working when things fail</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#25252D] tracking-tight max-w-3xl mx-auto leading-tight">
          Your files stay safe, even when a server fails.
        </h1>

        <p className="text-base sm:text-lg text-[#777784] max-w-2xl mx-auto font-normal leading-relaxed">
          VAULT keeps multiple copies of your files across different storage nodes. If one fails or data gets damaged, VAULT automatically creates a new copy.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onRunLiveDemo}
            className="clay-button-primary flex items-center gap-2 px-6 py-3.5 text-sm font-bold shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>See VAULT Protect a File</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="clay-button-secondary flex items-center gap-2 px-6 py-3.5 text-sm font-bold"
          >
            <Upload className="w-4 h-4 text-[#6C63FF]" />
            <span>Upload a File</span>
          </button>

          <button
            onClick={onOpenChaos}
            className="clay-button-secondary flex items-center gap-2 px-5 py-3.5 text-sm font-bold text-[#EF7B7B] border-[#EF7B7B]/30 hover:bg-[#FFF5F5]"
          >
            <Flame className="w-4 h-4 text-[#EF7B7B]" />
            <span>Try Breaking a Server</span>
          </button>
        </div>
      </div>

      {/* The Visual Explanation Centerpiece */}
      <HowVaultWorksVisual />
    </div>
  );
};
