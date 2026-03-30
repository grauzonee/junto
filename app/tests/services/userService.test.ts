import { deleteUser } from "@/services/userService";
import { createUser } from "@tests/generators/user";
import { createFakeEvent } from "@tests/generators/event";
import { createFakeRSVP } from "@tests/generators/rsvp";
import { User } from "@/models/user/User";
import { Event } from "@/models/event/Event";
import { RSVP } from "@/models/rsvp/RSVP";
import { STATUS_CANCELED, STATUS_CONFIRMED } from "@/models/rsvp/utils";

describe("deleteUser()", () => {
    it("Should soft delete the user, cancel their RSVPs, and soft delete authored events", async () => {
        const author = await createUser({}, true);
        const attendee = await createUser({}, true);
        const otherAuthor = await createUser({}, true);

        const authoredEvent = await createFakeEvent({ author: author._id.toString() }, true);
        const otherEvent = await createFakeEvent({ author: otherAuthor._id.toString() }, true);
        const authoredEventDate = authoredEvent.date instanceof Date ? authoredEvent.date : new Date(authoredEvent.date * 1000);
        const otherEventDate = otherEvent.date instanceof Date ? otherEvent.date : new Date(otherEvent.date * 1000);

        await createFakeRSVP({
            event: authoredEvent._id,
            user: attendee._id,
            status: STATUS_CONFIRMED,
            eventDate: authoredEventDate
        }, true);
        await createFakeRSVP({
            event: otherEvent._id,
            user: author._id,
            status: STATUS_CONFIRMED,
            eventDate: otherEventDate
        }, true);

        await deleteUser(author._id.toString());

        const deletedUser = await User.findById(author._id);
        const deletedEvent = await Event.findById(authoredEvent._id);
        const authoredEventRsvps = await RSVP.find({ event: authoredEvent._id });
        const authorRsvpOnOtherEvent = await RSVP.findOne({ event: otherEvent._id, user: author._id });

        expect(deletedUser?.active).toBe(false);
        expect(deletedUser?.deletedAt).toBeInstanceOf(Date);
        expect(deletedEvent?.active).toBe(false);
        expect(deletedEvent?.deletedAt).toBeInstanceOf(Date);
        expect(authoredEventRsvps.length).toBeGreaterThan(0);
        expect(authoredEventRsvps.every(rsvp => rsvp.status === STATUS_CANCELED)).toBe(true);
        expect(authorRsvpOnOtherEvent?.status).toBe(STATUS_CANCELED);
    });
});
