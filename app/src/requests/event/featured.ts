import { listFeatured } from "@/services/eventService";
import { Request, Response } from "express";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";

export const featured = asyncHandler(async (_req: Request, res: Response) => {
    const events = await listFeatured();
    const data = events.length > 0
        ? events.map(event => event.toJSON())
        : {};

    setSuccessResponse(res, data);
});
