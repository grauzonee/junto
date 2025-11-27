import { Request, Response } from "express"
import { insertEvent, geoSearch, attendEvent, listEvents, editEvent } from "@/services/eventService";
import { ZodError } from "zod";
import * as z from "zod"
import { BadInputError, NotFoundError } from "@/types/errors/InputError";
import mongoose from "mongoose";
import messages from "@/constants/errorMessages"
import { parseMongooseValidationError, setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";

export async function create(req: Request, res: Response) {
    try {
        const event = await insertEvent(req);
        setSuccessResponse(res, event.toJSON(), 201);
        return;
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const fieldErrors = parseMongooseValidationError(error);
            setErrorResponse(res, 422, fieldErrors);
            return;
        }
        setErrorResponse(
            res, 500, [],
            [messages.response.SERVER_ERROR("creating event")]
        );
    }
}

export async function list(req: Request, res: Response) {
    const events = await listEvents(req);
    setSuccessResponse(res, events.map(event => event.toJSON()));
}

export async function geosearch(req: Request, res: Response) {
    try {
        const result = await geoSearch(req);
        setSuccessResponse(res, result.map(event => event.toJSON()));
    } catch (error) {
        if (error instanceof ZodError) {
            const flattenedError = z.flattenError(error);
            setErrorResponse(res, 400, flattenedError.fieldErrors, flattenedError.formErrors);
            return;
        }
        setErrorResponse(res, 500, {}, [messages.response.SERVER_ERROR()]);
    }
}

export async function attend(req: Request, res: Response) {
    try {
        const eventFound = await attendEvent(req)
        res.status(200).json({ success: true, data: eventFound.toJSON() })
    } catch (error) {
        let status = 500;
        let message = messages.response.SERVER_ERROR();
        if (error instanceof NotFoundError) {
            status = 404;
            message = error.message;
        }
        if (error instanceof BadInputError) {
            status = 400;
            message = error.message;
        }
        res.status(status).json({ success: false, message: message })

    }
}

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
            setErrorResponse(res, 422, fieldErrors);
            return;
        }
        setErrorResponse(res, 500, {}, [messages.response.SERVER_ERROR("updating event")]);
    }
}
