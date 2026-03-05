import { RSVP } from "@/models/rsvp/RSVP"
import { STATUS_CANCELED, STATUS_CONFIRMED } from "@/models/rsvp/utils"
import { Types, Error } from "mongoose"
import messages from "@/constants/errorMessages"
import { parseMongooseValidationError } from "@/helpers/requestHelper"
import { getOneEvent, getOneUser } from "@tests/getters"
import { createUser } from "@tests/generators/user"
import { createFakeEvent } from "@tests/generators/event"

async function createUserAndEvent() {
    const user = await createUser({}, true);
    const event = await createFakeEvent({}, true);
    if (!user || !event || !event._id) {
        throw new Error("No user/event found, check your seeders");
    }
    return { user, event };
}

describe("RSVP model", () => {
    it("Should save RSVP with valid status", async () => {
        const { user, event } = await createUserAndEvent();
        const rsvp = await RSVP.create({ user: user.id, event: event._id, status: STATUS_CONFIRMED })

        expect(rsvp).toBeDefined();
        expect(rsvp.user.toString()).toBe(user.id.toString());
        expect(rsvp.event.toString()).toBe(event._id!.toString());
        expect(rsvp.status).toBe(STATUS_CONFIRMED);
    })

    it("Should not save RSVP with invalid status", async () => {
        const { user, event } = await createUserAndEvent();
        try {
            await RSVP.create({ user: user.id, event: event._id, status: "going" })
        } catch (error) {
            expect(error).toBeInstanceOf(Error.ValidationError);
            const parsedError = parseMongooseValidationError(error as Error.ValidationError);
            expect(parsedError).toHaveProperty('status')
            expect(parsedError.status).toEqual([messages.validation.NOT_CORRECT("Rsvp status")])

            const rsvp = await RSVP.find({ user: user.id, event: event._id });
            expect(rsvp.length).toBe(0);
        }
    })

    it("Should not save RSVP with non existing user", async () => {
        const event = await getOneEvent({ active: true });
        if (!event) {
            throw new Error("No event found, check your seeders");
        }
        try {
            await RSVP.create({ user: new Types.ObjectId(), event: event.id, status: STATUS_CANCELED })
        } catch (error) {
            expect(error).toBeInstanceOf(Error.ValidationError);
        }
    })

    it("Should not save RSVP with non existing event", async () => {
        const user = await getOneUser();
        if (!user) {
            throw new Error("No user found, check your seeders");
        }
        try {
            await RSVP.create({ user: user.id, event: new Types.ObjectId(), status: STATUS_CANCELED })
        } catch (error) {
            expect(error).toBeInstanceOf(Error.ValidationError);
        }
    })

    it("Should not save RSVP with inactive event", async () => {
        const event = await getOneEvent({ active: false });
        const user = await createUser({}, true);
        if (!user || !event) {
            throw new Error("No user/event found, check your seeders");
        }
        event.active = false;
        await event.save();
        try {
            await RSVP.create({ user: user.id, event: event.id, status: STATUS_CANCELED })
        } catch (error) {
            expect(error).toBeInstanceOf(Error.ValidationError);
            const parsedError = parseMongooseValidationError(error as Error.ValidationError);
            expect(parsedError).toHaveProperty('event')
            expect(parsedError.event).toEqual([messages.validation.NOT_CORRECT("event")])
        }
    })

    it("Should return an RSVP if user is attending an event", async () => {
        const { user, event } = await createUserAndEvent();
        const newRsvp = {
            user: user._id,
            event: event._id,
            status: STATUS_CONFIRMED,
            additionalGuests: 0
        };
        const rsvp = await RSVP.create(newRsvp);
        if (!rsvp) {
            throw new Error("RSVP was not created");
        }
        const result = await RSVP.isUserAttendingEvent(user?._id.toString(), event._id!.toString());
        if (!result) {
            throw new Error("RSVP was not found");
        }
        expect(result).not.toBeNull();
        expect(result.user.toString()).toBe(user._id.toString())
        expect(result.event.toString()).toBe(event._id!.toString())
        expect(result.status).toBe(STATUS_CONFIRMED);
    })
    it("Should return null if user is not attending an event", async () => {
        await RSVP.deleteMany();
        const { user, event } = await createUserAndEvent();

        const result = await RSVP.isUserAttendingEvent(user?._id.toString(), event._id!.toString());
        expect(result).toBeNull();
    })
})