import { Request, Response } from "express";
import successMessages from "@/constants/successMessages";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";
import { getRequestUserId } from "@/requests/utils";
import { deleteComment as deleteCommentService } from "@/services/commentService";
import { BadInputError } from "@/types/errors/InputError";

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.commentId) {
        throw new BadInputError("commentId", "Comment ID is required");
    }

    await deleteCommentService(req.params.commentId, getRequestUserId(req));
    setSuccessResponse(res, { message: successMessages.response.COMMENT_DELETED });
});
