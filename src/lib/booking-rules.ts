import { Booking, ConflictReport, MaintenanceWindow, Resource } from '@/types';

const minutes = (time: string) => {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
};

const overlaps = (startA: number, endA: number, startB: number, endB: number) => startA < endB && startB < endA;

export function validateBookingRequest(
  resource: Resource,
  date: string,
  startTime: string,
  endTime: string,
  attendeeCount: number,
  bookings: Booking[],
  maintenance: MaintenanceWindow[] = [],
): ConflictReport {
  const start = minutes(startTime);
  const end = minutes(endTime);
  const fail = (conflictType: ConflictReport['conflictType'], message: string): ConflictReport => ({ detected: true, conflictType, message, alternatives: [] });

  if (!date || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return fail('operating_hours', 'Choose a valid date and an end time later than the start time.');
  }
  if (start < minutes(resource.operatingHours.open) || end > minutes(resource.operatingHours.close)) {
    return fail('operating_hours', `This resource is open from ${resource.operatingHours.open} to ${resource.operatingHours.close}.`);
  }
  if ((end - start) / 60 > resource.maxBookingHours) {
    return fail('operating_hours', `Bookings for this resource can be up to ${resource.maxBookingHours} hours.`);
  }
  if (attendeeCount < 1 || attendeeCount > resource.capacity) {
    return fail('capacity_exceeded', `Enter between 1 and ${resource.capacity} attendees for this resource.`);
  }
  if (resource.status === 'maintenance') {
    return fail('maintenance', 'This resource is currently unavailable. Choose another space or date.');
  }

  const maintenanceConflict = maintenance.find((window) => window.resourceId === resource.id && window.date === date && window.status === 'scheduled' && overlaps(start, end, minutes(window.startTime), minutes(window.endTime)));
  if (maintenanceConflict) {
    return fail('maintenance', `${resource.name} has maintenance scheduled from ${maintenanceConflict.startTime} to ${maintenanceConflict.endTime}.`);
  }

  const conflictingBooking = bookings.find((booking) => booking.resourceId === resource.id && booking.date === date && !['cancelled', 'conflict_flagged'].includes(booking.status) && overlaps(start, end, minutes(booking.startTime), minutes(booking.endTime)));
  if (conflictingBooking) {
    return {
      detected: true,
      conflictType: 'overlap',
      message: `This resource is already booked from ${conflictingBooking.startTime} to ${conflictingBooking.endTime} for “${conflictingBooking.title}”.`,
      conflictingBooking,
      alternatives: [],
    };
  }

  return { detected: false, conflictType: 'overlap', message: 'This time is available for booking.', alternatives: [] };
}
