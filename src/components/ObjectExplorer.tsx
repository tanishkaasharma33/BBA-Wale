import React, { useState } from 'react';
import { StorageObject, ObjectReplica, StorageNode } from '../types/storage';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Code,
  Zap,
  Trash2,
  History,
  HardDriveDownload,
  ShieldCheck,
  Server,
  Info,
} from 'lucide-react';
import { formatBytes, truncateHash } from '../utils/crypto';

interface ObjectExplorerProps {
  objects: StorageObject[];
  replicas: ObjectReplica[];
  nodes: StorageNode[];
  selectedObjectId?: string | null;
  onSelectObject: (objectId: string | null) => void;
  onReadObject: (objectId: string) => void;
  onViewMetadata: (object: StorageObject) => void;
  onCorruptReplica: (objectId: string, nodeId: string) => void;
  onInspectBitRot?: (objectId: string, nodeId: string) => void;
  onUpdateVersion: (objectId: string) => void;
  onDeleteObject: (objectId: string) => void;
}

export const ObjectExplorer: React.FC<ObjectExplorerProps> = ({
  objects,
  replicas,
  nodes,
  selectedObjectId,
  onSelectObject,
  onReadObject,
  onViewMetadata,
  onCorruptReplica,
  onInspectBitRot,
  onUpdateVersion,
  onDeleteObject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const filteredObjects = objects.filter((obj) => {
    return (
      obj.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.objectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.checksum.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getFileIconColor = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return 'bg-[#EF7B7B]/15 text-[#EF7B7B]';
    if (fileName.endsWith('.mp4')) return 'bg-[#8B7CF6]/15 text-[#8B7CF6]';
    if (fileName.endsWith('.zip')) return 'bg-[#6C63FF]/15 text-[#6C63FF]';
    if (fileName.endsWith('.png')) return 'bg-[#62C49A]/15 text-[#3FA97E]';
    if (fileName.endsWith('.csv')) return 'bg-[#F4B860]/20 text-[#D88D23]';
    return 'bg-[#6C63FF]/15 text-[#6C63FF]';
  };

  return (
    <div className="clay-card p-6 sm:p-8 space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE7DF] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#25252D] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#6C63FF]" />
            Your Files ({objects.length})
          </h2>
          <p className="text-sm text-[#777784] mt-0.5">
            Every file is automatically stored in multiple copies across healthy servers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#777784] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs font-medium bg-[#FAF8F5] border border-[#E2DED6] rounded-2xl text-[#25252D] placeholder-[#777784] focus:outline-none focus:border-[#6C63FF] focus:bg-white w-52 sm:w-64 transition-all"
            />
          </div>

          {/* Technical toggle for judges */}
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${
              showTechnicalDetails
                ? 'bg-[#6C63FF] text-white border-[#6C63FF]'
                : 'bg-white text-[#777784] border-[#EBE7DF] hover:text-[#25252D]'
            }`}
          >
            {showTechnicalDetails ? 'Simple view' : 'Technical details'}
          </button>
        </div>
      </div>

      {/* Files List Cards */}
      <div className="space-y-3">
        {filteredObjects.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#777784] bg-[#FAF8F5] rounded-3xl border border-[#EBE7DF]">
            No files matched your search.
          </div>
        ) : (
          filteredObjects.map((obj) => {
            const objReplicas = replicas.filter((r) => r.objectId === obj.objectId);
            const corruptReplica = objReplicas.find((r) => r.status === 'CORRUPTED');
            const isSelected = selectedObjectId === obj.objectId;

            // Healthy active replicas
            const healthyReplicas = objReplicas.filter((r) => {
              const node = nodes.find((n) => n.id === r.nodeId);
              return r.status === 'VERIFIED' && node && (node.status === 'HEALTHY' || node.status === 'DEGRADED');
            });

            const isProtected = healthyReplicas.length >= obj.replicationFactor && !corruptReplica;
            const isRepairing = healthyReplicas.length < obj.replicationFactor && !corruptReplica;

            return (
              <div
                key={obj.objectId}
                onClick={() => onSelectObject(isSelected ? null : obj.objectId)}
                className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#F9F8FF] border-[#6C63FF] shadow-md shadow-[#6C63FF]/10'
                    : 'bg-white border-[#EBE7DF] hover:border-[#6C63FF]/40 hover:shadow-xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* File Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getFileIconColor(obj.fileName)}`}>
                      <FileText className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-[#25252D] truncate">
                          {obj.fileName}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#EBE7DF] text-[10px] font-bold text-[#777784]">
                          v{obj.version}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#777784] mt-0.5">
                        <span>{formatBytes(obj.fileSizeMB)}</span>
                        <span>·</span>
                        <span>{healthyReplicas.length} safe copies</span>
                        {showTechnicalDetails && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[11px] text-[#6C63FF]">{obj.objectId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Server Badges and Status */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Servers where this file lives */}
                    <div className="flex items-center gap-1.5">
                      {obj.replicaLocations.map((nodeId) => {
                        const node = nodes.find((n) => n.id === nodeId);
                        const rep = objReplicas.find((r) => r.nodeId === nodeId);
                        const isDown = !node || node.status === 'FAILED' || node.status === 'PARTITIONED';
                        const isCorrupt = rep?.status === 'CORRUPTED';

                        return (
                          <span
                            key={nodeId}
                            title={`${node?.name || nodeId} · ${isDown ? 'Server offline' : isCorrupt ? 'Damaged copy' : 'Healthy'}`}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                              isCorrupt
                                ? 'bg-[#EF7B7B]/15 text-[#EF7B7B] border border-[#EF7B7B]/40 animate-pulse'
                                : isDown
                                ? 'bg-[#FAF8F5] text-[#A09CA8] line-through border border-[#EBE7DF]'
                                : 'bg-[#FAF8F5] text-[#25252D] border border-[#E2DED6]'
                            }`}
                          >
                            Server {nodeId.replace('node-', '')}
                          </span>
                        );
                      })}
                    </div>

                    {/* Protection Status Badge */}
                    <div className="shrink-0">
                      {corruptReplica ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onInspectBitRot) onInspectBitRot(obj.objectId, corruptReplica.nodeId);
                          }}
                          className="px-3 py-1 rounded-full bg-[#FFF5F5] text-[#EF7B7B] border border-[#EF7B7B]/40 text-xs font-bold flex items-center gap-1.5 animate-pulse"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Damaged copy · Fix now</span>
                        </button>
                      ) : isProtected ? (
                        <span className="px-3 py-1 rounded-full bg-[#F0FDF4] text-[#3FA97E] border border-[#62C49A]/30 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Protected</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[#FFFDF5] text-[#D88D23] border border-[#F4B860]/40 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Re-creating copy...</span>
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onReadObject(obj.objectId)}
                        title="Download / test access"
                        className="clay-button-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1 text-[#6C63FF]"
                      >
                        <HardDriveDownload className="w-3.5 h-3.5" />
                        <span>Get File</span>
                      </button>

                      {/* Test damage button */}
                      <button
                        onClick={() => {
                          const target = objReplicas.find((r) => r.status === 'VERIFIED');
                          if (target) onCorruptReplica(obj.objectId, target.nodeId);
                        }}
                        title="Simulate data damage on one copy"
                        className="p-2 rounded-xl text-[#777784] hover:text-[#EF7B7B] hover:bg-[#FFF5F5] transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                      </button>

                      {/* Technical Specs & JSON */}
                      <button
                        onClick={() => onViewMetadata(obj)}
                        title="View technical metadata"
                        className="p-2 rounded-xl text-[#777784] hover:text-[#25252D] hover:bg-[#FAF8F5] transition-colors"
                      >
                        <Code className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteObject(obj.objectId)}
                        title="Delete file"
                        className="p-2 rounded-xl text-[#777784] hover:text-[#EF7B7B] hover:bg-[#FFF5F5] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optional Technical Drawer for Judges */}
                {showTechnicalDetails && (
                  <div className="mt-3 pt-3 border-t border-[#EBE7DF] text-[11px] font-mono text-[#777784] flex flex-wrap items-center justify-between gap-2">
                    <span className="truncate max-w-md">SHA-256: {obj.checksum}</span>
                    <span>Replication Factor: N={obj.replicationFactor} (Quorum Active)</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
