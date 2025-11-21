import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { Request } from "express"
import { createFakeEvent } from "./generator"
import { Event, type EventDocument } from "@/models/Event"
import { insertEvent, listEvents, geoSearch, attendEvent, editEvent } from "@/services/eventService"
import { BadInputError, NotFoundError } from "@/types/errors/InputError"
import { ZodError } from "zod"

let mongoServer: MongoMemoryServer
let req: Partial<Request>

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
})
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("create event tests SUCCESS", () => {
    it("Should create event when all input data are correct", async () => {
        const userId = new mongoose.Types.ObjectId()
        const event = createFakeEvent()
        req = {
            user: {
                id: userId
            },
            body: event
        } as Request
        const result = await insertEvent(req as Request)
        expect(result).not.toBe(undefined)
        expect(result!._id).not.toBe(undefined)
        expect(result!.author).toBe(userId)
        expect(result!.title).toBe(event.title)
        expect(result!.description).toBe(event.description)
        expect(result!.attendees).toEqual([userId])
    })
})
describe("create event tests FAIL", () => {
    it("Should NOT create an event without author id", async () => {
        const event = createFakeEvent()
        req = {
            body: event
        } as Request
        const result = await insertEvent(req as Request)
        expect(result).toBe(undefined)
    })
})
describe("list events tests SUCCESS", () => {
    beforeEach(async () => {
        await Event.deleteMany({});
    })
    it("Should return event that has been created", async () => {
        const userId = new mongoose.Types.ObjectId()
        const event = createFakeEvent()
        event.author = userId;
        await Event.create(event)
        req = {} as Request
        const result = await listEvents(req as Request)
        expect(result).not.toBe(undefined)
        expect(result.length).toBe(1)
        expect(result[0].title).toBe(event.title)
        expect(result[0].author).toEqual(userId)
    })
    it("Should return empty array when there are no events", async () => {
        req = {} as Request
        const result = await listEvents(req as Request)
        expect(result).toEqual([])
    })
})
describe("geosearch events tests SUCCESS", () => {
    const event = createFakeEvent()
    const userId = new mongoose.Types.ObjectId()
    beforeAll(async () => {
        event.location.coordinates = [48.21649, 16.40087]
        event.author = userId;
        await Event.create(event)
    })
    it("Should return events near", async () => {
        req = {
            query: {
                lat: 48.21649,
                lng: 16.40087,
                radius: 1,
            },
        } as unknown as Request;
        const result = await geoSearch(req as Request)
        expect(result).not.toBe(undefined)
        expect(result!.length).toBe(1)
        expect(result![0].title).toBe(event.title)
        expect(result![0].author).toEqual(userId)
    })
    it("Should return empty array when there are no events", async () => {
        req = {
            query: {
                lat: 68.21649,
                lng: 16.40087,
                radius: 1,
            },
        } as unknown as Request;
        const result = await geoSearch(req as Request)
        expect(result).toEqual([])
        expect(result!.length).toBe(0)
    })
    it("Should throw an exception on invalid coordinates", async () => {
        req = {
            query: {
                lat: 168.21649,
                lng: 16.40087,
                radius: 1,
            },
        } as unknown as Request;
        try {
            const result = await geoSearch(req as Request)
        } catch (error) {
            expect(error).toBeInstanceOf(ZodError)
        }
    })
})

describe("attendEvent tests SUCCESS", () => {
    let savedEvent: EventDocument;
    const event = createFakeEvent()
    const userId = new mongoose.Types.ObjectId()
    beforeAll(async () => {
        event.author = userId;
        savedEvent = await Event.create(event)
    })
    it("Should return attended event if operation was successfull", async () => {
        const newUserId = new mongoose.Types.ObjectId();
        req = {
            params: {
                eventId: savedEvent._id
            },
            user: {
                id: newUserId
            }
        } as unknown as Request;
        const result = await attendEvent(req as Request);
        expect(result.id).toBe(savedEvent.id)
        expect(result.attendees).toContain(newUserId)
    })
    it("Should throw an exception if user is already attending the event", async () => {
        req = {
            params: {
                eventId: savedEvent._id
            },
            user: {
                id: userId
            }
        } as unknown as Request;
        try {
            const result = await attendEvent(req as Request);
        } catch (error) {

            expect(error).toBeInstanceOf(BadInputError)
            if (error instanceof Error) {
                expect(error.message).toBe("User already attending this event")
            }
        }
    })
    it("Should throw an exception if event not found", async () => {
        req = {
            params: {
                eventId: savedEvent.id
            },
            user: {
                id: userId
            }
        } as unknown as Request;
        try {
            const result = await attendEvent(req as Request);
        } catch (error) {

            expect(error).toBeInstanceOf(NotFoundError)
            if (error instanceof Error) {
                expect(error.message).toBe("Event not found")
            }
        }
    })
})

describe("Edit event SUCCESS", () => {
    let savedEvent: EventDocument;
    const event = createFakeEvent()
    const userId = new mongoose.Types.ObjectId()
    beforeEach(async () => {
        await Event.deleteMany({})
        event.author = userId;
        savedEvent = await Event.create(event)
        req = {
            params: {
                eventId: savedEvent._id
            },
            user: {
                id: userId
            },
        } as unknown as Request
    })

    const title = "New title"
    const description = "New description"
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    const date = Math.floor(now.getTime() / 1000);

    it("Should edit event with PUT payload and return updated object", async () => {
        req.user.id = userId;
        req.body = {
            ...savedEvent.toJSON(),
            title,
            description,
            date
        }
        const result = await editEvent(req as Request)
        expect(result.title).toBe(title)
        expect(result.description).toBe(description)
    })
    it("Should edit event with PATCH payload and return updated object", async () => {
        req.body = {
            title,
            description
        }

        const result = await editEvent(req as Request)
        expect(result.title).toBe(title)
        expect(result.description).toBe(description)
    })
})
describe("Edit event FAIL", () => {
    let savedEvent: EventDocument;
    const event = createFakeEvent()
    const userId = new mongoose.Types.ObjectId()
    beforeEach(async () => {
        await Event.deleteMany({})
        event.author = userId;
        savedEvent = await Event.create(event)
        req = {
            params: {
                eventId: savedEvent._id
            },
            user: {
                id: userId
            },
        } as unknown as Request
    })
    it("Should NOT edit event of another user", async () => {
        const title = "New title";
        req.user.id = new mongoose.Types.ObjectId();
        req.body = {
            ...savedEvent.toJSON(),
            title,
        }
        try {
            const result = await editEvent(req as Request)
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError)
        }
    })
    it("Should NOT edit not active event", async () => {
        savedEvent.active = false;
        await savedEvent.save();
        const title = "New title";
        req.user.id = new mongoose.Types.ObjectId();
        req.body = {
            ...savedEvent.toJSON(),
            title,
        }
        try {
            const result = await editEvent(req as Request)
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError)
        }
    })
})
