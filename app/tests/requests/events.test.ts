import request from "supertest";
import { createUser } from "../generators/user";
import { createFakeRSVP } from "../generators/rsvp";
import { Types } from "mongoose";

let user: Awaited<ReturnType<typeof createUser>>;

jest.mock("@/middlewares/authMiddleware", () => ({
    authMiddleware: jest.fn(
        async (req: any, _res: any, next: any) => {
            req.user = { _id: user._id };
            next();
        }
    ),
}));
import app from "@/app";
import { Event } from "@/models/event/Event";
import messages from "@/constants/errorMessages"
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { createFakeEvent } from "@tests/generators/event";
import { getOneEvent, getOneUser } from "@tests/getters";

describe("GET /:eventId", () => {
    it("Should return event with author, categories and type data", async () => {
        const event = await getOneEvent();
        if (!event) {
            throw new Error("No events in DB!");
        }
        const res = await request(app).get(`/api/event/${event._id.toString()}`).send();
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data).toHaveProperty('location');
        expect(res.body.data).toHaveProperty('fee');
        expect(res.body.data).toHaveProperty('author');
        expect(res.body.data.author).toHaveProperty('_id');
        expect(res.body.data.author).toHaveProperty('username');
        expect(res.body.data.author).toHaveProperty('email');
        expect(res.body.data).toHaveProperty('categories');
        expect(res.body.data).toHaveProperty('type');
        expect(res.body.data.type).toHaveProperty('_id');
        expect(res.body.data.type).toHaveProperty('title');
        expect(res.body.data).toHaveProperty('description');
        expect(res.body.data).toHaveProperty('date');
        expect(res.body.data).toHaveProperty('fullAddress');
        expect(res.body.data).toHaveProperty('imageUrl');
        expect(res.body.data).toHaveProperty('maxAttendees');
        expect(res.body.data).toHaveProperty('active');
        expect(res.body.data).toHaveProperty('createdAt');
    })
    it("Should return 404 if event not found", async () => {
        const event = await getOneEvent();
        if (!event) {
            throw new Error("No events in DB!");
        }
        const res = await request(app).get(`/api/event/${new Types.ObjectId().toString()}`).send();
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('formErrors');
        expect(res.body.data.formErrors).toEqual([messages.response.NOT_FOUND('event')]);
        expect(res.body.data).toHaveProperty('fieldErrors');
    })
})

describe("GET /geosearch", () => {
    it("Should route to geosearch instead of fetchOne for the static path", async () => {
        const author = await getOneUser();
        const latitude = 48.2082;
        const longitude = 16.3738;
        const event = await createFakeEvent({
            author: author._id.toString(),
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        }, true);

        const res = await request(app)
            .get('/api/event/geosearch')
            .query({ lat: latitude.toString(), lng: longitude.toString(), radius: "3" });

        if (!event._id) {
            throw new Error("Expected saved event to have an _id");
        }
        const eventId = event._id.toString();

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.some((item: { _id: string }) => item._id === eventId)).toBe(true);

        await Event.deleteOne({ _id: event._id });
    });

    it("Should treat radius as kilometers", async () => {
        const viennaEvent = await Event.findOne({ fullAddress: "Leystraße 2, 1200 Vienna, Austria" });
        if (!viennaEvent?._id) {
            throw new Error("Expected seeded Vienna event to exist");
        }

        const res = await request(app)
            .get('/api/event/geosearch')
            .query({
                lat: "48.24847480429635",
                lng: "16.37497422734464",
                radius: "3"
            });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.some((item: { _id: string }) => item._id === viennaEvent._id.toString())).toBe(true);
    });
});

describe("POST /attend", () => {
    let eventId: string;
    let userId: string;

    beforeAll(async () => {
        const eventRes = await Event.findOne();
        user = await createUser({}, true);
        if (!eventRes || !user) {
            throw new Error("No events or users found, check your seeders");
        }
        eventId = eventRes._id.toString();
        userId = user._id.toString();
    });
    it("Should allow a user to attend an event", async () => {
        const requestBody = {
            eventId: eventId,
            userId: userId,
            status: STATUS_CONFIRMED
        }
        const res = await request(app).post('/api/event/attend').send(requestBody);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data.event.toString()).toBe(eventId);
        expect(res.body.data.user.toString()).toBe(userId);
        expect(res.body.data.status).toBe(STATUS_CONFIRMED);
    });

    it("Should prevent a user from attending an event they are already attending", async () => {
        const requestBody = {
            eventId: eventId,
            userId: userId,
            status: STATUS_CONFIRMED
        }
        const res = await request(app).post('/api/event/attend').send(requestBody);
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.data.fieldErrors).toEqual({ user: messages.response.DUPLICATE_ATTEND });
    });

    afterAll(async () => {
        await user.deleteOne();
    });
});

describe("GET /:eventId/rsvps", () => {
    let eventId: string;
    let userId: string;

    beforeAll(async () => {
        const author = await getOneUser();
        const user1 = await createUser({}, true);
        const user2 = await createUser({}, true);
        const user3 = await createUser({}, true);

        const event = await createFakeEvent({ maxAttendees: 10, author: author._id.toString() }, true);
        const rsvp1 = createFakeRSVP({ event: event._id, user: user1._id, status: STATUS_CONFIRMED }, true);
        const rsvp2 = createFakeRSVP({ event: event._id, user: user2._id, status: STATUS_CONFIRMED }, true);
        const rsvp3 = createFakeRSVP({ event: event._id, user: user3._id, status: STATUS_CONFIRMED }, true);

        if (!event || !event._id) {
            throw new Error("No events found, check your seeders");
        }
        eventId = event._id.toString();
        userId = author._id.toString();
    });

    it("Should allow a user to get RSVPs for an event", async () => {
        const res = await request(app).get(`/api/event/${eventId}/rsvps`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('total', 4); // 3 created + 1 author
        expect(Array.isArray(res.body.data.entities)).toBe(true);
        expect(res.body.data.entities.length).toBe(4); // 3 created + 1 author
    });

    afterAll(async () => {
        await user.deleteOne();
    });
});
