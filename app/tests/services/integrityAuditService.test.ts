import { Types } from "mongoose";
import { auditIntegrity } from "@/services/integrityAuditService";
import { deleteUser } from "@/services/userService";
import { createUser } from "@tests/generators/user";
import { createFakeEvent } from "@tests/generators/event";
import { createFakeRSVP } from "@tests/generators/rsvp";
import { Category } from "@/models/category/Category";
import { Interest } from "@/models/Interest";
import { User } from "@/models/user/User";
import { Event } from "@/models/event/Event";
import { RSVP } from "@/models/rsvp/RSVP";
import { STATUS_CANCELED, STATUS_CONFIRMED } from "@/models/rsvp/utils";

async function createEventWithAttendeeRsvp() {
    const author = await createUser({}, true);
    const attendee = await createUser({}, true);
    const event = await createFakeEvent({ author: author._id.toString() }, true);
    if (!event._id) {
        throw new Error("Expected saved event to have an _id");
    }

    const rsvp = await createFakeRSVP({
        event: event._id,
        user: attendee._id,
        status: STATUS_CONFIRMED,
        eventDate: event.date instanceof Date ? event.date : new Date(event.date * 1000)
    }, true);
    if (!rsvp._id) {
        throw new Error("Expected saved RSVP to have an _id");
    }

    return {
        author,
        attendee,
        event,
        rsvp,
        eventId: event._id.toString(),
        rsvpId: rsvp._id.toString()
    };
}

describe("auditIntegrity()", () => {
    it("Should report and fix dangling taxonomy references", async () => {
        const interest = await Interest.create({ title: `Audit interest ${Date.now()}` });
        const user = await createUser({ interests: [interest._id] }, true);
        const category = await Category.create({ title: `Audit category ${Date.now()}` });
        const event = await createFakeEvent({ categories: [category._id.toString()] }, true);
        if (!event._id) {
            throw new Error("Expected saved event to have an _id");
        }
        const child = await Category.create({ title: `Audit child ${Date.now()}` });
        const missingParentId = new Types.ObjectId();
        await Category.updateOne({ _id: child._id }, { parent: missingParentId });

        await Interest.collection.deleteOne({ _id: interest._id });
        await Category.collection.deleteOne({ _id: category._id });

        const report = await auditIntegrity();
        expect(report.eventsWithMissingCategories).toEqual([
            { eventId: event._id.toString(), missingCategoryIds: [category._id.toString()] }
        ]);
        expect(report.usersWithMissingInterests).toEqual([
            { userId: user._id.toString(), missingInterestIds: [interest._id.toString()] }
        ]);
        expect(report.danglingCategoryParents).toContain(child._id.toString());

        await auditIntegrity({ fix: true });

        const updatedEvent = await Event.findById(event._id);
        const updatedUser = await User.findById(user._id);
        const updatedChild = await Category.findById(child._id);

        expect(updatedEvent?.categories).toEqual([]);
        expect(updatedUser?.interests).toEqual([]);
        expect(updatedChild?.parent).toBeNull();
    });

    it("Should report and fix invalid authors and RSVP users", async () => {
        const { author, attendee, eventId, rsvpId } = await createEventWithAttendeeRsvp();

        await User.collection.deleteOne({ _id: author._id });
        await User.collection.deleteOne({ _id: attendee._id });

        const report = await auditIntegrity();
        expect(report.invalidEventAuthors).toContain(eventId);
        expect(report.invalidRsvpUsers).toContain(rsvpId);

        await auditIntegrity({ fix: true });

        const updatedEvent = await Event.findById(eventId);
        const deletedRsvp = await RSVP.findById(rsvpId);

        expect(updatedEvent?.active).toBe(false);
        expect(deletedRsvp).toBeNull();
    });

    it("Should ignore canceled RSVPs for soft-deleted users", async () => {
        const { attendee, rsvpId } = await createEventWithAttendeeRsvp();

        await deleteUser(attendee._id.toString());

        const updatedRsvp = await RSVP.findById(rsvpId);
        expect(updatedRsvp?.status).toBe(STATUS_CANCELED);

        const report = await auditIntegrity();
        expect(report.invalidRsvpUsers).not.toContain(rsvpId);
    });
});
