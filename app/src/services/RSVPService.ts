import { RSVP } from "@/models/rsvp/RSVP";
import { Event } from "@/models/event/Event";
import { logger } from "@/config/loggerConfig";
import { CreateRSVPInput, UpdateRSVPInput } from "@/types/services/RSVPService";
import { BadInputError, NotFoundError } from "@/types/errors/InputError";
import messages from "@/constants/errorMessages";
import { RSVPStatus, STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { RequestData } from "@/types/common";
import { buildFilterQuery, buildSortQuery } from "@/helpers/queryBuilder";

export async function list(data: RequestData) {
    const result = await RSVP.find(buildFilterQuery(data.dbFilter)).sort(buildSortQuery(data.sort)).paginate(data.pagination.offset, data.pagination.limit)
    return result;
}
export async function create(data: CreateRSVPInput, userId: string) {
    const { eventId, status, additionalGuests } = data;

    const foundRsvp = await RSVP.isUserAttendingEvent(userId, eventId);
    if (foundRsvp) {
        throw new BadInputError("user", messages.response.DUPLICATE_ATTEND);
    }
    const event = await Event.findOne({ _id: eventId, active: true })
    if (!event) {
        throw new NotFoundError('event');
    }
    try {
        return await RSVP.create({ event: eventId, status, additionalGuests, user: userId, eventDate: event.date });
    } catch (error) {
        logger.error("Error saving RSVP to MongoDB", error)
        throw error;
    }
}

export async function update(data: UpdateRSVPInput, rsvpId: string, userId: string) {
    const rsvp = await RSVP.findOne({ _id: rsvpId, user: userId }).populate('event');
    if (!rsvp) {
        throw new NotFoundError("rsvp");
    }
    await rsvp.setStatus(data.status);
    if (data.additionalGuests !== undefined) {
        rsvp.additionalGuests = data.additionalGuests;
    }

    await rsvp.save();
    return rsvp.depopulate('event');
}

export async function getForEvent(eventId: string, status: RSVPStatus = STATUS_CONFIRMED) {
    const rsvps = await RSVP.find({ event: eventId, status }).populate('user');
    return rsvps;
}

export async function getForUser(userId: string) {
    const rsvps = await RSVP.find({ user: userId }).populate('event');
    return rsvps;
}