import { getForEvent } from "@/services/RSVPService";
jest.mock("@/services/RSVPService");
import { createFakeRSVP } from "../../generators/rsvp";
import { getMockedRequest } from "../../utils";
import { listRsvps } from "@/requests/event/listRsvps";
import { NextFunction } from "express";
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
        (getForEvent as jest.Mock).mockResolvedValue(rsvps);
        const req = getMockedRequest({}, { eventId: "mockEventId" });
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        }
        await listRsvps(req as any, res as any, next);
        expect(getForEvent).toHaveBeenCalledWith("mockEventId");
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(setSuccessResponse).toHaveBeenCalledWith(res, rsvps.map(rsvp => rsvp.toJSON?.()))
    });

    it("Should call next with BadInputError if eventId is missing", async () => {
        const req = getMockedRequest();
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        }
        await listRsvps(req as any, res as any, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(new BadInputError("eventId", "Event ID is required"));
    });

    afterEach(async () => {
        await RSVP.deleteMany({});
    });
});