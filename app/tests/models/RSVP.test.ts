import { RSVP, STATUS_CANCELED, STATUS_CONFIRMED } from "@/models/RSVP"
import { User } from "@/models/User"
import { Event } from "@/models/Event"
import { EventType } from "@/models/EventType"
import { Types, Error } from "mongoose"
import messages from "@/constants/errorMessages"
import { parseMongooseValidationError } from "@/helpers/requestHelper"

let eventTypeId: Types.ObjectId;

beforeAll(async () => {
    const eventType = await EventType.findOne();
    if (!eventType) {
        throw new Error("No event types found, check your seeders");
    }
    eventTypeId = eventType._id;
})

describe("RSVP model", () => {
    it("Should save RSVP with valid status", async () => {
        const user = await User.findOne();
        const event = await Event.findOne();
        if (!user || !event) {
            throw new Error("No user/event found, check your seeders");
        }
        try {
            await RSVP.create({ user: user.id, event: event.id, status: STATUS_CANCELED })
        } catch (error) {
            expect(error).toBeInstanceOf(Error.ValidationError);
        }
    })

    it("Should not save RSVP with invalid status", async () => {
        const user = await User.findOne();
        const event = await Event.findOne();
        if (!user || !event) {
            throw new Error("No user/event found, check your seeders");
        }
        try {
            await RSVP.create({ user: user.id, event: event.id, status: "going" })
        } catch (error) {
            expect(error).toBeInstanceOf(Error.ValidationError);
            const parsedError = parseMongooseValidationError(error as Error.ValidationError);
            expect(parsedError).toHaveProperty('status')
            expect(parsedError.status).toEqual([messages.validation.NOT_CORRECT("Rsvp status")])
        }
    })

    it("Should not save RSVP with non existing user", async () => {
        const event = await Event.findOne();
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
        const user = await User.findOne();
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
        const event = await Event.findOne();
        const user = await User.findOne();
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
        const event = await Event.findOne({ active: true });
        const user = await User.findOne();
        if (!user || !event) {
            throw new Error("No user/event found, check your seeders");
        }
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
        const result = await RSVP.isUserAttendingEvent(user?._id, event._id);
        console.log(result)
        expect(result.user.toString()).toBe(user._id.toString())
        expect(result.event.toString()).toBe(event._id.toString())
        expect(result.status).toBe(STATUS_CONFIRMED);
    })
})