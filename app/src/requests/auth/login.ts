import { Request, Response } from "express"
import { login as serviceLogin } from "@/services/authService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";

/**
 * Login user 
 * @param {Request} req 
 * @param {Response} res 
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    {
        const { email, password } = req.body
        const responseData = await serviceLogin({ email, password });
        setSuccessResponse(res, responseData);
    }
});
