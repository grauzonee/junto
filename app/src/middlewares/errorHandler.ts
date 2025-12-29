import { Request, Response } from "express";
import { HttpError } from "@/types/errors/InputError";
import mongoose from "mongoose";
import messages from "@/constants/errorMessages"
import { ZodError } from "zod";
import * as z from "zod"
import { parseMongooseValidationError, setErrorResponse } from "@/helpers/requestHelper";

export function errorHandler(err: Error, req: Request, res: Response) {
    if (err instanceof HttpError) {
        setErrorResponse(res, err.statusCode, err.fieldErrors || {}, err.formErrors || []);
        return;
    }
    if (err instanceof mongoose.Error.ValidationError) {
        const fieldErrors = parseMongooseValidationError(err);
        setErrorResponse(res, 400, fieldErrors);
        return;
    }
    if (err instanceof ZodError) {
        const flattenedError = z.flattenError(err);
        setErrorResponse(res, 400, flattenedError.fieldErrors, flattenedError.formErrors);
        return;
    }
    setErrorResponse(res, 500, {}, [messages.response.SERVER_ERROR()]);
}