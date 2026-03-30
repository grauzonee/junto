import { setSuccessResponse } from "@/helpers/requestHelper";
import { Request, Response } from "express"
import { asyncHandler } from "@/requests/asyncHandler";
import { NotFoundError } from "@/types/errors/InputError";
import successMessages from "@/constants/successMessages";

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const requestData = req.body;
    if (!req.user) {
        throw new NotFoundError("user");
    }
    await req.user.updatePassword(requestData);
    setSuccessResponse(res, { message: successMessages.response.PASSWORD_UPDATED });
});
