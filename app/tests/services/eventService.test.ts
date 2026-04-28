import mongoose, { HydratedDocument, Types } from "mongoose"
import { createFakeEvent } from "@tests/generators/event"
import { createUser } from "@tests/generators/user"

import { create as createEvent, list as listEvents, geoSearch, update as editEvent, fetchOne } from "@/services/eventService"
import { ForbiddenError, NotFoundError } from "@/types/errors/InputError"
import { EventType } from "@/models/EventType"
import { CreateEventInput } from "@/types/services/eventService"
import { Category } from "@/models/category/Category"

import { Event, type IEvent } from "@/models/event/Event"
import { RSVP } from "@/models/rsvp/RSVP";
import { getOneCategory, getOneEventType } from "@tests/getters"
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";

let eventTypeId: Types.ObjectId;
let categoryId: Types.ObjectId;

const requestData = {
    pagination: { offset: 0, limit: 10 },
    sort: {},
    dbFilter: undefined
};

beforeEach(async () => {
    const eventType = await EventType.findOne();
    const category = await Category.findOne();
    if (!eventType || !category) {
        throw new Error("No event types or categories found, check your seeders");
    }
    eventTypeId = eventType._id;
    categoryId = category._id;
})


describe("create event tests SUCCESS", () => {
    it("Should create event when all input data are correct", async () => {
        const user = await createUser({}, true);
        const event = await createFakeEvent({ type: eventTypeId.toString(), categories: [categoryId.toString()] })
        const result = await createEvent(event as CreateEventInput, user._id.toString())
        expect(result).toBeDefined()
        if (!result) {
            throw new Error("Event was not created");
        }
        expect(result._id).not.toBe(undefined)
        expect(result.author.toString()).toBe(user._id.toString())
        expect(result.title).toBe(event.title)
        expect(result.description).toBe(event.description)
    })
})
describe("create event tests FAIL", () => {
    it("Should NOT create an event with invalid author id", async () => {
        const event = await createFakeEvent(
            { type: eventTypeId.toString(), categories: [categoryId.toString()] }
        )
        try {
            await createEvent(event as CreateEventInput, new Types.ObjectId().toString())
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("Should NOT create an event with invalid type id", async () => {
        const event = await createFakeEvent({
            type: new Types.ObjectId().toString(),
            categories: [categoryId.toString()]
        })
        try {
            await createEvent(event as CreateEventInput, new Types.ObjectId().toString())
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("Should NOT create an event with invalid category id", async () => {
        const event = await createFakeEvent({
            type: eventTypeId.toString(),
            categories: [new Types.ObjectId().toString()]
        })
        try {
            await createEvent(event as CreateEventInput, new Types.ObjectId().toString())
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
})
describe("list events tests SUCCESS", () => {
    beforeEach(async () => {
        await Event.deleteMany({});
    })
    it("Should return event that has been created", async () => {
        const user = await createUser({}, true);
        const event = await createFakeEvent({
            type: eventTypeId.toString(), categories: [categoryId.toString()]
        })
        event.author = user._id.toString();
        await Event.create(event)

        const result = await listEvents(requestData)
        expect(result).not.toBe(undefined)
        expect(result.length).toBe(1)
        expect(result[0].title).toBe(event.title)
        expect(result[0].author).toEqual(user._id)
        expect(result[0].type).toMatchObject({
            _id: eventTypeId
        })
        expect(result[0].categories[0]).toMatchObject({
            _id: categoryId
        })
    })
    it("Should return empty array when there are no events", async () => {
        const result = await listEvents(requestData)
        expect(result).toEqual([])
    })
})

describe("fetchOne tests SUCCESS", () => {
    beforeEach(async () => {
        await Event.deleteMany({});
    })
    it("Should return event if it exists", async () => {
        const author = await createUser({}, true);
        const type = await getOneEventType();
        const category = await getOneCategory()
        const event = await createFakeEvent({ author: author._id.toString(), type: type._id.toString(), categories: [category._id.toString()] }, true);
        if (!event._id) {
            throw new Error("Error creating event in test");
        }
        const result = await fetchOne(event._id.toString());
        if (!result) {
            throw new Error("No event retrieved in test")
        }
        expect(result).toHaveProperty('author');
        expect(result.title).toBe(event.title)
        expect(result.author).toMatchObject({
            _id: author._id,
            username: author.username,
            email: author.email,
        })
        expect(result.type).toMatchObject({
            _id: type._id,
            title: type.title
        });
        expect(result.categories[0]).toMatchObject(
            {
                _id: category._id,
                title: category.title
            }
        );
    })
    it("Should return null if event not found", async () => {
        const result = await fetchOne(new Types.ObjectId().toString());
        expect(result).toBe(null);
    })
})
describe("geosearch events tests SUCCESS", () => {

    let userId: Types.ObjectId;
    let eventTitle: string;
    beforeAll(async () => {
        const user = await createUser({}, true);
        userId = user._id;
        const eventType = await EventType.findOne();
        const category = await Category.findOne();
        if (!eventType || !category) {
            throw new Error("No event types or categories found, check your seeders");
        }
        const event = await createFakeEvent({
            type: eventType._id.toString(),
            categories: [category._id.toString()],
            location: {
                type: "Point",
                coordinates: [16.40087, 48.21649]
            },
            author: userId.toString()
        }, true);
        //await Event.create(event)
        eventTitle = event.title;
    })

    it("Should return events near", async () => {
        const coordinates = {
            lat: 48.21649,
            lng: 16.40087,
            radius: 1,
        };
        const result = await geoSearch(coordinates, requestData)
        expect(result).toBeDefined()
        expect(result).toHaveLength(1)
        const [foundEvent] = result;
        if (!foundEvent) {
            throw new Error("Expected one event to be returned");
        }
        expect(foundEvent.title).toBe(eventTitle)
        expect(foundEvent.author).toEqual(userId)
        expect(foundEvent.type).toMatchObject({
            _id: eventTypeId
        })
        expect(foundEvent.categories[0]).toMatchObject({
            _id: categoryId
        })
    })

    it("Should return empty array when there are no events", async () => {
        const coordinates =
        {
            lat: 68.21649,
            lng: 16.40087,
            radius: 1,
        };
        const result = await geoSearch(coordinates, requestData)
        expect(result).toEqual([])
        expect(result).toHaveLength(0)
    })
})

describe("Edit event SUCCESS", () => {
    let savedEvent: HydratedDocument<IEvent>;
    let eventId: Types.ObjectId;
    let userId: string;

    beforeEach(async () => {
        const user = await createUser({}, true);
        userId = user._id.toString();
        const event = await createFakeEvent({
            type: eventTypeId.toString(),
            categories: [categoryId.toString()]
        })
        await Event.deleteMany({})
        event.author = userId.toString();
        savedEvent = await Event.create(event)
        eventId = savedEvent._id;
    })

    const title = "New title"
    const description = "New description"
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    const date = Math.floor(now.getTime() / 1000);

    it("Should edit event with PUT payload and return updated object", async () => {
        const editEventData = {
            title,
            description,
            date,
            imageUrl: savedEvent.imageUrl,
            fullAddress: savedEvent.fullAddress,
            location: savedEvent.location,
            categories: savedEvent.categories.map(category => category.toString()),
            type: savedEvent.type.toString(),
            fee: savedEvent.fee,
            maxAttendees: savedEvent.maxAttendees
        };

        const result = await editEvent(editEventData, eventId.toString(), userId.toString())
        expect(result.title).toBe(title)
        expect(result.description).toBe(description)
    })
    it("Should edit event with PATCH payload and return updated object", async () => {
        const editEventData = {
            title,
            description
        }

        const result = await editEvent(editEventData, eventId.toString(), userId.toString())
        expect(result.title).toBe(title)
        expect(result.description).toBe(description)
    })

    it("Should sync RSVP event dates when the event date changes", async () => {
        const attendee = await createUser({}, true);
        await RSVP.create({
            event: eventId,
            user: attendee._id,
            status: STATUS_CONFIRMED,
            eventDate: savedEvent.date
        });
        const updatedDate = Math.floor((Date.now() + 2 * 60 * 60 * 1000) / 1000);
        const syncSpy = jest.spyOn(RSVP, "updateMany");

        await editEvent({ date: updatedDate }, eventId.toString(), userId);

        const rsvps = await RSVP.find({ event: eventId });
        const expectedDate = new Date(updatedDate * 1000).getTime();
        expect(rsvps.length).toBeGreaterThan(0);
        expect(rsvps.every(rsvp => rsvp.eventDate.getTime() === expectedDate)).toBe(true);
        expect(syncSpy).toHaveBeenCalledTimes(1);
        expect(syncSpy).toHaveBeenCalledWith({ event: eventId }, { eventDate: expect.any(Date) });
        syncSpy.mockRestore();
    })
})
describe("Edit event FAIL", () => {
    let savedEvent: HydratedDocument<IEvent>;
    let eventId: Types.ObjectId;
    let userId: string;
    beforeEach(async () => {
        const user = await createUser({}, true);
        userId = user._id.toString();
        const event = await createFakeEvent({
            type: eventTypeId.toString(),
            categories: [categoryId.toString()]
        })
        await Event.deleteMany({})
        event.author = userId.toString();
        savedEvent = await Event.create(event)
        eventId = savedEvent._id;
    })
    it("Should NOT edit event of another user", async () => {
        const title = "New title";
        const date = Math.floor((Date.now() + 1000000) / 1000);
        const editEventData = {
            title,
            date
        }
        try {
            await editEvent(editEventData, eventId.toString(), new mongoose.Types.ObjectId().toString())
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenError)
        }
    })
    it("Should NOT edit not active event", async () => {
        savedEvent.active = false;
        await savedEvent.save();
        const title = "New title";
        const editEventData = {
            title,
        }
        try {
            await editEvent(editEventData, eventId.toString(), userId.toString())
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError)
        }
    })
})
