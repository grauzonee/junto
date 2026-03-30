import { getForEvent } from "@/services/RSVPService";
jest.mock("@/services/RSVPService");
import { createFakeRSVP } from "../../generators/rsvp";
import { getMockedRequest, getMockedResponse } from "../../utils";
import { listRsvps } from "@/requests/event/listRsvps";
import { NextFunction, Request, Response } from "express";
import { RSVP } from "@/models/rsvp/RSVP";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { BadInputError } from "@/types/errors/InputError";
jest.mock("@/helpers/requestHelper")

const next = jest.fn() as NextFunction

describe("listRsvps() success", () => {
    it("Should return list of RSVPs for the event", async () => {
        const rsvps = [
            await createFakeRSVP({ toJSON: jest.fn() }),
            await createFakeRSVP({ toJSON: jest.fn() })
        ];
        jest.mocked(getForEvent).mockResolvedValue(rsvps as never);
        const req = getMockedRequest({}, { eventId: "mockEventId" });
        const res = getMockedResponse();
        await listRsvps(req as Request, res as Response, next);
        expect(getForEvent).toHaveBeenCalledWith("mockEventId");
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(setSuccessResponse).toHaveBeenCalledWith(res, { total: 2, entities: rsvps.map(rsvp => rsvp.toJSON?.()) });
    });

    it("Should call next with BadInputError if eventId is missing", async () => {
        const req = getMockedRequest();
        const res = getMockedResponse();
        await listRsvps(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(new BadInputError("eventId", "Event ID is required"));
    });

    afterEach(async () => {
        await RSVP.deleteMany({});
    });
});
