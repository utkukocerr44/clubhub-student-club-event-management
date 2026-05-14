export const EVENT_STATUSES = ['scheduled', 'cancelled', 'completed'];
export const MEMBERSHIP_STATUSES = ['pending', 'approved', 'rejected'];
export const REGISTRATION_STATUSES = ['registered', 'cancelled', 'attended'];

export function assertFutureEventDate(eventDate, now = new Date()) {
  const parsedDate = new Date(eventDate);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Event date must be a valid date.');
  }

  if (parsedDate <= now) {
    throw new Error('Event date must be in the future.');
  }
}

export function assertPositiveCapacity(capacity) {
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new Error('Capacity must be a positive integer.');
  }
}

export function assertRegistrationAllowed(event, registeredCount, studentAlreadyRegistered, now = new Date()) {
  if (!event) {
    throw new Error('Event was not found.');
  }

  if (event.status !== 'scheduled') {
    throw new Error('Only scheduled events can accept registrations.');
  }

  assertFutureEventDate(event.event_date, now);

  if (studentAlreadyRegistered) {
    throw new Error('Student is already registered for this event.');
  }

  if (registeredCount >= event.capacity) {
    throw new Error('Event capacity is full.');
  }
}

export function assertMembershipStatus(status) {
  if (!MEMBERSHIP_STATUSES.includes(status)) {
    throw new Error('Membership status must be pending, approved, or rejected.');
  }
}

export function assertEventStatus(status) {
  if (!EVENT_STATUSES.includes(status)) {
    throw new Error('Event status must be scheduled, cancelled, or completed.');
  }
}

export function calculateAvailableSeats(capacity, registeredCount) {
  return Math.max(capacity - registeredCount, 0);
}
