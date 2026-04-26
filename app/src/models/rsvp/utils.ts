export const STATUS_CONFIRMED = 'confirmed' as const;
export const STATUS_CANCELED = 'canceled' as const;
export const STATUS_MAYBE = 'maybe' as const;

export const RSVP_STATUSES = [
    STATUS_CANCELED,
    STATUS_CONFIRMED,
    STATUS_MAYBE
] as const;

export type RSVPStatus = typeof RSVP_STATUSES[number];

export function isRSVPStatus(status: string): status is RSVPStatus {
    return (RSVP_STATUSES as readonly string[]).includes(status);
}

export function getConfirmedRsvpSeatCount(additionalGuests = 0) {
    return 1 + additionalGuests;
}
