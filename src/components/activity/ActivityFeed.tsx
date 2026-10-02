'use client';

import React from 'react';
import { AuditLogEntry } from '@/types';
import { Activity, CalendarDays, CheckCircle2, Clock3, Wrench } from 'lucide-react';

const actionLabels: Record<AuditLogEntry['action'], string> = {
  LOCK_ACQUIRED: 'Booking request submitted',
  CONFLICT_PREVENTED: 'Booking conflict prevented',
  BOOKING_CREATED: 'Booking confirmed',
  APPROVAL_GRANTED: 'Booking approved',
  QR_CHECKIN: 'Check-in recorded',
  MAINTENANCE_SCHEDULED: 'Maintenance scheduled',
};

export const ActivityFeed: React.FC<{ logs: AuditLogEntry[] }> = ({ logs }) => (
  <div className="mx-auto max-w-5xl space-y-5">
    <div><h1 className="text-2xl font-semibold tracking-tight text-foreground">Activity log</h1><p className="mt-1 text-sm text-muted-foreground">A record of recent booking and resource updates.</p></div>
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {logs.length ? logs.map((log) => {
        const Icon = log.action === 'APPROVAL_GRANTED' ? CheckCircle2 : log.action === 'MAINTENANCE_SCHEDULED' ? Wrench : log.action === 'LOCK_ACQUIRED' ? Clock3 : CalendarDays;
        return <article key={log.id} className="flex gap-3 border-b border-border p-4 last:border-0 sm:px-5"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-1 sm:flex-row"><p className="text-xs font-semibold text-foreground">{actionLabels[log.action]}</p><time className="text-[10px] text-muted-foreground">{log.timestamp}</time></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{log.details}</p><p className="mt-2 text-[10px] text-muted-foreground">{log.actor} · {log.actorRole.replaceAll('_', ' ')} · {log.resourceName}</p></div></article>;
      }) : <div className="p-12 text-center"><Activity className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm font-medium text-foreground">No activity yet</p></div>}
    </section>
  </div>
);
