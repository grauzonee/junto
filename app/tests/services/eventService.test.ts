import mongoose, { Document, HydratedDocument, Types } from "mongoose"
import { Request } from "express"
import { createFakeEvent } from "../generators/event"
import { Event, type IEvent } from "@/models/Event"
import { insertEvent, listEvents, geoSearch, editEvent } from "@/services/eventService"
import { NotFoundError } from "@/types/errors/InputError"
import { ZodError } from "zod"
import { EventType } from "@/models/EventType"
import { CreateEventInput } from "@/types/services/eventService"
import { Category } from "@/models/Category"

let req: Partial<Request>
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
        const userId = new mongoose.Types.ObjectId()
        const event: CreateEventInput = createFakeEvent({ type: eventTypeId.toString(), categories: [categoryId.toString()] })

        const result = await insertEvent(event, userId.toString())
        expect(result).not.toBe(undefined)
        expect(result!._id).not.toBe(undefined)
        expect(result!.author.toString()).toBe(userId.toString())
        expect(result!.title).toBe(event.title)
        expect(result!.description).toBe(event.description)
        expect(result!.attendees).toEqual([userId])
    })
})
describe("create event tests FAIL", () => {
    it("Should NOT create an event with invalid author id", async () => {
        const event = createFakeEvent(
            { type: eventTypeId.toString(), categories: [categoryId.toString()] }
        )
        try {
            await insertEvent(event, new Types.ObjectId().toString())
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("Should NOT create an event with invalid type id", async () => {
        const event = createFakeEvent({
            type: new Types.ObjectId().toString(),
            categories: [categoryId.toString()]
        })
        try {
            await insertEvent(event, new Types.ObjectId().toString())
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("Should NOT create an event with invalid category id", async () => {
        const event = createFakeEvent({
            type: eventTypeId.toString(),
            categories: [new Types.ObjectId().toString()]
        })
        try {
            await insertEvent(event, new Types.ObjectId().toString())
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
})
describe("list events tests SUCCESS", () => {
    beforeEach(async () => {
        await Event.deleteMany({});
    })
    // TODO: Refactor
    it("Should return event that has been created", async () => {
        const userId = new mongoose.Types.ObjectId()
        const event = createFakeEvent({
            type: eventTypeId.toString(), categories: [categoryId.toString()]
        })
        event.author = userId;
        await Event.create(event)

        const result = await listEvents(requestData)
        expect(result).not.toBe(undefined)
        expect(result.length).toBe(1)
        expect(result[0].title).toBe(event.title)
        expect(result[0].author).toEqual(userId)
    })
    it("Should return empty array when there are no events", async () => {
        req = {} as Request
        const result = await listEvents(requestData)
        expect(result).toEqual([])
    })
})
describe("geosearch events tests SUCCESS", () => {

    const userId = new mongoose.Types.ObjectId()
    let eventTitle: string;
    // TODO: Refactor to seeder
    beforeAll(async () => {
        const event = createFakeEvent({
            type: eventTypeId.toString(),
            categories: [categoryId.toString()],
            location: {
                type: "Point",
                coordinates: [48.21649, 16.40087]
            },
            author: userId
        });
        await Event.create(event)
        eventTitle = event.title;
    })

    it("Should return events near", async () => {
        const coordinates = {
            lat: 48.21649,
            lng: 16.40087,
            radius: 1,
        };
        const result = await geoSearch(coordinates, requestData)
        expect(result).not.toBe(undefined)
        expect(result!.length).toBe(1)
        expect(result![0].title).toBe(eventTitle)
        expect(result![0].author).toEqual(userId)
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
        expect(result!.length).toBe(0)
    })
    it("Should throw an exception on invalid coordinates", async () => {
        const coordinates = {
            lat: 168.21649,
            lng: 16.40087,
            radius: 1,
        };

        try {
            await geoSearch(coordinates, requestData)
        } catch (error) {
            expect(error).toBeInstanceOf(ZodError)
        }
    })
})

describe("Edit event SUCCESS", () => {
    let savedEvent: Document;
    let eventId: Types.ObjectId;
    const userId = new mongoose.Types.ObjectId()

    // TODO: Refactor to seeders
    beforeEach(async () => {
        const event = createFakeEvent({
            type: eventTypeId.toString(),
            categories: [categoryId.toString()]
        })
        await Event.deleteMany({})
        event.author = userId;
        savedEvent = await Event.create(event)
        eventId = savedEvent.id;
    })

    const title = "New title"
    const description = "New description"
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    const date = Math.floor(now.getTime() / 1000);

    it("Should edit event with PUT payload and return updated object", async () => {
        const editEventData = {
            ...savedEvent.toJSON(),
            title,
            description,
            date
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
})
describe("Edit event FAIL", () => {
    let savedEvent: HydratedDocument<IEvent>;
    let eventId: Types.ObjectId;
    const userId = new mongoose.Types.ObjectId()
    beforeEach(async () => {
        const event = createFakeEvent({
            type: eventTypeId.toString(),
            categories: [categoryId.toString()]
        })
        await Event.deleteMany({})
        event.author = userId;
        savedEvent = await Event.create(event)
        eventId = savedEvent.id;
    })
    it("Should NOT edit event of another user", async () => {
        const title = "New title";
        const date = Math.floor((new Date().valueOf() + 1000000) / 1000);
        const editEventData = {
            title,
            date
        }
        try {
            await editEvent(editEventData, eventId.toString(), new mongoose.Types.ObjectId().toString())
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError)
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
