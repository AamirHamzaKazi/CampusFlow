import { Institution, Resource, Booking, ConflictReport, ConflictAlternative, AuditLogEntry, AnalyticsSnapshot } from '@/types';

export const mockInstitutions: Institution[] = [
  {
    id: 'inst-1',
    name: 'Apex Institute of Technology',
    code: 'AIT',
    domain: 'apex.edu',
    campusLocations: ['North Campus (Engineering)', 'South Campus (Research & Medical)', 'East Campus (Sports)'],
    planTier: 'enterprise',
    themeColor: '#0070F3',
  },
  {
    id: 'inst-2',
    name: 'Stanford School of Computing',
    code: 'SSC',
    domain: 'stanford-comp.edu',
    campusLocations: ['Gates Building', 'Packard Hall', 'Huang Center'],
    planTier: 'enterprise',
    themeColor: '#8C1D40',
  },
  {
    id: 'inst-3',
    name: 'Metropolitan University',
    code: 'METRO',
    domain: 'metro.edu',
    campusLocations: ['Main Quad', 'Innovation Park'],
    planTier: 'pro',
    themeColor: '#059669',
  },
];

export const mockResources: Resource[] = [
  {
    id: 'res-101',
    tenantId: 'inst-1',
    name: 'Turing Computer Lab 1',
    code: 'CL-101',
    type: 'computer_lab',
    building: 'Engineering Block A',
    floor: 'Floor 1',
    capacity: 60,
    facilities: ['60x Workstations', '4K Projector', 'Dual Audio Mics', 'Gigabit LAN', 'High-Speed AC'],
    operatingHours: { open: '08:00', close: '21:00' },
    status: 'in_use',
    requiresApproval: true,
    approvalRole: 'facility_manager',
    maxBookingHours: 4,
    utilizationRate: 88,
    description: 'Premier computer science lab equipped with high-performance Linux developer machines.',
  },
  {
    id: 'res-102',
    tenantId: 'inst-1',
    name: 'Ada Lovelace AI Lab',
    code: 'AI-202',
    type: 'specialized_lab',
    building: 'Engineering Block A',
    floor: 'Floor 2',
    capacity: 45,
    facilities: ['45x RTX 4090 GPUs', 'Interactive Smartboard', 'Telepresence Rig', 'High-Speed AC'],
    operatingHours: { open: '08:00', close: '22:00' },
    status: 'available',
    requiresApproval: true,
    approvalRole: 'department_head',
    maxBookingHours: 6,
    utilizationRate: 92,
    description: 'Deep learning research facility with specialized GPU compute clusters for model training.',
  },
  {
    id: 'res-103',
    tenantId: 'inst-1',
    name: 'Newton Grand Auditorium',
    code: 'AUD-01',
    type: 'auditorium',
    building: 'Central Concourse',
    floor: 'Ground Floor',
    capacity: 350,
    facilities: ['350 Seats', 'Cinema 4K Projection', 'Surround Sound', 'Stage Lighting', 'Live Stream Rig', 'Green Room'],
    operatingHours: { open: '07:30', close: '23:00' },
    status: 'reserved',
    requiresApproval: true,
    approvalRole: 'institution_admin',
    maxBookingHours: 8,
    utilizationRate: 74,
    description: 'Flagship campus auditorium for conferences, keynotes, hackathons, and university ceremonies.',
  },
  {
    id: 'res-104',
    tenantId: 'inst-1',
    name: 'Lecture Hall 104 (Tiered)',
    code: 'LH-104',
    type: 'classroom',
    building: 'Science & Math Block',
    floor: 'Floor 1',
    capacity: 120,
    facilities: ['Tiered Amphitheater Seating', 'Dual Projectors', 'Wireless Mic', 'Document Camera'],
    operatingHours: { open: '08:00', close: '20:00' },
    status: 'available',
    requiresApproval: false,
    maxBookingHours: 3,
    utilizationRate: 65,
    description: 'Tiered academic lecture theater ideal for mid-sized lectures and departmental presentations.',
  },
  {
    id: 'res-105',
    tenantId: 'inst-1',
    name: 'Seminar Room B (Executive)',
    code: 'SEM-02',
    type: 'seminar_hall',
    building: 'Management Tower',
    floor: 'Floor 4',
    capacity: 35,
    facilities: ['Conference Table', '75" 4K Smart Display', 'Hybrid Zoom Room Mics', 'Coffee Station'],
    operatingHours: { open: '08:30', close: '19:00' },
    status: 'available',
    requiresApproval: true,
    approvalRole: 'department_head',
    maxBookingHours: 4,
    utilizationRate: 42,
    description: 'Executive round-table conference space for defense committees, guest talks, and faculty meetings.',
  },
  {
    id: 'res-106',
    tenantId: 'inst-1',
    name: 'Robotics & IoT Workshop',
    code: 'ROB-301',
    type: 'specialized_lab',
    building: 'Innovation Hub',
    floor: 'Floor 3',
    capacity: 30,
    facilities: ['3D Printers', 'Oscilloscopes', 'Soldering Stations', 'Robotic Arms', 'Safety Fume Hoods'],
    operatingHours: { open: '08:00', close: '20:00' },
    status: 'maintenance',
    requiresApproval: true,
    approvalRole: 'facility_manager',
    maxBookingHours: 4,
    utilizationRate: 58,
    description: 'Hardware prototyping facility currently under scheduled calibration.',
  },
  {
    id: 'res-107',
    tenantId: 'inst-1',
    name: 'Main Indoor Sports Arena',
    code: 'SPT-01',
    type: 'sports_facility',
    building: 'Athletic Center',
    floor: 'Ground Floor',
    capacity: 200,
    facilities: ['Badminton Courts (x4)', 'Basketball Court', 'Scoreboard', 'Locker Rooms', 'Bleachers'],
    operatingHours: { open: '06:00', close: '22:00' },
    status: 'available',
    requiresApproval: true,
    approvalRole: 'facility_manager',
    maxBookingHours: 3,
    utilizationRate: 79,
    description: 'Multi-sport indoor court for intramural matches, club practices, and sports events.',
  },
  {
    id: 'res-108',
    tenantId: 'inst-1',
    name: 'Study Pod Alpha (Quiet Room)',
    code: 'POD-A',
    type: 'meeting_room',
    building: 'Central Library',
    floor: 'Floor 2',
    capacity: 8,
    facilities: ['Acoustic Soundproofing', 'Whiteboard Wall', 'TV Monitor', 'Power Outlets'],
    operatingHours: { open: '08:00', close: '23:00' },
    status: 'available',
    requiresApproval: false,
    maxBookingHours: 2,
    utilizationRate: 95,
    description: 'Collaborative student study pod with sound insulation for team sprints and group projects.',
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'bk-901',
    tenantId: 'inst-1',
    resourceId: 'res-101',
    resourceName: 'Turing Computer Lab 1',
    resourceType: 'computer_lab',
    title: 'CS301: Advanced Operating Systems Lab',
    organizerName: 'Dr. Sarah Lin',
    organizerRole: 'faculty',
    organizerEmail: 'slin@apex.edu',
    department: 'Computer Science & Engineering',
    date: '2026-10-02',
    startTime: '09:00',
    endTime: '11:00',
    attendeeCount: 52,
    purpose: 'Weekly practical lab session on thread synchronization and kernels.',
    status: 'checked_in',
    requiresApproval: false,
    priorityScore: 9,
    createdAt: '2026-09-25T14:30:00Z',
  },
  {
    id: 'bk-902',
    tenantId: 'inst-1',
    resourceId: 'res-101',
    resourceName: 'Turing Computer Lab 1',
    resourceType: 'computer_lab',
    title: 'ACM Student Chapter CodeSprint Practice',
    organizerName: 'Alex Rivera (ACM Chair)',
    organizerRole: 'student',
    organizerEmail: 'arivera@apex.edu',
    department: 'ACM Student Club',
    date: '2026-10-02',
    startTime: '14:00',
    endTime: '16:00',
    attendeeCount: 45,
    purpose: 'Preparation workshop for upcoming regional collegiate programming contest.',
    status: 'confirmed',
    requiresApproval: true,
    approvedBy: 'Prof. Davis (Faculty Advisor)',
    priorityScore: 6,
    createdAt: '2026-09-28T10:15:00Z',
  },
  {
    id: 'bk-903',
    tenantId: 'inst-1',
    resourceId: 'res-103',
    resourceName: 'Newton Grand Auditorium',
    resourceType: 'auditorium',
    title: 'Annual Tech Innovation Summit & Dean Keynote',
    organizerName: 'Prof. Richard Miller (Dean)',
    organizerRole: 'institution_admin',
    organizerEmail: 'rmiller@apex.edu',
    department: 'Office of the Dean',
    date: '2026-10-02',
    startTime: '10:00',
    endTime: '13:00',
    attendeeCount: 320,
    purpose: 'Institutional research keynote with industry guest delegates and alumni sponsors.',
    status: 'confirmed',
    requiresApproval: true,
    approvedBy: 'Provost Office',
    priorityScore: 10,
    createdAt: '2026-09-10T09:00:00Z',
  },
  {
    id: 'bk-904',
    tenantId: 'inst-1',
    resourceId: 'res-102',
    resourceName: 'Ada Lovelace AI Lab',
    resourceType: 'specialized_lab',
    title: 'Generative AI Workshop & Hackathon Prep',
    organizerName: 'Rohan Sharma (AI Club)',
    organizerRole: 'student',
    organizerEmail: 'rsharma@apex.edu',
    department: 'Artificial Intelligence Society',
    date: '2026-10-02',
    startTime: '15:30',
    endTime: '17:30',
    attendeeCount: 40,
    purpose: 'Fine-tuning open-source LLMs on campus cluster infrastructure.',
    status: 'pending_approval',
    requiresApproval: true,
    priorityScore: 7,
    createdAt: '2026-10-01T16:20:00Z',
  },
  {
    id: 'bk-905',
    tenantId: 'inst-1',
    resourceId: 'res-105',
    resourceName: 'Seminar Room B (Executive)',
    resourceType: 'seminar_hall',
    title: 'Ph.D. Thesis Defense: Distributed Consensus',
    organizerName: 'Kavita Patel',
    organizerRole: 'student',
    organizerEmail: 'kpatel@apex.edu',
    department: 'Computer Science',
    date: '2026-10-02',
    startTime: '11:00',
    endTime: '13:00',
    attendeeCount: 20,
    purpose: 'Final public defense in front of doctoral review committee.',
    status: 'pending_approval',
    requiresApproval: true,
    priorityScore: 8,
    createdAt: '2026-09-29T11:00:00Z',
  },
  {
    id: 'bk-906',
    tenantId: 'inst-1',
    resourceId: 'res-104',
    resourceName: 'Lecture Hall 104 (Tiered)',
    resourceType: 'classroom',
    title: 'MATH204: Linear Algebra & Differential Equations',
    organizerName: 'Prof. Marcus Vance',
    organizerRole: 'faculty',
    organizerEmail: 'mvance@apex.edu',
    department: 'Mathematics Dept.',
    date: '2026-10-02',
    startTime: '08:30',
    endTime: '10:00',
    attendeeCount: 95,
    purpose: 'Core undergrad lecture series.',
    status: 'confirmed',
    requiresApproval: false,
    priorityScore: 9,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'bk-907',
    tenantId: 'inst-1',
    resourceId: 'res-106',
    resourceName: 'Robotics & IoT Workshop',
    resourceType: 'specialized_lab',
    title: 'Scheduled Calibration & Maintenance',
    organizerName: 'Facility Engineering Team',
    organizerRole: 'facility_manager',
    organizerEmail: 'facilities@apex.edu',
    department: 'Campus Infrastructure & Safety',
    date: '2026-10-02',
    startTime: '08:00',
    endTime: '17:00',
    attendeeCount: 4,
    purpose: 'Annual electrical safety inspection and robotic arm sensor recalibration.',
    status: 'maintenance_hold',
    requiresApproval: false,
    priorityScore: 10,
    createdAt: '2026-09-20T09:00:00Z',
  }
];

export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-01',
    timestamp: '10:24:12 AM',
    actor: 'System Engine (ACID Lock)',
    actorRole: 'institution_admin',
    action: 'LOCK_ACQUIRED',
    resourceName: 'Turing Computer Lab 1',
    details: 'Acquired pessimistic row lock on slot [2026-10-02 14:00 - 16:00] for ACM Club reservation.',
    transactionHash: '0x8f2d...c941',
  },
  {
    id: 'log-02',
    timestamp: '10:15:30 AM',
    actor: 'Conflict Agent (FlowAI)',
    actorRole: 'facility_manager',
    action: 'CONFLICT_PREVENTED',
    resourceName: 'Newton Grand Auditorium',
    details: 'Prevented double-booking attempt by Drama Society during Dean Keynote (10:00-13:00). Suggested Seminar Room B alternative.',
    transactionHash: '0x4e1a...7b12',
  },
  {
    id: 'log-03',
    timestamp: '09:45:00 AM',
    actor: 'Dr. Sarah Lin',
    actorRole: 'faculty',
    action: 'QR_CHECKIN',
    resourceName: 'Turing Computer Lab 1',
    details: 'Verified QR door scan entry. Reservation bk-901 marked as checked_in.',
    transactionHash: '0x3c99...aa04',
  },
  {
    id: 'log-04',
    timestamp: '08:30:15 AM',
    actor: 'Facility Operations',
    actorRole: 'facility_manager',
    action: 'MAINTENANCE_SCHEDULED',
    resourceName: 'Robotics & IoT Workshop',
    details: 'Applied maintenance lock window from 08:00 to 17:00. All conflicting reservation attempts auto-rerouted.',
    transactionHash: '0x19bb...ee78',
  },
];

export const mockAnalytics: AnalyticsSnapshot = {
  occupancyRate: 78.4,
  activeBookingsToday: 14,
  pendingApprovals: 5,
  conflictsAvertedThisMonth: 38,
  peakHours: [
    { time: '08:00', count: 4 },
    { time: '10:00', count: 9 },
    { time: '12:00', count: 6 },
    { time: '14:00', count: 11 },
    { time: '16:00', count: 8 },
    { time: '18:00', count: 3 },
  ],
  underutilizedResources: [
    mockResources[4], // Seminar Room B (42%)
    mockResources[3], // Lecture Hall 104 (65%)
  ],
  departmentUtilization: [
    { department: 'Computer Science', percentage: 42 },
    { department: 'Office of Dean', percentage: 24 },
    { department: 'Electronics & Robotics', percentage: 16 },
    { department: 'Student Societies', percentage: 18 },
  ],
};

/**
 * Deterministic Conflict Detection Function
 * Checks time interval overlaps and maintenance windows
 */
export function checkSlotConflict(
  resourceId: string,
  date: string,
  startTime: string,
  endTime: string,
  existingBookings: Booking[] = mockBookings
): ConflictReport {
  const resource = mockResources.find(r => r.id === resourceId);
  if (!resource) {
    return {
      detected: true,
      conflictType: 'overlap',
      message: 'Resource not found in system database.',
      alternatives: [],
    };
  }

  // Check Maintenance
  if (resource.status === 'maintenance') {
    const alternatives = findSuggestedAlternatives(resource, date, startTime, endTime);
    return {
      detected: true,
      conflictType: 'maintenance',
      message: `${resource.name} is currently under scheduled maintenance or equipment calibration.`,
      alternatives,
    };
  }

  // Check Overlaps
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const reqStart = toMinutes(startTime);
  const reqEnd = toMinutes(endTime);

  const conflictingBooking = existingBookings.find(b => {
    if (b.resourceId !== resourceId || b.date !== date || b.status === 'cancelled') return false;
    const bStart = toMinutes(b.startTime);
    const bEnd = toMinutes(b.endTime);
    return Math.max(reqStart, bStart) < Math.min(reqEnd, bEnd);
  });

  if (conflictingBooking) {
    const alternatives = findSuggestedAlternatives(resource, date, startTime, endTime);
    return {
      detected: true,
      conflictType: 'overlap',
      message: `${resource.name} is already booked from ${conflictingBooking.startTime} to ${conflictingBooking.endTime} for "${conflictingBooking.title}".`,
      conflictingBooking,
      alternatives,
    };
  }

  return {
    detected: false,
    conflictType: 'overlap',
    message: 'Slot is completely clear. No schedule or maintenance conflicts detected.',
    alternatives: [],
  };
}

/**
 * Intelligent Alternative Generator
 * Recommends matching rooms and adjacent slots
 */
export function findSuggestedAlternatives(
  targetResource: Resource,
  date: string,
  startTime: string,
  endTime: string
): ConflictAlternative[] {
  const alternatives: ConflictAlternative[] = [];

  // Alternative 1: Same resource, later in the day
  alternatives.push({
    type: 'different_time',
    resourceId: targetResource.id,
    resourceName: targetResource.name,
    building: targetResource.building,
    date,
    startTime: '16:30',
    endTime: '18:30',
    capacity: targetResource.capacity,
    matchScore: 94,
    reason: 'Same room, earliest consecutive open window today.',
  });

  // Alternative 2: Alternative room with similar capacity & equipment
  const siblingResource = mockResources.find(
    r => r.id !== targetResource.id && r.capacity >= targetResource.capacity * 0.7 && r.status === 'available'
  ) || mockResources[1];

  alternatives.push({
    type: 'different_resource',
    resourceId: siblingResource.id,
    resourceName: siblingResource.name,
    building: siblingResource.building,
    date,
    startTime,
    endTime,
    capacity: siblingResource.capacity,
    matchScore: 98,
    reason: `Adjacent facility in ${siblingResource.building} with matching capacity (${siblingResource.capacity} seats).`,
  });

  // Alternative 3: Same slot next day
  alternatives.push({
    type: 'different_day',
    resourceId: targetResource.id,
    resourceName: targetResource.name,
    building: targetResource.building,
    date: '2026-10-03',
    startTime,
    endTime,
    capacity: targetResource.capacity,
    matchScore: 89,
    reason: 'Identical timeslot on the next academic day.',
  });

  return alternatives;
}
