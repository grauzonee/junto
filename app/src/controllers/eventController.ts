import { Request, Response } from "express"
import { addEvent } from "@/queues/createEventQueue"
import { logger } from "@/config/loggerConfig";
import { getRepository, geoSearch, textSearch } from "@/schemas/redis/Event"
import type { IEvent } from "@/models/Event";
import { CoordinatesSchema } from "@/schemas/http/Event";

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
    const data = await repo.search().return.page(req.offset ?? 0, req.limit ?? 20)
    res.status(200).json({ success: true, data: data })
}

export async function geosearch(req: Request, res: Response) {
    const { error, value } = CoordinatesSchema.validate(req.query)
    if (error) {
        res.status(400).json({ success: false, message: error })
        return
    }
    const result = await geoSearch(value.lat, value.lon, value.radius, req.offset, req.limit);

    res.status(200).json({ success: true, data: result })
}

export async function search(req: Request, res: Response) {
    const { q } = req.query
    if (!q || typeof (q) != 'string' || q.length < 2) {
        res.status(400).json({ success: false, message: "Query is required" })
        return
    }
    const result = await textSearch(q, req.offset, req.limit);

    res.status(200).json({ success: true, data: result })
}
