'use client';

import React, { useState } from 'react';
import { AuditLogEntry } from '@/types';
import { 
  Terminal as TerminalIcon, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Wrench, 
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';

interface AuditTerminalProps {
  logs: AuditLogEntry[];
  onSimulateRaceCondition: () => void;
}

export const AuditTerminal: React.FC<AuditTerminalProps> = ({
  logs,
  onSimulateRaceCondition,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(hash);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'LOCK_ACQUIRED':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'CONFLICT_PREVENTED':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'BOOKING_CREATED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'APPROVAL_GRANTED':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'QR_CHECKIN':
        return 'text-cyan-700 bg-cyan-50 border-cyan-200';
      case 'MAINTENANCE_SCHEDULED':
        return 'text-zinc-700 bg-zinc-100 border-zinc-200';
      default:
        return 'text-zinc-700 bg-zinc-100 border-zinc-200';
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-mono">
      {/* Terminal Title Bar */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm font-sans">
        <div>
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-foreground" />
            <h2 className="text-sm font-bold text-foreground">Engine Transaction & ACID Audit Stream</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border font-semibold">
              ACID GUARANTEED
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time record of pessimistic locking, constraint validations, and slot allocations.
          </p>
        </div>

        <button
          onClick={onSimulateRaceCondition}
          className="px-3.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Simulate Concurrent Double-Booking Race</span>
        </button>
      </div>

      {/* Terminal Screen (TermCN styled) */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm text-xs overflow-hidden">
        {/* Terminal Top Window Controls */}
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/80" />
            <span className="text-muted-foreground text-[11px] ml-2">campusflow audit stream</span>
          </div>
          <span className="text-muted-foreground text-[10px]">Isolation: SERIALIZABLE</span>
        </div>

        {/* Log Entries */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-md border border-border bg-background hover:bg-muted/60 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{log.timestamp}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getActionBadge(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-foreground font-semibold">{log.resourceName}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-[10px]">{log.transactionHash}</span>
                  <button
                    onClick={() => handleCopy(log.transactionHash)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                    title="Copy Tx Hash"
                  >
                    {copiedId === log.transactionHash ? (
                      <Check className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-muted-foreground text-[11px] pl-1 border-l-2 border-border">
                &gt; {log.details}
              </div>

              <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-0.5">
                <span>Actor: {log.actor} ({log.actorRole})</span>
                <span className="text-emerald-700">✓ Commit Verified</span>
              </div>
            </div>
          ))}
        </div>

        {/* Terminal Input Line Prompt */}
        <div className="flex items-center gap-2 pt-2 border-t border-border text-muted-foreground text-[11px]">
          <span className="text-foreground font-bold">$</span>
          <span className="animate-pulse">monitoring postgres tsrange exclusion locks in real-time...</span>
        </div>
      </div>
    </div>
  );
};
