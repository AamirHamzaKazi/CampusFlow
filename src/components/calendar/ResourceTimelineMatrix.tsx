'use client';

import React, { useState } from 'react';
import { Resource, Booking, ResourceType } from '@/types';
import { localDateKey } from '@/lib/dates';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Clock, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench,
  Sparkles,
  Plus
} from 'lucide-react';

interface ResourceTimelineMatrixProps {
  resources: Resource[];
  bookings: Booking[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSelectSlot: (resource: Resource, startTime: string, endTime: string) => void;
  onSelectBooking: (booking: Booking) => void;
  onTriggerFlowAI: (prompt: string) => void;
}

export const ResourceTimelineMatrix: React.FC<ResourceTimelineMatrixProps> = ({
  resources,
  bookings,
  selectedDate,
  onDateChange,
  onSelectSlot,
  onSelectBooking,
  onTriggerFlowAI,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [hoveredSlot, setHoveredSlot] = useState<{ resourceId: string; hour: number } | null>(null);

  // Time headers: 08:00 to 20:00
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', 
    '18:00', '19:00', '20:00'
  ];

  // Unique filter items
  const buildings = Array.from(new Set(resources.map(r => r.building)));
  const resourceTypes: { id: string; label: string }[] = [
    { id: 'all', label: 'All Resources' },
    { id: 'computer_lab', label: 'Computer Labs' },
    { id: 'specialized_lab', label: 'AI & Robotics Labs' },
    { id: 'auditorium', label: 'Auditoriums' },
    { id: 'classroom', label: 'Lecture Halls' },
    { id: 'seminar_hall', label: 'Seminar Rooms' },
    { id: 'sports_facility', label: 'Sports Arena' },
  ];

  const filteredResources = resources.filter(res => {
    if (selectedType !== 'all' && res.type !== selectedType) return false;
    if (selectedBuilding !== 'all' && res.building !== selectedBuilding) return false;
    if (minCapacity > 0 && res.capacity < minCapacity) return false;
    return true;
  });

  // Calculate position and width of a booking block on the timeline
  const getBookingStyle = (startTime: string, endTime: string) => {
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    const timelineStart = 8 * 60; // 08:00 in minutes
    const timelineEnd = 21 * 60;   // 21:00 in minutes
    const totalDuration = timelineEnd - timelineStart;

    const startMinutes = Math.max(toMinutes(startTime), timelineStart);
    const endMinutes = Math.min(toMinutes(endTime), timelineEnd);

    const leftPercent = ((startMinutes - timelineStart) / totalDuration) * 100;
    const widthPercent = Math.max(((endMinutes - startMinutes) / totalDuration) * 100, 4);

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'checked_in':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs';
      case 'confirmed':
        return 'bg-foreground text-background border-foreground/80 hover:border-foreground';
      case 'pending_approval':
        return 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs';
      case 'maintenance_hold':
        return 'maintenance-stripe text-zinc-700 border-zinc-300';
      default:
        return 'bg-foreground text-background border-foreground/80';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls & Filter Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card/60 backdrop-blur-xs">
        {/* Left: Date Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border bg-background p-1 shadow-2xs">
            <button
              onClick={() => {
                const d = new Date(`${selectedDate}T12:00:00`);
                d.setDate(d.getDate() - 1);
                onDateChange(localDateKey(d));
              }}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold">
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>{selectedDate}</span>
              {selectedDate === localDateKey() && <span className="text-[10px] text-muted-foreground font-normal">(Today)</span>}
            </div>
            <button
              onClick={() => {
                const d = new Date(`${selectedDate}T12:00:00`);
                d.setDate(d.getDate() + 1);
                onDateChange(localDateKey(d));
              }}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onDateChange(localDateKey())}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            Today
          </button>
        </div>

        {/* Center: Quick AI Prompt Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerFlowAI('Find and reserve a computer lab for 50 students between 2 PM and 4 PM')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-foreground text-background text-xs font-medium hover:opacity-90 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Auto-Find Available Slot</span>
          </button>
        </div>

        {/* Right: Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
          >
            {resourceTypes.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          {/* Building Filter */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Buildings</option>
            {buildings.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Capacity Filter */}
          <select
            value={minCapacity}
            onChange={(e) => setMinCapacity(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
          >
            <option value={0}>Any Capacity</option>
            <option value={30}>30+ Seats</option>
            <option value={50}>50+ Seats</option>
            <option value={100}>100+ Seats</option>
          </select>
        </div>
      </div>

      {/* Timeline Matrix Main Board */}
      <div
        role="region"
        aria-label="Resource schedule. Scroll horizontally to view all times."
        tabIndex={0}
        className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="min-w-[1008px] overflow-hidden rounded-xl">
        {/* Timeline Header Row */}
        <div className="flex border-b border-border bg-muted/40 sticky top-0 z-20">
          <div className="sticky left-0 z-30 flex w-64 shrink-0 items-center justify-between border-r border-border bg-muted p-3 text-xs font-semibold text-muted-foreground">
            <span>Campus Resource</span>
            <span className="text-[10px] font-mono">Capacity</span>
          </div>

          <div className="grid min-w-[750px] flex-1 grid-cols-13 divide-x divide-border/60 py-2.5 text-center font-mono text-[11px] text-muted-foreground">
            {timeSlots.map((slot) => (
              <div key={slot} className="px-1">
                {slot}
              </div>
            ))}
          </div>
        </div>

        {/* Resource Rows */}
        <div className="divide-y divide-border/70">
          {filteredResources.map((resource) => {
            const resourceBookings = bookings.filter(
              b => b.resourceId === resource.id && b.date === selectedDate && b.status !== 'cancelled'
            );

            return (
              <div key={resource.id} className="flex group hover:bg-muted/20 transition-colors relative">
                {/* Left Resource Meta Column */}
                <div className="sticky left-0 z-20 flex w-64 shrink-0 flex-col justify-between border-r border-border bg-card p-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground transition-colors">
                        {resource.name}
                      </span>
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {resource.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{resource.building} • {resource.floor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{resource.capacity} seats</span>
                    </div>
                    {resource.requiresApproval && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-500 font-medium">
                        Approval Req.
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Interactive Timeline Track */}
                <div className="flex-1 relative h-20 min-w-[750px] bg-background/50">
                  {/* Grid background guidelines */}
                  <div className="absolute inset-0 grid grid-cols-13 divide-x divide-border/40 pointer-events-none">
                    {timeSlots.map((slot, idx) => (
                      <div key={idx} className="h-full hover:bg-muted/10" />
                    ))}
                  </div>

                  {/* Empty Slot Click Trigger Overlay */}
                  <div className="absolute inset-0 grid grid-cols-13">
                    {timeSlots.slice(0, 12).map((slot, idx) => {
                      const nextHour = `${String(parseInt(slot.split(':')[0]) + 1).padStart(2, '0')}:00`;
                      const isHovered = hoveredSlot?.resourceId === resource.id && hoveredSlot?.hour === idx;

                      return (
                        <button
                          key={slot}
                          onMouseEnter={() => setHoveredSlot({ resourceId: resource.id, hour: idx })}
                          onMouseLeave={() => setHoveredSlot(null)}
                          onClick={() => onSelectSlot(resource, slot, nextHour)}
                          className="h-full w-full relative group/slot text-transparent hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center"
                          title={`Click to reserve ${resource.name} at ${slot}`}
                        >
                          <Plus className="w-3.5 h-3.5 opacity-0 group-hover/slot:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Booked / Reserved Blocks */}
                  {resourceBookings.map((booking) => {
                    const style = getBookingStyle(booking.startTime, booking.endTime);
                    const badgeStyle = getStatusBadge(booking.status);

                    return (
                      <div
                        key={booking.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBooking(booking);
                        }}
                        style={style}
                        title={booking.status === 'maintenance_hold' ? booking.purpose : booking.title}
                        className={`absolute top-2 bottom-2 rounded-md border p-2 text-left cursor-pointer transition-all shadow-xs z-10 overflow-hidden flex flex-col justify-between ${badgeStyle}`}
                      >
                        <div className="flex min-w-0 items-center justify-between gap-1">
                          <span className="min-w-0 flex-1 truncate font-semibold text-[11px] leading-tight">
                            {booking.title}
                          </span>
                          {booking.status === 'checked_in' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-ping shrink-0" />
                          )}
                        </div>

                        <div className="flex min-w-0 items-center justify-between gap-1 text-[10px] opacity-80 mt-0.5">
                          <span className="shrink-0 whitespace-nowrap font-mono">
                            {booking.startTime} - {booking.endTime}
                          </span>
                          <span className="min-w-0 truncate text-right">
                            {booking.organizerName.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>

      <p className="text-right text-[11px] text-muted-foreground md:hidden">Swipe the schedule horizontally to view all hours.</p>

      {/* Legend & Guide */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-foreground border border-foreground" />
            <span>Confirmed Booking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-600 border border-emerald-400" />
            <span>Checked-In (Active)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-50 border border-amber-300" />
            <span>Pending Approval</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded maintenance-stripe border border-zinc-600" />
            <span>Scheduled Maintenance</span>
          </div>
        </div>

        <div className="text-[11px]">
          💡 <span className="text-foreground">Pro-tip:</span> Click any empty space on the grid to instantly initiate a conflict-checked reservation.
        </div>
      </div>
    </div>
  );
};
