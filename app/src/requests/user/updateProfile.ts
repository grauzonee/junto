import { Request, Response } from "express"
import {validateUpdateData} from "@/requests/user/utils"
import messages from "@/constants/errorMessages"
import { parseMongooseValidationError, setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";
import mongoose from "mongoose";

export async function updateProfile(req: Request, res: Response) {
    const requestData = req.body;
    if (!requestData) {
        setErrorResponse(res, 400, {}, [messages.response.EMPTY_BODY]);
        return;
    }
    const { error, field } = await validateUpdateData(req);
    if (error && field) {
        setErrorResponse(res, 400, { [field]: error });
        return;
    }

    try {
        if (requestData.avatarUrl) {
            requestData.avatarUrl = requestData.avatarUrl.replace(/^\/+/, "").trim()
        }
        const user = await req.user?.updateProfile(requestData);
        setSuccessResponse(res, user.toJSON());
        return;
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const fieldErrors = parseMongooseValidationError(error);
            setErrorResponse(res, 400, fieldErrors);
            return;
        }
        setErrorResponse(res, 400, {}, [messages.response.SERVER_ERROR()]);
    }
}