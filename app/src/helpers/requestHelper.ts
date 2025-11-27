import { Response } from "express";
import mongoose from "mongoose";

export function parseMongooseValidationError(error: mongoose.Error.ValidationError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const field in error.errors) {
        const err = error.errors[field];
        fieldErrors[err.path] = [err.message];
    }
    return fieldErrors;
}

export function setErrorResponse(res: Response, statusCode: number, fieldErrors = {}, formErrors: string[] = []) {
    res.status(statusCode).json({ success: false, data: { formErrors, fieldErrors } });
}

export function setSuccessResponse<T>(res: Response, data: T, statusCode = 200) {
    res.status(statusCode).json({ success: true, data });
}
