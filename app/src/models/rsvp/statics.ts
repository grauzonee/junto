import { RSVPModelType } from "@/models/rsvp/RSVP";

export async function isUserAttendingEvent(this: RSVPModelType, user: string, event: string) {
    return await this.findOne({ user, event });
}