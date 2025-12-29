import { listEvents } from "@/services/eventService"
import { NextFunction, Request, Response } from "express";
import { setSuccessResponse } from "@/helpers/requestHelper"
import { list } from "@/requests/event/list"
import { getMockedRequest, getMockedResponse } from "../../utils"
jest.mock("@/helpers/requestHelper")
jest.mock("@/services/eventService")

const res = getMockedResponse();
const next = jest.fn() as NextFunction
const mockedEvent = {
    toJSON: jest.fn().mockReturnThis()
}
const result = [mockedEvent]
describe("list() SUCCESS", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        (listEvents as jest.Mock).mockResolvedValue(result)
    })
    it("Should call listEvents method", async () => {
        const req = getMockedRequest();
        await list(req as Request, res as Response, next);
        expect(listEvents).toHaveBeenCalledTimes(1)
        expect(listEvents).toHaveBeenCalledWith(req)
    })
    it("Should call setSuccessResponse method", async () => {
        const req = getMockedRequest();
        await list(req as Request, res as Response, next);
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(setSuccessResponse).toHaveBeenCalledWith(res, result.map(event => event.toJSON()))

    })
})
