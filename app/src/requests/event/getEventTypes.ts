import { listEventTypes } from "@/services/eventService"
import { Request, Response } from "express"
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";

export const getEventTypes = asyncHandler(async (req: Request, res: Response) => {
    const eventTypes = await listEventTypes(req);
    setSuccessResponse(res, eventTypes.map(i => i.toJSON()));
});

