import mongoose from "mongoose";
import { setSuccessResponse, setErrorResponse } from "@/helpers/requestHelper";
import { parseMongooseValidationError } from "@/helpers/requestHelper";
import { insertEvent } from "@/services/eventService";
import { Request, Response } from "express"
import messages from "@/constants/errorMessages"

export async function create(req: Request, res: Response) {
    try {
        const event = await insertEvent(req);
        setSuccessResponse(res, event.toJSON(), 201);
        return;
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const fieldErrors = parseMongooseValidationError(error);
            setErrorResponse(res, 400, fieldErrors);
            return;
        }
        setErrorResponse(
            res, 500, [],
            [messages.response.SERVER_ERROR("creating event")]
        );
    }
}
