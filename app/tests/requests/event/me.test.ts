import request from "supertest";
import app from "@/app";
import { Event } from "@/models/event/Event";
import { EventType } from "@/models/EventType";
import { generateToken } from "@/helpers/jwtHelper";
import { createUser } from "@tests/generators/user";
import { createFakeEvent } from "@tests/generators/event";
import { getOneCategory, getOneEventType } from "@tests/getters";

describe("GET /api/event/me", () => {
    beforeEach(async () => {
        await Event.deleteMany({});
    });

    it("Should return only active events authored by the current user", async () => {
        const currentUser = await createUser({}, true);
        const otherUser = await createUser({}, true);
        const token = generateToken(currentUser._id.toString());

        await createFakeEvent({ title: "Current User Event", author: currentUser._id.toString() }, true);
        await createFakeEvent({ title: "Inactive Current User Event", author: currentUser._id.toString(), active: false }, true);
        await createFakeEvent({ title: "Other User Event", author: otherUser._id.toString() }, true);

        const res = await request(app)
            .get("/api/event/me")
            .set("Authorization", `Bearer ${token}`)
            .send();

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.map((event: { title: string }) => event.title)).toEqual(["Current User Event"]);
        expect(res.body.data[0].author).toBe(currentUser._id.toString());
    });

    it("Should reuse supported event list filters, search, and sorting", async () => {
        const currentUser = await createUser({}, true);
        const token = generateToken(currentUser._id.toString());
        const category = await getOneCategory();
        const matchingType = await getOneEventType();
        const otherType = await EventType.create({ title: "Current User Events Other Type" });

        await createFakeEvent({
            title: "Later Matched Event",
            description: "planning meetup",
            author: currentUser._id.toString(),
            categories: [category._id.toString()],
            type: matchingType._id.toString(),
            date: Math.floor(new Date("2026-03-30T12:00:00.000Z").getTime() / 1000)
        }, true);
        await createFakeEvent({
            title: "Earlier Matched Event",
            description: "planning meetup",
            author: currentUser._id.toString(),
            categories: [category._id.toString()],
            type: matchingType._id.toString(),
            date: Math.floor(new Date("2026-03-29T12:00:00.000Z").getTime() / 1000)
        }, true);
        await createFakeEvent({
            title: "Wrong Type Event",
            description: "planning meetup",
            author: currentUser._id.toString(),
            categories: [category._id.toString()],
            type: otherType._id.toString(),
            date: Math.floor(new Date("2026-03-28T12:00:00.000Z").getTime() / 1000)
        }, true);
        await createFakeEvent({
            title: "Search Miss Event",
            description: "different words",
            author: currentUser._id.toString(),
            categories: [category._id.toString()],
            type: matchingType._id.toString(),
            date: Math.floor(new Date("2026-03-27T12:00:00.000Z").getTime() / 1000)
        }, true);

        const res = await request(app)
            .get("/api/event/me")
            .set("Authorization", `Bearer ${token}`)
            .query({
                search: "planning",
                type_eq: matchingType._id.toString(),
                sortByAsc: "date"
            })
            .send();

        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((event: { title: string }) => event.title)).toEqual([
            "Earlier Matched Event",
            "Later Matched Event"
        ]);
        expect(res.body.data[0].type).toMatchObject({
            _id: matchingType._id.toString(),
            title: matchingType.title
        });
    });

    it("Should reject unauthenticated requests", async () => {
        const res = await request(app).get("/api/event/me").send();

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ success: false, message: "Unauthorized" });
    });
});
