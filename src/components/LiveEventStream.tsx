import React, { useState } from 'react';
import { SystemEvent, OperationType } from '../types/storage';
import { Activity, CheckCircle2, AlertTriangle, AlertOctagon, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { formatTimeAgo } from '../utils/crypto';

interface LiveEventStreamProps {
  events: SystemEvent[];
}

export const LiveEventStream: React.FC<LiveEventStreamProps> = ({ events }) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const getFriendlyMessage = (evt: SystemEvent) => {
    switch (evt.operation) {
      case 'WRITE':
        return `✓ ${evt.objectName || 'File'} uploaded safely`;
      case 'REPLICATE':
        return `✓ Copies distributed across servers`;
      case 'READ':
        return `✓ File accessed safely`;
      case 'FAILOVER':
        return `⚠ A server stopped responding — automatic recovery started`;
      case 'PARTITION':
        return `⚠ Network wire disconnected from server`;
      case 'REPAIR':
        return `↻ Replacement copy created — protection restored ✓`;
      case 'CORRUPT':
        return `⚠ Damaged copy detected — repairing from safe copy...`;
      case 'VERIFY':
        return `✓ Integrity check: all copies confirmed safe`;
      case 'REBALANCE':
        return `↻ Files redistributed to keep storage balanced`;
      case 'RESTART':
        return `✓ Server rebooted and back online`;
      case 'HEARTBEAT':
        return `● All servers checked in and healthy`;
      default:
        return evt.message;
    }
  };

  const getStatusIcon = (status: SystemEvent['status'], op: OperationType) => {
    if (status === 'ERROR' || op === 'CORRUPT' || op === 'FAILOVER') {
      return (
        <div className="w-8 h-8 rounded-xl bg-[#FFF5F5] text-[#EF7B7B] border border-[#EF7B7B]/30 flex items-center justify-center shrink-0">
          <AlertOctagon className="w-4 h-4" />
        </div>
      );
    }
    if (status === 'WARNING' || op === 'PARTITION') {
      return (
        <div className="w-8 h-8 rounded-xl bg-[#FFFDF5] text-[#D88D23] border border-[#F4B860]/40 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (op === 'REPAIR') {
      return (
        <div className="w-8 h-8 rounded-xl bg-[#F8F7FF] text-[#6C63FF] border border-[#6C63FF]/30 flex items-center justify-center shrink-0">
          <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-[#3FA97E] border border-[#62C49A]/30 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="clay-card p-6 sm:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE7DF] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#25252D] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#6C63FF]" />
            Recent Activity
          </h2>
          <p className="text-sm text-[#777784] mt-0.5">
            A real-time log of how VAULT manages and protects your files.
          </p>
        </div>

        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border self-start sm:self-auto ${
            showTechnicalDetails
              ? 'bg-[#6C63FF] text-white border-[#6C63FF]'
              : 'bg-white text-[#777784] border-[#EBE7DF] hover:text-[#25252D]'
          }`}
        >
          {showTechnicalDetails ? 'Simple view' : 'Technical logs'}
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#777784]">
            No activity recorded yet.
          </div>
        ) : (
          events.map((evt) => {
            const isExpanded = expandedEventId === evt.id;

            return (
              <div
                key={evt.id}
                onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] hover:border-[#6C63FF]/30 hover:bg-white transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(evt.status, evt.operation)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-[#25252D] truncate">
                        {showTechnicalDetails ? evt.message : getFriendlyMessage(evt)}
                      </span>
                      <span className="text-[11px] font-medium text-[#777784] shrink-0">
                        {formatTimeAgo(evt.timestamp)}
                      </span>
                    </div>

                    {!showTechnicalDetails && evt.objectName && (
                      <div className="text-xs text-[#777784]">
                        File: <span className="font-semibold text-[#25252D]">{evt.objectName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details for Judges */}
                {(isExpanded || showTechnicalDetails) && (
                  <div className="pt-2 mt-1 border-t border-[#EBE7DF] text-xs font-mono text-[#777784] space-y-0.5 animate-in fade-in">
                    <div>Operation: <strong className="text-[#25252D]">{evt.operation}</strong></div>
                    <div>Original Log: <span className="text-[#25252D]">{evt.message}</span></div>
                    {evt.details && <div>Telemetry: <span className="text-[#6C63FF]">{evt.details}</span></div>}
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
