import { NextFunction, Request, Response } from "express"
import { update as updateEvent } from "@/services/eventService";
import { getMockedRequest, getMockedResponse, MockedJsonDocument, withToJSON } from "../../utils";
import mongoose from "mongoose";
import { createFakeEvent } from "../../generators/event"
import { setSuccessResponse } from "@/helpers/requestHelper";
import { update } from "@/requests/event/update";

jest.mock("@/services/eventService")
jest.mock("@/helpers/requestHelper")


let res: Partial<Response>;
const next = jest.fn() as NextFunction;
let mockEvent: MockedJsonDocument<Awaited<ReturnType<typeof createFakeEvent>>>;
beforeAll(async () => {
    const event = await createFakeEvent();
    mockEvent = withToJSON(event);
})
beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(updateEvent).mockResolvedValue(mockEvent as never)
    res = getMockedResponse();

})

describe("update() SUCCESS", () => {
    it("Should call editEvent method", async () => {
        const editData = { title: "Updated Title" }
        const eventId = new mongoose.Types.ObjectId().toString();
        const userId = new mongoose.Types.ObjectId().toString();
        const req = getMockedRequest(editData, { eventId }, { user: { id: userId } });
        await update(req as Request, res as Response, next);
        expect(updateEvent).toHaveBeenCalledTimes(1);
        expect(updateEvent).toHaveBeenCalledWith(editData, eventId, userId);
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

        jest.mocked(updateEvent).mockRejectedValue(validationError)
        const editData = { title: "Updated Title" }
        const eventId = new mongoose.Types.ObjectId().toString();
        const req = getMockedRequest(editData, { eventId }, { user: { id: new mongoose.Types.ObjectId().toString() } });
        await update(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(validationError)
    })
    it("Should return 500 in case of default error", async () => {
        const error = new Error();
        jest.mocked(updateEvent).mockRejectedValue(error)
        const editData = { title: "Updated Title" }
        const eventId = new mongoose.Types.ObjectId().toString();
        const req = getMockedRequest(editData, { eventId }, { user: { id: new mongoose.Types.ObjectId().toString() } });
        await update(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(error)
    })
})
