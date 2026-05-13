import { Request, Response } from "express";
import { asyncHandler } from "@/requests/asyncHandler";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { CreateEventCommentSchema } from "@/schemas/http/Comment";
import { create as createCommentService } from "@/services/commentService";
import { getRequestUserId } from "@/requests/utils";

export const createComment = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateEventCommentSchema.parse(req.body);
    const comment = await createCommentService(data, getRequestUserId(req));

    setSuccessResponse(res, comment.toJSON(), 201);
});
