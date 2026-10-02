'use client';

import React, { useState } from 'react';
import { Booking } from '@/types';
import { CalendarDays, Clock3, MapPin, Users, X } from 'lucide-react';
import { localDateKey } from '@/lib/dates';

interface BookingHistoryProps {
  bookings: Booking[];
  onCancel: (bookingId: string) => void;
}

const statusLabel: Record<Booking['status'], string> = {
  confirmed: 'Confirmed',
  pending_approval: 'Awaiting approval',
  conflict_flagged: 'Needs attention',
  cancelled: 'Cancelled',
  checked_in: 'Checked in',
  maintenance_hold: 'Maintenance',
};

const statusStyle: Record<Booking['status'], string> = {
  confirmed: 'bg-emerald-50 text-emerald-800',
  pending_approval: 'bg-amber-50 text-amber-800',
  conflict_flagged: 'bg-rose-50 text-rose-800',
  cancelled: 'bg-muted text-muted-foreground',
  checked_in: 'bg-blue-50 text-blue-800',
  maintenance_hold: 'bg-zinc-100 text-zinc-700',
};

export const BookingHistory: React.FC<BookingHistoryProps> = ({ bookings, onCancel }) => {
  const [selected, setSelected] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const today = localDateKey();
  const visible = bookings
    .filter((booking) => filter === 'all' || (filter === 'upcoming' ? booking.date >= today : booking.date < today))
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">My bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review requests, upcoming reservations, and past activity.</p>
        </div>
        <div className="inline-flex w-fit rounded-lg border border-border bg-card p-1">
          {(['all', 'upcoming', 'past'] as const).map((option) => (
            <button key={option} onClick={() => setFilter(option)} className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${filter === option ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {visible.length ? visible.map((booking) => (
          <div key={booking.id} className="flex flex-col justify-between gap-4 border-b border-border p-4 last:border-0 sm:flex-row sm:items-center sm:px-5">
            <button onClick={() => setSelected(booking)} className="min-w-0 flex-1 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold text-foreground">{booking.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyle[booking.status]}`}>{statusLabel[booking.status]}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{booking.resourceName}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{booking.date}</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{booking.startTime}–{booking.endTime}</span>
              </div>
            </button>
            {['confirmed', 'pending_approval'].includes(booking.status) && booking.date >= today && (
              <button onClick={() => onCancel(booking.id)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            )}
          </div>
        )) : (
          <div className="p-12 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-3 text-sm font-semibold text-foreground">No bookings in this view</h2>
            <p className="mt-1 text-xs text-muted-foreground">Try another filter or find a campus resource to book.</p>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="booking-detail-title" className="w-full max-w-lg space-y-5 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusStyle[selected.status]}`}>{statusLabel[selected.status]}</span>
                <h2 id="booking-detail-title" className="mt-3 text-lg font-semibold text-foreground">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close booking details" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-4 text-xs">
              <div><p className="text-muted-foreground">Resource</p><p className="mt-1 font-medium text-foreground">{selected.resourceName}</p></div>
              <div><p className="text-muted-foreground">Date</p><p className="mt-1 font-medium text-foreground">{selected.date}</p></div>
              <div><p className="text-muted-foreground">Time</p><p className="mt-1 font-medium text-foreground">{selected.startTime}–{selected.endTime}</p></div>
              <div><p className="text-muted-foreground">Attendees</p><p className="mt-1 inline-flex items-center gap-1 font-medium text-foreground"><Users className="h-3.5 w-3.5" />{selected.attendeeCount}</p></div>
            </div>
            <div><p className="text-xs font-medium text-foreground">Purpose</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{selected.purpose}</p></div>
            {selected.rejectionReason && <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800"><strong>Decision note:</strong> {selected.rejectionReason}</div>}
            <div className="flex justify-end"><button onClick={() => setSelected(null)} className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90">Done</button></div>
          </section>
        </div>
      )}
    </div>
  );
};
