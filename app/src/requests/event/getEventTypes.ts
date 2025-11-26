import { listEventTypes } from "@/services/eventService"
import { Request, Response } from "express"

export async function getEventTypes(req: Request, res: Response) {
    const eventTypes = await listEventTypes(req);
    res.status(200).json({ success: true, data: eventTypes.map(i => i.toJSON()) })
}
