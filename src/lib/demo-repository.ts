import { AuditLogEntry, Booking, CampusNotification, MaintenanceWindow, Resource } from '@/types';
import { mockBookings, mockResources } from '@/lib/mock-data';

export interface CampusSnapshot {
  resources: Resource[];
  bookings: Booking[];
  maintenance: MaintenanceWindow[];
  auditLogs: AuditLogEntry[];
  notifications: CampusNotification[];
}

const STORAGE_KEY = 'campusflow-demo-v1';

const personalBookings: Booking[] = [
  {
    id: 'bk-demo-1',
    tenantId: 'inst-1',
    resourceId: 'res-105',
    resourceName: 'Seminar Room B (Executive)',
    resourceType: 'seminar_hall',
    title: 'Design Review with Project Team',
    organizerName: 'Aamir Kazi',
    organizerRole: 'student',
    organizerEmail: 'aamir@campusflow.io',
    department: 'Computer Science',
    date: '2026-10-03',
    startTime: '14:00',
    endTime: '16:00',
    attendeeCount: 8,
    purpose: 'Review the capstone project prototype and divide final tasks.',
    status: 'pending_approval',
    requiresApproval: true,
    priorityScore: 5,
    createdAt: '2026-10-01T09:30:00Z',
  },
  {
    id: 'bk-demo-2',
    tenantId: 'inst-1',
    resourceId: 'res-108',
    resourceName: 'Study Pod Alpha (Quiet Room)',
    resourceType: 'meeting_room',
    title: 'Capstone Focus Session',
    organizerName: 'Aamir Kazi',
    organizerRole: 'student',
    organizerEmail: 'aamir@campusflow.io',
    department: 'Computer Science',
    date: '2026-10-05',
    startTime: '10:00',
    endTime: '12:00',
    attendeeCount: 4,
    purpose: 'Focused team working session.',
    status: 'confirmed',
    requiresApproval: false,
    priorityScore: 5,
    createdAt: '2026-09-30T12:15:00Z',
  },
];

export function getInitialCampusSnapshot(): CampusSnapshot {
  return {
    resources: mockResources.map((resource) => ({ ...resource, status: resource.status === 'maintenance' ? 'available' : resource.status, facilities: [...resource.facilities] })),
    bookings: [...personalBookings, ...mockBookings],
    maintenance: [
      {
        id: 'maint-1',
        tenantId: 'inst-1',
        resourceId: 'res-106',
        resourceName: 'Robotics & IoT Workshop',
        date: '2026-10-02',
        startTime: '08:00',
        endTime: '17:00',
        reason: 'Annual safety inspection and sensor calibration',
        status: 'scheduled',
      },
    ],
    auditLogs: [
      { id: 'demo-log-1', timestamp: 'Oct 1, 9:30 AM', actor: 'Aamir Kazi', actorRole: 'student', action: 'LOCK_ACQUIRED', resourceName: 'Seminar Room B (Executive)', details: 'Booking request submitted for Oct 3, 2:00–4:00 PM.', transactionHash: 'demo-event-001' },
      { id: 'demo-log-2', timestamp: 'Sep 30, 12:15 PM', actor: 'Aamir Kazi', actorRole: 'student', action: 'BOOKING_CREATED', resourceName: 'Study Pod Alpha (Quiet Room)', details: 'Booking confirmed for Oct 5, 10:00 AM–12:00 PM.', transactionHash: 'demo-event-002' },
    ],
    notifications: [
      { id: 'notif-1', title: 'Request submitted', description: 'Design Review with Project Team is waiting for staff approval.', createdAt: '2026-10-01T09:30:00Z', read: false, kind: 'booking' },
      { id: 'notif-2', title: 'Booking confirmed', description: 'Capstone Focus Session is confirmed for Monday, October 5.', createdAt: '2026-09-30T12:15:00Z', read: true, kind: 'approval' },
    ],
  };
}

/** Browser-backed demo repository; replace this adapter with server calls when the API is ready. */
export const demoRepository = {
  load(): CampusSnapshot {
    if (typeof window === 'undefined') return getInitialCampusSnapshot();

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as CampusSnapshot;
    } catch {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* Storage can be disabled by the browser. */ }
    }

    return getInitialCampusSnapshot();
  },

  save(snapshot: CampusSnapshot) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    }
  },
};
