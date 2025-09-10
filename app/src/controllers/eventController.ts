import { Request, Response } from "express"
import { addEvent } from "@/queues/createEventQueue"
import { logger } from "@/config/loggerConfig";
import { getRepository } from "@/schemas/redis/Event"
import type { IEvent } from "@/models/Event";

export async function create(req: Request, res: Response) {
    const repo = await getRepository()
    const event: IEvent = req.body
    const redisEvent = {
        ...event,
        locationValue: event.location.value,
        location: {
            latitude: event.location.coordinates.lat,
            longitude: event.location.coordinates.lon,
        }
    }
    try {
        repo.save(redisEvent)
        await addEvent(event)
        res.status(200).json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: "Error creating event in Redis, try again later" })
        logger.error("Error creating event in redis", err)
    }
}

export async function list(req: Request, res: Response) {
    const repo = await getRepository()
    res.status(200).json({ success: true, data: repo.fetch() })
}
