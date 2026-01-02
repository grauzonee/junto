import { logger } from "@/config/loggerConfig";
import { Event } from "@/models/Event"
import { CreateEventInput, CoordinatesInput, EditEventInput } from "@/types/services/eventService";
import { NotFoundError } from "@/types/errors/InputError";
import { EventType } from "@/models/EventType";
import { buildGeosearchQuery, buildFilterQuery, buildSortQuery } from "@/helpers/queryBuilder";
import { RequestData } from "@/types/common";

export async function listEvents(data: RequestData) {
    const result = await Event.find(buildFilterQuery(data.dbFilter)).sort(buildSortQuery(data.sort)).paginate(data.pagination.offset, data.pagination.limit)
    return result;
}

export async function listEventTypes(data: RequestData) {
    const result = await EventType.find(buildFilterQuery(data.dbFilter)).sort(buildSortQuery(data.sort)).paginate(data.pagination.offset, data.pagination.limit)
    return result;
}

export async function insertEvent(data: CreateEventInput, author: string) {
    try {
        const createdEvent = await Event.create({ ...data, author });
        return createdEvent;
    } catch (error) {
        logger.error("Error saving event to MongoDB", error)
        throw error;
    }
}

export async function geoSearch(coordinates: CoordinatesInput, data: RequestData) {
    const query = buildGeosearchQuery(coordinates)
    try {
        const result = await Event.find(query).sort(buildSortQuery(data.sort)).paginate(data.pagination.offset, data.pagination.limit);
        return result;
    } catch (error) {
        logger.error("Error performing geosearch on events: " + error)
        throw error;
    }
}

export async function editEvent(data: EditEventInput, eventId: string, userId: string) {
    try {
        const event = await Event.findOneAndUpdate({ _id: eventId, author: userId, active: true }, data, { new: true, runValidators: true })
        if (!event) {
            throw new NotFoundError("event")
        }
        return event;
    } catch (error) {
        logger.error(`Error while updating event ${eventId}:`, error)
        throw error
    }
}
