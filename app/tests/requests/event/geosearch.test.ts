import { NextFunction } from "express"
import { ParsedQs } from "qs";
import { geoSearch as serviceGeoSearch } from "@/services/eventService";
import { createFakeEvent } from "../../generators/event"
import { setSuccessResponse } from "@/helpers/requestHelper";
import { getMockedRequest, getMockedResponse, MockedJsonDocument, withToJSON } from "../../utils";
import { geosearch } from "@/requests/event/geosearch";
import { ZodError } from "zod";
import { CoordinatesSchema } from "@/schemas/http/Event";
import { buildRequestData } from "@/requests/utils";
jest.mock("@/services/eventService")
jest.mock("@/helpers/requestHelper")
jest.mock("@/schemas/http/Event")

let res = getMockedResponse();
let mockEvent: MockedJsonDocument<Awaited<ReturnType<typeof createFakeEvent>>>;
let result: typeof mockEvent[] = [];
const next = jest.fn() as NextFunction;
const coordinates = {
    lat: 40.7128,
    lng: -74.006,
    radius: 3
};
const coordinateQuery = coordinates as unknown as ParsedQs;
beforeAll(async () => {
    const event = await createFakeEvent();
    mockEvent = withToJSON(event);
    result = [mockEvent, mockEvent];
});

beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(serviceGeoSearch).mockResolvedValue(result as never);
    jest.mocked(CoordinatesSchema.parse).mockReturnValue(coordinates);
    res = getMockedResponse();

})

describe("geosearch() SUCCESS", () => {
    it("Should call serviceGeoSearch method", async () => {
        const req = getMockedRequest({}, {}, { query: coordinateQuery });
        await geosearch(req, res, next);
        expect(serviceGeoSearch).toHaveBeenCalledTimes(1);
        expect(serviceGeoSearch).toHaveBeenCalledWith(coordinates, buildRequestData(req));
    })
    it("Should call setSuccessResponse method", async () => {
        const req = getMockedRequest();
        await geosearch(req, res, next);
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
        jest.mocked(serviceGeoSearch).mockRejectedValue(error)
        const req = getMockedRequest({}, {}, { query: coordinateQuery });
        await geosearch(req, res, next);
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(error);
    })
    it("Should return 500 in case of default error", async () => {
        const error = new Error("Geosearch failed");
        jest.mocked(serviceGeoSearch).mockRejectedValue(error)
        const req = getMockedRequest({}, {}, { query: coordinateQuery });
        await geosearch(req, res, next);
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(error);
    })
})
