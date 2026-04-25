import { listCurrentUser as listCurrentUserEvents } from "@/services/eventService";
import { Request, Response } from "express";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";
import { buildRequestData, getRequestUserId } from "@/requests/utils";

export const listCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const events = await listCurrentUserEvents(buildRequestData(req), getRequestUserId(req));
    setSuccessResponse(res, events.map(event => event.toJSON()));
});
