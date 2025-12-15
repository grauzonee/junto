import { create } from "@/requests/event/create"
import { getMockedRequest, getMockedResponse } from "../../utils"
import messages from "@/constants/errorMessages"
import { parseMongooseValidationError } from "@/helpers/requestHelper"
import mongoose from "mongoose"
import { Request, Response } from "express"
import { insertEvent } from "@/services/eventService"
import { createFakeEvent } from "../../generators/event"
import { setSuccessResponse, setErrorResponse } from "@/helpers/requestHelper"
jest.mock("@/services/eventService")
jest.mock("@/helpers/requestHelper")

let res: Partial<Response>;
const mockEvent = { ...createFakeEvent(), toJSON: jest.fn().mockReturnThis() }
const newEvent = createFakeEvent();
beforeEach(() => {
    jest.resetAllMocks();
    (insertEvent as jest.Mock).mockResolvedValue(mockEvent)
    res = getMockedResponse();

})
describe("create() SUCCESS", () => {
    it("Should call insertEvent function", async () => {
        const req = getMockedRequest({ ...newEvent });
        await create(req as Request, res as Response)
        expect(insertEvent).toHaveBeenCalledTimes(1)
        expect(insertEvent).toHaveBeenCalledWith(req)
    })
    it("Should call setSuccessResponse function", async () => {
        const req = getMockedRequest({ ...newEvent });
        await create(req as Request, res as Response)
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(setSuccessResponse).toHaveBeenCalledWith(res, mockEvent.toJSON(), 201)

    })
})
describe("create() FAIL", () => {

    it("Should return 400 on mongoose validation error", async () => {
        const validationError = new mongoose.Error.ValidationError();

        validationError.addError(
            "interests",
            new mongoose.Error.ValidatorError({
                message: "Interests field is not invalid",
                path: "interests",
                value: "badInterest",
            })
        );
        const fieldErrors = parseMongooseValidationError(validationError);
        (insertEvent as jest.Mock).mockRejectedValue(validationError)
        const req = getMockedRequest({ ...newEvent });
        await create(req as Request, res as Response)
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 400, fieldErrors)

    })
    it("Should return 500 on default error", async () => {


        (insertEvent as jest.Mock).mockRejectedValue(new Error())
        const req = getMockedRequest({ ...newEvent });
        await create(req as Request, res as Response)
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 500, [],
            [messages.response.SERVER_ERROR("creating event")]
        )
    })
})
