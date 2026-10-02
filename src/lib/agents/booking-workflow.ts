import { validateBookingRequest } from '@/lib/booking-rules';
import { localDateKey } from '@/lib/dates';
import { AgentStep, Booking, CampusRole, MaintenanceWindow, Resource, ResourceType } from '@/types';

export interface BookingIntent {
  resourceType: ResourceType | null;
  attendeeCount: number;
  requiredFeatures: string[];
  keywords: string[];
  date: string;
  startTime: string;
  endTime: string;
}

export interface BookingMatch {
  resource: Resource;
  approval: string;
}

export interface BookingWorkflowResult {
  intent: BookingIntent;
  steps: AgentStep[];
  matches: BookingMatch[];
  matchingResourceCount: number;
  blockedResourceCount: number;
}

const roleLabels: Record<CampusRole, string> = {
  student: 'student',
  faculty: 'faculty',
  department_head: 'department head',
  facility_manager: 'facility manager',
  institution_admin: 'campus admin',
};

function toClock(hourValue: string, minuteValue: string | undefined, meridiem?: string, assumedMeridiem?: string) {
  let hour = Number(hourValue);
  const minute = Number(minuteValue ?? '0');
  const period = (meridiem ?? assumedMeridiem)?.toLowerCase();
  if (period === 'pm' && hour < 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseTimeRange(prompt: string) {
  const match = prompt.match(/(?:from\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|until|through|[-–])\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match || (!match[2] && !match[3] && !match[5] && !match[6])) return null;
  return {
    startTime: toClock(match[1], match[2], match[3], match[6]),
    endTime: toClock(match[4], match[5], match[6], match[3]),
  };
}

function parseDate(prompt: string, fallback: string) {
  const text = prompt.toLowerCase();
  if (text.includes('today')) return localDateKey(new Date());
  if (text.includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return localDateKey(tomorrow);
  }
  return fallback;
}

function parseResourceType(prompt: string): ResourceType | null {
  const text = prompt.toLowerCase();
  if (text.includes('ai lab') || text.includes('gpu lab') || text.includes('specialized lab')) return 'specialized_lab';
  if (text.includes('computer lab') || text.includes('computer') || text.includes('coding lab')) return 'computer_lab';
  if (text.includes('auditorium') || text.includes('keynote')) return 'auditorium';
  if (text.includes('seminar')) return 'seminar_hall';
  if (text.includes('sports') || text.includes('court')) return 'sports_facility';
  if (text.includes('classroom') || text.includes('lecture hall')) return 'classroom';
  if (text.includes('meeting room') || text.includes('study pod') || text.includes('quiet room')) return 'meeting_room';
  if (text.includes('equipment')) return 'equipment';
  if (text.includes('lab')) return 'computer_lab';
  return null;
}

function parseCapacity(prompt: string, fallback: number) {
  const match = prompt.match(/\b(?:for|with)\s+(\d{1,3})\b/i)
    ?? prompt.match(/\b(\d{1,3})\s+(?:people|students|attendees|persons?|seats)\b/i);
  return match ? Number(match[1]) : fallback;
}

function parseFeatures(prompt: string) {
  const text = prompt.toLowerCase();
  const features: { key: string; matches: string[] }[] = [
    { key: 'projector', matches: ['projector', 'projection'] },
    { key: 'whiteboard', matches: ['whiteboard', 'smartboard'] },
    { key: 'GPU', matches: ['gpu', 'graphics processor'] },
    { key: 'microphone', matches: ['microphone', 'mic'] },
    { key: 'air conditioning', matches: ['air conditioning', 'air-conditioned', ' ac '] },
    { key: 'display', matches: ['display', 'monitor', 'screen'] },
  ];
  return features.filter(({ matches }) => matches.some((term) => text.includes(term))).map(({ key }) => key);
}

function resourceHasFeature(resource: Resource, feature: string) {
  const facilities = resource.facilities.join(' ').toLowerCase();
  if (feature === 'projector') return facilities.includes('project') || facilities.includes('projection');
  if (feature === 'whiteboard') return facilities.includes('whiteboard') || facilities.includes('smartboard');
  if (feature === 'GPU') return facilities.includes('gpu');
  if (feature === 'microphone') return facilities.includes('mic');
  if (feature === 'air conditioning') return facilities.includes(' ac') || facilities.includes(' air') || facilities.includes('cooling');
  return facilities.includes('display') || facilities.includes('monitor') || facilities.includes('screen');
}

function buildStep(agentName: AgentStep['agentName'], title: string, details: string, status: AgentStep['status'] = 'completed'): AgentStep {
  return { id: `${agentName.toLowerCase().replaceAll(' ', '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, agentName, title, details, status, timestamp: new Date().toISOString() };
}

export function runBookingAgentWorkflow(input: {
  prompt: string;
  date: string;
  startTime: string;
  endTime: string;
  attendeeCount: number;
  resources: Resource[];
  bookings: Booking[];
  maintenance: MaintenanceWindow[];
}): BookingWorkflowResult {
  const timeRange = parseTimeRange(input.prompt);
  const intent: BookingIntent = {
    resourceType: parseResourceType(input.prompt),
    attendeeCount: parseCapacity(input.prompt, input.attendeeCount),
    requiredFeatures: parseFeatures(input.prompt),
    keywords: ['quiet', 'study', 'library'].filter((keyword) => input.prompt.toLowerCase().includes(keyword)),
    date: parseDate(input.prompt, input.date),
    startTime: timeRange?.startTime ?? input.startTime,
    endTime: timeRange?.endTime ?? input.endTime,
  };

  const requirements = [intent.resourceType?.replaceAll('_', ' ') ?? 'any resource type', `${intent.attendeeCount} seats`, ...intent.requiredFeatures];
  const intentStep = buildStep('Orchestrator', 'Request understood', `Looking for ${requirements.join(' · ')} on ${intent.date}, ${intent.startTime}–${intent.endTime}.`);

  const candidates = input.resources.filter((resource) => {
    if (intent.resourceType && resource.type !== intent.resourceType) return false;
    if (resource.capacity < intent.attendeeCount) return false;
    if (!intent.requiredFeatures.every((feature) => resourceHasFeature(resource, feature))) return false;
    if (intent.keywords.length && !intent.keywords.some((keyword) => `${resource.name} ${resource.description} ${resource.facilities.join(' ')}`.toLowerCase().includes(keyword))) return false;
    return true;
  });
  const availabilityStep = buildStep('Availability Agent', 'Campus inventory checked', `${candidates.length} resource${candidates.length === 1 ? '' : 's'} meet the type, capacity, and facility requirements.`);

  const checked = candidates.map((resource) => ({ resource, validation: validateBookingRequest(resource, intent.date, intent.startTime, intent.endTime, intent.attendeeCount, input.bookings, input.maintenance) }));
  const available = checked.filter((candidate) => !candidate.validation.detected);
  const blockedResourceCount = checked.length - available.length;
  const conflictStep = buildStep('Conflict Agent', 'Bookings and maintenance checked',
    available.length
      ? `${available.length} matching slot${available.length === 1 ? '' : 's'} are clear${blockedResourceCount ? `; ${blockedResourceCount} candidate${blockedResourceCount === 1 ? '' : 's'} blocked` : ''}.`
      : checked.length ? 'Every matching space is outside operating rules, booked, or under maintenance.' : 'No candidates reached conflict checks.',
    available.length || !checked.length ? 'completed' : 'warning');

  available.sort((left, right) => {
    const capacityFit = (left.resource.capacity - intent.attendeeCount) - (right.resource.capacity - intent.attendeeCount);
    if (capacityFit !== 0) return capacityFit;
    if (left.resource.requiresApproval !== right.resource.requiresApproval) return left.resource.requiresApproval ? 1 : -1;
    return left.resource.name.localeCompare(right.resource.name);
  });
  const recommendations = available.slice(0, 4);
  const recommendationStep = buildStep('Recommendation Agent', 'Best-fit spaces ranked',
    recommendations.length ? `Ranked ${recommendations.length} available choice${recommendations.length === 1 ? '' : 's'} by seat fit and direct booking access.` : 'No available match to recommend.',
    recommendations.length ? 'completed' : 'warning');
  const topChoice = recommendations[0]?.resource;
  const approvalStep = buildStep('Approval Agent', 'Approval path identified',
    topChoice
      ? topChoice.requiresApproval ? `${topChoice.name} requires review${topChoice.approvalRole ? ` by a ${roleLabels[topChoice.approvalRole as CampusRole] ?? 'campus staff member'}` : ' by campus staff'}. You will confirm the request in the booking form.`
        : `${topChoice.name} can be requested directly. You will confirm the booking in the booking form.`
      : 'Approval routing will be shown once an available space is found.');

  return {
    intent,
    steps: [intentStep, availabilityStep, conflictStep, recommendationStep, approvalStep],
    matches: recommendations.map(({ resource }) => ({
      resource,
      approval: resource.requiresApproval ? resource.approvalRole ? `Approval required · ${roleLabels[resource.approvalRole as CampusRole] ?? 'campus staff'}` : 'Approval required · campus staff' : 'Direct request',
    })),
    matchingResourceCount: candidates.length,
    blockedResourceCount,
  };
}
