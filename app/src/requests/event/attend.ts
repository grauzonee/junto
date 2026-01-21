import { Request, Response } from "express";
import { create } from "@/services/RSVPService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { RSVPSchema } from "@/schemas/http/RSVP";
import { asyncHandler } from "@/requests/asyncHandler";

export const attend = asyncHandler(async (req: Request, res: Response) => {
    const data = RSVPSchema.parse(req.body);
    const rsvp = await create(data, req.user._id);

    setSuccessResponse(res, rsvp.toJSON(), 201);
});