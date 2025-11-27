import { listEventTypes } from "@/services/eventService"
import { Request, Response } from "express"
import { setSuccessResponse } from "@/helpers/requestHelper";

export async function getEventTypes(req: Request, res: Response) {
    const eventTypes = await listEventTypes(req);
    setSuccessResponse(res, eventTypes.map(i => i.toJSON()));
}
