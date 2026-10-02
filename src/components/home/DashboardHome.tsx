'use client';

import React from 'react';
import { Booking, Resource, Role } from '@/types';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin, Plus, Search, Sparkles, Users } from 'lucide-react';
import { ActiveTab } from '@/components/layout/Sidebar';

interface DashboardHomeProps {
  role: Role;
  resources: Resource[];
  bookings: Booking[];
  userEmail: string;
  onNavigate: (tab: ActiveTab) => void;
  onBookResource: (resource: Resource) => void;
  onSelectBooking: (booking: Booking) => void;
}

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  role,
  resources,
  bookings,
  userEmail,
  onNavigate,
  onBookResource,
  onSelectBooking,
}) => {
  const isStaff = !['student', 'faculty'].includes(role);
  const myBookings = bookings.filter((booking) => booking.organizerEmail === userEmail);
  const visibleBookings = isStaff ? bookings : myBookings;
  const upcoming = visibleBookings
    .filter((booking) => booking.date >= today() && !['cancelled', 'maintenance_hold'].includes(booking.status))
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 4);
  const pendingCount = bookings.filter((booking) => booking.status === 'pending_approval').length;
  const availableCount = resources.filter((resource) => resource.status !== 'maintenance').length;
  const greetingName = isStaff ? 'Campus operations' : role === 'faculty' ? 'Faculty workspace' : 'Your campus';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-end sm:p-8">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Apex Institute of Technology</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{greetingName}, all in one place.</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {isStaff
              ? 'Review requests, keep campus spaces running, and see how resources are being used.'
              : 'Find the right campus space, request a booking, and keep track of what you have coming up.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isStaff && (
            <button onClick={() => onNavigate('discover')} className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90">
              <Search className="h-4 w-4" /> Find a resource
            </button>
          )}
          {isStaff && (
            <button onClick={() => onNavigate('resources')} className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90">
              <Plus className="h-4 w-4" /> Manage resources
            </button>
          )}
          <button onClick={() => onNavigate(isStaff ? 'calendar' : 'my-bookings')} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
            <CalendarDays className="h-4 w-4" /> {isStaff ? 'Open schedule' : 'My bookings'}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(isStaff
          ? [
              { label: 'Managed resources', value: resources.length, icon: MapPin, note: `${availableCount} bookable` },
              { label: 'Requests to review', value: pendingCount, icon: Clock3, note: 'Across campus' },
              { label: 'Bookings today', value: bookings.filter((booking) => booking.date === today() && booking.status !== 'cancelled').length, icon: CalendarDays, note: 'All resource types' },
              { label: 'People served', value: bookings.filter((booking) => booking.date === today() && booking.status !== 'cancelled').reduce((sum, booking) => sum + booking.attendeeCount, 0), icon: Users, note: 'Expected today' },
            ]
          : [
              { label: 'My upcoming bookings', value: myBookings.filter((booking) => booking.date >= today() && !['cancelled', 'maintenance_hold'].includes(booking.status)).length, icon: CalendarDays, note: 'Your schedule' },
              { label: 'Awaiting approval', value: myBookings.filter((booking) => booking.status === 'pending_approval').length, icon: Clock3, note: 'We’ll update you' },
              { label: 'Available resources', value: availableCount, icon: MapPin, note: 'Across campus' },
              { label: 'Campus capacity', value: resources.reduce((sum, resource) => sum + resource.capacity, 0).toLocaleString(), icon: Users, note: 'Seats and spaces' },
            ]).map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">{item.label}</span>
              <item.icon className="h-4 w-4" />
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{item.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{item.note}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">{isStaff ? 'Upcoming campus bookings' : 'Your next bookings'}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{isStaff ? 'The next reservations across your institution.' : 'Your confirmed and pending reservations.'}</p>
            </div>
            <button onClick={() => onNavigate(isStaff ? 'calendar' : 'my-bookings')} className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {upcoming.length ? (
            <div className="divide-y divide-border">
              {upcoming.map((booking) => (
                <button key={booking.id} onClick={() => onSelectBooking(booking)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/50">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{booking.title}</div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">{booking.resourceName}{isStaff ? ` · ${booking.organizerName}` : ''}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-medium text-foreground">{booking.date}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{booking.startTime}–{booking.endTime}</div>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${booking.status === 'pending_approval' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                      {booking.status === 'pending_approval' ? 'Pending' : 'Confirmed'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <CalendarDays className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">Nothing scheduled yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Your next booking will show up here.</p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-foreground" />
            <h2 className="text-sm font-semibold text-foreground">{isStaff ? 'Needs your attention' : 'Good to know'}</h2>
          </div>
          <div className="mt-4 space-y-3">
            {isStaff ? (
              <button onClick={() => onNavigate('approvals')} className="flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left hover:bg-muted/50">
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-800"><Clock3 className="h-4 w-4" /></span>
                <span><span className="block text-xs font-semibold text-foreground">{pendingCount} requests waiting</span><span className="mt-1 block text-[11px] text-muted-foreground">Review booking requests to keep schedules moving.</span></span>
              </button>
            ) : (
              <button onClick={() => onNavigate('assistant')} className="flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left hover:bg-muted/50">
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground"><Sparkles className="h-4 w-4" /></span>
                <span><span className="block text-xs font-semibold text-foreground">Need help finding a space?</span><span className="mt-1 block text-[11px] text-muted-foreground">Describe your event and get matching options.</span></span>
              </button>
            )}
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground"><CheckCircle2 className="h-4 w-4" /></span>
              <span><span className="block text-xs font-semibold text-foreground">Campus resources at a glance</span><span className="mt-1 block text-[11px] text-muted-foreground">{availableCount} spaces are currently available to browse.</span></span>
            </div>
            {!isStaff && (
              <button onClick={() => onNavigate('discover')} className="flex w-full items-center justify-between rounded-lg bg-foreground px-4 py-3 text-xs font-medium text-background hover:opacity-90">
                Browse available spaces <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
