import { Types } from "mongoose";
import { Event } from "@/models/event/Event";
import { getConfirmedRsvpSeatCount, isRSVPStatus, STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { RSVP, type IRSVP } from "@/models/rsvp/RSVP";

interface RsvpValidationContext extends Partial<IRSVP> {
    _id?: Types.ObjectId;
}

export async function eventValidator(this: RsvpValidationContext, value: Types.ObjectId) {
    const rsvp = this ?? {};
    const event = await Event.findOne({ _id: value, active: true })
    if (!event) {
        return false;
    }
    if (event.maxAttendees < 0 || rsvp.status !== STATUS_CONFIRMED || !rsvp.user) {
        return true;
    }
    if (event.author.toString() === rsvp.user.toString()) {
        return true;
    }

    const confirmedAttendanceTotal = await RSVP.getConfirmedAttendanceTotal(value, event.author, rsvp._id);
    const requestedSeatCount = getConfirmedRsvpSeatCount(rsvp.additionalGuests);

    return confirmedAttendanceTotal + requestedSeatCount <= event.maxAttendees;
}

export function statusValidator(value: string) {
    return isRSVPStatus(value);
}
