export type Role = 'student' | 'faculty' | 'department_head' | 'facility_manager' | 'institution_admin' | 'saas_super_admin';
export type CampusRole = Exclude<Role, 'saas_super_admin'>;

export interface CampusUserProfile {
  id: string;
  institutionId: string;
  role: CampusRole;
  fullName: string;
  email: string;
  department: string;
}

export type ResourceType = 'classroom' | 'computer_lab' | 'seminar_hall' | 'auditorium' | 'sports_facility' | 'meeting_room' | 'specialized_lab' | 'equipment';

export type BookingStatus = 'confirmed' | 'pending_approval' | 'conflict_flagged' | 'cancelled' | 'checked_in' | 'maintenance_hold';

export interface Institution {
  id: string;
  name: string;
  code: string;
  domain: string;
  logoUrl?: string;
  campusLocations: string[];
  planTier: 'starter' | 'pro' | 'enterprise';
  themeColor: string;
}

export interface ResourceFacility {
  id: string;
  name: string;
  icon: string;
}

export interface Resource {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: ResourceType;
  building: string;
  floor: string;
  capacity: number;
  facilities: string[];
  operatingHours: {
    open: string;  // e.g. "08:00"
    close: string; // e.g. "21:00"
  };
  status: 'available' | 'in_use' | 'maintenance' | 'reserved';
  requiresApproval: boolean;
  approvalRole?: Role;
  maxBookingHours: number;
  utilizationRate: number; // 0 to 100%
  imageUrl?: string;
  description: string;
}

export interface Booking {
  id: string;
  tenantId: string;
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  title: string;
  organizerName: string;
  organizerRole: Role;
  organizerEmail: string;
  department: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  attendeeCount: number;
  purpose: string;
  status: BookingStatus;
  requiresApproval: boolean;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  qrCodeUrl?: string;
  priorityScore: number; // 1 to 10 (10 = official exam / high priority)
}

export interface ConflictAlternative {
  type: 'different_resource' | 'different_time' | 'different_day';
  resourceId: string;
  resourceName: string;
  building: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  matchScore: number; // 0 to 100
  reason: string;
}

export interface ConflictReport {
  detected: boolean;
  conflictType: 'overlap' | 'maintenance' | 'operating_hours' | 'capacity_exceeded' | 'role_restricted';
  message: string;
  conflictingBooking?: Booking;
  alternatives: ConflictAlternative[];
}

export interface AgentStep {
  id: string;
  agentName: 'Orchestrator' | 'Availability Agent' | 'Conflict Agent' | 'Recommendation Agent' | 'Booking Agent' | 'Approval Agent' | 'Analytics Agent';
  status: 'pending' | 'running' | 'completed' | 'warning';
  title: string;
  details: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: Role;
  action: 'LOCK_ACQUIRED' | 'CONFLICT_PREVENTED' | 'BOOKING_CREATED' | 'APPROVAL_GRANTED' | 'QR_CHECKIN' | 'MAINTENANCE_SCHEDULED';
  resourceName: string;
  details: string;
  transactionHash: string;
}

export interface AnalyticsSnapshot {
  resourceCount?: number;
  occupancyRate: number;
  activeBookingsToday: number;
  pendingApprovals: number;
  conflictsAvertedThisMonth: number;
  peakHours: { time: string; count: number }[];
  underutilizedResources: Resource[];
  departmentUtilization: { department: string; percentage: number }[];
}

export interface MaintenanceWindow {
  id: string;
  tenantId: string;
  resourceId: string;
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface CampusNotification {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  kind: 'booking' | 'approval' | 'maintenance' | 'system';
}
