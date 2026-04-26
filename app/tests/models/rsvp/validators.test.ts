// Unmock validators before importing them for this test file
jest.unmock("@/models/rsvp/validators");

import { eventValidator, statusValidator } from "@/models/rsvp/validators";
import { Types } from "mongoose";
import { createFakeEvent } from "../../generators/event";
import { RSVP } from "@/models/rsvp/RSVP";
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { Event } from "@/models/event/Event";
import { createUser } from "@tests/generators/user";

function getSavedEventId(event: Awaited<ReturnType<typeof createFakeEvent>>) {
    if (!event._id) {
        throw new Error("Failed to create fake event");
    }

    return event._id;
}

async function createEventWithConfirmedAttendee(maxAttendees: number) {
    const event = await createFakeEvent({ maxAttendees }, true);
    const eventId = getSavedEventId(event);

    const firstAttendee = await createUser({}, true);
    const secondAttendee = await createUser({}, true);
    await RSVP.create({
        event: eventId,
        user: firstAttendee._id,
        status: STATUS_CONFIRMED,
        additionalGuests: 1,
        eventDate: event.date
    });

    return { event, eventId, secondAttendee };
}

describe("eventValidator", () => {
    it("Should return false for non existing event", async () => {
        const isValid = await eventValidator.call({}, new Types.ObjectId());
        expect(isValid).toBe(false);
    });

    it("Should return false for inactive event", async () => {
        const event = await createFakeEvent({}, true);
        const eventId = getSavedEventId(event);
        await Event.findByIdAndUpdate(eventId, { active: false });
        const isValid = await eventValidator.call({}, eventId);
        expect(isValid).toBe(false);
        await Event.findByIdAndDelete(eventId);
    });

    it("Should not count the event author toward max capacity", async () => {
        const author = await createUser({}, true);
        const event = await createFakeEvent({ author: author._id.toString(), maxAttendees: 1 }, true);
        const eventId = getSavedEventId(event);
        const attendee = await createUser({}, true);

        const isValid = await eventValidator.call({
            event: eventId,
            user: attendee._id,
            status: STATUS_CONFIRMED,
            additionalGuests: 0
        }, eventId);
        expect(isValid).toBe(true);
        await Event.findByIdAndDelete(eventId);
    });

    it("Should return false if additional guests put the event over max capacity", async () => {
        const { eventId, secondAttendee } = await createEventWithConfirmedAttendee(2);

        const isValid = await eventValidator.call({
            event: eventId,
            user: secondAttendee._id,
            status: STATUS_CONFIRMED,
            additionalGuests: 0
        }, eventId);
        expect(isValid).toBe(false);
        await Event.findByIdAndDelete(eventId);
    });

    it("Should return true for valid event", async () => {
        const { eventId, secondAttendee } = await createEventWithConfirmedAttendee(3);

        const isValid = await eventValidator.call({
            event: eventId,
            user: secondAttendee._id,
            status: STATUS_CONFIRMED,
            additionalGuests: 0
        }, eventId);
        expect(isValid).toBe(true);
        await Event.findByIdAndDelete(eventId);
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
