'use client';

import React, { useState } from 'react';
import { MaintenanceWindow, Resource } from '@/types';
import { CalendarDays, Plus, Wrench } from 'lucide-react';
import { localDateKey } from '@/lib/dates';

interface MaintenancePlannerProps {
  resources: Resource[];
  windows: MaintenanceWindow[];
  onAdd: (window: MaintenanceWindow) => Promise<boolean>;
  onCancel: (id: string) => Promise<void>;
}

export const MaintenancePlanner: React.FC<MaintenancePlannerProps> = ({ resources, windows, onAdd, onCancel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resourceId, setResourceId] = useState(resources[0]?.id ?? '');
  const [date, setDate] = useState(localDateKey());
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reason, setReason] = useState('');

  const createWindow = async (event: React.FormEvent) => {
    event.preventDefault();
    const resource = resources.find((item) => item.id === resourceId);
    if (!resource || endTime <= startTime) return;
    const saved = await onAdd({ id: '', tenantId: resource.tenantId, resourceId, resourceName: resource.name, date, startTime, endTime, reason, status: 'scheduled' });
    if (!saved) return;
    setReason('');
    setIsOpen(false);
  };

  const activeWindows = windows.filter((window) => window.status === 'scheduled').sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><h1 className="text-2xl font-semibold tracking-tight text-foreground">Maintenance schedule</h1><p className="mt-1 text-sm text-muted-foreground">Block time for repairs, inspections, and scheduled service.</p></div>
        <button onClick={() => setIsOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"><Plus className="h-4 w-4" /> Schedule maintenance</button>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="text-sm font-semibold text-foreground">Scheduled maintenance</h2><p className="mt-1 text-xs text-muted-foreground">These periods will be unavailable for booking.</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{activeWindows.length} scheduled</span></div>
        {activeWindows.length ? <div className="divide-y divide-border">{activeWindows.map((window) => <div key={window.id} className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"><div className="flex items-start gap-3"><span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800"><Wrench className="h-4 w-4" /></span><div><p className="text-sm font-semibold text-foreground">{window.resourceName}</p><p className="mt-1 text-xs text-muted-foreground">{window.reason}</p><p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{window.date} · {window.startTime}–{window.endTime}</p></div></div><button onClick={() => { void onCancel(window.id); }} className="self-start rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted sm:self-center">Remove schedule</button></div>)}</div> : <div className="p-12 text-center"><Wrench className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm font-semibold text-foreground">No maintenance scheduled</p><p className="mt-1 text-xs text-muted-foreground">Add a service window when a campus resource needs attention.</p></div>}
      </div>
      {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}><form onSubmit={createWindow} className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl"><div><h2 className="text-lg font-semibold text-foreground">Schedule maintenance</h2><p className="mt-1 text-xs text-muted-foreground">The resource will be blocked for this date and time.</p></div><label className="block space-y-1 text-xs font-medium text-foreground">Resource<select required value={resourceId} onChange={(event) => setResourceId(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal">{resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name}</option>)}</select></label><label className="block space-y-1 text-xs font-medium text-foreground">Date<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label><div className="grid grid-cols-2 gap-3"><label className="space-y-1 text-xs font-medium text-foreground">Start<input type="time" required value={startTime} onChange={(event) => setStartTime(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label><label className="space-y-1 text-xs font-medium text-foreground">End<input type="time" required value={endTime} onChange={(event) => setEndTime(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label></div><label className="block space-y-1 text-xs font-medium text-foreground">Reason<input required value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Annual safety inspection" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>{endTime <= startTime && <p className="text-xs text-rose-700">End time must be later than start time.</p>}<div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setIsOpen(false)} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground">Cancel</button><button type="submit" disabled={!reason || endTime <= startTime} className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background disabled:opacity-40">Save maintenance</button></div></form></div>}
    </div>
  );
};
