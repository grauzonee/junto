import { createFakeRSVP } from "../../generators/rsvp";
import { STATUS_CONFIRMED, STATUS_CANCELED } from "@/models/rsvp/utils";
import { BadInputError } from "@/types/errors/InputError";
import { RSVP } from "@/models/rsvp/RSVP";
import messages from "@/constants/errorMessages"
import { setStatus } from "@/models/rsvp/methods";

describe("setStatus() method", () => {
    it("Should set valid status", async () => {
        const rsvp = await createFakeRSVP({}, true);
        if (typeof rsvp.setStatus !== 'function') {
            throw new TypeError("setStatus method not found on RSVP");
        }
        rsvp.setStatus(STATUS_CONFIRMED);
        expect(rsvp.status).toBe(STATUS_CONFIRMED);
    })

    it("Should throw error for invalid status", async () => {
        const rsvp = await createFakeRSVP({}, true);
        rsvp.event = { author: rsvp.user } as never;
        rsvp.populate = jest.fn();
        if (typeof rsvp.setStatus !== 'function') {
            throw new TypeError("setStatus method not found on RSVP");
        }
        try {
            await rsvp.setStatus("somestatus");
        } catch (error) {
            expect(error).toBeInstanceOf(BadInputError);
            expect((error as BadInputError).message).toBe(messages.validation.NOT_CORRECT("Rsvp status"));
        }
    })

    it("Should throw error if event author tries to set status other than confirmed", async () => {
        const rsvp = await createFakeRSVP({}, true);
        rsvp.populate = jest.fn();
        jest.spyOn(rsvp, 'event', 'get').mockReturnValue({ author: rsvp.user } as never);
        if (typeof rsvp.setStatus !== 'function') {
            throw new TypeError("setStatus method not found on RSVP");
        }
        try {
            await setStatus.call(rsvp as never, STATUS_CANCELED);
        } catch (error) {
            expect(error).toBeInstanceOf(BadInputError);
            expect((error as BadInputError).message).toBe(messages.validation.CANNOT_MODIFY("Event authors RSVP status"));
        }
    })

    afterEach(async () => {
        await RSVP.deleteMany({});
    })
})
