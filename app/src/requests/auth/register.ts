import { Request, Response } from "express"
import messages from "@/constants/errorMessages"
import { setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";
import { register as serviceRegister } from "@/services/authService";
import { BadInputError } from "@/types/errors/InputError";

/**
 * Register user
 * @param {Request} req 
 * @param {Response} res 
 */
export async function register(req: Request, res: Response) {
    const { username, email, password } = req.body
    try {
        const responseData = await serviceRegister({ username, email, password });
        setSuccessResponse(res, responseData, 201);
    } catch (error) {
        if (error instanceof BadInputError) {
            setErrorResponse(res, 400, { [error.field]: error.message }, []);
            return;
        }
        setErrorResponse(res, 500, {}, [messages.response.SERVER_ERROR()]);
    }

}
