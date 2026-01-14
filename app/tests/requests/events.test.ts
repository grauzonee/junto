import request from "supertest";
import { createUser } from "../generators/user";

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
import { Event } from "@/models/Event";
import messages from "@/constants/errorMessages"
import { STATUS_CONFIRMED } from "@/models/RSVP";

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
        expect(res.body.data.formErrors[0]).toBe(messages.response.DUPLICATE_ATTEND);
    });

    afterAll(async () => {
        await user.deleteOne();
    });
});