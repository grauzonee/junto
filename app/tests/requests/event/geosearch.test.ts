import { NextFunction, Request, Response } from "express"
import { geoSearch as serviceGeoSearch } from "@/services/eventService";
import { createFakeEvent } from "../../generators/event"
import { setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";
import messages from "@/constants/errorMessages"
import * as z from "zod"
import { getMockedRequest, getMockedResponse } from "../../utils";
import { geosearch } from "@/requests/event/geosearch";
import { ZodError } from "zod";
jest.mock("@/services/eventService")
jest.mock("@/helpers/requestHelper")

let res: Partial<Response>;
const mockEvent = { ...createFakeEvent(), toJSON: jest.fn().mockReturnThis() }
const result = [mockEvent, mockEvent];
const next = jest.fn() as NextFunction;
beforeEach(() => {
    jest.resetAllMocks();
    (serviceGeoSearch as jest.Mock).mockResolvedValue(result)
    res = getMockedResponse();

})

describe("geosearch() SUCCESS", () => {
    it("Should call serviceGeoSearch method", async () => {
        const req = getMockedRequest();
        await geosearch(req as Request, res as Response, next);
        expect(serviceGeoSearch).toHaveBeenCalledTimes(1);
        expect(serviceGeoSearch).toHaveBeenCalledWith(req);
    })
    it("Should call setSuccessResponse method", async () => {
        const req = getMockedRequest();
        await geosearch(req as Request, res as Response, next);
        expect(setSuccessResponse).toHaveBeenCalledTimes(1);
        expect(setSuccessResponse).toHaveBeenCalledWith(res, result.map(event => event.toJSON()));
    })
})
describe("geosearch() FAIL", () => {
    it("Should return 400 in case of ZodError", async () => {
        const error = new ZodError([
            {
                code: "custom",
                message: "Invalid lng",
                path: ["lng"],
            },
        ]);
        (serviceGeoSearch as jest.Mock).mockRejectedValue(error)
        const req = getMockedRequest();
        await geosearch(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(error);
    })
    it("Should return 500 in case of default error", async () => {
        (serviceGeoSearch as jest.Mock).mockRejectedValue(new Error())
        const req = getMockedRequest();
        await geosearch(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(new Error());
    })
})
