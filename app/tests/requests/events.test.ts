import request from "supertest";
jest.mock("./middleware/auth", () => ({
    authMiddleware: jest.fn(
        (req: any, _res: any, next: any) => {
            req.user = { _id: "test-user-id" };
            next();
        }
    ),
}));
import app from "@/app";
import { Event } from "@/models/Event";
import { User } from "@/models/User";
import messages from "@/constants/errorMessages"
import { STATUS_CONFIRMED } from "@/models/RSVP";

describe("POST /attend", () => {
    let eventId: string;
    let userId: string;

    beforeAll(async () => {
        const eventRes = await Event.findOne();
        const userRes = await User.findOne();
        if (!eventRes || !userRes) {
            throw new Error("No events or users found, check your seeders");
        }
        eventId = eventRes._id.toString();
        userId = userRes._id.toString();
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
        expect(res.body).toHaveProperty('_id');
        expect(res.body.event.toString()).toBe(eventId);
        expect(res.body.user.toString()).toBe(userId);
        expect(res.body.status).toBe(STATUS_CONFIRMED);
    });

    it("Should prevent a user from attending an event they are already attending", async () => {
        const requestBody = {
            eventId: eventId,
            userId: userId,
            status: STATUS_CONFIRMED
        }
        const res = await request(app).post('/api/event/attend').send(requestBody);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(messages.response.DUPLICATE_ATTEND);
    });
});