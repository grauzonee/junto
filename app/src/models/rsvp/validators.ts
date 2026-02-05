import { Types } from "mongoose";
import { Event } from "@/models/Event";
import { RSVP } from "@/models/rsvp/RSVP";
import { isRSVPStatus, STATUS_CONFIRMED } from "@/models/rsvp/utils";

export async function eventValidator(value: Types.ObjectId) {
    const event = await Event.findOne({ _id: value, active: true })
    if (!event) {
        return false;
    }
    const rsvpCount = await RSVP.countDocuments({ event: value, status: STATUS_CONFIRMED });
    return rsvpCount < event.maxAttendees;
}

export function statusValidator(value: string) {
    return isRSVPStatus(value);
}