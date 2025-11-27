import { Request, Response } from "express"
import { login as serviceLogin } from "@/services/authService";
import messages from "@/constants/errorMessages"
import { setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";
import { BadInputError, NotFoundError } from "@/types/errors/InputError";

/**
 * Login user 
 * @param {Request} req 
 * @param {Response} res 
 */
export async function login(req: Request, res: Response) {
    const { email, password } = req.body
    try {
        const responseData = await serviceLogin({ email, password });
        setSuccessResponse(res, responseData);
    } catch (error) {
        if (error instanceof NotFoundError) {
            setErrorResponse(res, 404, {}, [messages.response.NOT_FOUND("User")]);
            return;
        }
        if (error instanceof BadInputError) {
            setErrorResponse(res, 400, { [error.field]: [error.message] }, []);
            return;
        }
    }

}
