import { Request, Response } from "express";
import { asyncHandler } from "@/requests/asyncHandler";
import { deleteUser } from "@/services/userService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { getRequestUserId } from "@/requests/utils";
import successMessages from "@/constants/successMessages";

export const deleteProfile = asyncHandler(async (req: Request, res: Response) => {
    await deleteUser(getRequestUserId(req));
    setSuccessResponse(res, { message: successMessages.response.PROFILE_DELETED });
});
