import React from 'react';
import { X, Play, Pause, SkipForward, SkipBack, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { DemoStep } from '../types/storage';
import { DEMO_STEPS } from '../services/demoRunner';

interface DemoWalkthroughModalProps {
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

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({
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
  const progressPercent = Math.round((currentStep.stepNumber / totalSteps) * 100);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-5">
      <div className="rounded-2xl border border-violet-500/50 bg-[#090b14]/95 backdrop-blur-md p-5 shadow-2xl text-slate-100 space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-violet-950 text-violet-400 border border-violet-800">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Hackathon Live Demo Sequence
              </span>
              <div className="text-[10px] text-slate-400 font-mono">
                Step {currentStep.stepNumber} of {totalSteps}: {progressPercent}% Completed
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Active Step Content */}
        <div className="space-y-2 py-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-violet-950/80 text-violet-300 border border-violet-800">
              {currentStep.stepNumber < 10 ? `0${currentStep.stepNumber}` : currentStep.stepNumber}
            </span>
            <h4 className="text-sm font-bold font-mono text-white">
              {currentStep.title}
            </h4>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {currentStep.description}
          </p>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-cyan-300 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Expected Resilience Invariant:</div>
            <div className="text-slate-200">{currentStep.expectedOutcome}</div>
          </div>

          {currentStep.autoActionText && (
            <div className="text-[10px] font-mono text-violet-400 flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span>{currentStep.autoActionText}</span>
            </div>
          )}
        </div>

        {/* Interactive Step Controllers */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              disabled={currentStep.stepNumber === 1}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors"
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {isPaused || !isRunning ? (
              <button
                onClick={onResume}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-semibold transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-xs font-semibold transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={onNext}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onRestart}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restart Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
