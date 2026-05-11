import { fetchOne } from "@/requests/event/fetchOne";
import { getMockedResponse, getMockedRequest } from "@tests/utils";
import { fetchOneWithCapacity } from "@/services/eventService";
import { Types } from "mongoose";
import { NextFunction } from "express";
import { setSuccessResponse } from "@/helpers/requestHelper"
jest.mock("@/helpers/requestHelper")
jest.mock("@/services/eventService")

const res = getMockedResponse();
const next = jest.fn() as NextFunction
const mockedEvent = {
    toJSON: jest.fn().mockReturnValue({
        _id: "event-id",
        maxAttendees: 10,
        title: "title"
    })
}
const result = {
    event: mockedEvent,
    capacity: {
        maxAttendees: 10,
        confirmedAttendanceTotal: 3,
        remainingSeats: 7
    }
}
describe("fetchOne()", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        (fetchOneWithCapacity as jest.Mock).mockResolvedValue(result)
    })
    it("Should call fetchOne method", async () => {
        const eventId = new Types.ObjectId().toString();
        const req = getMockedRequest({}, { eventId });

        await fetchOne(req, res, next);
        expect(fetchOneWithCapacity).toHaveBeenCalledTimes(1)
        expect(fetchOneWithCapacity).toHaveBeenCalledWith(eventId);
    })
    it("Should call setSuccessResponse method", async () => {
        const req = getMockedRequest({}, { eventId: "event-id" });
        await fetchOne(req, res, next);
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(setSuccessResponse).toHaveBeenCalledWith(res, {
            _id: "event-id",
            title: "title",
            capacity: result.capacity
        })
    })
})
