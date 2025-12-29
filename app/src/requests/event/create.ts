import { setSuccessResponse } from "@/helpers/requestHelper";
import { insertEvent } from "@/services/eventService";
import { Request, Response } from "express"
import { asyncHandler } from "@/requests/asyncHandler";

export const create = asyncHandler(async (req: Request, res: Response) => {
    const event = await insertEvent(req);
    setSuccessResponse(res, event.toJSON(), 201);
});
