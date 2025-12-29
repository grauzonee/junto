import { Request, Response } from "express";
import { editEvent } from "@/services/eventService";
import { asyncHandler } from "@/requests/asyncHandler";
import { setSuccessResponse } from "@/helpers/requestHelper";

export const update = asyncHandler(async (req: Request, res: Response) => {
    const event = await editEvent(req);
    setSuccessResponse(res, event.toJSON());
});
