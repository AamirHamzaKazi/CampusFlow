'use client';

import React, { useMemo, useState } from 'react';
import { Booking, MaintenanceWindow, Resource } from '@/types';
import { ArrowRight, CalendarDays, Clock3, Search, Sparkles, Users } from 'lucide-react';
import { validateBookingRequest } from '@/lib/booking-rules';

interface BookingAssistantProps {
  resources: Resource[];
  bookings: Booking[];
  maintenance: MaintenanceWindow[];
  selectedDate: string;
  onBook: (resource: Resource, date: string, startTime: string, endTime: string, attendeeCount: number) => void;
}

const examples = ['A room for 30 people with a projector', 'A computer lab for 50 students', 'A quiet meeting space for 6'];

export const BookingAssistant: React.FC<BookingAssistantProps> = ({ resources, bookings, maintenance, selectedDate, onBook }) => {
  const [prompt, setPrompt] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [attendees, setAttendees] = useState(30);
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    const text = prompt.toLowerCase();
    const type = text.includes('computer') || text.includes('lab') ? 'computer_lab'
      : text.includes('auditorium') ? 'auditorium'
      : text.includes('seminar') ? 'seminar_hall'
      : text.includes('sports') || text.includes('court') ? 'sports_facility'
      : null;
    const requestedCapacity = Number(text.match(/\b(\d{1,3})\s*(?:people|students|attendees|person|seats)?\b/)?.[1] ?? attendees);
    const featureTerms = ['projector', 'whiteboard', 'gpu', 'ac', 'microphone'];
    const requiredFeatures = featureTerms.filter((feature) => text.includes(feature));

    return resources
      .filter((resource) => (!type || resource.type === type) && resource.capacity >= requestedCapacity)
      .filter((resource) => requiredFeatures.every((feature) => resource.facilities.join(' ').toLowerCase().includes(feature)))
      .map((resource) => ({ resource, validation: validateBookingRequest(resource, date, startTime, endTime, requestedCapacity, bookings, maintenance) }))
      .filter(({ validation }) => !validation.detected)
      .slice(0, 4);
  }, [prompt, resources, date, startTime, endTime, attendees, bookings, maintenance]);

  const submit = (event: React.FormEvent) => { event.preventDefault(); setSubmitted(true); };
  const requested = prompt.match(/\b(\d{1,3})\s*(?:people|students|attendees|person|seats)?\b/i);
  const attendeeValue = requested ? Number(requested[1]) : attendees;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground"><Sparkles className="h-3.5 w-3.5" /> Booking assistant</span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Find a space that fits.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Describe what you need, choose a time, and we’ll show spaces that match your requirements and current schedule.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="relative block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input value={prompt} onChange={(event) => { setPrompt(event.target.value); setSubmitted(false); }} placeholder="e.g. A computer lab for 50 students with a projector" className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring" /></label>
          <div className="grid gap-3 sm:grid-cols-4">
            <label className="space-y-1 text-[11px] font-medium text-muted-foreground"><span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground" /></label>
            <label className="space-y-1 text-[11px] font-medium text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> Starts</span><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground" /></label>
            <label className="space-y-1 text-[11px] font-medium text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> Ends</span><input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground" /></label>
            <label className="space-y-1 text-[11px] font-medium text-muted-foreground"><span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> Attendees</span><input type="number" min={1} value={attendees} onChange={(event) => setAttendees(Number(event.target.value))} className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground" /></label>
          </div>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex flex-wrap gap-2">{examples.map((example) => <button type="button" key={example} onClick={() => { setPrompt(example); setSubmitted(true); }} className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground">{example}</button>)}</div><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-xs font-semibold text-background hover:opacity-90">Find matching spaces <ArrowRight className="h-3.5 w-3.5" /></button></div>
        </form>
      </section>

      {submitted && <section className="space-y-3"><div><h2 className="text-sm font-semibold text-foreground">Available matches</h2><p className="mt-1 text-xs text-muted-foreground">Showing spaces that meet the request and pass the booking rules.</p></div>{results.length ? <div className="grid gap-3 sm:grid-cols-2">{results.map(({ resource }) => <article key={resource.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-foreground">{resource.name}</h3><p className="mt-1 truncate text-xs text-muted-foreground">{resource.building} · {resource.capacity} capacity · {resource.facilities.slice(0, 2).join(', ')}</p><p className="mt-2 text-[11px] text-muted-foreground">{date} · {startTime}–{endTime}</p></div><button onClick={() => onBook(resource, date, startTime, endTime, attendeeValue)} className="shrink-0 rounded-lg bg-foreground px-3 py-2 text-[11px] font-semibold text-background hover:opacity-90">Request</button></article>)}</div> : <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center"><p className="text-sm font-semibold text-foreground">No spaces match that time</p><p className="mt-1 text-xs text-muted-foreground">Try another time or reduce the capacity or facility requirements.</p></div>}</section>}
    </div>
  );
};
