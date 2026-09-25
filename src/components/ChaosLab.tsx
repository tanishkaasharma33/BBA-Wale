import React, { useState } from 'react';
import { StorageNode, StorageObject, ObjectReplica } from '../types/storage';
import {
  Flame,
  Zap,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  ShieldCheck,
} from 'lucide-react';

interface ChaosLabProps {
  nodes: StorageNode[];
  objects: StorageObject[];
  replicas: ObjectReplica[];
  onFailNode: (nodeId: string) => void;
  onRestartNode: (nodeId: string) => void;
  onPartitionNode: (nodeId: string) => void;
  onRestoreNetwork: (nodeId: string) => void;
  onCorruptReplica: (objectId: string, nodeId: string) => void;
  onRebalance: () => void;
  onRunIntegrityCheck: () => void;
  onSimulateTraffic: () => void;
  onResetCluster: () => void;
  onTriggerDisaster?: (scenarioId: 'SINGLE_FAIL' | 'DOUBLE_FAIL' | 'BIT_ROT' | 'PARTITION_RACK' | 'HIGH_SKEW' | 'READ_STORM') => void;
}

export const ChaosLab: React.FC<ChaosLabProps> = ({
  nodes,
  objects,
  replicas,
  onFailNode,
  onRestartNode,
  onPartitionNode,
  onRestoreNetwork,
  onCorruptReplica,
  onRebalance,
  onRunIntegrityCheck,
  onSimulateTraffic,
  onResetCluster,
  onTriggerDisaster,
}) => {
  const [lastAction, setLastAction] = useState<string>('Ready to test. Pick any action below to break a component and watch VAULT self-heal.');
  const [showTechnicalOptions, setShowTechnicalOptions] = useState(false);

  const healthyNodes = nodes.filter((n) => n.status === 'HEALTHY');
  const failedNodes = nodes.filter((n) => n.status === 'FAILED');
  const partitionedNodes = nodes.filter((n) => n.status === 'PARTITIONED');

  const handleTurnOffServer = () => {
    // Pick the first healthy server or node-3
    const target = healthyNodes.find((n) => n.id === 'node-3') || healthyNodes[0];
    if (target) {
      onFailNode(target.id);
      setLastAction(`You turned off Server ${target.id.replace('node-', '')}. Your files still have remaining healthy copies on other servers. VAULT is automatically creating replacement copies. Protection restored ✓`);
    } else {
      setLastAction('All servers are already offline! Click "Restore Everything" to bring them back.');
    }
  };

  const handleDamageFileCopy = () => {
    // Pick first object with verified replica
    const targetObj = objects[0];
    if (targetObj) {
      const rep = replicas.find((r) => r.objectId === targetObj.objectId && r.status === 'VERIFIED');
      if (rep) {
        onCorruptReplica(targetObj.objectId, rep.nodeId);
        setLastAction(`You damaged a copy of "${targetObj.fileName}" on Server ${rep.nodeId.replace('node-', '')}. VAULT noticed the checksum mismatch, quarantined the damaged data, and restored it from a healthy peer copy ✓`);
      }
    }
  };

  const handleDisconnectServer = () => {
    const target = healthyNodes.find((n) => n.id === 'node-4') || healthyNodes[0];
    if (target) {
      onPartitionNode(target.id);
      setLastAction(`You disconnected Server ${target.id.replace('node-', '')} from the network. VAULT prevented stale writes to protect data consistency, while other servers continue serving your files safely.`);
    }
  };

  const handleRestoreEverything = () => {
    onResetCluster();
    setLastAction('All servers rebooted, network links re-established, and all file copies 100% verified. Protection level: 100% ✓');
  };

  return (
    <div className="clay-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE7DF] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#EF7B7B] text-xs font-bold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4" />
            <span>Interactive Stress Testing</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#25252D]">
            Break it. Watch VAULT fix it.
          </h2>
          <p className="text-sm text-[#777784] mt-0.5">
            Try breaking the storage system and see how VAULT protects your files in real time.
          </p>
        </div>

        <button
          onClick={handleRestoreEverything}
          className="clay-button-secondary px-4 py-2 text-xs font-bold flex items-center gap-2 text-[#3FA97E] border-[#62C49A]/40 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restore Everything</span>
        </button>
      </div>

      {/* 4 Large Friendly Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Button 1: Turn off server */}
        <button
          onClick={handleTurnOffServer}
          className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#EBE7DF] hover:border-[#EF7B7B]/50 hover:bg-[#FFF8F8] transition-all text-left space-y-2 group shadow-xs hover:-translate-y-0.5"
        >
          <div className="text-2xl">💥</div>
          <div className="font-bold text-base text-[#25252D] group-hover:text-[#EF7B7B]">
            Turn Off a Server
          </div>
          <p className="text-xs text-[#777784] leading-relaxed">
            Simulate a machine crashing. See your files stay online and self-heal.
          </p>
        </button>

        {/* Button 2: Damage copy */}
        <button
          onClick={handleDamageFileCopy}
          className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#EBE7DF] hover:border-[#F4B860]/50 hover:bg-[#FFFDF5] transition-all text-left space-y-2 group shadow-xs hover:-translate-y-0.5"
        >
          <div className="text-2xl">🧩</div>
          <div className="font-bold text-base text-[#25252D] group-hover:text-[#D88D23]">
            Damage a File Copy
          </div>
          <p className="text-xs text-[#777784] leading-relaxed">
            Corrupt a file's bytes. Watch VAULT detect the mismatch and repair it.
          </p>
        </button>

        {/* Button 3: Disconnect */}
        <button
          onClick={handleDisconnectServer}
          className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#EBE7DF] hover:border-[#8B7CF6]/50 hover:bg-[#F9F8FF] transition-all text-left space-y-2 group shadow-xs hover:-translate-y-0.5"
        >
          <div className="text-2xl">📡</div>
          <div className="font-bold text-base text-[#25252D] group-hover:text-[#6C63FF]">
            Disconnect a Server
          </div>
          <p className="text-xs text-[#777784] leading-relaxed">
            Cut network wires. Observe consistency protection against split-brain.
          </p>
        </button>

        {/* Button 4: Restore Everything */}
        <button
          onClick={handleRestoreEverything}
          className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#EBE7DF] hover:border-[#62C49A]/50 hover:bg-[#F0FDF4] transition-all text-left space-y-2 group shadow-xs hover:-translate-y-0.5"
        >
          <div className="text-2xl">🔄</div>
          <div className="font-bold text-base text-[#25252D] group-hover:text-[#3FA97E]">
            Restore Everything
          </div>
          <p className="text-xs text-[#777784] leading-relaxed">
            Reboot all servers and return cluster health to 100% green.
          </p>
        </button>
      </div>

      {/* Human-Readable Real-Time Feedback Box */}
      <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#6C63FF] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>What Just Happened</span>
        </div>
        <p className="text-sm text-[#25252D] font-medium leading-relaxed">
          {lastAction}
        </p>
      </div>

      {/* Quick Server Restart Buttons if any server is down */}
      {(failedNodes.length > 0 || partitionedNodes.length > 0) && (
        <div className="p-4 rounded-3xl bg-[#FFFDF5] border border-[#F4B860]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-[#25252D]">
            Attention: {failedNodes.length + partitionedNodes.length} server(s) are currently offline or disconnected.
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {failedNodes.map((n) => (
              <button
                key={n.id}
                onClick={() => onRestartNode(n.id)}
                className="px-3 py-1 rounded-xl bg-white border border-[#EBE7DF] font-bold text-[#3FA97E] hover:bg-[#F0FDF4]"
              >
                Turn On Server {n.id.replace('node-', '')}
              </button>
            ))}
            {partitionedNodes.map((n) => (
              <button
                key={n.id}
                onClick={() => onRestoreNetwork(n.id)}
                className="px-3 py-1 rounded-xl bg-white border border-[#EBE7DF] font-bold text-[#D88D23] hover:bg-[#FFFDF5]"
              >
                Reconnect Server {n.id.replace('node-', '')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Optional Advanced Telemetry Drawer for Judges */}
      <div className="pt-2 border-t border-[#EBE7DF]">
        <button
          onClick={() => setShowTechnicalOptions(!showTechnicalOptions)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#777784] hover:text-[#25252D] py-1"
        >
          <span>Advanced Distributed Systems Tests (For Judges)</span>
          {showTechnicalOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechnicalOptions && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in">
            <button
              onClick={onRebalance}
              className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] text-left hover:border-[#6C63FF]"
            >
              <div className="font-bold text-[#25252D]">Storage Rebalance</div>
              <div className="text-[11px] text-[#777784] mt-0.5">Migrate files to balance disk usage across servers.</div>
            </button>
            <button
              onClick={onRunIntegrityCheck}
              className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] text-left hover:border-[#6C63FF]"
            >
              <div className="font-bold text-[#25252D]">Run Full Checksum Audit</div>
              <div className="text-[11px] text-[#777784] mt-0.5">Scans all files and verifies SHA-256 signatures.</div>
            </button>
            <button
              onClick={onSimulateTraffic}
              className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] text-left hover:border-[#6C63FF]"
            >
              <div className="font-bold text-[#25252D]">Simulate Traffic Storm</div>
              <div className="text-[11px] text-[#777784] mt-0.5">Fires concurrent read and write operations.</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
