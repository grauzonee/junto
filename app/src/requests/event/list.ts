import { listEvents } from "@/services/eventService";
import { Request, Response } from "express";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";

export const list = asyncHandler(async (req: Request, res: Response) => {
    const events = await listEvents(req);
    setSuccessResponse(res, events.map(event => event.toJSON()));
});

