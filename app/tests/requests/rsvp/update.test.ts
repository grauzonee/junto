import { update } from "@/requests/rsvp/update";
import { update as updateRSVP } from "@/services/RSVPService";
import { UpdateRSVPSchema } from "@/schemas/http/RSVP";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { getMockedRequest, getMockedResponse, withToJSON } from "../../utils";
import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";

jest.mock("@/services/RSVPService");
jest.mock("@/helpers/requestHelper");
jest.mock("@/schemas/http/RSVP");

const next = jest.fn() as NextFunction;

beforeEach(() => {
    jest.resetAllMocks();
});

describe("update() request handler", () => {
    it("Should parse request data, call updateRSVP, and return the updated RSVP", async () => {
        const rsvpId = new Types.ObjectId().toString();
        const userId = new Types.ObjectId().toString();
        const requestBody = {
            status: STATUS_CONFIRMED,
            additionalGuests: 2
        };
        const parsedBody = {
            status: STATUS_CONFIRMED,
            additionalGuests: 2
        };
        const updatedRSVP = withToJSON({
            _id: rsvpId,
            status: STATUS_CONFIRMED,
            additionalGuests: 2
        });
        jest.mocked(UpdateRSVPSchema.parse).mockReturnValue(parsedBody);
        jest.mocked(updateRSVP).mockResolvedValue(updatedRSVP as never);

        const req = getMockedRequest(requestBody, { rsvpId }, { user: { id: userId } });
        const res = getMockedResponse();

        await update(req as Request, res as Response, next);

        expect(UpdateRSVPSchema.parse).toHaveBeenCalledTimes(1);
        expect(UpdateRSVPSchema.parse).toHaveBeenCalledWith(requestBody);
        expect(updateRSVP).toHaveBeenCalledTimes(1);
        expect(updateRSVP).toHaveBeenCalledWith(parsedBody, rsvpId, userId);
        expect(setSuccessResponse).toHaveBeenCalledTimes(1);
        expect(setSuccessResponse).toHaveBeenCalledWith(res, updatedRSVP.toJSON(), 200);
        expect(next).not.toHaveBeenCalled();
    });

    it("Should forward service errors to next", async () => {
        const error = new Error("Update failed");
        const rsvpId = new Types.ObjectId().toString();
        const userId = new Types.ObjectId().toString();
        const parsedBody = { status: STATUS_CONFIRMED };
        jest.mocked(UpdateRSVPSchema.parse).mockReturnValue(parsedBody);
        jest.mocked(updateRSVP).mockRejectedValue(error);

        const req = getMockedRequest(parsedBody, { rsvpId }, { user: { id: userId } });
        const res = getMockedResponse();

        await update(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(error);
        expect(setSuccessResponse).not.toHaveBeenCalled();
    });
});
