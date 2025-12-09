import { setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";
import messages from "@/constants/errorMessages"
import { Request, Response } from "express"
import { BadInputError } from "@/types/errors/InputError";

export async function updatePassword(req: Request, res: Response) {
    const requestData = req.body;
    try {
        await req.user?.updatePassword(requestData);
        setSuccessResponse(res, { message: "Password has been updated" });
        return;
    } catch (error) {
        if (error instanceof BadInputError) {
            setErrorResponse(res, 400, {}, [error.message]);
            return;
        }
        setErrorResponse(res, 500, {}, [messages.response.SERVER_ERROR()]);
    }
}