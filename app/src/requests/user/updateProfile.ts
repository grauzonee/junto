import { Request, Response } from "express"
import { validateUpdateData } from "@/requests/user/utils"
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";
import { BadInputError, EmptyBodyError } from "@/types/errors/InputError";

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const requestData = req.body;
    if (!requestData || Object.keys(requestData).length < 1) {
        throw new EmptyBodyError()
    }
    const { error, field } = await validateUpdateData(req);
    if (error && field) {
        throw new BadInputError(field, error);
    }
    if (requestData.avatarUrl) {
        requestData.avatarUrl = requestData.avatarUrl.replace(/^\/+/, "").trim()
    }
    const user = await req.user?.updateProfile(requestData);
    setSuccessResponse(res, user.toJSON());
    return;
});
