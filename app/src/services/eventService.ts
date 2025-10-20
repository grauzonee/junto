import { logger } from "@/config/loggerConfig";
import { type IEvent, Event } from "@/models/Event"
import { Request } from "express";

export async function insertEvent(req: Request): Promise<IEvent | undefined> {
    try {
        const event: IEvent = req.body
        event.author = req.user?.id;
        const createdEvent = await Event.create(event);
        return createdEvent;
    } catch (error) {
        logger.error("Error saving event to MongoDB", error)
        return undefined;
    }
}
