import { listEventTypes } from "@/services/eventService"
import { Request, Response } from "express"
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";
import { buildRequestData } from "@/requests/utils";

export const getEventTypes = asyncHandler(async (req: Request, res: Response) => {
    const eventTypes = await listEventTypes(buildRequestData(req));
    setSuccessResponse(res, eventTypes.map(i => i.toJSON()));
});

