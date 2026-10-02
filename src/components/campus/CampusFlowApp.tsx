'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsSnapshot, AuditLogEntry, Booking, CampusNotification, CampusUserProfile, MaintenanceWindow, Resource, Role } from '@/types';
import { CampusSnapshot } from '@/lib/demo-repository';
import { validateBookingRequest } from '@/lib/booking-rules';
import { localDateKey } from '@/lib/dates';
import { Navbar } from '@/components/layout/Navbar';
import { ActiveTab, Sidebar } from '@/components/layout/Sidebar';
import { ResourceTimelineMatrix } from '@/components/calendar/ResourceTimelineMatrix';
import { BookingAssistant } from '@/components/agent/BookingAssistant';
import { ApprovalQueue } from '@/components/approvals/ApprovalQueue';
import { ResourceCatalog } from '@/components/resources/ResourceCatalog';
import { UtilizationDashboard } from '@/components/analytics/UtilizationDashboard';
import { BookingModal } from '@/components/booking/BookingModal';
import { DashboardHome } from '@/components/home/DashboardHome';
import { BookingHistory } from '@/components/bookings/BookingHistory';
import { MaintenancePlanner } from '@/components/maintenance/MaintenancePlanner';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { Search, X } from 'lucide-react';

const localDate = localDateKey;

function createAnalytics(resources: Resource[], bookings: Booking[], logs: AuditLogEntry[], date: string): AnalyticsSnapshot {
  const active = bookings.filter((booking) => booking.date === date && !['cancelled', 'maintenance_hold', 'conflict_flagged'].includes(booking.status));
  const duration = (booking: Booking) => {
    const [startHour, startMinute] = booking.startTime.split(':').map(Number);
    const [endHour, endMinute] = booking.endTime.split(':').map(Number);
    return Math.max(0, endHour * 60 + endMinute - (startHour * 60 + startMinute));
  };
  const toMinutes = (time: string) => { const [hour, minute] = time.split(':').map(Number); return hour * 60 + minute; };
  const bookedMinutes = active.reduce((sum, booking) => sum + duration(booking), 0);
  const availableMinutes = resources.reduce((sum, resource) => sum + Math.max(0, toMinutes(resource.operatingHours.close) - toMinutes(resource.operatingHours.open)), 0);
  const perResource = resources.map((resource) => {
    const minutesBooked = active.filter((booking) => booking.resourceId === resource.id).reduce((sum, booking) => sum + duration(booking), 0);
    const openMinutes = Math.max(1, toMinutes(resource.operatingHours.close) - toMinutes(resource.operatingHours.open));
    return { ...resource, utilizationRate: Math.min(100, Math.round((minutesBooked / openMinutes) * 100)) };
  });
  const departments = new Map<string, number>();
  active.forEach((booking) => departments.set(booking.department, (departments.get(booking.department) ?? 0) + duration(booking)));
  const totalDepartmentMinutes = Array.from(departments.values()).reduce((sum, item) => sum + item, 0) || 1;
  const peakHours = Array.from({ length: 12 }, (_, index) => {
    const hour = index + 8;
    const count = active.filter((booking) => toMinutes(booking.startTime) < (hour + 1) * 60 && toMinutes(booking.endTime) > hour * 60).length;
    return { time: `${String(hour).padStart(2, '0')}:00`, count };
  });

  return {
    resourceCount: resources.length,
    occupancyRate: availableMinutes ? Math.round((bookedMinutes / availableMinutes) * 100) : 0,
    activeBookingsToday: active.length,
    pendingApprovals: bookings.filter((booking) => booking.status === 'pending_approval').length,
    conflictsAvertedThisMonth: logs.filter((log) => log.action === 'CONFLICT_PREVENTED').length,
    peakHours,
    underutilizedResources: perResource.filter((resource) => resource.utilizationRate < 30).slice(0, 4),
    departmentUtilization: Array.from(departments.entries()).map(([department, minutes]) => ({ department, percentage: Math.round((minutes / totalDepartmentMinutes) * 100) })),
  };
}

interface CampusFlowAppProps {
  profile: CampusUserProfile;
  institutionName: string;
  initialSnapshot: CampusSnapshot;
}

export default function CampusFlowApp({ profile, institutionName, initialSnapshot }: CampusFlowAppProps) {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>(initialSnapshot.resources);
  const [bookings, setBookings] = useState<Booking[]>(initialSnapshot.bookings);
  const [maintenance, setMaintenance] = useState<MaintenanceWindow[]>(initialSnapshot.maintenance);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialSnapshot.auditLogs);
  const [notifications, setNotifications] = useState<CampusNotification[]>(initialSnapshot.notifications);

  const currentRole = profile.role;
  const currentUser = { name: profile.fullName, email: profile.email, department: profile.department };
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState(localDate);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [bookingSlot, setBookingSlot] = useState({ start: '14:00', end: '16:00', attendees: 30, date: localDate() });
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [toast, setToast] = useState<{ id: string; title: string; description: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null);

  const isStaff = !['student', 'faculty'].includes(currentRole);
  const pendingCount = bookings.filter((booking) => booking.status === 'pending_approval').length;
  const analytics = useMemo(() => createAnalytics(resources, bookings, auditLogs, selectedDate), [resources, bookings, auditLogs, selectedDate]);
  const calendarBookings = useMemo<Booking[]>(() => [
    ...bookings,
    ...maintenance.filter((window) => window.status === 'scheduled' && !bookings.some((booking) =>
      booking.status === 'maintenance_hold' &&
      booking.resourceId === window.resourceId &&
      booking.date === window.date &&
      booking.startTime === window.startTime &&
      booking.endTime === window.endTime
    )).map((window) => ({
      id: window.id,
      tenantId: window.tenantId,
      resourceId: window.resourceId,
      resourceName: window.resourceName,
      resourceType: resources.find((resource) => resource.id === window.resourceId)?.type ?? 'classroom',
      title: 'Maintenance',
      organizerName: 'Campus operations',
      organizerRole: 'facility_manager' as Role,
      organizerEmail: 'facilities@apex.edu',
      department: 'Campus Operations',
      date: window.date,
      startTime: window.startTime,
      endTime: window.endTime,
      attendeeCount: 0,
      purpose: window.reason,
      status: 'maintenance_hold' as const,
      requiresApproval: false,
      priorityScore: 10,
      createdAt: new Date().toISOString(),
    })),
  ], [bookings, maintenance, resources]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsQuickSearchOpen(true);
      }
      if (event.key === 'Escape') setIsQuickSearchOpen(false);
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // Server refreshes deliver the canonical snapshot after each successful mutation.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setResources(initialSnapshot.resources);
    setBookings(initialSnapshot.bookings);
    setMaintenance(initialSnapshot.maintenance);
    setAuditLogs(initialSnapshot.auditLogs);
    setNotifications(initialSnapshot.notifications);
  }, [initialSnapshot]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const showToast = (title: string, description: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToast({ id, title, description, type });
    window.setTimeout(() => setToast((current) => current?.id === id ? null : current), 4200);
  };

  const mutate = async (path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: Record<string, unknown>) => {
    try {
      const response = await fetch(path, { method, ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? 'The change could not be saved.');
      router.refresh();
      return true;
    } catch (error) {
      showToast('Could not save change', error instanceof Error ? error.message : 'Please try again.', 'error');
      return false;
    }
  };

  const openBooking = (resource: Resource, date = selectedDate, start = '14:00', end = '16:00', attendees = 30) => {
    setSelectedResource(resource);
    setBookingSlot({ date, start, end, attendees });
    setIsBookingModalOpen(true);
  };

  const handleCreateBooking = async (data: Partial<Booking>) => {
    const resource = resources.find((item) => item.id === data.resourceId);
    if (!resource) { showToast('Resource not found', 'Refresh the inventory and try again.', 'error'); return false; }
    const date = data.date ?? bookingSlot.date;
    const startTime = data.startTime ?? bookingSlot.start;
    const endTime = data.endTime ?? bookingSlot.end;
    const attendeeCount = Number(data.attendeeCount ?? bookingSlot.attendees);
    const validation = validateBookingRequest(resource, date, startTime, endTime, attendeeCount, bookings, maintenance);
    if (validation.detected) { showToast('This booking needs a change', validation.message, 'error'); return false; }

    const requiresApproval = resource.requiresApproval;
    const saved = await mutate('/api/bookings', 'POST', { resourceId: resource.id, title: data.title?.trim() || `Reservation for ${resource.name}`, date, startTime, endTime, attendeeCount, purpose: data.purpose?.trim() || 'Campus resource booking' });
    if (!saved) return false;
    showToast(requiresApproval ? 'Request submitted' : 'Booking confirmed', requiresApproval ? 'You’ll see an update here when staff reviews your request.' : `${resource.name} is reserved for you.`, requiresApproval ? 'warning' : 'success');
    return true;
  };

  const handleApprove = async (bookingId: string) => {
    if (!isStaff) return;
    const booking = bookings.find((item) => item.id === bookingId && item.status === 'pending_approval');
    if (!booking) return;
    const resource = resources.find((item) => item.id === booking.resourceId);
    if (!resource) { showToast('Resource is no longer available', 'Review the resource before approving this request.', 'error'); return; }
    const validation = validateBookingRequest(resource, booking.date, booking.startTime, booking.endTime, booking.attendeeCount, bookings.filter((item) => item.id !== bookingId), maintenance);
    if (validation.detected) { showToast('Request needs review', validation.message, 'error'); return; }
    if (await mutate(`/api/bookings/${bookingId}`, 'PATCH', { action: 'approve' })) showToast('Booking approved', `${booking.title} is now confirmed.`);
  };

  const handleReject = async (bookingId: string, reason: string) => {
    if (!isStaff) return;
    const booking = bookings.find((item) => item.id === bookingId && item.status === 'pending_approval');
    if (!booking) return;
    if (await mutate(`/api/bookings/${bookingId}`, 'PATCH', { action: 'reject', reason })) showToast('Request declined', `The decision for “${booking.title}” has been saved.`, 'info');
  };

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking || booking.status === 'cancelled') return;
    if (!isStaff && booking.organizerEmail !== currentUser.email) { showToast('You can’t cancel this booking', 'Only the booking organizer can cancel it.', 'error'); return; }
    if (await mutate(`/api/bookings/${bookingId}`, 'PATCH', { action: 'cancel' })) showToast('Booking cancelled', `${booking.resourceName} is available again.`);
  };

  const handleSaveResource = async (resource: Resource) => {
    const saved = await mutate(resource.id ? `/api/resources/${resource.id}` : '/api/resources', resource.id ? 'PATCH' : 'POST', resource as unknown as Record<string, unknown>);
    if (saved) showToast('Resource saved', `${resource.name} is now in the campus inventory.`);
    return saved;
  };

  const handleAddMaintenance = async (window: MaintenanceWindow) => {
    const conflict = bookings.find((booking) => booking.resourceId === window.resourceId && booking.date === window.date && !['cancelled', 'conflict_flagged'].includes(booking.status) && booking.startTime < window.endTime && window.startTime < booking.endTime);
    if (conflict) { showToast('Existing booking overlaps', `Resolve “${conflict.title}” before scheduling maintenance.`, 'error'); return false; }
    const saved = await mutate('/api/maintenance', 'POST', window as unknown as Record<string, unknown>);
    if (saved) showToast('Maintenance scheduled', `${window.resourceName} is blocked for that time.`);
    return saved;
  };

  const handleCancelMaintenance = async (id: string) => { if (await mutate(`/api/maintenance/${id}`, 'DELETE')) showToast('Maintenance removed', 'The resource is available for booking again.'); };
  const visibleBookings = isStaff ? bookings : bookings.filter((booking) => booking.organizerEmail === currentUser.email);
  const quickResources = resources.filter((resource) => `${resource.name} ${resource.building} ${resource.facilities.join(' ')}`.toLowerCase().includes(quickSearch.toLowerCase())).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar currentRole={currentRole} currentUserName={profile.fullName} institutionName={institutionName} onOpenQuickSearch={() => setIsQuickSearchOpen(true)} notifications={notifications} onMarkNotificationsRead={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))} />
      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} pendingCount={pendingCount} currentRole={currentRole} resourceCount={resources.length} />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
          {activeTab === 'dashboard' && <DashboardHome role={currentRole} resources={resources} bookings={bookings} userEmail={currentUser.email} onNavigate={setActiveTab} onBookResource={(resource) => openBooking(resource)} onSelectBooking={(booking) => showToast(booking.title, `${booking.resourceName} · ${booking.date}, ${booking.startTime}–${booking.endTime}.`, 'info')} />}
          {activeTab === 'calendar' && <ResourceTimelineMatrix resources={resources} bookings={calendarBookings} selectedDate={selectedDate} onDateChange={setSelectedDate} onSelectSlot={(resource, start, end) => openBooking(resource, selectedDate, start, end)} onSelectBooking={(booking) => showToast(booking.title, `${booking.resourceName} · ${booking.startTime}–${booking.endTime} (${booking.status.replaceAll('_', ' ')}).`, 'info')} onTriggerFlowAI={() => setActiveTab(isStaff ? 'resources' : 'assistant')} />}
          {(activeTab === 'discover' || activeTab === 'resources') && <ResourceCatalog resources={resources} tenantId={profile.institutionId} canManage={isStaff} onBook={(resource) => openBooking(resource)} onSave={handleSaveResource} />}
          {activeTab === 'my-bookings' && <BookingHistory bookings={visibleBookings} onCancel={handleCancelBooking} />}
          {activeTab === 'approvals' && isStaff && <ApprovalQueue bookings={bookings} onApprove={handleApprove} onReject={handleReject} currentRole={currentRole} />}
          {activeTab === 'maintenance' && isStaff && <MaintenancePlanner resources={resources} windows={maintenance} onAdd={handleAddMaintenance} onCancel={handleCancelMaintenance} />}
          {activeTab === 'analytics' && isStaff && <UtilizationDashboard analytics={analytics} onSelectResource={() => setActiveTab('resources')} />}
          {activeTab === 'assistant' && !isStaff && <BookingAssistant resources={resources} bookings={bookings} maintenance={maintenance} selectedDate={selectedDate} onBook={(resource, date, start, end, attendees) => openBooking(resource, date, start, end, attendees)} />}
          {activeTab === 'activity' && isStaff && <ActivityFeed logs={auditLogs} />}
        </main>
      </div>

      {isBookingModalOpen && <BookingModal key={`${selectedResource?.id ?? 'none'}:${bookingSlot.date}:${bookingSlot.start}:${bookingSlot.end}`} isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} resource={selectedResource} initialDate={bookingSlot.date} initialStartTime={bookingSlot.start} initialEndTime={bookingSlot.end} initialAttendeeCount={bookingSlot.attendees} onConfirmBooking={handleCreateBooking} allBookings={bookings} maintenanceWindows={maintenance} currentRole={currentRole} currentUser={currentUser} />}

      {isQuickSearchOpen && <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsQuickSearchOpen(false); }}><section role="dialog" aria-modal="true" aria-label="Search campus" className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"><div className="flex items-center gap-3 border-b border-border px-4"><Search className="h-4 w-4 text-muted-foreground" /><input autoFocus value={quickSearch} onChange={(event) => setQuickSearch(event.target.value)} placeholder="Search rooms, buildings, facilities…" className="h-14 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" /><button onClick={() => setIsQuickSearchOpen(false)} aria-label="Close search" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button></div><div className="max-h-[60vh] overflow-y-auto p-2">{quickSearch && quickResources.length ? quickResources.map((resource) => <button key={resource.id} onClick={() => { setIsQuickSearchOpen(false); openBooking(resource); }} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-muted"><span><span className="block text-xs font-medium text-foreground">{resource.name}</span><span className="mt-1 block text-[11px] text-muted-foreground">{resource.building} · {resource.capacity} capacity</span></span><span className="text-[10px] text-muted-foreground">Book <span aria-hidden="true">↗</span></span></button>) : <div className="p-7 text-center text-xs text-muted-foreground">{quickSearch ? 'No matching spaces. Try a building or facility name.' : 'Start typing to search the campus inventory.'}</div>}</div></section></div>}

      {toast && <div role="status" className={`fixed bottom-20 right-4 z-[60] max-w-sm rounded-xl border bg-card p-4 shadow-xl sm:bottom-6 sm:right-6 ${toast.type === 'success' ? 'border-emerald-300' : toast.type === 'warning' ? 'border-amber-300' : toast.type === 'error' ? 'border-rose-300' : 'border-border'}`}><div className="text-xs font-semibold text-foreground">{toast.title}</div><p className="mt-1 text-[11px] leading-4 text-muted-foreground">{toast.description}</p></div>}
    </div>
  );
}
