import { Request, Response } from "express";
import { EmptyBodyError, NotFoundError } from "@/types/errors/InputError";
import { parseMongooseValidationError } from "@/helpers/requestHelper";
import mongoose from "mongoose";
import messages from "@/constants/errorMessages"
import { ZodError } from "zod";
import { BadInputError } from "@/types/errors/InputError";
import { errorHandler } from "@/middlewares/errorHandler";
import { getMockedRequest, getMockedResponse } from "../utils";

describe("errorHandler middleware", () => {
    it("Should return status 404 in NotFoundError", () => {
        const req = getMockedRequest();
        const res = getMockedResponse();
        const err = new NotFoundError("resource");
        errorHandler(err, req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            data: {
                formErrors: [err.message],
                fieldErrors: {}
            },
        });
    });

    it("Should return status 400 in BadInputError", () => {
        const req = getMockedRequest();
        const res = getMockedResponse();
        const err = new BadInputError("field", "Invalid field");
        errorHandler(err, req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            data: {
                formErrors: [],
                fieldErrors: { field: "Invalid field" }
            },
        });
    });

    it("Should return status 400 in Mongoose ValidationError", () => {
        const req = getMockedRequest();
        const res = getMockedResponse();
        const validationError = new mongoose.Error.ValidationError();

        validationError.addError(
            "email",
            new mongoose.Error.ValidatorError({
                message: "Email is invalid",
                path: "email",
                value: "bad@email",
            })
        );
        const parsedError = parseMongooseValidationError(validationError);
        errorHandler(validationError, req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            data: {
                formErrors: [],
                fieldErrors: parsedError
            },
        });
    });

    it("Should return status 400 in ZodError", () => {
        const req = getMockedRequest();
        const res = getMockedResponse();
        const zodError = new ZodError([{
            code: "invalid_type",
            expected: "string",
            path: ["field"],
            message: "Invalid field"
        }]);
        errorHandler(zodError, req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            data: {
                formErrors: [],
                fieldErrors: { field: ["Invalid field"] }
            },
        });
    });

    it("Should return status 500 in generic Error", () => {
        const req = getMockedRequest();
        const res = getMockedResponse();
        const err = new Error("Server error");
        errorHandler(err, req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            data: {
                formErrors: [messages.response.SERVER_ERROR()],
                fieldErrors: {}
            }
        });
    });

    it("Should return status 400 on EmptyBodyError", () => {
        const req = getMockedRequest();
        const res = getMockedResponse();
        const err = new EmptyBodyError();
        errorHandler(err, req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            data: {
                formErrors: [err.message],
                fieldErrors: {}
            },
        });
    });
})