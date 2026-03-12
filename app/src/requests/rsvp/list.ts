import { Request, Response } from "express";
import { asyncHandler } from "@/requests//asyncHandler";
import { list as listRSVPs } from "@/services/RSVPService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { buildRequestData } from "@/requests/utils";

export const list = asyncHandler(async (req: Request, res: Response) => {
    const rsvps = await listRSVPs(buildRequestData(req));

    setSuccessResponse(res, rsvps.map(rsvp => rsvp.toJSON()));
});