import { Request, Response } from "express"
import { setSuccessResponse } from "@/helpers/requestHelper";
import { register as serviceRegister } from "@/services/authService";
import { asyncHandler } from "@/requests/asyncHandler";

/**
 * Register user
 * @param {Request} req 
 * @param {Response} res 
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body
    const responseData = await serviceRegister({ username, email, password });
    setSuccessResponse(res, responseData, 201);
});