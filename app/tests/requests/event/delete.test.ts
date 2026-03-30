import request from "supertest";
import { NextFunction, Request, Response } from "express";
import { createUser } from "@tests/generators/user";

let user: Awaited<ReturnType<typeof createUser>>;

jest.mock("@/middlewares/authMiddleware", () => ({
    authMiddleware: jest.fn(async (req: Request, _res: Response, next: NextFunction) => {
        req.user = user;
        next();
    }),
}));

import app from "@/app";
import { createFakeEvent } from "@tests/generators/event";
import { createFakeRSVP } from "@tests/generators/rsvp";
import { Event } from "@/models/event/Event";
import { RSVP } from "@/models/rsvp/RSVP";
import { STATUS_CANCELED, STATUS_CONFIRMED } from "@/models/rsvp/utils";

describe("DELETE /api/event/:eventId", () => {
    it("Should soft delete the event and cancel its RSVPs", async () => {
        user = await createUser({}, true);
        const attendee = await createUser({}, true);
        const event = await createFakeEvent({ author: user._id.toString() }, true);
        if (!event._id) {
            throw new Error("Expected saved event to have an _id");
        }
        const eventDate = event.date instanceof Date ? event.date : new Date(event.date * 1000);
        await createFakeRSVP({
            event: event._id,
            user: attendee._id,
            status: STATUS_CONFIRMED,
            eventDate
        }, true);

        const res = await request(app).delete(`/api/event/${event._id.toString()}`).send();
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual({ message: "Event has been deleted" });

        const deletedEvent = await Event.findById(event._id);
        const rsvps = await RSVP.find({ event: event._id });
        const fetchDeletedRes = await request(app).get(`/api/event/${event._id.toString()}`).send();
        const listRes = await request(app).get("/api/event").send();
        const eventId = event._id.toString();

        expect(deletedEvent?.active).toBe(false);
        expect(rsvps.every(rsvp => rsvp.status === STATUS_CANCELED)).toBe(true);
        expect(fetchDeletedRes.statusCode).toBe(404);
        expect(listRes.body.data.some((listedEvent: { _id: string }) => listedEvent._id === eventId)).toBe(false);
    });
});
