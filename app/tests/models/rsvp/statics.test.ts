import { RSVP } from "@/models/rsvp/RSVP";
import { createFakeRSVP } from "../../generators/rsvp";
import { Types } from "mongoose";
import { createFakeEvent } from "@tests/generators/event";
import { createUser } from "@tests/generators/user";
import { STATUS_CANCELED, STATUS_CONFIRMED, STATUS_MAYBE } from "@/models/rsvp/utils";

function getEventDate(eventDate: Date | number) {
    return eventDate instanceof Date ? eventDate : new Date(eventDate * 1000);
}

describe("isUserAttendingEvent() static method", () => {
    it("Should return RSVP if user is attending the event", async () => {
        const mockRSVP = await createFakeRSVP({}, true);
        if (!mockRSVP._id) {
            throw new Error("Mock RSVP must have an _id");
        }
        const foundRSVP = await RSVP.isUserAttendingEvent(mockRSVP.user.toString(), mockRSVP.event.toString());
        expect(foundRSVP).not.toBeNull();
        expect(foundRSVP?._id.toString()).toBe(mockRSVP._id.toString());
    });

    it("Should return null if user is not attending the event", async () => {
        const mockRSVP = await createFakeRSVP({}, true);
        const anotherUserId = new Types.ObjectId().toString();
        const foundRSVP = await RSVP.isUserAttendingEvent(anotherUserId, mockRSVP.event.toString());
        expect(foundRSVP).toBeNull();
    });

    afterEach(async () => {
        await RSVP.deleteMany({});
    });
});

describe("bulk cancellation static methods", () => {
    it("Should cancel all RSVPs for an event", async () => {
        const event = await createFakeEvent({}, true);
        const eventId = event._id;
        if (!eventId) {
            throw new Error("Expected saved event to have an _id");
        }
        const attendee = await createUser({}, true);
        await createFakeRSVP({
            event: eventId,
            user: attendee._id,
            status: STATUS_CONFIRMED,
            eventDate: getEventDate(event.date)
        }, true);

        await RSVP.cancelForEvent(eventId);

        const rsvps = await RSVP.find({ event: eventId });
        expect(rsvps.length).toBeGreaterThan(0);
        expect(rsvps.every(rsvp => rsvp.status === STATUS_CANCELED)).toBe(true);
    });

    it("Should cancel all RSVPs for a user", async () => {
        const user = await createUser({}, true);
        const event = await createFakeEvent({}, true);
        const otherEvent = await createFakeEvent({}, true);
        if (!event._id || !otherEvent._id) {
            throw new Error("Expected saved events to have an _id");
        }
        await createFakeRSVP({
            event: event._id,
            user: user._id,
            status: STATUS_CONFIRMED,
            eventDate: getEventDate(event.date)
        }, true);
        await createFakeRSVP({
            event: otherEvent._id,
            user: user._id,
            status: STATUS_MAYBE,
            eventDate: getEventDate(otherEvent.date)
        }, true);

        await RSVP.cancelForUser(user._id);

        const rsvps = await RSVP.find({ user: user._id });
        expect(rsvps.length).toBeGreaterThan(0);
        expect(rsvps.every(rsvp => rsvp.status === STATUS_CANCELED)).toBe(true);
    });

    afterEach(async () => {
        await RSVP.deleteMany({});
    });
});
