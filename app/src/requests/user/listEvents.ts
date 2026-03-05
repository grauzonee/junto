import { asyncHandler } from "@/requests/asyncHandler";
import { Request, Response } from "express";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { getForUser } from "@/services/RSVPService";

// status, active, before_date, after_date, date, is_organizer

export const listEvents = asyncHandler(async (req: Request, res: Response) => {
    const id = req.user.id;
    const result = await getForUser(id)

    setSuccessResponse(res, result.map(rsvp => rsvp.toJSON()));
});