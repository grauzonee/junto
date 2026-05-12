import { Request, Response } from "express";
import { asyncHandler } from "@/requests/asyncHandler";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { listForEvent } from "@/services/commentService";
import { buildRequestData } from "@/requests/utils";
import { BadInputError } from "@/types/errors/InputError";

export const listComments = asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.eventId) {
        throw new BadInputError("eventId", "Event ID is required");
    }

    const result = await listForEvent(req.params.eventId, buildRequestData(req));
    setSuccessResponse(res, {
        total: result.total,
        entities: result.entities.map(comment => comment.toJSON())
    });
});
