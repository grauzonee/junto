import { ensureAuthorRsvp, syncRsvpEventDates } from "@/models/rsvp/cascade";
import { RSVP } from "@/models/rsvp/RSVP";
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { createFakeEvent } from "@tests/generators/event";
import { createFakeRSVP } from "@tests/generators/rsvp";
import { createUser } from "@tests/generators/user";

function getEventDate(eventDate: Date | number) {
    return eventDate instanceof Date ? eventDate : new Date(eventDate * 1000);
}

describe("RSVP cascade helpers", () => {
    it("Should create the author RSVP once", async () => {
        const author = await createUser({}, true);
        const event = await createFakeEvent({ author: author._id.toString() }, true);
        const eventId = event._id;
        if (!eventId) {
            throw new Error("Expected saved event to have an _id");
        }
        const eventDate = getEventDate(event.date);
        await RSVP.deleteOne({ event: eventId, user: author._id });

        const firstRsvp = await ensureAuthorRsvp({
            _id: eventId,
            author: author._id,
            date: eventDate
        });
        const secondRsvp = await ensureAuthorRsvp({
            _id: eventId,
            author: author._id,
            date: eventDate
        });

        const authorRsvps = await RSVP.find({ event: eventId, user: author._id });
        expect(firstRsvp?._id.toString()).toBe(secondRsvp?._id.toString());
        expect(authorRsvps).toHaveLength(1);
        expect(authorRsvps[0].status).toBe(STATUS_CONFIRMED);
        expect(authorRsvps[0].eventDate.getTime()).toBe(eventDate.getTime());
    });

    it("Should synchronize RSVP event dates for an event", async () => {
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
        const updatedDate = new Date(Date.now() + 3 * 60 * 60 * 1000);

        await syncRsvpEventDates(eventId, updatedDate);

        const rsvps = await RSVP.find({ event: eventId });
        expect(rsvps.length).toBeGreaterThan(0);
        expect(rsvps.every(rsvp => rsvp.eventDate.getTime() === updatedDate.getTime())).toBe(true);
    });
});
