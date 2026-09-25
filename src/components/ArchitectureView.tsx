import React from 'react';
import { Layers, ShieldCheck, Database, Server, RefreshCw, Cpu, CheckCircle2 } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="clay-card p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#EBE7DF] pb-4">
        <div className="flex items-center gap-2 text-[#6C63FF] text-xs font-bold uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          <span>System Architecture</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#25252D]">
          How VAULT is Built & Why It Never Loses Files
        </h2>
        <p className="text-sm text-[#777784] mt-1 max-w-2xl">
          VAULT is built from independent, loosely coupled services. All storage servers are independent, and consensus metadata guarantees your files are always protected.
        </p>
      </div>

      {/* 7 Layer Request Flow */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#777784]">
          End-to-End File Request Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {/* Layer 1 */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-1.5 text-center">
            <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-wider">Step 1</span>
            <div className="text-xs font-bold text-[#25252D]">Client App</div>
            <p className="text-[11px] text-[#777784]">Sends file via friendly API or browser upload</p>
          </div>

          {/* Layer 2 */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-1.5 text-center">
            <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-wider">Step 2</span>
            <div className="text-xs font-bold text-[#25252D]">API Gateway</div>
            <p className="text-[11px] text-[#777784]">Encrypts connections and calculates file checksums</p>
          </div>

          {/* Layer 3 */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-1.5 text-center">
            <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-wider">Step 3</span>
            <div className="text-xs font-bold text-[#25252D]">Metadata Catalog</div>
            <p className="text-[11px] text-[#777784]">Maintains synchronized record of where all copies live</p>
          </div>

          {/* Layer 4 */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-1.5 text-center">
            <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-wider">Step 4</span>
            <div className="text-xs font-bold text-[#25252D]">Smart Scheduler</div>
            <p className="text-[11px] text-[#777784]">Chooses servers in separate buildings/zones</p>
          </div>

          {/* Layer 5 */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-1.5 text-center">
            <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-wider">Step 5</span>
            <div className="text-xs font-bold text-[#25252D]">Storage Nodes</div>
            <p className="text-[11px] text-[#777784]">5 independent physical storage machines</p>
          </div>

          {/* Layer 6 */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-1.5 text-center">
            <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-wider">Step 6</span>
            <div className="text-xs font-bold text-[#25252D]">Health Watchdog</div>
            <p className="text-[11px] text-[#777784]">Pings servers every 2.5s to spot crashes instantly</p>
          </div>

          {/* Layer 7 */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-1.5 text-center">
            <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-wider">Step 7</span>
            <div className="text-xs font-bold text-[#25252D]">Self-Healing Loop</div>
            <p className="text-[11px] text-[#777784]">Automatically duplicates missing or damaged copies</p>
          </div>
        </div>
      </div>

      {/* 4 Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Concept 1 */}
        <div className="rounded-3xl border border-[#EBE7DF] bg-[#FAF8F5] p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#6C63FF] text-sm font-bold">
            <ShieldCheck className="w-5 h-5 text-[#6C63FF]" />
            <span>1. Multi-Copy Protection & Diversity</span>
          </div>
          <p className="text-xs text-[#777784] leading-relaxed">
            Every file is kept in 3 distinct copies across different location zones. Even if a fire or power outage knocks out an entire building, your files remain completely intact in the others.
          </p>
        </div>

        {/* Concept 2 */}
        <div className="rounded-3xl border border-[#EBE7DF] bg-[#FAF8F5] p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#3FA97E] text-sm font-bold">
            <Database className="w-5 h-5 text-[#62C49A]" />
            <span>2. Cryptographic Checksums (Detecting Bit-Rot)</span>
          </div>
          <p className="text-xs text-[#777784] leading-relaxed">
            Every file has a unique mathematical fingerprint (SHA-256). If a cosmic ray or failing hard drive quietly corrupts even a single byte of data, VAULT notices immediately and discards the damaged copy.
          </p>
        </div>

        {/* Concept 3 */}
        <div className="rounded-3xl border border-[#EBE7DF] bg-[#FAF8F5] p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#8B7CF6] text-sm font-bold">
            <RefreshCw className="w-5 h-5 text-[#8B7CF6]" />
            <span>3. Autonomous Self-Healing</span>
          </div>
          <p className="text-xs text-[#777784] leading-relaxed">
            No on-call humans needed. When a server dies, VAULT immediately asks a surviving server to duplicate the file onto another healthy machine, returning the cluster to 100% protection in seconds.
          </p>
        </div>

        {/* Concept 4 */}
        <div className="rounded-3xl border border-[#EBE7DF] bg-[#FAF8F5] p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#D88D23] text-sm font-bold">
            <Cpu className="w-5 h-5 text-[#F4B860]" />
            <span>4. Network Cut Isolation (No Split-Brains)</span>
          </div>
          <p className="text-xs text-[#777784] leading-relaxed">
            If a network wire is disconnected, isolated servers are stopped from taking stale writes. The rest of the cluster keeps serving you seamlessly without any conflicting edits.
          </p>
        </div>
      </div>
    </div>
  );
};
