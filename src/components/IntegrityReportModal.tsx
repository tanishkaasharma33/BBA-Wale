import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertOctagon, ShieldCheck, Clock } from 'lucide-react';
import { IntegrityCheckReport } from '../types/storage';

interface IntegrityReportModalProps {
  isOpen: boolean;
  report: IntegrityCheckReport | null;
  onClose: () => void;
}

export const IntegrityReportModal: React.FC<IntegrityReportModalProps> = ({ isOpen, report, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const isAllHealthy = report.corruptedReplicas === 0 && report.missingReplicas === 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="clay-card relative w-full max-w-lg p-6 sm:p-8 space-y-6 text-[#25252D]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              isAllHealthy ? 'bg-[#62C49A]/20 text-[#3FA97E]' : 'bg-[#F4B860]/20 text-[#D88D23]'
            }`}>
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#25252D]">
                Cluster Health Audit
              </h3>
              <p className="text-xs text-[#777784]">
                Cryptographic checksum verification scan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Audit Modal"
            className="p-2 rounded-xl text-[#777784] hover:text-[#25252D] hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 ${
            isAllHealthy
              ? 'bg-[#F0FDF4] border-[#62C49A]/40 text-[#3FA97E]'
              : 'bg-[#FFFDF5] border-[#F4B860]/50 text-[#D88D23]'
          }`}
        >
          {isAllHealthy ? (
            <CheckCircle2 className="w-6 h-6 text-[#62C49A] shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-[#F4B860] shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm text-[#25252D]">
              {isAllHealthy ? '100% Protection Confirmed' : 'Action Required on Some Replicas'}
            </div>
            <div className="text-xs text-[#777784] mt-0.5">
              {isAllHealthy
                ? 'Every file copy matched its cryptographic fingerprint perfectly.'
                : 'VAULT detected differences and has scheduled automatic self-healing.'}
            </div>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF]">
            <div className="text-[10px] text-[#777784] uppercase font-bold tracking-wider">Healthy Copies</div>
            <div className="text-2xl font-extrabold text-[#3FA97E] tabular-nums mt-0.5">
              {report.healthyReplicas}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF]">
            <div className="text-[10px] text-[#777784] uppercase font-bold tracking-wider">Damaged</div>
            <div className={`text-2xl font-extrabold tabular-nums mt-0.5 ${report.corruptedReplicas > 0 ? 'text-[#EF7B7B]' : 'text-[#777784]'}`}>
              {report.corruptedReplicas}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF]">
            <div className="text-[10px] text-[#777784] uppercase font-bold tracking-wider">Offline</div>
            <div className={`text-2xl font-extrabold tabular-nums mt-0.5 ${report.missingReplicas > 0 ? 'text-[#D88D23]' : 'text-[#777784]'}`}>
              {report.missingReplicas}
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#777784]">
            <span className="font-medium">Checked: {report.totalObjects} files ({report.totalReplicas} total copies)</span>
            <span className="flex items-center gap-1 font-bold">
              <Clock className="w-3.5 h-3.5" />
              {report.scanDurationMs}ms scan
            </span>
          </div>

          {report.issues.length > 0 ? (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {report.issues.map((iss, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] text-xs flex items-start gap-2.5"
                >
                  <AlertOctagon className="w-4 h-4 text-[#D88D23] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#25252D] font-bold">{iss.fileName} ({iss.nodeId})</div>
                    <div className="text-[#777784] text-[11px] mt-0.5">{iss.issue}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] text-center text-xs text-[#777784]">
              ✓ All checksums matched. Zero data loss detected across the entire cluster.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#EBE7DF] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="clay-button-primary px-6 py-2.5 text-xs font-bold shadow-md"
          >
            Done & Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
