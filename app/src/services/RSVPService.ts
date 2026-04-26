import mongoose from "mongoose";
import { RSVP } from "@/models/rsvp/RSVP";
import { Event, HydratedEvent } from "@/models/event/Event";
import { logger } from "@/config/loggerConfig";
import { CreateRSVPInput, UpdateRSVPInput } from "@/types/services/RSVPService";
import { BadInputError, HttpError, NotFoundError } from "@/types/errors/InputError";
import messages from "@/constants/errorMessages";
import { getConfirmedRsvpSeatCount, RSVPStatus, STATUS_CONFIRMED } from "@/models/rsvp/utils";

const CAPACITY_LOCK_TTL_MS = 5000;
const CAPACITY_LOCK_RETRIES = 20;
const CAPACITY_LOCK_RETRY_DELAY_MS = 25;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function acquireEventCapacityLock(eventId: string) {
    const lockId = new mongoose.Types.ObjectId().toString();

    for (let attempt = 0; attempt < CAPACITY_LOCK_RETRIES; attempt += 1) {
        const now = new Date();
        const lockExpiresAt = new Date(now.getTime() + CAPACITY_LOCK_TTL_MS);
        const event = await Event.findOneAndUpdate(
            {
                _id: eventId,
                active: true,
                $or: [
                    { capacityLockExpiresAt: { $exists: false } },
                    { capacityLockExpiresAt: { $lte: now } }
                ]
            },
            { $set: { capacityLockId: lockId, capacityLockExpiresAt: lockExpiresAt } },
            { new: true }
        );

        if (event) {
            return { event, lockId };
        }

        const activeEventExists = await Event.exists({ _id: eventId, active: true });
        if (!activeEventExists) {
            throw new NotFoundError("event");
        }

        await sleep(CAPACITY_LOCK_RETRY_DELAY_MS);
    }

    throw new BadInputError("event", messages.response.EVENT_FULL);
}

async function releaseEventCapacityLock(eventId: string, lockId: string) {
    await Event.updateOne(
        { _id: eventId, capacityLockId: lockId },
        { $unset: { capacityLockId: "", capacityLockExpiresAt: "" } }
    );
}

async function assertEventCapacity(
    event: HydratedEvent,
    userId: string,
    status: RSVPStatus,
    additionalGuests = 0,
    excludedRsvpId?: mongoose.Types.ObjectId
) {
    if (event.maxAttendees < 0 || status !== STATUS_CONFIRMED || event.author.toString() === userId) {
        return;
    }

    const confirmedAttendanceTotal = await RSVP.getConfirmedAttendanceTotal(event._id, event.author, excludedRsvpId);
    const requestedSeatCount = getConfirmedRsvpSeatCount(additionalGuests);

    if (confirmedAttendanceTotal + requestedSeatCount > event.maxAttendees) {
        throw new BadInputError("event", messages.response.EVENT_FULL);
    }
}

export async function create(data: CreateRSVPInput, userId: string) {
    const { eventId, status, additionalGuests } = data;

    const { event, lockId } = await acquireEventCapacityLock(eventId);
    try {
        const foundRsvp = await RSVP.isUserAttendingEvent(userId, eventId);
        if (foundRsvp) {
            throw new BadInputError("user", messages.response.DUPLICATE_ATTEND);
        }
        await assertEventCapacity(event, userId, status as RSVPStatus, additionalGuests);
        return await RSVP.create({ event: eventId, status, additionalGuests, user: userId, eventDate: event.date });
    } catch (error) {
        if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
            throw new BadInputError("user", messages.response.DUPLICATE_ATTEND);
        }
        if (!(error instanceof HttpError)) {
            logger.error("Error saving RSVP to MongoDB", error)
        }
        throw error;
    } finally {
        await releaseEventCapacityLock(eventId, lockId);
    }
}

export async function update(data: UpdateRSVPInput, rsvpId: string, userId: string) {
    const existingRsvp = await RSVP.findOne({ _id: rsvpId, user: userId });
    if (!existingRsvp) {
        throw new NotFoundError("rsvp");
    }

    const eventId = existingRsvp.event.toString();
    const { event, lockId } = await acquireEventCapacityLock(eventId);
    try {
        const rsvp = await RSVP.findOne({ _id: rsvpId, user: userId }).populate({
            path: 'event',
            match: { active: true }
        });
        if (!rsvp) {
            throw new NotFoundError("rsvp");
        }
        if (!rsvp.event) {
            throw new NotFoundError("event");
        }

        const nextAdditionalGuests = data.additionalGuests ?? rsvp.additionalGuests ?? 0;
        await assertEventCapacity(event, userId, data.status as RSVPStatus, nextAdditionalGuests, rsvp._id);

        await rsvp.setStatus(data.status);
        if (data.additionalGuests !== undefined) {
            rsvp.additionalGuests = data.additionalGuests;
        }

        await rsvp.save();
        return rsvp.depopulate('event');
    } finally {
        await releaseEventCapacityLock(eventId, lockId);
    }
}

export async function getForEvent(eventId: string, status: RSVPStatus = STATUS_CONFIRMED) {
    const event = await Event.findOne({ _id: eventId, active: true });
    if (!event) {
        throw new NotFoundError("event");
    }
    const rsvps = await RSVP.find({ event: eventId, status }).populate('user');
    return rsvps;
}
