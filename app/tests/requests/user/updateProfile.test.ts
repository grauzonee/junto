import { getMockedRequest, getMockedResponse } from "../../utils"
import { updateProfile } from "@/requests/user/updateProfile";
import { NextFunction, Request, Response } from "express"
import { setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";
import { validateUpdateData } from "@/requests/user/utils"
import messages from "@/constants/errorMessages"
import mongoose from "mongoose";
import { parseMongooseValidationError } from "@/helpers/requestHelper";
import { BadInputError, EmptyBodyError } from "@/types/errors/InputError";

jest.mock("@/helpers/requestHelper")
jest.mock("@/requests/user/utils")

const res = getMockedResponse();
const username = "newUsername"
const next = jest.fn() as NextFunction;

beforeEach(() => {
    (validateUpdateData as jest.Mock).mockImplementation(() => {
        return {};
    });

})
describe("updateProfile() SUCCESS", () => {

    afterEach(() => {
        jest.resetAllMocks()
    })
    it("Should call 'validateUpdateData' function", async () => {
        const req = getMockedRequest({ username });

        await updateProfile(req as Request, res as Response, next);
        expect(validateUpdateData).toHaveBeenCalledTimes(1);
        expect(validateUpdateData).toHaveBeenCalledWith(req);
    })
    it("Should call 'updateProfile' function", async () => {
        const mockedUser = {
            updateProfile: jest.fn()
        }
        const req = getMockedRequest({ username }, {}, { user: mockedUser })
        await updateProfile(req as Request, res as Response, next);
        expect(mockedUser.updateProfile).toHaveBeenCalledTimes(1)
        expect(mockedUser.updateProfile).toHaveBeenCalledWith(req.body)
    })
    it("Should call 'setSuccessResponse' function", async () => {
        const mockedUser = {
            updateProfile: jest.fn().mockReturnThis(),
            toJSON: jest.fn()
        }
        const req = getMockedRequest({ username }, {}, { user: mockedUser })
        await updateProfile(req as Request, res as Response, next);
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(mockedUser.toJSON).toHaveBeenCalledTimes(1)

    })
})
describe("updateProfile() FAIL", () => {
    afterEach(() => {
        jest.resetAllMocks()
    })
    it("Should return 400 status code when request body is empty", async () => {
        const req = getMockedRequest(undefined);
        await updateProfile(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(new EmptyBodyError());
    })
    it("Should return 400 status code when validateUpdateData returns error", async () => {
        const returnError = { error: "New error", field: "username" };
        (validateUpdateData as jest.Mock).mockImplementation(() => {
            return returnError;
        });
        const req = getMockedRequest({ username });
        await updateProfile(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(new BadInputError(returnError.field, returnError.error));

    })
    it("Should return 500 in case of exception", async () => {

        const mockedUser = {
            updateProfile: jest.fn().mockImplementation(() => {
                throw new Error("Error")
            }),
        }
        const req = getMockedRequest({ username }, {}, { user: mockedUser })
        await updateProfile(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(new Error("Error"))
    })
    it("Should return 400 in case of mongoose validation exception", async () => {
        const validationError = new mongoose.Error.ValidationError();

        validationError.addError(
            "email",
            new mongoose.Error.ValidatorError({
                message: "Email is invalid",
                path: "email",
                value: "bad@email",
            })
        );
        const fieldErrors = parseMongooseValidationError(validationError);
        const mockedUser = {
            updateProfile: jest.fn().mockImplementation(() => {

                throw validationError;
            }),
        }
        const req = getMockedRequest({ username }, {}, { user: mockedUser })
        await updateProfile(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(validationError)
    })
})
