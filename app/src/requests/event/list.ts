import { list as listEvents } from "@/services/eventService";
import { Request, Response } from "express";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";
import { buildRequestData } from "@/requests/utils";

export const list = asyncHandler(async (req: Request, res: Response) => {
    const events = await listEvents(buildRequestData(req));
    setSuccessResponse(res, events.map(event => event.toJSON()));
});

