import React, { useState } from 'react';
import { X, Copy, Check, FileText } from 'lucide-react';
import { StorageObject, ObjectReplica, StorageNode } from '../types/storage';

interface MetadataViewerModalProps {
  object: StorageObject | null;
  replicas: ObjectReplica[];
  nodes: StorageNode[];
  onClose: () => void;
}

export const MetadataViewerModal: React.FC<MetadataViewerModalProps> = ({
  object,
  replicas,
  nodes,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && object) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [object, onClose]);

  if (!object) return null;

  const objReplicas = replicas.filter((r) => r.objectId === object.objectId);

  const metadataJSON = {
    objectId: object.objectId,
    fileName: object.fileName,
    sizeMB: object.fileSizeMB,
    mimeType: object.mimeType,
    version: object.version,
    authoritativeChecksum: object.checksum,
    replicationFactor: object.replicationFactor,
    status: object.status,
    createdAt: new Date(object.createdAt).toISOString(),
    updatedAt: new Date(object.updatedAt).toISOString(),
    replicaLocations: object.replicaLocations.map((nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      const rep = objReplicas.find((r) => r.nodeId === nodeId);
      return {
        nodeId,
        nodeName: node?.name || nodeId,
        rack: node?.rack,
        status: rep?.status || 'UNKNOWN',
        verifiedChecksum: rep?.actualChecksum,
        lastVerified: rep?.lastVerifiedAt ? new Date(rep.lastVerifiedAt).toISOString() : null,
      };
    }),
    versionHistory: object.versionsHistory.map((v) => ({
      version: v.version,
      checksum: v.checksum,
      updatedAt: new Date(v.updatedAt).toISOString(),
      sizeMB: v.sizeMB,
      note: v.note,
    })),
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(metadataJSON, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="clay-card relative w-full max-w-2xl max-h-[85vh] flex flex-col p-6 sm:p-8 space-y-5 text-[#25252D] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6C63FF]/15 text-[#6C63FF] flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#25252D]">
                {object.fileName}
              </h3>
              <p className="text-xs text-[#777784]">
                Detailed catalog metadata & replica record
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="clay-button-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#3FA97E]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#777784] hover:text-[#25252D] hover:bg-[#FAF8F5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto space-y-4 pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pb-2 text-xs">
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#777784]">Version</div>
              <div className="text-sm font-bold text-[#6C63FF] mt-0.5">v{object.version}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#777784]">Copies</div>
              <div className="text-sm font-bold text-[#3FA97E] mt-0.5">{object.replicaLocations.length} / {object.replicationFactor}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#777784]">Status</div>
              <div className="text-sm font-bold text-[#25252D] mt-0.5">{object.status}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#777784]">Fingerprint</div>
              <div className="text-xs font-bold text-[#777784] mt-0.5">SHA-256 (64 hex)</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-bold text-[#777784]">Raw System Metadata</div>
            <pre className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] text-[#25252D] overflow-x-auto text-xs font-mono leading-relaxed">
              {JSON.stringify(metadataJSON, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#EBE7DF] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="clay-button-secondary px-5 py-2 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
