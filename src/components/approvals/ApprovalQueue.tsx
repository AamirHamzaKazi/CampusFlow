'use client';

import React, { useState } from 'react';
import { Booking, Role } from '@/types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  MapPin, 
  ShieldCheck, 
  Calendar,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface ApprovalQueueProps {
  bookings: Booking[];
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string, reason: string) => void;
  currentRole: Role;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  bookings,
  onApprove,
  onReject,
  currentRole,
}) => {
  const [selectedBookingForReject, setSelectedBookingForReject] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingBookings = bookings.filter(b => b.status === 'pending_approval');
  const pastActionedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'cancelled');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Approval queue</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold">
              {pendingBookings.length} Pending
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Institutional requests routed based on facility capacity and policy tier.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Authorized Reviewer:</span>
          <span className="font-semibold text-foreground capitalize px-2 py-1 rounded bg-muted">
            {currentRole.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Pending Queue List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Awaiting Action ({pendingBookings.length})
        </h3>

        {pendingBookings.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/10 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="text-sm font-semibold text-foreground">All caught up!</div>
            <p className="text-xs text-muted-foreground">There are no pending resource requests awaiting your review.</p>
          </div>
        ) : (
          pendingBookings.map((bk) => (
            <div
              key={bk.id}
              className="p-5 rounded-xl border border-border bg-card hover:border-border/80 transition-all shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{bk.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                      Priority {bk.priorityScore}/10
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Requested by <span className="text-foreground font-medium">{bk.organizerName}</span> ({bk.organizerEmail}) • {bk.department}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-foreground">{bk.resourceName}</span>
                  <div className="text-[11px] text-muted-foreground font-mono">{bk.resourceType.replace('_', ' ')}</div>
                </div>
              </div>

              {/* Booking Specifications Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-muted/40 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{bk.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>{bk.startTime} - {bk.endTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-3.5 h-3.5 text-purple-500" />
                  <span>{bk.attendeeCount} Attendees</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Awaiting staff decision</span>
                </div>
              </div>

              {/* Purpose */}
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Stated Purpose:</span> {bk.purpose}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => setSelectedBookingForReject(bk)}
                  className="px-3.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => onApprove(bk.id)}
                  className="px-4 py-1.5 rounded-lg bg-foreground hover:bg-foreground/90 text-background text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve request</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Reason Dialog Modal */}
      {selectedBookingForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Reject Request: {selectedBookingForReject.title}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Please provide a reason. The student or faculty member will receive an automated notification with alternative suggestions.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Department lab maintenance scheduled; please select Seminar Room B instead..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedBookingForReject(null);
                  setRejectReason('');
                }}
                className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReject(selectedBookingForReject.id, rejectReason || 'Institution policy constraint.');
                  setSelectedBookingForReject(null);
                  setRejectReason('');
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
