import mongoose, { Types } from "mongoose";
import { RSVP, type HydratedRSVP } from "@/models/rsvp/RSVP";
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";

interface EventRsvpCascadeInput {
    _id: Types.ObjectId;
    author: Types.ObjectId;
    date: Date;
}

function isDuplicateKeyError(error: unknown) {
    return error instanceof mongoose.mongo.MongoServerError && error.code === 11000;
}

export async function ensureAuthorRsvp(event: EventRsvpCascadeInput): Promise<HydratedRSVP | null> {
    const existingRsvp = await RSVP.findOne({ event: event._id, user: event.author });
    if (existingRsvp) {
        return existingRsvp;
    }

    try {
        return await RSVP.create({
            event: event._id,
            user: event.author,
            status: STATUS_CONFIRMED,
            eventDate: event.date
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return RSVP.findOne({ event: event._id, user: event.author });
        }

        throw error;
    }
}

export async function syncRsvpEventDates(eventId: Types.ObjectId | string, eventDate: Date) {
    return RSVP.updateMany({ event: eventId }, { eventDate });
}
