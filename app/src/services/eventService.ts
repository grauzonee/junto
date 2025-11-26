import { logger } from "@/config/loggerConfig";
import { Event } from "@/models/Event"
import { Request } from "express";
import { CoordinatesSchema } from "@/schemas/http/Event";
import { NotFoundError } from "@/types/errors/InputError";
import { EventType } from "@/models/EventType";
import { buildGeosearchQuery, buildFilterQuery, buildSortQuery } from "@/helpers/queryBuilder";

export async function listEvents(req: Request) {
    const result = await Event.find(buildFilterQuery(req.dbFilter)).sort(buildSortQuery(req.sort)).paginate(req.offset, req.limit)
    return result;
}

export async function listEventTypes(req: Request) {
    const result = await EventType.find(buildFilterQuery(req.dbFilter)).sort(buildSortQuery(req.sort)).paginate(req.offset, req.limit)
    return result;
}

export async function insertEvent(req: Request) {
    try {
        const event = req.body
        event.author = req.user?.id;
        const createdEvent = await Event.create(event);
        return createdEvent;
    } catch (error) {
        logger.error("Error saving event to MongoDB", error)
        throw error;
    }
}

export async function geoSearch(req: Request) {
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

export async function attendEvent(req: Request) {
    const { eventId } = req.params;
    const eventFound = await Event.findOne({ _id: eventId });
    if (!eventFound) {
        throw new NotFoundError("Event not found")
    }
    await eventFound.attend(req.user?.id)
    return eventFound;
}

export async function editEvent(req: Request) {
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
