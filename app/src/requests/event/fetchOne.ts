import { asyncHandler } from "@/requests/asyncHandler";
import { Request, Response } from 'express'
import { fetchOne as fetchOneEvent } from "@/services/eventService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { NotFoundError } from "@/types/errors/InputError";

export const fetchOne = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.eventId;
    const event = await fetchOneEvent(id);
    if (!event) {
        throw new NotFoundError('event');
    }
    setSuccessResponse(res, event.toJSON());
});