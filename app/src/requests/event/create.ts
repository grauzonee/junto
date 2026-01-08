import { setSuccessResponse } from "@/helpers/requestHelper";
import { create as createEvent } from "@/services/eventService";
import { Request, Response } from "express"
import { asyncHandler } from "@/requests/asyncHandler";
import { CreateEventSchema } from "@/schemas/http/Event";

export const create = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateEventSchema.parse(req.body);
    const event = await createEvent(data, req.user.id);
    setSuccessResponse(res, event.toJSON(), 201);
});
