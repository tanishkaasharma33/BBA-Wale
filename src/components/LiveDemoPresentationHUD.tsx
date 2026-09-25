import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Zap,
  HardDrive,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { DemoStep } from '../types/storage';
import { DEMO_STEPS } from '../services/demoRunner';

interface LiveDemoPresentationHUDProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: DemoStep;
  isRunning: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRestart: () => void;
}

export const LiveDemoPresentationHUD: React.FC<LiveDemoPresentationHUDProps> = ({
  isOpen,
  onClose,
  currentStep,
  isRunning,
  isPaused,
  onPause,
  onResume,
  onNext,
  onPrev,
  onRestart,
}) => {
  if (!isOpen) return null;

  const totalSteps = DEMO_STEPS.length;

  const getStageIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
      case 2:
      case 3:
        return <HardDrive className="w-4 h-4 text-[#6C63FF]" />;
      case 4:
      case 5:
        return <AlertTriangle className="w-4 h-4 text-[#EF7B7B]" />;
      case 6:
        return <ShieldCheck className="w-4 h-4 text-[#62C49A]" />;
      case 7:
        return <RefreshCw className="w-4 h-4 text-[#8B7CF6] animate-spin" />;
      case 8:
      case 9:
        return <Zap className="w-4 h-4 text-[#F4B860]" />;
      case 10:
        return <RefreshCw className="w-4 h-4 text-[#62C49A] animate-spin" />;
      case 11:
      case 12:
        return <CheckCircle2 className="w-4 h-4 text-[#62C49A]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#6C63FF]" />;
    }
  };

  return (
    <aside
      aria-label="Guided Live Demo Controller"
      className="sticky top-[60px] z-30 w-full bg-[#FAF8F5]/95 border-b border-[#E6E2DA] shadow-md backdrop-blur-md px-4 lg:px-8 py-3.5 transition-all animate-in slide-in-from-top-2"
    >
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top Bar: Step & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6C63FF] text-white text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {currentStep.stepNumber} of {totalSteps}</span>
            </span>

            <span className="text-sm font-extrabold text-[#25252D]">
              {currentStep.stageName}
            </span>

            <span className="text-xs text-[#777784] hidden lg:inline font-medium">
              · Guided 3-Minute Hackathon Walkthrough
            </span>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={currentStep.stepNumber === 1}
              className="p-2 rounded-xl bg-white hover:bg-[#F2EFE8] text-[#25252D] border border-[#EBE7DF] disabled:opacity-30 transition-all shadow-xs"
              title="Previous Step"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {isPaused || !isRunning ? (
              <button
                onClick={onResume}
                className="clay-button-primary flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Demo</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="clay-button-secondary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#D88D23] border-[#F4B860]/50 bg-[#FFFDF5]"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Auto-Step</span>
              </button>
            )}

            <button
              onClick={onNext}
              className="clay-button-secondary flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold"
              title="Next Step"
            >
              <span>Next</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onRestart}
              className="p-2 rounded-xl bg-white hover:bg-[#F2EFE8] text-[#777784] hover:text-[#25252D] border border-[#EBE7DF] transition-all shadow-xs"
              title="Restart Demo From Step 1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-[#FFF5F5] text-[#EF7B7B] border border-[#EF7B7B]/30 transition-all shadow-xs ml-1"
              title="Close Demo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 12-Step Progress Indicator */}
        <div className="hidden md:grid grid-cols-12 gap-1.5 pt-1">
          {DEMO_STEPS.map((s) => {
            const isCompleted = s.stepNumber < currentStep.stepNumber;
            const isCurrent = s.stepNumber === currentStep.stepNumber;

            return (
              <div
                key={s.stepNumber}
                className={`flex flex-col gap-1 text-[10px] font-semibold transition-all ${
                  isCurrent
                    ? 'text-[#6C63FF] font-bold'
                    : isCompleted
                    ? 'text-[#25252D]'
                    : 'text-[#777784]'
                }`}
              >
                <div
                  className={`h-2 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-[#6C63FF] shadow-sm shadow-[#6C63FF]/30'
                      : isCompleted
                      ? 'bg-[#62C49A]'
                      : 'bg-[#E5E0D6]'
                  }`}
                />
                <span className="truncate">{s.stepNumber}. {s.stageName.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>

        {/* Dedicated "What Just Happened?" Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-2 border-t border-[#E6E2DA] items-stretch">
          {/* Left Column: Stage Summary */}
          <div className="lg:col-span-5 rounded-2xl bg-white border border-[#EBE7DF] p-4 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2">
              {getStageIcon(currentStep.stepNumber)}
              <h3 className="text-sm font-bold text-[#25252D]">
                {currentStep.title}
              </h3>
            </div>
            <p className="text-xs text-[#777784] leading-relaxed">
              {currentStep.description}
            </p>
            {currentStep.autoActionText && (
              <div className="text-xs font-bold text-[#6C63FF] flex items-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-ping" />
                <span>{currentStep.autoActionText}</span>
              </div>
            )}
          </div>

          {/* Right Column: "What Just Happened?" */}
          <div className="lg:col-span-7 rounded-2xl bg-white border border-[#6C63FF]/30 p-4 flex flex-col justify-between space-y-2 shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#6C63FF] uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-[#6C63FF]" />
                  <span>What Just Happened?</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C63FF] bg-[#F8F7FF] px-2.5 py-0.5 rounded-full border border-[#6C63FF]/20">
                  {currentStep.systemConcept}
                </span>
              </div>
              <p className="text-xs text-[#25252D] leading-relaxed">
                {currentStep.whatJustHappened}
              </p>
            </div>

            <div className="text-xs font-bold text-[#3FA97E] flex items-center gap-2 pt-2 border-t border-[#EBE7DF]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#62C49A] shrink-0" />
              <span>Safety Guarantee: {currentStep.expectedOutcome}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
