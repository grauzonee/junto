import { Types } from "mongoose";
import type { RSVPModelType } from "@/models/rsvp/RSVP";
import { STATUS_CANCELED } from "@/models/rsvp/utils";

export async function isUserAttendingEvent(this: RSVPModelType, user: string, event: string) {
    return await this.findOne({ user, event });
}

export function cancelForEvent(this: RSVPModelType, eventId: Types.ObjectId | string) {
    return this.updateMany({ event: eventId }, { status: STATUS_CANCELED });
}

export function cancelForUser(this: RSVPModelType, userId: Types.ObjectId | string) {
    return this.updateMany({ user: userId }, { status: STATUS_CANCELED });
}
