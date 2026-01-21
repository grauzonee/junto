import { setSuccessResponse } from "@/helpers/requestHelper";
import { Request, Response } from "express"
import { asyncHandler } from "@/requests/asyncHandler";

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const requestData = req.body;
    await req.user?.updatePassword(requestData);
    setSuccessResponse(res, { message: "Password has been updated" });
});