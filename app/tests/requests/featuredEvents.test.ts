import request from "supertest";
import app from "@/app";
import { Event } from "@/models/event/Event";
import { RSVP } from "@/models/rsvp/RSVP";
import { createFakeEvent } from "@tests/generators/event";
import { createFakeRSVP } from "@tests/generators/rsvp";
import { createUser } from "@tests/generators/user";
import { getOneCategory, getOneEventType } from "@tests/getters";
import { STATUS_CANCELED, STATUS_CONFIRMED } from "@/models/rsvp/utils";
import type { HydratedEvent } from "@/models/event/Event";

function getEventDate(event: HydratedEvent) {
    return event.date instanceof Date
        ? event.date
        : new Date(event.date * 1000);
}

async function createSavedEvent(overrides: Parameters<typeof createFakeEvent>[0]) {
    return await createFakeEvent(overrides, true) as HydratedEvent;
}

async function createRsvpForEvent(event: HydratedEvent, additionalGuests = 0) {
    const user = await createUser({}, true);
    return createFakeRSVP({
        event: event._id,
        user: user._id,
        status: STATUS_CONFIRMED,
        additionalGuests,
        eventDate: getEventDate(event)
    }, true);
}

describe("GET /api/event/featured", () => {
    beforeEach(async () => {
        await RSVP.deleteMany({});
        await Event.deleteMany({});
    });

    it("Should return up to three active events ordered by confirmed RSVP count", async () => {
        const category = await getOneCategory();
        const type = await getOneEventType();
        const eventDefaults = {
            categories: [category._id.toString()],
            type: type._id.toString()
        };
        const oneRsvpEvent = await createSavedEvent({ ...eventDefaults, title: "One RSVP Event" });
        const threeRsvpEvent = await createSavedEvent({ ...eventDefaults, title: "Three RSVP Event" });
        const twoRsvpEvent = await createSavedEvent({ ...eventDefaults, title: "Two RSVP Event" });
        const inactivePopularEvent = await createSavedEvent({ ...eventDefaults, title: "Inactive Popular Event", active: false });
        await createSavedEvent({ ...eventDefaults, title: "No RSVP Event" });

        await createRsvpForEvent(oneRsvpEvent, 10);
        await createRsvpForEvent(threeRsvpEvent);
        await createRsvpForEvent(threeRsvpEvent);
        await createRsvpForEvent(threeRsvpEvent);
        await createRsvpForEvent(twoRsvpEvent);
        await createRsvpForEvent(twoRsvpEvent);
        await createRsvpForEvent(inactivePopularEvent, 4);
        await createFakeRSVP({
            event: oneRsvpEvent._id,
            user: (await createUser({}, true))._id,
            status: STATUS_CANCELED,
            additionalGuests: 10,
            eventDate: getEventDate(oneRsvpEvent)
        }, true);

        const res = await request(app).get("/api/event/featured").send();

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(3);
        expect(res.body.data.map((event: { title: string }) => event.title)).toEqual([
            "Three RSVP Event",
            "Two RSVP Event",
            "One RSVP Event"
        ]);
        expect(res.body.data[0]).toMatchObject({
            _id: threeRsvpEvent._id.toString(),
            title: "Three RSVP Event",
            description: threeRsvpEvent.description,
            fullAddress: threeRsvpEvent.fullAddress
        });
        expect(res.body.data[0]).toHaveProperty("imageUrl");
        expect(res.body.data[0]).toHaveProperty("categories");
        expect(res.body.data[0]).toHaveProperty("type");
        expect(Object.keys(res.body.data[0].categories[0]).sort((a, b) => a.localeCompare(b))).toEqual(["_id", "title"]);
        expect(Object.keys(res.body.data[0].type).sort((a, b) => a.localeCompare(b))).toEqual(["_id", "title"]);
        expect(typeof res.body.data[0].date).toBe("number");
        expect(res.body.data.find((event: { title: string }) => event.title === "Inactive Popular Event")).toBeUndefined();
        expect(res.body.data.find((event: { title: string }) => event.title === "No RSVP Event")).toBeUndefined();
    });

    it("Should return an empty object when there are no featured events", async () => {
        const res = await request(app).get("/api/event/featured").send();

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            success: true,
            data: {}
        });
    });

    it("Should return active events by newest created date when there are no RSVPs", async () => {
        const category = await getOneCategory();
        const type = await getOneEventType();
        const eventDefaults = {
            categories: [category._id.toString()],
            type: type._id.toString()
        };
        const oldestEvent = await createSavedEvent({ ...eventDefaults, title: "Oldest Event" });
        const newestEvent = await createSavedEvent({ ...eventDefaults, title: "Newest Event" });
        const middleEvent = await createSavedEvent({ ...eventDefaults, title: "Middle Event" });
        const inactiveEvent = await createSavedEvent({ ...eventDefaults, title: "Inactive Event", active: false });

        await Event.collection.updateOne({ _id: oldestEvent._id }, { $set: { createdAt: new Date("2026-01-01T00:00:00.000Z") } });
        await Event.collection.updateOne({ _id: middleEvent._id }, { $set: { createdAt: new Date("2026-01-02T00:00:00.000Z") } });
        await Event.collection.updateOne({ _id: newestEvent._id }, { $set: { createdAt: new Date("2026-01-03T00:00:00.000Z") } });
        await Event.collection.updateOne({ _id: inactiveEvent._id }, { $set: { createdAt: new Date("2026-01-04T00:00:00.000Z") } });

        const res = await request(app).get("/api/event/featured").send();

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.map((event: { title: string }) => event.title)).toEqual([
            "Newest Event",
            "Middle Event",
            "Oldest Event"
        ]);
    });
});
