import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import { DurabilityPolicyId } from '../types/storage';
import { DURABILITY_POLICIES } from '../data/initialData';

interface UploadObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (params: {
    fileName: string;
    fileSizeMB: number;
    mimeType: string;
    replicationFactor: number;
    description: string;
  }) => Promise<void>;
  defaultPolicy: DurabilityPolicyId;
}

const TEMPLATE_FILES = [
  {
    fileName: 'quarterly_financial_report.pdf',
    sizeMB: 18.4,
    mimeType: 'application/pdf',
    description: 'Certified financial compliance report with signatures',
  },
  {
    fileName: 'product_launch_demo.mp4',
    sizeMB: 310.5,
    mimeType: 'video/mp4',
    description: '4K product keynote recording for team archives',
  },
  {
    fileName: 'client_contract_archive.zip',
    sizeMB: 74.2,
    mimeType: 'application/zip',
    description: 'Full customer contract archive with legal verification',
  },
  {
    fileName: 'employee_handbook_2026.pdf',
    sizeMB: 12.8,
    mimeType: 'application/pdf',
    description: 'Internal operations guideline and safety protocols',
  },
];

export const UploadObjectModal: React.FC<UploadObjectModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  defaultPolicy,
}) => {
  const [fileName, setFileName] = useState(TEMPLATE_FILES[0].fileName);
  const [fileSizeMB, setFileSizeMB] = useState(TEMPLATE_FILES[0].sizeMB);
  const [mimeType, setMimeType] = useState(TEMPLATE_FILES[0].mimeType);
  const [description, setDescription] = useState(TEMPLATE_FILES[0].description);
  const [selectedPolicy, setSelectedPolicy] = useState<DurabilityPolicyId>(defaultPolicy);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPolicy = DURABILITY_POLICIES.find((p) => p.id === selectedPolicy) || DURABILITY_POLICIES[1];

  const handleSelectTemplate = (template: typeof TEMPLATE_FILES[0]) => {
    setFileName(template.fileName);
    setFileSizeMB(template.sizeMB);
    setMimeType(template.mimeType);
    setDescription(template.description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    try {
      setIsSubmitting(true);
      setUploadPhase('1/3 Calculating SHA-256 fingerprint...');
      await new Promise((r) => setTimeout(r, 350));

      setUploadPhase(`2/3 Selecting ${currentPolicy.replicas} healthy servers across different zones...`);
      await new Promise((r) => setTimeout(r, 400));

      setUploadPhase(`3/3 Distributing ${currentPolicy.replicas} copies safely...`);
      await new Promise((r) => setTimeout(r, 450));

      await onUpload({
        fileName: fileName.trim(),
        fileSizeMB: Number(fileSizeMB),
        mimeType,
        replicationFactor: currentPolicy.replicas,
        description: description.trim(),
      });

      onClose();
    } catch (err: any) {
      alert(err?.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
      setUploadPhase(null);
    }
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
            <div className="w-10 h-10 rounded-2xl bg-[#6C63FF]/15 text-[#6C63FF] flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#25252D]">
                Store a New File
              </h3>
              <p className="text-xs text-[#777784]">
                VAULT will automatically duplicate it across independent servers.
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

        {/* Quick Sample Presets */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#777784]">
            Quick Sample Files
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {TEMPLATE_FILES.map((tpl) => (
              <button
                key={tpl.fileName}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-3 rounded-2xl border text-left text-xs transition-all truncate shadow-xs ${
                  fileName === tpl.fileName
                    ? 'bg-[#F9F8FF] border-[#6C63FF] text-[#6C63FF] font-bold'
                    : 'bg-[#FAF8F5] border-[#EBE7DF] text-[#25252D] hover:border-[#6C63FF]/50'
                }`}
              >
                <div className="truncate font-bold">{tpl.fileName}</div>
                <div className="text-[11px] text-[#777784] mt-0.5">{tpl.sizeMB} MB · {tpl.mimeType.split('/')[1]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#25252D]">File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
              className="w-full text-xs font-medium bg-[#FAF8F5] border border-[#E2DED6] rounded-2xl p-3 text-[#25252D] focus:outline-none focus:border-[#6C63FF] focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#25252D]">Size (MB)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={fileSizeMB}
                onChange={(e) => setFileSizeMB(parseFloat(e.target.value) || 1)}
                required
                className="w-full text-xs font-medium bg-[#FAF8F5] border border-[#E2DED6] rounded-2xl p-3 text-[#25252D] focus:outline-none focus:border-[#6C63FF] focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#25252D]">Format</label>
              <input
                type="text"
                value={mimeType}
                onChange={(e) => setMimeType(e.target.value)}
                className="w-full text-xs font-medium bg-[#FAF8F5] border border-[#E2DED6] rounded-2xl p-3 text-[#25252D] focus:outline-none focus:border-[#6C63FF] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Protection Policy */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#25252D] flex items-center justify-between">
              <span>Protection Level</span>
              <span className="text-[#6C63FF] font-bold">{currentPolicy.replicas} Copies ({currentPolicy.faultTolerance})</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DURABILITY_POLICIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPolicy(p.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all shadow-xs ${
                    selectedPolicy === p.id
                      ? 'bg-[#6C63FF] border-[#6C63FF] text-white font-bold'
                      : 'bg-[#FAF8F5] border-[#EBE7DF] text-[#777784] hover:text-[#25252D]'
                  }`}
                >
                  <div className="text-xs font-bold">{p.replicas} Copies</div>
                  <div className="text-[10px] opacity-80 mt-0.5 truncate">{p.name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Progress */}
          {uploadPhase && (
            <div className="p-3.5 rounded-2xl bg-[#F8F7FF] border border-[#6C63FF]/30 text-xs font-bold text-[#6C63FF] flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-ping" />
              <span>{uploadPhase}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE7DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-[#777784] hover:text-[#25252D] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="clay-button-primary flex items-center gap-2 px-6 py-2.5 text-xs font-bold disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Distributing Copies...' : 'Save File Safely'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
