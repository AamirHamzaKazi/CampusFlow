'use client';

import React, { useState } from 'react';
import { AgentStep, Booking, MaintenanceWindow, Resource } from '@/types';
import { AlertTriangle, ArrowRight, Bot, CalendarDays, CheckCircle2, Clock3, Search, Sparkles, Users } from 'lucide-react';
import { BookingWorkflowResult, runBookingAgentWorkflow } from '@/lib/agents/booking-workflow';

interface BookingAssistantProps {
  resources: Resource[];
  bookings: Booking[];
  maintenance: MaintenanceWindow[];
  selectedDate: string;
  onBook: (resource: Resource, date: string, startTime: string, endTime: string, attendeeCount: number) => void;
}

const examples = [
  'A room for 30 people with a projector',
  'A computer lab for 50 students from 2 PM to 4 PM',
  'A quiet meeting space for 6',
];

const stepIcons: Record<AgentStep['agentName'], React.ReactNode> = {
  Orchestrator: <Bot className="h-4 w-4" />,
  'Availability Agent': <Search className="h-4 w-4" />,
  'Conflict Agent': <CheckCircle2 className="h-4 w-4" />,
  'Recommendation Agent': <Sparkles className="h-4 w-4" />,
  'Booking Agent': <CalendarDays className="h-4 w-4" />,
  'Approval Agent': <CheckCircle2 className="h-4 w-4" />,
  'Analytics Agent': <Sparkles className="h-4 w-4" />,
};

export const BookingAssistant: React.FC<BookingAssistantProps> = ({ resources, bookings, maintenance, selectedDate, onBook }) => {
  const [prompt, setPrompt] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [attendees, setAttendees] = useState(30);
  const [workflow, setWorkflow] = useState<BookingWorkflowResult | null>(null);

  const runWorkflow = (request: string) => {
    if (!request.trim()) return;
    const result = runBookingAgentWorkflow({ prompt: request, date, startTime, endTime, attendeeCount: attendees, resources, bookings, maintenance });
    setPrompt(request);
    setDate(result.intent.date);
    setStartTime(result.intent.startTime);
    setEndTime(result.intent.endTime);
    setAttendees(result.intent.attendeeCount);
    setWorkflow(result);
  };

  const updateCriteria = (update: () => void) => {
    update();
    setWorkflow(null);
  };

  const steps = workflow?.steps ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground"><Bot className="h-3.5 w-3.5" /> Multi-agent booking assistant</span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Find a space that fits.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">The request, availability, conflict, recommendation, and approval agents work through your campus schedule before you choose a space.</p>
        <form onSubmit={(event) => { event.preventDefault(); runWorkflow(prompt); }} className="mt-6 space-y-4">
          <label className="relative block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input value={prompt} onChange={(event) => updateCriteria(() => setPrompt(event.target.value))} placeholder="e.g. A computer lab for 50 students from 2 PM to 4 PM with a projector" className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring" /></label>
          <div className="grid gap-3 sm:grid-cols-4">
            <label className="space-y-1 text-[11px] font-medium text-muted-foreground"><span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Date</span><input type="date" value={date} onChange={(event) => updateCriteria(() => setDate(event.target.value))} className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground" /></label>
            <label className="space-y-1 text-[11px] font-medium text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> Starts</span><input type="time" value={startTime} onChange={(event) => updateCriteria(() => setStartTime(event.target.value))} className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground" /></label>
            <label className="space-y-1 text-[11px] font-medium text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> Ends</span><input type="time" value={endTime} onChange={(event) => updateCriteria(() => setEndTime(event.target.value))} className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground" /></label>
            <label className="space-y-1 text-[11px] font-medium text-muted-foreground"><span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> Attendees</span><input type="number" min={1} value={attendees} onChange={(event) => updateCriteria(() => setAttendees(Number(event.target.value)))} className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground" /></label>
          </div>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex flex-wrap gap-2">{examples.map((example) => <button type="button" key={example} onClick={() => runWorkflow(example)} className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground">{example}</button>)}</div><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-xs font-semibold text-background hover:opacity-90">Run agents <ArrowRight className="h-3.5 w-3.5" /></button></div>
        </form>
      </section>

      {workflow && <section className="space-y-4" aria-live="polite">
        <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-sm font-semibold text-foreground">Agent workflow</h2><p className="mt-1 text-xs text-muted-foreground">Each specialist checks the current campus resources and schedules.</p></div><span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] text-muted-foreground">{workflow.matches.length} recommendations</span></div>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{steps.map((step) => <li key={step.id} className="rounded-xl border border-border bg-card p-3 shadow-sm"><div className="flex items-center gap-2"><span className={`flex h-7 w-7 items-center justify-center rounded-lg ${step.status === 'warning' ? 'bg-amber-50 text-amber-800' : 'bg-muted text-foreground'}`}>{step.status === 'warning' ? <AlertTriangle className="h-4 w-4" /> : stepIcons[step.agentName]}</span><span className="text-[10px] font-semibold text-foreground">{step.agentName}</span></div><p className="mt-2 text-[11px] font-medium text-foreground">{step.title}</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{step.details}</p></li>)}</ol>

        <div><h2 className="text-sm font-semibold text-foreground">Available matches</h2><p className="mt-1 text-xs text-muted-foreground">Final booking rules are checked again when you open the request form.</p></div>
        {workflow.matches.length ? <div className="grid gap-3 sm:grid-cols-2">{workflow.matches.map(({ resource, approval }) => <article key={resource.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-foreground">{resource.name}</h3><p className="mt-1 truncate text-xs text-muted-foreground">{resource.building} · {resource.capacity} capacity · {resource.facilities.slice(0, 2).join(', ')}</p><p className="mt-2 text-[11px] text-muted-foreground">{workflow.intent.date} · {workflow.intent.startTime}–{workflow.intent.endTime}</p><span className="mt-2 inline-flex rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{approval}</span></div><button onClick={() => onBook(resource, workflow.intent.date, workflow.intent.startTime, workflow.intent.endTime, workflow.intent.attendeeCount)} className="shrink-0 rounded-lg bg-foreground px-3 py-2 text-[11px] font-semibold text-background hover:opacity-90">Continue</button></article>)}</div> : <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center"><p className="text-sm font-semibold text-foreground">{workflow.matchingResourceCount ? 'Matching spaces are unavailable at that time' : 'No space meets those requirements'}</p><p className="mt-1 text-xs text-muted-foreground">Try changing the time, capacity, resource type, or facility requirements.</p></div>}
      </section>}
    </div>
  );
};
