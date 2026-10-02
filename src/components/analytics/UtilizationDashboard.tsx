'use client';

import React from 'react';
import { AnalyticsSnapshot } from '@/types';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Building2, 
  ArrowUpRight 
} from 'lucide-react';

interface UtilizationDashboardProps {
  analytics: AnalyticsSnapshot;
  onSelectResource: (resourceId: string) => void;
}

export const UtilizationDashboard: React.FC<UtilizationDashboardProps> = ({
  analytics,
  onSelectResource,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Resource utilization</h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium">
              Demo data
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            A snapshot of bookings and resource demand for the selected period.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Snapshot period:</span>
          <span className="text-xs font-semibold text-foreground px-2.5 py-1 rounded-md bg-muted">
            Selected day
          </span>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Live Campus Occupancy</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">{analytics.occupancyRate}%</span>
            <span className="text-[11px] text-muted-foreground">of scheduled hours</span>
          </div>
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analytics.occupancyRate}%` }} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Conflicts prevented</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">{analytics.conflictsAvertedThisMonth}</span>
            <span className="text-[11px] text-muted-foreground font-medium">Booking checks</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Logged booking conflicts for this month.</p>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Active Reservations Today</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">{analytics.activeBookingsToday}</span>
            <span className="text-[11px] text-muted-foreground">{analytics.resourceCount ?? 0} Resources</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Based on bookings scheduled today.</p>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Pending Approvals</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-500">{analytics.pendingApprovals}</span>
            <span className="text-[11px] text-muted-foreground">In Review</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Requests currently awaiting a decision.</p>
        </div>
      </div>

      {/* Charts & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Peak Hours Demand Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div>
              <h3 className="font-bold text-sm text-foreground">Hourly Campus Resource Demand</h3>
              <p className="text-xs text-muted-foreground">Booking distribution across operational hours</p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">08:00 - 20:00</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
            {analytics.peakHours.map((slot, idx) => {
              const heightPercent = (slot.count / 12) * 100;
              const isPeak = slot.count >= 9;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {slot.count} req
                  </span>
                  <div
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    className={`w-full max-w-[40px] rounded-t-md transition-all ${
                      isPeak
                        ? 'bg-emerald-500 group-hover:bg-emerald-400 shadow-xs'
                        : 'bg-muted-foreground/30 group-hover:bg-muted-foreground/50'
                    }`}
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">{slot.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-4">
          <div className="border-b border-border/80 pb-3">
            <h3 className="font-bold text-sm text-foreground">Department Allocation</h3>
            <p className="text-xs text-muted-foreground">Share of total reserved hours</p>
          </div>

          <div className="space-y-3 pt-1">
            {analytics.departmentUtilization.map((dept, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium truncate">{dept.department}</span>
                  <span className="font-mono text-muted-foreground">{dept.percentage}%</span>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-foreground h-full rounded-full"
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower-utilization resources */}
      <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Resources with lower utilization</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Review lightly booked spaces when planning future schedules or resource changes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {analytics.underutilizedResources.map((res) => (
            <div
              key={res.id}
              className="p-3.5 rounded-lg border border-border bg-card flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-xs text-foreground">{res.name}</div>
                <div className="text-[11px] text-muted-foreground">{res.building} • {res.capacity} Seats</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-amber-500">{res.utilizationRate}%</span>
                <div className="text-[10px] text-muted-foreground">Avg Occupancy</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
