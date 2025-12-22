import { Request, Response } from "express";
import { insert } from "@/services/RSVPService";
import { parseMongooseValidationError, setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";
import { Error } from "mongoose";
import messages from "@/constants/errorMessages"
import { RSVP } from "@/models/RSVP";

export async function attend(req: Request, res: Response) {
    try {
        const foundRsvp = await RSVP.isUserAttendingEvent(req.user._id, req.body.eventId);
        if (foundRsvp) {
            setErrorResponse(res, 400, messages.response.DUPLICATE_ATTEND);
            return;
        }
        const rsvp = await insert(req);

        setSuccessResponse(res, rsvp.toJSON(), 201);
        return;
    } catch (error) {
        if (error instanceof Error.ValidationError) {
            const parsedError = parseMongooseValidationError(error);
            setErrorResponse(res, 400, parsedError);
            return;
        }
        setErrorResponse(
            res, 500, [],
            [messages.response.SERVER_ERROR("attending event")]
        );
    }
}