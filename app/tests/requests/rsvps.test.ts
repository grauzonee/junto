import request from "supertest";
import { createUser } from "../generators/user";
import type { NextFunction, Request, Response } from "express";

let user: Awaited<ReturnType<typeof createUser>>;

jest.mock("@/middlewares/authMiddleware", () => ({
    authMiddleware: jest.fn(
        async (req: Request, _res: Response, next: NextFunction) => {
            req.user = user;
            next();
        }
    ),
}));
import app from "@/app";
import { Event } from "@/models/event/Event";
import messages from "@/constants/errorMessages"
import { RSVP } from "@/models/rsvp/RSVP";
import { STATUS_CANCELED, STATUS_CONFIRMED, STATUS_MAYBE } from "@/models/rsvp/utils";
import { Types } from "mongoose";
import { createFakeEvent } from "../generators/event";

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

    it("Should prevent event authors from setting RSVP status to 'maybe' or 'canceled'", async () => {
        // Create an event where the user is the author
        const newEvent = await createFakeEvent({ author: user._id.toString() }, true);
        const rsvp = await RSVP.findOne({ user: user._id, event: newEvent._id });
        const authorRsvpId = rsvp ? rsvp._id.toString() : null;

        if (!authorRsvpId) {
            throw new Error("Failed to create RSVP for event author");
        }

        const updateMaybeRes = await request(app).put(`/api/rsvp/${authorRsvpId}`).send({
            status: STATUS_MAYBE
        });
        expect(updateMaybeRes.statusCode).toBe(400);
        expect(updateMaybeRes.body.success).toBe(false);
        expect(updateMaybeRes.body.data.fieldErrors).toEqual({ "user": messages.validation.CANNOT_MODIFY("Event authors RSVP status") });

        // Attempt to update RSVP status to 'canceled'
        const updateCanceledRes = await request(app).put(`/api/rsvp/${authorRsvpId}`).send({
            status: STATUS_CANCELED
        });
        expect(updateCanceledRes.statusCode).toBe(400);
        expect(updateCanceledRes.body.success).toBe(false);
        expect(updateCanceledRes.body.data.fieldErrors).toEqual({ "user": messages.validation.CANNOT_MODIFY("Event authors RSVP status") });

        // Clean up
        await Event.deleteOne({ _id: newEvent._id });
    });

    it("Should throw validation error for invalid status", async () => {
        const requestBody = {
            status: "invalidstatus",
            additionalGuests: 1
        }
        const res = await request(app).put(`/api/rsvp/${rsvpId}`).send(requestBody);
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.data.fieldErrors).toEqual({ "status": [messages.validation.NOT_CORRECT("Status")] });
    });
});
