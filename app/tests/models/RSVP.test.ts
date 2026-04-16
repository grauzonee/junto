jest.unmock("@/models/rsvp/validators");

import { RSVP } from "@/models/rsvp/RSVP"
import { STATUS_CONFIRMED } from "@/models/rsvp/utils"
import { createUser } from "@tests/generators/user"
import { createFakeEvent } from "@tests/generators/event"

async function createUserAndEvent() {
    const user = await createUser({}, true);
    const event = await createFakeEvent({}, true);
    const eventId = event._id;
    if (!eventId) {
        throw new Error("No user/event found, check your seeders");
    }
    return { user, event, eventId };
}

describe("RSVP model", () => {
    it("Should save RSVP with valid status", async () => {
        const { user, event, eventId } = await createUserAndEvent();
        const rsvp = await RSVP.create({ user: user.id, event: eventId, status: STATUS_CONFIRMED, eventDate: event.date })

        expect(rsvp).toBeDefined();
        expect(rsvp.user.toString()).toBe(user.id.toString());
        expect(rsvp.event.toString()).toBe(eventId.toString());
        expect(rsvp.status).toBe(STATUS_CONFIRMED);
    })

    it("Should return an RSVP if user is attending an event", async () => {
        const { user, event, eventId } = await createUserAndEvent();
        const newRsvp = {
            user: user._id,
            event: eventId,
            status: STATUS_CONFIRMED,
            additionalGuests: 0,
            eventDate: event.date
        };
        const rsvp = await RSVP.create(newRsvp);
        if (!rsvp) {
            throw new Error("RSVP was not created");
        }
        const result = await RSVP.isUserAttendingEvent(user._id.toString(), eventId.toString());
        if (!result) {
            throw new Error("RSVP was not found");
        }
        expect(result).not.toBeNull();
        expect(result.user.toString()).toBe(user._id.toString())
        expect(result.event.toString()).toBe(eventId.toString())
        expect(result.status).toBe(STATUS_CONFIRMED);
    })
    it("Should return null if user is not attending an event", async () => {
        await RSVP.deleteMany();
        const { user, eventId } = await createUserAndEvent();

        const result = await RSVP.isUserAttendingEvent(user._id.toString(), eventId.toString());
        expect(result).toBeNull();
    })
})
