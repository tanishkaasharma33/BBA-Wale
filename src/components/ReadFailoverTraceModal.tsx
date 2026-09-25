import React from 'react';
import { X, CheckCircle2, AlertOctagon, ShieldCheck, ArrowRight, HardDrive, Clock } from 'lucide-react';
import { ReadTraceResult, StorageObject } from '../types/storage';

interface ReadFailoverTraceModalProps {
  trace: ReadTraceResult | null;
  object?: StorageObject | null;
  onClose: () => void;
}

export const ReadFailoverTraceModal: React.FC<ReadFailoverTraceModalProps> = ({
  trace,
  object,
  onClose,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && trace) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trace, onClose]);

  if (!trace) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="clay-card relative w-full max-w-xl p-6 sm:p-8 space-y-6 text-[#25252D]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              trace.failoverOccurred
                ? 'bg-[#F4B860]/20 text-[#D88D23]'
                : 'bg-[#62C49A]/20 text-[#3FA97E]'
            }`}>
              <HardDrive className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[#25252D]">
                  File Access Trace
                </h3>
                {trace.failoverOccurred && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D88D23] bg-[#FFFDF5] px-2.5 py-0.5 rounded-full border border-[#F4B860]/40">
                    Transparent Failover
                  </span>
                )}
              </div>
              <p className="text-xs text-[#777784]">
                Entity: <strong className="text-[#25252D] font-bold">{trace.fileName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#777784] hover:text-[#25252D] hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resilience Summary Banner */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
          trace.success
            ? trace.failoverOccurred
              ? 'bg-[#FFFDF5] border-[#F4B860]/40 text-[#D88D23]'
              : 'bg-[#F0FDF4] border-[#62C49A]/40 text-[#3FA97E]'
            : 'bg-[#FFF5F5] border-[#EF7B7B]/40 text-[#EF7B7B]'
        }`}>
          {trace.success ? (
            <CheckCircle2 className="w-6 h-6 text-[#62C49A] shrink-0 mt-0.5" />
          ) : (
            <AlertOctagon className="w-6 h-6 text-[#EF7B7B] shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-bold text-sm text-[#25252D]">
              {trace.success
                ? trace.failoverOccurred
                  ? 'Server Offline? No Problem — File Delivered Instantly!'
                  : 'File Accessed Directly with 100% Integrity'
                : 'Read Failed: No Copies Available'}
            </div>
            <p className="text-xs text-[#777784] leading-relaxed">
              {trace.failoverOccurred
                ? `Even though a replica server was unavailable, VAULT automatically grabbed another healthy copy from ${trace.servingNodeName}. You experienced zero interruption or error.`
                : `Delivered directly from healthy server ${trace.servingNodeName} with verified checksum match.`}
            </p>
          </div>
        </div>

        {/* Step-by-Step Distributed Trace Timeline */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#777784] flex items-center justify-between">
            <span>Execution Steps</span>
            <span>Speed / Result</span>
          </div>

          <div className="space-y-2">
            {trace.steps.map((step, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                  step.status === 'SUCCESS'
                    ? 'bg-[#F0FDF4] border-[#62C49A]/30'
                    : 'bg-[#FFF5F5] border-[#EF7B7B]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2 text-[#25252D]">
                    {step.status === 'SUCCESS' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#62C49A]" />
                    ) : (
                      <AlertOctagon className="w-4 h-4 text-[#EF7B7B]" />
                    )}
                    <span>Step {idx + 1}: {step.nodeName}</span>
                  </span>
                  <span className="text-[11px] text-[#777784] flex items-center gap-1 font-bold">
                    <Clock className="w-3 h-3 text-[#777784]" />
                    {step.latencyMs}ms
                  </span>
                </div>
                <p className="text-xs text-[#777784] pl-6">
                  {step.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-[#EBE7DF]">
          <button
            onClick={onClose}
            className="clay-button-primary px-6 py-2.5 text-xs font-bold shadow-md"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
