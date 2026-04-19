import { logger } from "@/config/loggerConfig";
import { Event, type HydratedEvent, type IEvent } from "@/models/event/Event"
import { CreateEventInput, CoordinatesInput, EditEventInput } from "@/types/services/eventService";
import { ForbiddenError, NotFoundError } from "@/types/errors/InputError";
import { EventType } from "@/models/EventType";
import { buildGeosearchQuery, buildFilterQuery, buildSearchQuery, buildSortQuery, combineQueries } from "@/helpers/queryBuilder";
import { RequestData } from "@/types/common";
import { RSVP } from "@/models/rsvp/RSVP";
import { STATUS_CANCELED } from "@/models/rsvp/utils";

async function syncEventDateForRsvps(event: HydratedEvent) {
    await RSVP.updateMany({ event: event._id }, { eventDate: event.date });
}

async function cancelEventRsvps(event: HydratedEvent) {
    await RSVP.updateMany({ event: event._id }, { status: STATUS_CANCELED });
}

export async function softDeleteEvent(event: HydratedEvent) {
    if (!event.active) {
        return event;
    }

    event.active = false;
    event.deletedAt = new Date();
    await event.save({ validateBeforeSave: false });
    await cancelEventRsvps(event);
    return event;
}

export async function deleteEventsByAuthor(authorId: string) {
    const events = await Event.find({ author: authorId, active: true });
    for (const event of events) {
        await softDeleteEvent(event);
    }
}

export async function list(data: RequestData) {
    const query = combineQueries<IEvent>(
        { active: true },
        buildFilterQuery<IEvent>(data.dbFilter),
        buildSearchQuery<IEvent>(['title', 'description'], data.search)
    );
    const result = await Event.find(query)
        .populate('categories')
        .populate('type')
        .sort(buildSortQuery(data.sort))
        .paginate(data.pagination.offset, data.pagination.limit)
    return result;
}

export async function fetchOne(id: string) {
    const result = await Event.findOne({ _id: id, active: true }).populate('categories').populate('type').populate('author', '_id username email');
    return result;
}

export async function listEventTypes(data: RequestData) {
    const result = await EventType.find(buildFilterQuery(data.dbFilter)).sort(buildSortQuery(data.sort)).paginate(data.pagination.offset, data.pagination.limit)
    return result;
}

export async function create(data: CreateEventInput, author: string) {
    try {
        const createdEvent = await Event.create({ ...data, author });
        return createdEvent;
    } catch (error) {
        logger.error("Error saving event to MongoDB", error)
        throw error;
    }
}

export async function geoSearch(coordinates: CoordinatesInput, data: RequestData) {
    const query = combineQueries<IEvent>({ active: true }, buildGeosearchQuery(coordinates))
    try {
        const result = await Event.find(query)
            .populate('categories')
            .populate('type')
            .sort(buildSortQuery(data.sort))
            .paginate(data.pagination.offset, data.pagination.limit);
        return result;
    } catch (error) {
        logger.error("Error performing geosearch on events:", error)
        throw error;
    }
}

export async function update(data: EditEventInput, eventId: string, userId: string) {
    try {
        const event = await Event.findOne({ _id: eventId, author: userId, active: true });
        if (!event) {
            throw new NotFoundError("event")
        }

        event.set(data);
        const shouldSyncEventDate = event.isModified("date");
        await event.save();

        if (shouldSyncEventDate) {
            await syncEventDateForRsvps(event);
        }

        return event;
    } catch (error) {
        logger.error(`Error while updating event ${eventId}:`, error)
        throw error
    }
}

export async function deleteEvent(eventId: string, userId: string) {
    try {
        const event = await Event.findOne({ _id: eventId, active: true });
        if (!event) {
            throw new NotFoundError("event");
        }
        if (event.author.toString() !== userId) {
            throw new ForbiddenError("Only the event author can delete this event");
        }

        await softDeleteEvent(event);
        return event;
    } catch (error) {
        logger.error(`Error while deleting event ${eventId}:`, error);
        throw error;
    }
}
