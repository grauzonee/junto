import { Request, Response } from "express";
import { asyncHandler } from "@/requests/asyncHandler";
import { getForEvent } from "@/services/RSVPService";
import { BadInputError } from "@/types/errors/InputError";
import { setSuccessResponse } from "@/helpers/requestHelper";

export const listRsvps = asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.eventId) {
        throw new BadInputError("eventId", "Event ID is required");
    }
    const rsvps = await getForEvent(req.params.eventId as string);
    setSuccessResponse(res, rsvps.map(rsvp => rsvp.toJSON()));
});