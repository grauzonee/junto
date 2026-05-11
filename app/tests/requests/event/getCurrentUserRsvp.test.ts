import { NextFunction } from "express";
import { getMockedRequest, getMockedResponse } from "@tests/utils";
import { getCurrentUserRsvp } from "@/requests/event/getCurrentUserRsvp";
import { getForCurrentUser } from "@/services/RSVPService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { createFakeRSVP } from "../../generators/rsvp";
import { BadInputError } from "@/types/errors/InputError";
import { RSVP } from "@/models/rsvp/RSVP";

jest.mock("@/services/RSVPService");
jest.mock("@/helpers/requestHelper");

const next = jest.fn() as NextFunction;

describe("getCurrentUserRsvp() success", () => {
    it("Should return the current user's RSVP for the event", async () => {
        const response = {
            _id: "rsvp-id",
            event: "event-id",
            user: "current-user-id",
            status: "confirmed"
        };
        const rsvp = await createFakeRSVP({}, true);
        jest.spyOn(rsvp, "toJSON").mockReturnValue(response);
        jest.mocked(getForCurrentUser).mockResolvedValue(rsvp);

        const req = getMockedRequest({}, { eventId: "mockEventId" }, {
            user: { _id: "current-user-id" }
        });
        const res = getMockedResponse();

        await getCurrentUserRsvp(req, res, next);

        expect(getForCurrentUser).toHaveBeenCalledWith("mockEventId", "current-user-id");
        expect(setSuccessResponse).toHaveBeenCalledWith(res, response);
    });

    it("Should return null when the user has no RSVP", async () => {
        jest.mocked(getForCurrentUser).mockResolvedValue(null);

        const req = getMockedRequest({}, { eventId: "mockEventId" }, {
            user: { _id: "current-user-id" }
        });
        const res = getMockedResponse();

        await getCurrentUserRsvp(req, res, next);

        expect(setSuccessResponse).toHaveBeenCalledWith(res, null);
    });

    it("Should call next with BadInputError if eventId is missing", async () => {
        const req = getMockedRequest({}, {});
        const res = getMockedResponse();

        await getCurrentUserRsvp(req, res, next);

        expect(next).toHaveBeenCalledWith(new BadInputError("eventId", "Event ID is required"));
    });

    afterEach(async () => {
        await RSVP.deleteMany({});
    });
});
