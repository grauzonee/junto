import { Request, Response } from "express";
import { EmptyBodyError, NotFoundError } from "@/types/errors/InputError";
import mongoose from "mongoose";
import messages from "@/constants/errorMessages"
import { ZodError } from "zod";
import * as z from "zod"
import { BadInputError } from "@/types/errors/InputError";
import { parseMongooseValidationError, setErrorResponse } from "@/helpers/requestHelper";

export function errorHandler(err: Error, req: Request, res: Response) {
    if (err instanceof EmptyBodyError) {
        setErrorResponse(res, 400, {}, [err.message]);
        return;
    }
    if (err instanceof NotFoundError) {
        setErrorResponse(res, 404, {}, [err.message]);
        return;
    }
    if (err instanceof BadInputError) {
        setErrorResponse(res, 400, { [err.field]: err.message }, []);
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