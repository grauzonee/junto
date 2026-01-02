import { NextFunction, Request, Response } from "express"
import { update as updateEvent } from "@/services/eventService";
import { getMockedRequest, getMockedResponse } from "../../utils";
import mongoose from "mongoose";
import { createFakeEvent } from "../../generators/event"
import { parseMongooseValidationError, setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";
import { update } from "@/requests/event/update";

jest.mock("@/services/eventService")
jest.mock("@/helpers/requestHelper")


let res: Partial<Response>;
const next = jest.fn() as NextFunction;
const mockEvent = { ...createFakeEvent(), toJSON: jest.fn().mockReturnThis() }
beforeEach(() => {
    jest.resetAllMocks();
    (updateEvent as jest.Mock).mockResolvedValue(mockEvent)
    res = getMockedResponse();

})

describe("update() SUCCESS", () => {
    it("Should call editEvent method", async () => {
        const editData = { title: "Updated Title" }
        const eventId = new mongoose.Types.ObjectId().toString();
        const req = getMockedRequest(editData, { eventId }, { user: { id: new mongoose.Types.ObjectId().toString() } });
        await update(req as Request, res as Response, next);
        expect(updateEvent).toHaveBeenCalledTimes(1);
        expect(updateEvent).toHaveBeenCalledWith(editData, eventId, req.user.id);
    })
    it("Should call setSuccessResponse method", async () => {
        const editData = { title: "Updated Title" }
        const eventId = new mongoose.Types.ObjectId().toString();
        const req = getMockedRequest(editData, { eventId }, { user: { id: new mongoose.Types.ObjectId().toString() } });
        await update(req as Request, res as Response, next);
        expect(setSuccessResponse).toHaveBeenCalledTimes(1);
        expect(setSuccessResponse).toHaveBeenCalledWith(res, mockEvent.toJSON());
    })
})
describe("update() FAIL", () => {
    it("Should return 400 in case of mongoose validation error", async () => {
        const validationError = new mongoose.Error.ValidationError();

        validationError.addError(
            "interests",
            new mongoose.Error.ValidatorError({
                message: "Interests field is not invalid",
                path: "interests",
                value: "badInterest",
            })
        );

        (updateEvent as jest.Mock).mockRejectedValue(validationError)
        const editData = { title: "Updated Title" }
        const eventId = new mongoose.Types.ObjectId().toString();
        const req = getMockedRequest(editData, { eventId }, { user: { id: new mongoose.Types.ObjectId().toString() } });
        await update(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(validationError)
    })
    it("Should return 500 in case of default error", async () => {
        (updateEvent as jest.Mock).mockRejectedValue(new Error())
        const editData = { title: "Updated Title" }
        const eventId = new mongoose.Types.ObjectId().toString();
        const req = getMockedRequest(editData, { eventId }, { user: { id: new mongoose.Types.ObjectId().toString() } });
        await update(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(new Error())
    })
})
