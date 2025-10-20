import { Request, Response } from "express"
import { getRepository, geoSearch, textSearch } from "@/schemas/redis/Event"
import { Event } from "@/models/Event";
import { CoordinatesSchema } from "@/schemas/http/Event";
import { insertEvent } from "@/services/eventService";

export async function create(req: Request, res: Response) {
    const event = await insertEvent(req);
    if (event) {
        res.status(200).json({ success: true })
        return;
    }
    res.status(500).json({ success: false, message: "Error creating event, try again later" })
}

export async function list(req: Request, res: Response) {
    const repo = await getRepository()
    const data = await repo.search().return.all()
    res.status(200).json({ success: true, data: data })
}

export async function geosearch(req: Request, res: Response) {
    const { error, value } = CoordinatesSchema.validate(req.query)
    if (error) {
        res.status(400).json({ success: false, message: error })
        return
    }
    const result = await geoSearch(value.lat, value.lng, value.radius, req.offset, req.limit);

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

export async function attend(req: Request, res: Response) {
    const { eventId } = req.params;
    const eventFound = await Event.findOne({ _id: eventId });
    if (!eventFound) {
        res.status(404).json({ success: false, message: "Event not found" })
        return
    }
    if (eventFound.attendees.includes(req.user?.id)) {

        res.status(400).json({ success: false, message: "Event is already attended by this user" })
        return
    }
    eventFound.attendees.push(req.user?.id);
    await eventFound.save()

    res.status(200).json({ success: true, data: eventFound })
}
