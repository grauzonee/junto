import { Request, Response } from "express"
import { insertEvent, geoSearch, attendEvent, listEvents } from "@/services/eventService";
import { ZodError } from "zod";
import * as z from "zod"
import { BadInputError, NotFoundError } from "@/types/errors/InputError";

export async function create(req: Request, res: Response) {
    const event = await insertEvent(req);
    if (event) {
        res.status(200).json({ success: true, data: event.toJSON() })
        return;
    }
    res.status(500).json({ success: false, message: "Error creating event, try again later" })
}

export async function list(req: Request, res: Response) {
    const events = await listEvents(req);
    res.status(200).json({ success: true, data: events.map(event => event.toJSON()) })
}

export async function geosearch(req: Request, res: Response) {

    try {
        const result = await geoSearch(req);
        const jsonResult = result?.map(event => event.toJSON())
        res.status(200).json({ success: true, data: jsonResult })
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ success: false, data: z.flattenError(error) })
            return;
        }
        res.status(500).json({ success: false, message: "Server error, try again later" })
    }
}

export async function attend(req: Request, res: Response) {
    try {
        const eventFound = await attendEvent(req)
        res.status(200).json({ success: true, data: eventFound.toJSON() })
    } catch (error) {
        let status = 500;
        let message = "Server error, try again later"
        if (error instanceof NotFoundError) {
            status = 404;
            message = error.message;
        }
        if (error instanceof BadInputError) {
            status = 400;
            message = error.message;
        }
        res.status(status).json({ success: false, message: message })

    }

}
