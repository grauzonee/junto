// Unmock validators before importing them for this test file
jest.unmock("@/models/rsvp/validators");

import { eventValidator, statusValidator } from "@/models/rsvp/validators";
import { Types } from "mongoose";
import { createFakeEvent } from "../../generators/event";
import { RSVP } from "@/models/rsvp/RSVP";
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { Event } from "@/models/event/Event";

describe("eventValidator", () => {
    it("Should return false for non existing event", async () => {
        const isValid = await eventValidator(new Types.ObjectId());
        expect(isValid).toBe(false);
    });

    it("Should return false for inactive event", async () => {
        const event = await createFakeEvent({}, true);
        if (!event._id) {
            throw new Error("Failed to create fake event");
        }
        await Event.findByIdAndUpdate(event._id, { active: false });
        const isValid = await eventValidator(event._id);
        expect(isValid).toBe(false);
        await Event.findByIdAndDelete(event._id);
    });

    it("Should return false if event is at max capacity", async () => {
        const event = await createFakeEvent({ maxAttendees: 2 }, true);
        if (!event._id) {
            throw new Error("Failed to create fake event");
        }
        const spy = jest.spyOn(RSVP, 'countDocuments').mockResolvedValue(2);

        const isValid = await eventValidator(event._id);
        expect(isValid).toBe(false);
        spy.mockRestore();
        await Event.findByIdAndDelete(event._id);
    });

    it("Should return true for valid event", async () => {
        const event = await createFakeEvent({ maxAttendees: 5 }, true);
        if (!event._id) {
            throw new Error("Failed to create fake event");
        }
        const spy = jest.spyOn(RSVP, 'countDocuments').mockResolvedValue(3);

        const isValid = await eventValidator(event._id);
        expect(isValid).toBe(true);
        await Event.findByIdAndDelete(event._id);
        spy.mockRestore();
    });

    afterAll(async () => {
        await RSVP.deleteMany({});
    });
});

describe("statusValidator", () => {
    it("Should return true for valid status", () => {
        const isValid = statusValidator(STATUS_CONFIRMED);
        expect(isValid).toBe(true);
    });

    it("Should return false for invalid status", () => {
        const isValid = statusValidator("invalid_status");
        expect(isValid).toBe(false);
    });
});
