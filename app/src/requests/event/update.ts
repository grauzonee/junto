import { Request, Response } from "express";
import { update as updateEvent } from "@/services/eventService";
import { asyncHandler } from "@/requests/asyncHandler";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { EditEventSchema } from "@/schemas/http/Event";
import { getRequestUserId } from "@/requests/utils";

export const update = asyncHandler(async (req: Request, res: Response) => {
    const editEventData = EditEventSchema.parse(req.body);
    const event = await updateEvent(editEventData, req.params.eventId, getRequestUserId(req));
    setSuccessResponse(res, event.toJSON());
});
