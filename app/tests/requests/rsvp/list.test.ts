import { createFakeRSVP } from "@tests/generators/rsvp";
import { Request, Response } from "express";
import { getMockedRequest, getMockedResponse } from "../../utils";
import { list as listRSVPs } from "@/services/RSVPService";
import { list } from "@/requests/rsvp/list";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { buildRequestData } from "@/requests/utils";

jest.mock("@/services/RSVPService");
jest.mock("@/helpers/requestHelper");
jest.mock("@/requests/utils");

describe("list() success", () => {
    it("Should call listRSVPs method", async () => {
        const mockedRSVPs = await createFakeRSVP({}, false);
        (listRSVPs as jest.Mock).mockResolvedValue([mockedRSVPs]);
        (setSuccessResponse as jest.Mock).mockReturnValue(true);
        (buildRequestData as jest.Mock).mockReturnValue({ filters: {} });

        const req = getMockedRequest();
        const res = getMockedResponse();
        const next = jest.fn();
        await list(req as Request, res as Response, next)

        expect(listRSVPs).toHaveBeenCalledTimes(1);
        expect(setSuccessResponse).toHaveBeenCalledTimes(1);
    })
});