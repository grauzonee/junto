import { NextFunction, Request, Response } from "express"
import { geoSearch as serviceGeoSearch } from "@/services/eventService";
import { createFakeEvent } from "../../generators/event"
import { setSuccessResponse } from "@/helpers/requestHelper";
import { getMockedRequest, getMockedResponse } from "../../utils";
import { geosearch } from "@/requests/event/geosearch";
import { ZodError } from "zod";
import { CoordinatesSchema } from "@/schemas/http/Event";
import { buildRequestData } from "@/requests/utils";
jest.mock("@/services/eventService")
jest.mock("@/helpers/requestHelper")
jest.mock("@/schemas/http/Event")

let res: Partial<Response>;
type MockEvent = Awaited<ReturnType<typeof createFakeEvent>> & { toJSON(): unknown };
let mockEvent: MockEvent;
let result: typeof mockEvent[] = [];
const next = jest.fn() as NextFunction;
const coordinates = {
    lat: 40.7128,
    lng: -74.0060,
    radius: 3
};
beforeAll(async () => {
    const event = await createFakeEvent();
    mockEvent = { ...event, toJSON: jest.fn().mockReturnThis() } as MockEvent;
    result = [mockEvent, mockEvent];
});

beforeEach(() => {
    jest.resetAllMocks();
    (serviceGeoSearch as jest.Mock).mockResolvedValue(result);
    (CoordinatesSchema.parse as jest.Mock).mockReturnValue(coordinates);
    res = getMockedResponse();

})

describe("geosearch() SUCCESS", () => {
    it("Should call serviceGeoSearch method", async () => {
        const req = getMockedRequest({}, coordinates);
        await geosearch(req as Request, res as Response, next);
        expect(serviceGeoSearch).toHaveBeenCalledTimes(1);
        expect(serviceGeoSearch).toHaveBeenCalledWith(coordinates, buildRequestData(req as Request));
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
        const req = getMockedRequest({}, coordinates);
        await geosearch(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(error);
    })
    it("Should return 500 in case of default error", async () => {
        (serviceGeoSearch as jest.Mock).mockRejectedValue(new Error())
        const req = getMockedRequest({}, coordinates);
        await geosearch(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(new Error());
    })
})
