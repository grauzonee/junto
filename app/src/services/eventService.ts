import { logger } from "@/config/loggerConfig";
import { Event, EventDocument } from "@/models/Event"
import { Request } from "express";
import { CoordinatesSchema } from "@/schemas/http/Event";
import { NotFoundError } from "@/types/errors/InputError";
import { buildGeosearchQuery, buildFilterQuery, buildSortQuery } from "@/helpers/queryBuilder";

export async function listEvents(req: Request): Promise<EventDocument[]> {
    const result = await Event.find(buildFilterQuery(req.dbFilter)).sort(buildSortQuery(req.sort)).paginate(req.offset, req.limit)
    return result;
}

export async function insertEvent(req: Request): Promise<EventDocument | undefined> {
    try {
        const event = req.body
        event.author = req.user?.id;
        const createdEvent = await Event.create(event);
        return createdEvent;
    } catch (error) {
        logger.error("Error saving event to MongoDB", error)
        return undefined;
    }
}

export async function geoSearch(req: Request): Promise<EventDocument[] | undefined> {
    const value = CoordinatesSchema.parse(req.query)
    const query = buildGeosearchQuery(value)

    try {
        const result = await Event.find(query).sort(buildSortQuery(req.sort)).paginate(req.offset, req.limit);
        return result;
    } catch (error) {
        logger.error("Error performing geosearch on events: " + error)
        throw error;
    }
}

export async function attendEvent(req: Request): Promise<EventDocument> {
    const { eventId } = req.params;
    const eventFound = await Event.findOne({ _id: eventId });
    if (!eventFound) {
        throw new NotFoundError("Event not found")
    }
    await eventFound.attend(req.user?.id)
    return eventFound;
}

export async function editEvent(req: Request): Promise<EventDocument> {
    const { eventId } = req.params
    const userId = req.user?.id
    try {
        const event = await Event.findOneAndUpdate({ _id: eventId, author: userId, active: true }, req.body, { new: true })
        if (!event) {
            throw new NotFoundError("Event not found")
        }
        return event;
    } catch (error) {
        logger.error(`Error while updating event ${eventId}:`, error)
        throw error
    }
}
