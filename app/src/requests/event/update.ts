import { Request, Response } from "express";
import { editEvent } from "@/services/eventService";
import { asyncHandler } from "@/requests/asyncHandler";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { EditEventSchema } from "@/schemas/http/Event";

export const update = asyncHandler(async (req: Request, res: Response) => {
    const editEventData = EditEventSchema.parse(req.body);
    const event = await editEvent(editEventData, req.params.eventId, req.user.id);
    setSuccessResponse(res, event.toJSON());
});
