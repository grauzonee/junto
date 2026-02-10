import request from "supertest";
import { createUser } from "../generators/user";
import { createFakeRSVP } from "../generators/rsvp";

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
import { createFakeEvent } from "../generators/event";
import { getOneUser } from "../getters";

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
        console.log(res.body);
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