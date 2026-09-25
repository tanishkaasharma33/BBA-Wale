import React from 'react';
import { StorageNode, StorageObject, ObjectReplica, ActiveTransfer } from '../types/storage';
import {
  Server,
  ShieldCheck,
  RefreshCw,
  Database,
  Layers,
  Zap,
  ArrowRight,
  HardDrive,
  WifiOff,
} from 'lucide-react';
import { formatTimeAgo } from '../utils/crypto';

interface ClusterMapProps {
  nodes: StorageNode[];
  objects: StorageObject[];
  replicas: ObjectReplica[];
  activeTransfers?: ActiveTransfer[];
  selectedObjectId?: string | null;
  onSelectObject: (objectId: string | null) => void;
  onFailNode: (nodeId: string) => void;
  onRestartNode: (nodeId: string) => void;
  onPartitionNode: (nodeId: string) => void;
  onRestoreNetwork: (nodeId: string) => void;
  onInspectBitRot?: (objectId: string, nodeId: string) => void;
}

export const ClusterMap: React.FC<ClusterMapProps> = ({
  nodes,
  objects,
  replicas,
  activeTransfers = [],
  selectedObjectId,
  onSelectObject,
  onFailNode,
  onRestartNode,
  onPartitionNode,
  onRestoreNetwork,
  onInspectBitRot,
}) => {
  const selectedObject = objects.find((o) => o.objectId === selectedObjectId);
  const selectedObjectNodes = selectedObject ? new Set(selectedObject.replicaLocations) : new Set<string>();

  const getNodeTheme = (node: StorageNode) => {
    switch (node.status) {
      case 'HEALTHY':
        return {
          cardBg: 'bg-white',
          border: 'border-[#E2DED6]',
          badgeBg: 'bg-[#F0FDF4]',
          badgeText: 'text-[#3FA97E]',
          badgeDot: 'bg-[#62C49A]',
          label: 'Healthy & Online',
          progressColor: 'bg-[#62C49A]',
        };
      case 'DEGRADED':
        return {
          cardBg: 'bg-[#FFFDF5]',
          border: 'border-[#F4B860]/60',
          badgeBg: 'bg-[#FFFDF5]',
          badgeText: 'text-[#D88D23]',
          badgeDot: 'bg-[#F4B860]',
          label: 'Degraded',
          progressColor: 'bg-[#F4B860]',
        };
      case 'FAILED':
        return {
          cardBg: 'bg-[#FFF8F8]',
          border: 'border-[#EF7B7B]/50',
          badgeBg: 'bg-[#FFF5F5]',
          badgeText: 'text-[#EF7B7B]',
          badgeDot: 'bg-[#EF7B7B]',
          label: 'Server Offline',
          progressColor: 'bg-[#EF7B7B]',
        };
      case 'PARTITIONED':
        return {
          cardBg: 'bg-[#FFFDF5]',
          border: 'border-[#F4B860]/50',
          badgeBg: 'bg-[#FFFDF5]',
          badgeText: 'text-[#D88D23]',
          badgeDot: 'bg-[#F4B860]',
          label: 'Network Cut',
          progressColor: 'bg-[#F4B860]',
        };
      case 'REPAIRING':
        return {
          cardBg: 'bg-[#F9F8FF]',
          border: 'border-[#6C63FF]/50',
          badgeBg: 'bg-[#F8F7FF]',
          badgeText: 'text-[#6C63FF]',
          badgeDot: 'bg-[#6C63FF]',
          label: 'Rebuilding Data',
          progressColor: 'bg-[#6C63FF]',
        };
      default:
        return {
          cardBg: 'bg-white',
          border: 'border-[#E2DED6]',
          badgeBg: 'bg-[#FAF8F5]',
          badgeText: 'text-[#777784]',
          badgeDot: 'bg-[#777784]',
          label: 'Unknown',
          progressColor: 'bg-[#6C63FF]',
        };
    }
  };

  const nodePositions: Record<string, number> = {
    'node-1': 10,
    'node-2': 30,
    'node-3': 50,
    'node-4': 70,
    'node-5': 90,
  };

  return (
    <div className="clay-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE7DF] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#6C63FF] text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Interactive Cluster Topology</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#25252D]">
            Live Storage Servers & Replica Distribution
          </h2>
          <p className="text-sm text-[#777784] mt-0.5">
            5 independent physical servers. If any server fails, files are served from other copies while replacement copies are auto-created.
          </p>
        </div>

        {selectedObject ? (
          <div className="flex items-center gap-2 bg-[#F8F7FF] border border-[#6C63FF]/30 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-[#6C63FF]">
            <span>Highlighting copies of:</span>
            <strong className="text-[#25252D] font-extrabold">{selectedObject.fileName}</strong>
            <button
              onClick={() => onSelectObject(null)}
              className="text-[#777784] hover:text-[#25252D] ml-1.5 text-xs bg-white px-1.5 py-0.5 rounded-full border border-[#EBE7DF]"
            >
              ✕ clear
            </button>
          </div>
        ) : (
          <div className="text-xs font-bold text-[#3FA97E] flex items-center gap-2 bg-[#F0FDF4] px-3.5 py-1.5 rounded-2xl border border-[#62C49A]/30 self-start sm:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-[#62C49A] shadow-xs" />
            <span>5 Servers · 3 Location Zones</span>
          </div>
        )}
      </div>

      {/* Active Transfer Banner */}
      {activeTransfers.length > 0 && (
        <div className="rounded-2xl border border-[#8B7CF6]/40 bg-[#F9F8FF] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B7CF6]/20 text-[#6C63FF] flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin text-[#6C63FF]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">
                Live Data Migration in Progress ({activeTransfers[0].transferType})
              </div>
              <div className="text-xs text-[#25252D] mt-0.5">
                Copying <strong className="text-[#6C63FF]">"{activeTransfers[0].fileName}"</strong> from{' '}
                <strong className="text-[#25252D]">
                  {nodes.find((n) => n.id === activeTransfers[0].sourceNodeId)?.name || 'Controller'}
                </strong>{' '}
                →{' '}
                <strong className="text-[#3FA97E]">
                  {nodes.find((n) => n.id === activeTransfers[0].targetNodeId)?.name}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#6C63FF]">
            <span>Replicating bytes...</span>
            <div className="w-24 bg-[#EBE7DF] h-2 rounded-full overflow-hidden">
              <div className="h-full bg-[#6C63FF] animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Controller Hub */}
      <div className="flex flex-col items-center justify-center relative">
        <div className="w-full max-w-md rounded-3xl border border-[#E2DED6] bg-[#FAF8F5] p-5 text-center shadow-sm relative z-10 space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#6C63FF] uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>VAULT Cluster Controller & Metadata Index</span>
          </div>
          <p className="text-xs text-[#777784] max-w-sm mx-auto">
            Tracks file locations, detects down servers via heartbeat checks, and coordinates automatic self-healing.
          </p>
          <div className="pt-2 border-t border-[#EBE7DF] flex items-center justify-center gap-3 text-[11px] font-bold text-[#777784]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#62C49A]" />
              Heartbeat: 2.5s
            </span>
            <span>·</span>
            <span>Integrity: SHA-256</span>
            <span>·</span>
            <span className="text-[#3FA97E]">Consensus: Active</span>
          </div>
        </div>

        {/* Dynamic SVG Animated Bus */}
        <div className="w-full max-w-5xl h-14 relative hidden md:block">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 60">
            {/* Vertical stem from controller */}
            <line x1="500" y1="0" x2="500" y2="24" stroke="#8B7CF6" strokeWidth="2" strokeDasharray="3 3" />

            {/* Main horizontal distribution trunk */}
            <line x1="100" y1="24" x2="900" y2="24" stroke="#D8D4CC" strokeWidth="2.5" />

            {/* Connecting lines to each of the 5 nodes */}
            {nodes.map((n) => {
              const xPos = (nodePositions[n.id] || 50) * 10;
              const isFailed = n.status === 'FAILED';
              const isPartitioned = n.status === 'PARTITIONED';
              const isRepairing = n.status === 'REPAIRING' || activeTransfers.some((t) => t.targetNodeId === n.id);

              const strokeColor = isFailed
                ? '#EF7B7B'
                : isPartitioned
                ? '#F4B860'
                : isRepairing
                ? '#8B7CF6'
                : '#62C49A';

              return (
                <g key={n.id}>
                  <line
                    x1={xPos}
                    y1="24"
                    x2={xPos}
                    y2="60"
                    stroke={strokeColor}
                    strokeWidth={isRepairing ? '3' : '2'}
                    strokeDasharray={isFailed ? '4 4' : isRepairing ? '6 3' : 'none'}
                    className={isRepairing ? 'animate-pulse' : ''}
                  />
                  <circle
                    cx={xPos}
                    cy="24"
                    r={isFailed || isPartitioned ? 4.5 : 3.5}
                    fill={strokeColor}
                  />
                  {isFailed && (
                    <text x={xPos - 5} y="44" fill="#EF7B7B" fontSize="12" fontWeight="bold">
                      ✕
                    </text>
                  )}
                  {isPartitioned && (
                    <text x={xPos - 5} y="44" fill="#F4B860" fontSize="12" fontWeight="bold">
                      ⚡
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Location Zone Tags */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs font-bold text-[#777784]">
        <div className="p-2 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF]">
          Zone 1: <strong className="text-[#25252D]">Building Alpha (US-East)</strong>
        </div>
        <div className="p-2 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF]">
          Zone 2: <strong className="text-[#25252D]">Building Beta (US-Central)</strong>
        </div>
        <div className="p-2 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF]">
          Zone 3: <strong className="text-[#25252D]">Building Gamma (US-West)</strong>
        </div>
      </div>

      {/* 5 Storage Nodes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative pt-1">
        {nodes.map((node) => {
          const theme = getNodeTheme(node);
          const isReplicaHighlighted = selectedObjectNodes.has(node.id);
          const nodeReplicas = replicas.filter((r) => r.nodeId === node.id);
          const corruptReplica = nodeReplicas.find((r) => r.status === 'CORRUPTED');
          const isTargetOfTransfer = activeTransfers.some((t) => t.targetNodeId === node.id);

          return (
            <div
              key={node.id}
              className={`rounded-3xl border transition-all p-4 relative flex flex-col justify-between shadow-sm hover:shadow-md ${
                theme.border
              } ${theme.cardBg} ${
                isReplicaHighlighted ? 'ring-2 ring-[#6C63FF] shadow-lg shadow-[#6C63FF]/15' : ''
              } ${isTargetOfTransfer ? 'ring-2 ring-[#8B7CF6] animate-pulse' : ''}`}
            >
              {/* Card Top */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center font-bold text-xs">
                      {node.name.split(' ')[1] || 'S'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#25252D]">
                        {node.name}
                      </div>
                      <div className="text-[10px] text-[#777784]">
                        {node.rack}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${theme.badgeBg} ${theme.badgeText} border-current/20`}>
                    <span className={`w-2 h-2 rounded-full ${theme.badgeDot}`} />
                    <span>{theme.label}</span>
                  </span>

                  <span className="text-[10px] text-[#777784]">
                    {node.status === 'FAILED'
                      ? 'Offline'
                      : node.status === 'PARTITIONED'
                      ? 'Cut off'
                      : formatTimeAgo(node.lastHeartbeat)}
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#777784]">
                    <span>Storage used</span>
                    <span className="text-[#25252D] font-bold tabular-nums">
                      {node.usedCapacityGB} / {node.totalCapacityGB} GB
                    </span>
                  </div>
                  <div className="w-full bg-[#FAF8F5] h-2 rounded-full overflow-hidden border border-[#EBE7DF]">
                    <div
                      className={`h-full ${theme.progressColor} rounded-full transition-all`}
                      style={{
                        width: `${Math.min(100, Math.round((node.usedCapacityGB / node.totalCapacityGB) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stored Replicas Preview */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] text-[#777784] font-medium flex items-center justify-between">
                    <span>Copies on this server</span>
                    <span className="font-bold text-[#25252D]">{node.replicaCount}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {nodeReplicas.map((rep) => {
                      const obj = objects.find((o) => o.objectId === rep.objectId);
                      const isHighlighted = selectedObjectId === rep.objectId;
                      const isCorrupt = rep.status === 'CORRUPTED';

                      return (
                        <button
                          key={rep.replicaId}
                          onClick={() => onSelectObject(obj?.objectId || null)}
                          title={`${obj?.fileName || rep.objectId} - Status: ${rep.status}`}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-xl border transition-all truncate max-w-[90px] ${
                            isCorrupt
                              ? 'bg-[#FFF5F5] text-[#EF7B7B] border-[#EF7B7B] animate-pulse'
                              : isHighlighted
                              ? 'bg-[#6C63FF] text-white border-[#6C63FF] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#25252D] border-[#EBE7DF] hover:border-[#6C63FF]'
                          }`}
                        >
                          {obj?.fileName ? obj.fileName.split('.')[0] : rep.objectId}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bit-Rot Prompt */}
                {corruptReplica && (
                  <button
                    onClick={() => onInspectBitRot && onInspectBitRot(corruptReplica.objectId, node.id)}
                    className="w-full text-[11px] font-bold text-[#EF7B7B] bg-[#FFF5F5] border border-[#EF7B7B]/50 rounded-2xl p-2 flex items-center justify-between hover:bg-[#FFEBEB] transition-all animate-pulse text-left shadow-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#EF7B7B] shrink-0" />
                      <span>Damaged copy detected</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Node Action Buttons */}
              <div className="pt-3 border-t border-[#EBE7DF] mt-3">
                {node.status === 'FAILED' ? (
                  <button
                    onClick={() => onRestartNode(node.id)}
                    className="clay-button-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 bg-[#62C49A] hover:bg-[#52B48A]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Turn Back On</span>
                  </button>
                ) : node.status === 'PARTITIONED' ? (
                  <button
                    onClick={() => onRestoreNetwork(node.id)}
                    className="clay-button-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 bg-[#F4B860] hover:bg-[#E4A850] text-[#25252D]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reconnect Network</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      onClick={() => onFailNode(node.id)}
                      className="py-1.5 text-xs font-bold rounded-xl bg-[#FFF5F5] hover:bg-[#FFEBEB] text-[#EF7B7B] border border-[#EF7B7B]/40 transition-colors text-center"
                      title="Simulate hardware crash"
                    >
                      Turn Off
                    </button>
                    <button
                      onClick={() => onPartitionNode(node.id)}
                      className="py-1.5 text-xs font-bold rounded-xl bg-[#FAF8F5] hover:bg-[#F2EFE8] text-[#777784] hover:text-[#25252D] border border-[#EBE7DF] transition-colors text-center"
                      title="Disconnect network cables"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
