import { asyncHandler } from "@/requests/asyncHandler";
import { Request, Response } from 'express'
import { fetchOneWithCapacity } from "@/services/eventService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { NotFoundError } from "@/types/errors/InputError";

export const fetchOne = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.eventId;
    const result = await fetchOneWithCapacity(id);
    if (!result) {
        throw new NotFoundError('event');
    }

    setSuccessResponse(res, {
        ...((({ maxAttendees: _maxAttendees, ...rest }) => rest)(result.event.toJSON())),
        capacity: result.capacity
    });
});
