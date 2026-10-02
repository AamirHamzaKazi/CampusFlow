'use client';

import React, { useMemo, useState } from 'react';
import { Resource, Booking, Role, MaintenanceWindow } from '@/types';
import { validateBookingRequest } from '@/lib/booking-rules';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  initialStartTime?: string;
  initialEndTime?: string;
  initialDate?: string;
  initialAttendeeCount?: number;
  onConfirmBooking: (bookingData: Partial<Booking>) => Promise<boolean>;
  allBookings: Booking[];
  maintenanceWindows?: MaintenanceWindow[];
  currentRole?: Role;
  currentUser?: { name: string; email: string; department: string };
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  resource,
  initialStartTime = '10:00',
  initialEndTime = '12:00',
  initialDate = '2026-10-02',
  initialAttendeeCount = 30,
  onConfirmBooking,
  allBookings,
  maintenanceWindows = [],
  currentRole = 'student',
  currentUser = { name: 'Aamir Kazi', email: 'aamir@campusflow.io', department: 'Computer Science' },
}) => {
  const [title, setTitle] = useState('');
  const organizerName = currentUser.name;
  const organizerEmail = currentUser.email;
  const department = currentUser.department;
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [attendeeCount, setAttendeeCount] = useState(initialAttendeeCount);
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const conflictReport = useMemo(() => resource
    ? validateBookingRequest(resource, date, startTime, endTime, attendeeCount, allBookings, maintenanceWindows)
    : null, [resource, date, startTime, endTime, attendeeCount, allBookings, maintenanceWindows]);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conflictReport || conflictReport.detected || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const saved = await onConfirmBooking({
      resourceId: resource.id,
      resourceName: resource.name,
      resourceType: resource.type,
      title: title || `Reservation for ${resource.name}`,
      organizerName,
      organizerEmail,
      organizerRole: currentRole,
      department,
      date,
      startTime,
      endTime,
      attendeeCount: Number(attendeeCount),
      purpose: purpose || 'Academic Session / Study',
      status: resource.requiresApproval ? 'pending_approval' : 'confirmed',
      requiresApproval: resource.requiresApproval,
      priorityScore: 7,
      createdAt: new Date().toISOString(),
      });
      if (saved) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-foreground">Reserve Campus Resource</h3>
              {resource.requiresApproval && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Requires Approval
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {resource.name} ({resource.building} • {resource.capacity} Seats)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Conflict Alert Indicator */}
        {conflictReport && (
          <div
            className={`p-3.5 rounded-lg border text-xs space-y-2 ${
              conflictReport.detected
                ? 'border-rose-300 bg-rose-50 text-rose-900'
                : 'border-emerald-300 bg-emerald-50 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {conflictReport.detected ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  <span>Conflict Warning: Slot Occupied</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Verified: Slot is Free & Clear</span>
                </>
              )}
            </div>
            <p className="text-[11px] opacity-90">{conflictReport.message}</p>

            {/* Quick Alternatives buttons if conflicted */}
            {conflictReport.detected && conflictReport.alternatives.length > 0 && (
              <div className="pt-2 border-t border-rose-500/20 space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-rose-800">
                  Suggested Alternatives:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {conflictReport.alternatives.slice(0, 2).map((alt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDate(alt.date);
                        setStartTime(alt.startTime);
                        setEndTime(alt.endTime);
                      }}
                      className="p-2 rounded-md border border-border bg-card/80 hover:bg-accent text-left text-[11px] text-foreground transition-all"
                    >
                      <div className="font-semibold">{alt.resourceName}</div>
                      <div className="text-muted-foreground">{alt.startTime} - {alt.endTime} ({alt.matchScore}% Match)</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-muted-foreground font-medium mb-1">Session / Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Computer Vision Research Discussion"
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground font-medium mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-muted-foreground font-medium mb-1">Expected Attendees</label>
              <input
                type="number"
                min={1}
              max={resource.capacity}
                required
                value={attendeeCount}
              onChange={(e) => setAttendeeCount(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground font-medium mb-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-muted-foreground font-medium mb-1">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground font-medium mb-1">Purpose / Notes</label>
            <textarea
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Brief description of the activity..."
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border bg-card text-xs text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!conflictReport || conflictReport.detected || isSubmitting}
              className="px-5 py-2 rounded-lg bg-foreground text-background text-xs font-bold hover:opacity-90 disabled:opacity-40 transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isSubmitting ? 'Saving booking…' : resource.requiresApproval ? 'Submit Request for Approval' : 'Confirm Instant Reservation'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
