import { Request, Response } from "express";
import { asyncHandler } from "@/requests//asyncHandler";
import { UpdateRSVPSchema } from "@/schemas/http/RSVP";
import { update as updateRSVP } from "@/services/RSVPService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { getRequestUserId } from "@/requests/utils";

export const update = asyncHandler(async (req: Request, res: Response) => {
    const data = UpdateRSVPSchema.parse(req.body);
    const rsvpId = req.params.rsvpId;
    const rsvp = await updateRSVP(data, rsvpId, getRequestUserId(req));

    setSuccessResponse(res, rsvp.toJSON(), 200);
});
