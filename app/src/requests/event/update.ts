import { Request, Response } from "express"
import { editEvent } from "@/services/eventService";

import { NotFoundError } from "@/types/errors/InputError";
import mongoose from "mongoose";
import messages from "@/constants/errorMessages"
import { parseMongooseValidationError, setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";

export async function update(req: Request, res: Response) {
    try {
        const event = await editEvent(req);
        setSuccessResponse(res, event.toJSON());
    } catch (error) {
        if (error instanceof NotFoundError) {
            setErrorResponse(res, 404, {}, [error.message]);
            return;
        }
        if (error instanceof mongoose.Error.ValidationError) {
            const fieldErrors = parseMongooseValidationError(error);
            setErrorResponse(res, 400, fieldErrors);
            return;
        }
        setErrorResponse(res, 500, {}, [messages.response.SERVER_ERROR("updating event")]);
    }
}
