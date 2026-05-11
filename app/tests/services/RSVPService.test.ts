import { Types } from "mongoose"
import { createFakeRSVP } from "../../tests/generators/rsvp"
import { RSVP } from "@/models/rsvp/RSVP"
import { Event } from "@/models/event/Event"
import messages from "@/constants/errorMessages"
import { BadInputError } from "@/types/errors/InputError"
import { STATUS_CONFIRMED } from "@/models/rsvp/utils"
import { create, getForCurrentUser, getForEvent, update } from "@/services/RSVPService"
import { createUser } from "@tests/generators/user"
import { createFakeEvent } from "@tests/generators/event"

describe("create() method SUCCESS", () => {
    it("Should create an RSVP when requested seats fit event capacity", async () => {
        const author = await createUser({}, true);
        const user = await createUser({}, true);
        const event = await createFakeEvent({ author: author._id.toString(), maxAttendees: 2 }, true);
        if (!event._id) {
            throw new Error("Expected saved event to have an _id");
        }
        const body = {
            eventId: event._id.toString(),
            status: STATUS_CONFIRMED,
            additionalGuests: 1
        }

        const rsvp = await create(body, user._id.toString())

        expect(rsvp.event.toString()).toBe(body.eventId);
        expect(rsvp.user.toString()).toBe(user._id.toString());
        expect(rsvp.status).toBe(STATUS_CONFIRMED);
        expect(rsvp.additionalGuests).toBe(1);
    })
})

describe("create() method FAIL", () => {
    it("Should reject an RSVP when additional guests exceed event capacity", async () => {
        const author = await createUser({}, true);
        const user = await createUser({}, true);
        const event = await createFakeEvent({ author: author._id.toString(), maxAttendees: 1 }, true);
        if (!event._id) {
            throw new Error("Expected saved event to have an _id");
        }
        const body = {
            eventId: event._id.toString(),
            status: STATUS_CONFIRMED,
            additionalGuests: 1
        }

        await expect(create(body, user._id.toString())).rejects.toMatchObject({
            field: "event",
            message: messages.response.EVENT_FULL
        } satisfies Partial<BadInputError>);
    })
});

describe("update() method SUCCESS", () => {
    it("Should update RSVP additional guests when requested seats fit event capacity", async () => {
        const author = await createUser({}, true);
        const user = await createUser({}, true);
        const event = await createFakeEvent({ author: author._id.toString(), maxAttendees: 3 }, true);
        const mockRSVP = await createFakeRSVP({
            event: event._id,
            user: user._id,
            additionalGuests: 0
        }, true);
        if (!mockRSVP._id) {
            throw new Error("Mock RSVP must have an _id");
        }

        const body = {
            status: STATUS_CONFIRMED,
            additionalGuests: 2
        }

        const result = await update(body, mockRSVP._id.toString(), user._id.toString())
        expect(result.additionalGuests).toBe(2);
    })

    it("Should allow reducing additional guests when the event is full", async () => {
        const author = await createUser({}, true);
        const user = await createUser({}, true);
        const event = await createFakeEvent({ author: author._id.toString(), maxAttendees: 2 }, true);
        const rsvp = await createFakeRSVP({
            event: event._id,
            user: user._id,
            additionalGuests: 1
        }, true);
        if (!rsvp._id) {
            throw new Error("Expected saved RSVP to have an _id");
        }

        const result = await update({
            status: STATUS_CONFIRMED,
            additionalGuests: 0
        }, rsvp._id.toString(), user._id.toString());

        expect(result.additionalGuests).toBe(0);
    })
});

describe("update() method FAIL", () => {
    it("Should reject increasing additional guests above event capacity", async () => {
        const author = await createUser({}, true);
        const user = await createUser({}, true);
        const event = await createFakeEvent({ author: author._id.toString(), maxAttendees: 1 }, true);
        const rsvp = await createFakeRSVP({
            event: event._id,
            user: user._id,
            additionalGuests: 0
        }, true);
        if (!rsvp._id) {
            throw new Error("Expected saved RSVP to have an _id");
        }

        await expect(update({
            status: STATUS_CONFIRMED,
            additionalGuests: 1
        }, rsvp._id.toString(), user._id.toString())).rejects.toMatchObject({
            field: "event",
            message: messages.response.EVENT_FULL
        } satisfies Partial<BadInputError>);
    })
});

describe("getForEvent() method SUCCESS", () => {
    it("Should call RSVP.find with correct parameters", async () => {
        const eventId = new Types.ObjectId().toString();
        const eventFindSpy = jest.spyOn(Event, "findOne").mockResolvedValue({ _id: eventId });
        const populateMock = jest.fn().mockReturnValue([]);
        const findSpy = jest.spyOn(RSVP, "find").mockReturnValue({
            populate: populateMock,
        });

        await getForEvent(eventId);
        expect(Event.findOne).toHaveBeenCalledWith({ _id: eventId, active: true });
        expect(RSVP.find).toHaveBeenCalledTimes(1);
        expect(RSVP.find).toHaveBeenCalledWith({ event: eventId, status: STATUS_CONFIRMED });
        expect(populateMock).toHaveBeenCalledWith('user');

        findSpy.mockRestore();
        eventFindSpy.mockRestore();
    });
    it("Should return array of RSVPs", async () => {
        const mockRSVPs = [await createFakeRSVP({}), await createFakeRSVP({})];
        const eventFindSpy = jest.spyOn(Event, "findOne").mockResolvedValue({ _id: new Types.ObjectId() });
        const findSpy = jest.spyOn(RSVP, "find").mockReturnValue({
            populate: jest.fn().mockReturnValue(mockRSVPs),
        });

        const result = await getForEvent(new Types.ObjectId().toString());
        expect(result).toBe(mockRSVPs);

        findSpy.mockRestore();
        eventFindSpy.mockRestore();
    });
});

describe("getForCurrentUser() method SUCCESS", () => {
    it("Should return the matching RSVP for the current user", async () => {
        const eventId = new Types.ObjectId().toString();
        const userId = new Types.ObjectId().toString();
        const eventFindSpy = jest.spyOn(Event, "findOne").mockResolvedValue({ _id: eventId });
        const findOneSpy = jest.spyOn(RSVP, "findOne").mockResolvedValue({ _id: new Types.ObjectId(), event: eventId, user: userId });

        const result = await getForCurrentUser(eventId, userId);

        expect(Event.findOne).toHaveBeenCalledWith({ _id: eventId, active: true });
        expect(RSVP.findOne).toHaveBeenCalledWith({ event: eventId, user: userId });
        expect(result).toMatchObject({ event: eventId, user: userId });

        findOneSpy.mockRestore();
        eventFindSpy.mockRestore();
    });

    it("Should return null when no RSVP exists for current user", async () => {
        const eventId = new Types.ObjectId().toString();
        const userId = new Types.ObjectId().toString();
        const eventFindSpy = jest.spyOn(Event, "findOne").mockResolvedValue({ _id: eventId });
        const findOneSpy = jest.spyOn(RSVP, "findOne").mockResolvedValue(null);

        const result = await getForCurrentUser(eventId, userId);

        expect(result).toBeNull();

        findOneSpy.mockRestore();
        eventFindSpy.mockRestore();
    });
});
