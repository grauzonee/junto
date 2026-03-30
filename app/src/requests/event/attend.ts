import { Request, Response } from "express";
import { create } from "@/services/RSVPService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { CreateRSVPSchema } from "@/schemas/http/RSVP";
import { asyncHandler } from "@/requests/asyncHandler";
import { getRequestUserId } from "@/requests/utils";

export const attend = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateRSVPSchema.parse(req.body);
    const rsvp = await create(data, getRequestUserId(req));

    setSuccessResponse(res, rsvp.toJSON(), 201);
});
