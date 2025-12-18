import { parseMongooseValidationError, setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";
import mongoose from "mongoose"
import messages from "@/constants/errorMessages"
import { getMockedResponse } from "../utils";
import { Response } from "express";

describe("parseMongooseValidationError() tests", () => {
    it("Should convert mongoose ValidationError to [field: message] record", () => {
        const validationError = new mongoose.Error.ValidationError();
        
        validationError.addError(
            "interests",
            new mongoose.Error.ValidatorError({
                message: messages.validation.NOT_CORRECT("interests"),
                path: "interests",
                value: "badInterest",
            })
        );
        validationError.addError(
            "username",
            new mongoose.Error.ValidatorError({
                message: messages.validation.NOT_CORRECT("username"),
                path: "username",
                value: "badInterest",
            })
        );
        const parsedErrors = parseMongooseValidationError(validationError);
        expect(parsedErrors).toMatchObject({
            "interests": [messages.validation.NOT_CORRECT("interests")],
            "username": [messages.validation.NOT_CORRECT("username")]
        })

    })

    it("Should return empty object if no errors set", () => {
        const validationError = new mongoose.Error.ValidationError();
        
        const parsedErrors = parseMongooseValidationError(validationError);
        expect(parsedErrors).toMatchObject({})

    })
})

describe("setErrorResponse() test", () => {
    it("Should call status() and json() methods with provided values", () => {
        const res = getMockedResponse()
        const statusCode = 400;
        const fieldErrors = {
            "interests": [messages.validation.NOT_CORRECT("interests")],
        }
        const formErrors = ["Invalid form"];
        setErrorResponse(res as Response, statusCode, fieldErrors, formErrors)
        expect(res.status).toHaveBeenCalledWith(statusCode);
        expect(res.json).toHaveBeenCalledWith({success: false, data: {formErrors, fieldErrors}});
    })
})
describe("setSuccessResponse() test", () => {
    it("Should call status() and json() methods with provided values", () => {
        const res = getMockedResponse()
        const statusCode = 201;
        const data = {
            "interests": ["interest1"],
        }
        const formErrors = ["Invalid form"];
        setSuccessResponse(res as Response, data, statusCode)
        expect(res.status).toHaveBeenCalledWith(statusCode);
        expect(res.json).toHaveBeenCalledWith({success: true, data});
    })
})