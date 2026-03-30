import { Request, Response } from "express";
import { asyncHandler } from "@/requests/asyncHandler";
import { deleteEvent as deleteEventService } from "@/services/eventService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { getRequestUserId } from "@/requests/utils";
import successMessages from "@/constants/successMessages";

export const remove = asyncHandler(async (req: Request, res: Response) => {
    await deleteEventService(req.params.eventId, getRequestUserId(req));
    setSuccessResponse(res, { message: successMessages.response.EVENT_DELETED });
});
