import { fetchOne } from "@/requests/event/fetchOne";
import { getMockedResponse, getMockedRequest } from "@tests/utils";
import { fetchOne as fetchOneEvent } from "@/services/eventService";
import { Types } from "mongoose";
import { NextFunction } from "express";
import { setSuccessResponse } from "@/helpers/requestHelper"
jest.mock("@/helpers/requestHelper")
jest.mock("@/services/eventService")

const res = getMockedResponse();
const next = jest.fn() as NextFunction
const mockedEvent = {
    toJSON: jest.fn().mockReturnThis()
}
const result = mockedEvent
describe("fetchOne()", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        (fetchOneEvent as jest.Mock).mockResolvedValue(result)
    })
    it("Should call fetchOne method", async () => {
        const eventId = new Types.ObjectId().toString();
        const req = getMockedRequest({}, { eventId });

        await fetchOne(req, res, next);
        expect(fetchOneEvent).toHaveBeenCalledTimes(1)
        expect(fetchOneEvent).toHaveBeenCalledWith(eventId);
    })
    it("Should call setSuccessResponse method", async () => {
        const req = getMockedRequest();
        await fetchOne(req, res, next);
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(setSuccessResponse).toHaveBeenCalledWith(res, mockedEvent.toJSON())

    })
})
