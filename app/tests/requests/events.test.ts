import request from "supertest";
import { createUser } from "../generators/user";
import { createFakeRSVP } from "../generators/rsvp";
import { Types } from "mongoose";
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
import { Category } from "@/models/category/Category";
import { EventType } from "@/models/EventType";
import messages from "@/constants/errorMessages"
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { createFakeEvent } from "@tests/generators/event";
import { getOneCategory, getOneEvent, getOneEventType, getOneUser } from "@tests/getters";
import { SEARCH_QUERY_MAX_LENGTH } from "@/schemas/http/Event";

function toUnixSeconds(value: Date): number {
    return Math.floor(value.getTime() / 1000);
}

function atNoon(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12, 0, 0, 0);
}

function startOfWeek(value: Date): Date {
    const result = new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const distanceFromMonday = (result.getDay() + 6) % 7;
    result.setDate(result.getDate() - distanceFromMonday);
    return result;
}

describe("GET /:eventId", () => {
    it("Should return event with author, categories and type data", async () => {
        const event = await getOneEvent();
        if (!event) {
            throw new Error("No events in DB!");
        }
        const expectedDate = Math.floor(event.date.getTime() / 1000);
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
        expect(res.body.data.date).toBe(expectedDate);
        expect(typeof res.body.data.date).toBe("number");
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

describe("GET /api/event date filters", () => {
    const titles = {
        today: "Today Event",
        tomorrow: "Tomorrow Event",
        thisWeekend: "This Weekend Event",
        nextWeek: "Next Week Event",
        nextMonth: "Next Month Event"
    };

    beforeEach(async () => {
        await Event.deleteMany({});

        const now = new Date();
        const weekStart = startOfWeek(now);
        const thisWeekendDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 5, 12, 0, 0, 0);
        const nextWeekDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7, 12, 0, 0, 0);
        let nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 12, 0, 0, 0);

        // When the current week spills into the next month, keep this fixture in the
        // next month but outside the current week so the test assertions stay stable.
        if (nextMonthDate < nextWeekDate) {
            nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 8, 12, 0, 0, 0);
        }

        await createFakeEvent({ title: titles.today, date: toUnixSeconds(atNoon(now)) }, true);
        await createFakeEvent({ title: titles.tomorrow, date: toUnixSeconds(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0, 0)) }, true);
        await createFakeEvent({ title: titles.thisWeekend, date: toUnixSeconds(thisWeekendDate) }, true);
        await createFakeEvent({ title: titles.nextWeek, date: toUnixSeconds(nextWeekDate) }, true);
        await createFakeEvent({ title: titles.nextMonth, date: toUnixSeconds(nextMonthDate) }, true);
    });

    it("Should filter events for today", async () => {
        const res = await request(app).get("/api/event").query({ date_eq: "today" }).send();
        expect(res.statusCode).toBe(200);
        const resultTitles = res.body.data.map((event: { title: string }) => event.title);
        expect(resultTitles).toContain(titles.today);
        expect(resultTitles).not.toContain(titles.tomorrow);
        expect(resultTitles).not.toContain(titles.nextWeek);
        expect(resultTitles).not.toContain(titles.nextMonth);
    });

    it("Should filter events for this week", async () => {
        const res = await request(app).get("/api/event").query({ date_eq: "this week" }).send();
        expect(res.statusCode).toBe(200);
        const resultTitles = res.body.data.map((event: { title: string }) => event.title);
        expect(resultTitles).toContain(titles.today);
        expect(resultTitles).toContain(titles.thisWeekend);
        expect(resultTitles).not.toContain(titles.nextWeek);
        expect(resultTitles).not.toContain(titles.nextMonth);
    });

    it("Should filter events for this month", async () => {
        const res = await request(app).get("/api/event").query({ date_eq: "this month" }).send();
        expect(res.statusCode).toBe(200);
        const resultTitles = res.body.data.map((event: { title: string }) => event.title);
        expect(resultTitles).toContain(titles.today);
        expect(resultTitles).not.toContain(titles.nextMonth);
    });

    it("Should filter events for this weekend", async () => {
        const res = await request(app).get("/api/event").query({ date_eq: "this weekend" }).send();
        expect(res.statusCode).toBe(200);
        const resultTitles = res.body.data.map((event: { title: string }) => event.title);
        expect(resultTitles).toContain(titles.thisWeekend);
        expect(resultTitles).not.toContain(titles.nextWeek);
        expect(resultTitles).not.toContain(titles.nextMonth);
    });

    it("Should support discover date aliases", async () => {
        const weekRes = await request(app).get("/api/event").query({ date_eq: "week" }).send();
        const canonicalWeekRes = await request(app).get("/api/event").query({ date_eq: "this week" }).send();
        const weekendRes = await request(app).get("/api/event").query({ date_eq: "weekend" }).send();
        const canonicalWeekendRes = await request(app).get("/api/event").query({ date_eq: "this weekend" }).send();
        const monthRes = await request(app).get("/api/event").query({ date_eq: "month" }).send();
        const canonicalMonthRes = await request(app).get("/api/event").query({ date_eq: "this month" }).send();

        expect(weekRes.statusCode).toBe(200);
        expect(weekRes.body.data.map((event: { title: string }) => event.title)).toEqual(
            canonicalWeekRes.body.data.map((event: { title: string }) => event.title)
        );

        expect(weekendRes.statusCode).toBe(200);
        expect(weekendRes.body.data.map((event: { title: string }) => event.title)).toEqual(
            canonicalWeekendRes.body.data.map((event: { title: string }) => event.title)
        );

        expect(monthRes.statusCode).toBe(200);
        expect(monthRes.body.data.map((event: { title: string }) => event.title)).toEqual(
            canonicalMonthRes.body.data.map((event: { title: string }) => event.title)
        );
    });
});

describe("GET /api/event filters, search and sorting", () => {
    let defaultCategoryId: string;
    let alternateCategoryId: string;
    let defaultTypeId: string;
    let alternateTypeId: string;

    beforeAll(async () => {
        defaultCategoryId = (await getOneCategory())._id.toString();
        defaultTypeId = (await getOneEventType())._id.toString();
        alternateCategoryId = (await Category.create({ title: "Alternate Category" }))._id.toString();
        alternateTypeId = (await EventType.create({ title: "Alternate Type" }))._id.toString();
    });

    beforeEach(async () => {
        await Event.deleteMany({});
    });

    it("Should filter events by event type", async () => {
        await createFakeEvent({ title: "Default Type Event", type: defaultTypeId, categories: [defaultCategoryId] }, true);
        await createFakeEvent({ title: "Alternate Type Event", type: alternateTypeId, categories: [defaultCategoryId] }, true);

        const res = await request(app).get("/api/event").query({ type_eq: alternateTypeId }).send();
        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((event: { title: string }) => event.title)).toEqual(["Alternate Type Event"]);
    });

    it("Should filter events by category", async () => {
        await createFakeEvent({ title: "Default Category Event", type: defaultTypeId, categories: [defaultCategoryId] }, true);
        await createFakeEvent({ title: "Alternate Category Event", type: defaultTypeId, categories: [alternateCategoryId] }, true);

        const res = await request(app).get("/api/event").query({ categories_in: `[${alternateCategoryId}]` }).send();
        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((event: { title: string }) => event.title)).toEqual(["Alternate Category Event"]);
    });

    it("Should merge date_after and date_before filters", async () => {
        await createFakeEvent({ title: "Before Range", date: toUnixSeconds(new Date("2026-03-27T12:00:00.000Z")) }, true);
        await createFakeEvent({ title: "Within Range", date: toUnixSeconds(new Date("2026-03-28T12:00:00.000Z")) }, true);
        await createFakeEvent({ title: "After Range", date: toUnixSeconds(new Date("2026-03-30T12:00:00.000Z")) }, true);

        const res = await request(app).get("/api/event").query({
            date_after: "2026-03-28T00:00:00.000Z",
            date_before: "2026-03-29T23:59:59.999Z"
        }).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((event: { title: string }) => event.title)).toEqual(["Within Range"]);
    });

    it("Should keep date_eq as the source of truth when mixed with date_after and date_before", async () => {
        await createFakeEvent({ title: "Preset Match", date: toUnixSeconds(atNoon(new Date())) }, true);
        await createFakeEvent({ title: "Later Event", date: toUnixSeconds(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) }, true);

        const res = await request(app).get("/api/event").query({
            date_eq: "today",
            date_after: "2100-01-01T00:00:00.000Z",
            date_before: "2100-01-02T00:00:00.000Z"
        }).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((event: { title: string }) => event.title)).toContain("Preset Match");
        expect(res.body.data.map((event: { title: string }) => event.title)).not.toContain("Later Event");
    });

    it("Should sort events by date ascending and descending", async () => {
        await createFakeEvent({ title: "Middle Event", date: toUnixSeconds(new Date("2026-03-29T12:00:00.000Z")) }, true);
        await createFakeEvent({ title: "Latest Event", date: toUnixSeconds(new Date("2026-03-30T12:00:00.000Z")) }, true);
        await createFakeEvent({ title: "Earliest Event", date: toUnixSeconds(new Date("2026-03-28T12:00:00.000Z")) }, true);

        const ascRes = await request(app).get("/api/event").query({ sortByAsc: "date" }).send();
        const descRes = await request(app).get("/api/event").query({ sortByDesc: "date" }).send();

        expect(ascRes.statusCode).toBe(200);
        expect(ascRes.body.data.map((event: { title: string }) => event.title)).toEqual([
            "Earliest Event",
            "Middle Event",
            "Latest Event"
        ]);

        expect(descRes.statusCode).toBe(200);
        expect(descRes.body.data.map((event: { title: string }) => event.title)).toEqual([
            "Latest Event",
            "Middle Event",
            "Earliest Event"
        ]);
    });

    it("Should search across title and description using literal case-insensitive matching", async () => {
        await createFakeEvent({ title: "Harbor Party", description: "No keyword here", fullAddress: "One Street" }, true);
        await createFakeEvent({ title: "No Match", description: "Meet by the HARBOR at sunset", fullAddress: "Two Street" }, true);
        await createFakeEvent({ title: "Another Event", description: "No keyword here", fullAddress: "55 Harbor Lane" }, true);
        await createFakeEvent({ title: "Different Event", description: "Somewhere else entirely", fullAddress: "99 Inland Ave" }, true);

        const res = await request(app).get("/api/event").query({ search: "harbor" }).send();
        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((event: { title: string }) => event.title)).toEqual(
            expect.arrayContaining(["Harbor Party", "No Match"])
        );
        expect(res.body.data.map((event: { title: string }) => event.title)).not.toContain("Another Event");
        expect(res.body.data.map((event: { title: string }) => event.title)).not.toContain("Different Event");
    });

    it("Should normalize whitespace in the search query", async () => {
        await createFakeEvent({ title: "Summer Festival" }, true);
        await createFakeEvent({ title: "Summer Gathering" }, true);

        const res = await request(app).get("/api/event").query({ search: "   Summer    Festival   " }).send();
        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((event: { title: string }) => event.title)).toEqual(["Summer Festival"]);
    });

    it("Should treat regex metacharacters in search as literal text", async () => {
        await createFakeEvent({ title: "Literal .* Pattern" }, true);
        await createFakeEvent({ title: "Pattern Without Symbols" }, true);

        const res = await request(app).get("/api/event").query({ search: ".*" }).send();
        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((event: { title: string }) => event.title)).toEqual(["Literal .* Pattern"]);
    });

    it("Should reject oversized search input", async () => {
        const res = await request(app).get("/api/event").query({ search: "a".repeat(SEARCH_QUERY_MAX_LENGTH + 1) }).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.data.fieldErrors.search).toEqual([`Search must be maximum ${SEARCH_QUERY_MAX_LENGTH} characters long`]);
    });

    it("Should reject array search payloads", async () => {
        const res = await request(app).get("/api/event").query({ search: ["one", "two"] }).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.data.fieldErrors).toHaveProperty("search");
    });

    it("Should keep geosearch reachable and working as a static route", async () => {
        await createFakeEvent({
            title: "Nearby Event",
            location: {
                type: "Point",
                coordinates: [48.21649, 16.40087]
            }
        }, true);

        const res = await request(app).get("/api/event/geosearch").query({
            lat: 48.21649,
            lng: 16.40087
        }).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((event: { title: string }) => event.title)).toContain("Nearby Event");
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

    beforeAll(async () => {
        const author = await getOneUser();
        const user1 = await createUser({}, true);
        const user2 = await createUser({}, true);
        const user3 = await createUser({}, true);

        const event = await createFakeEvent({ maxAttendees: 10, author: author._id.toString() }, true);
        await Promise.all([
            createFakeRSVP({ event: event._id, user: user1._id, status: STATUS_CONFIRMED }, true),
            createFakeRSVP({ event: event._id, user: user2._id, status: STATUS_CONFIRMED }, true),
            createFakeRSVP({ event: event._id, user: user3._id, status: STATUS_CONFIRMED }, true)
        ]);

        if (!event || !event._id) {
            throw new Error("No events found, check your seeders");
        }
        eventId = event._id.toString();
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
