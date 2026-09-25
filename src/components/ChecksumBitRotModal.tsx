import React, { useState } from 'react';
import { X, Zap, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StorageObject, ObjectReplica, StorageNode } from '../types/storage';

interface ChecksumBitRotModalProps {
  object: StorageObject | null;
  replica: ObjectReplica | null;
  node: StorageNode | null;
  onClose: () => void;
  onRepair: (objectId: string, nodeId: string) => void;
}

export const ChecksumBitRotModal: React.FC<ChecksumBitRotModalProps> = ({
  object,
  replica,
  node,
  onClose,
  onRepair,
}) => {
  const [isHealing, setIsHealing] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && object) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [object, onClose]);

  if (!object || !replica || !node) return null;

  const expected = replica.expectedChecksum;
  const actual = replica.actualChecksum;
  const isCorrupted = replica.status === 'CORRUPTED' || expected !== actual;

  const handleStartHeal = async () => {
    setIsHealing(true);
    await new Promise((r) => setTimeout(r, 500));
    onRepair(object.objectId, node.id);
    setIsHealing(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="clay-card relative w-full max-w-xl p-6 sm:p-8 space-y-6 text-[#25252D]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              isCorrupted
                ? 'bg-[#EF7B7B]/15 text-[#EF7B7B]'
                : 'bg-[#62C49A]/15 text-[#3FA97E]'
            }`}>
              <Zap className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#25252D]">
                Data Corruption Inspector
              </h3>
              <p className="text-xs text-[#777784]">
                Host: <strong className="text-[#25252D]">{node.name}</strong> · File: <strong className="text-[#6C63FF]">{object.fileName}</strong>
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

        {/* Status Callout */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
          isCorrupted
            ? 'bg-[#FFF5F5] border-[#EF7B7B]/40 text-[#EF7B7B]'
            : 'bg-[#F0FDF4] border-[#62C49A]/40 text-[#3FA97E]'
        }`}>
          {isCorrupted ? (
            <AlertTriangle className="w-6 h-6 text-[#EF7B7B] shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-[#62C49A] shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-bold text-sm text-[#25252D]">
              {isCorrupted
                ? 'Damaged Copy Detected: Checksum Mismatch'
                : 'Copy is 100% Intact'}
            </div>
            <p className="text-xs text-[#777784] leading-relaxed">
              {isCorrupted
                ? 'A silent hardware error or bit-rot altered bytes on this server. VAULT detected the checksum discrepancy and isolated this copy so no user receives bad data.'
                : 'All bytes match the authoritative fingerprint perfectly. This copy is healthy.'}
            </p>
          </div>
        </div>

        {/* Checksum Diff */}
        <div className="space-y-3 text-xs">
          {/* Expected Signature */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[#777784] font-medium text-[11px]">
              <span className="font-bold uppercase tracking-wider">Expected Fingerprint (Original File)</span>
              <span className="text-[#3FA97E] font-bold">Safe Original</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] text-[#3FA97E] font-mono break-all text-[11px] leading-relaxed">
              {expected}
            </div>
          </div>

          {/* Actual Disk Block Signature */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[#777784] font-medium text-[11px]">
              <span className="font-bold uppercase tracking-wider">Actual Disk Fingerprint on {node.name}</span>
              <span className={isCorrupted ? 'text-[#EF7B7B] font-bold' : 'text-[#3FA97E] font-bold'}>
                {isCorrupted ? 'Damaged Bytes (Highlighted in Red)' : 'Matches 100%'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] font-mono break-all text-[11px] leading-relaxed">
              {actual.split('').map((char, index) => {
                const isDiff = expected[index] !== char;
                return (
                  <span
                    key={index}
                    className={
                      isDiff
                        ? 'bg-[#EF7B7B] text-white font-bold px-0.5 rounded'
                        : 'text-[#25252D]'
                    }
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#EBE7DF] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#777784]">
            {isCorrupted
              ? 'Click below to stream a pristine replacement from healthy peer copies.'
              : 'Integrity verified. No action needed.'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#777784] hover:text-[#25252D] transition-colors"
            >
              Close
            </button>

            {isCorrupted && (
              <button
                onClick={handleStartHeal}
                disabled={isHealing}
                className="clay-button-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#62C49A] hover:bg-[#52B48A] text-white shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isHealing ? 'animate-spin' : ''}`} />
                <span>{isHealing ? 'Restoring Bytes...' : 'Fix from Healthy Copy'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
