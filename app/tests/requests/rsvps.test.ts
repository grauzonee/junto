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
import { Types } from "mongoose";

describe("PUT /rsvp/:id", () => {
    let eventId: string;
    let userId: string;
    let rsvpId: string;

    beforeAll(async () => {
        const eventRes = await Event.findOne();
        user = await createUser({}, true);
        if (!eventRes || !user) {
            throw new Error("No events or users found, check your seeders");
        }
        eventId = eventRes._id.toString();
        userId = user._id.toString();

        const attendRes = await request(app).post('/api/event/attend').send({
            eventId: eventId,
            userId: userId,
            status: STATUS_CONFIRMED
        });
        rsvpId = attendRes.body.data._id;
    });
    it("Should allow a user to update their RSVP", async () => {
        const requestBody = {
            status: STATUS_CONFIRMED,
            additionalGuests: 2
        }
        const res = await request(app).put(`/api/rsvp/${rsvpId}`).send(requestBody);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data._id.toString()).toBe(rsvpId);
        expect(res.body.data.user.toString()).toBe(userId);
        expect(res.body.data.event.toString()).toBe(eventId);
        expect(res.body.data.status).toBe(STATUS_CONFIRMED);
        expect(res.body.data.additionalGuests).toBe(2);
    });

    it("Should prevent a user from updating a non-existing RSVP", async () => {
        const requestBody = {
            status: STATUS_CONFIRMED,
            additionalGuests: 3
        }
        const fakeRsvpId = new Types.ObjectId().toString();
        const res = await request(app).put(`/api/rsvp/${fakeRsvpId}`).send(requestBody);
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.data.formErrors).toEqual([messages.response.NOT_FOUND("rsvp")]);
    });

    afterAll(async () => {
        await user.deleteOne();
    });
});