import { Request, Response } from "express";
import { asyncHandler } from "@/requests/asyncHandler";
import { getForCurrentUser } from "@/services/RSVPService";
import { BadInputError } from "@/types/errors/InputError";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { getRequestUserId } from "@/requests/utils";

export const getCurrentUserRsvp = asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.eventId) {
        throw new BadInputError("eventId", "Event ID is required");
    }

    const rsvp = await getForCurrentUser(req.params.eventId, getRequestUserId(req));

    setSuccessResponse(res, rsvp ? rsvp.toJSON() : null);
});
