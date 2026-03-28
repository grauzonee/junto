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
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 12, 0, 0, 0);

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
        await Promise.all([
            createFakeRSVP({ event: event._id, user: user1._id, status: STATUS_CONFIRMED }, true),
            createFakeRSVP({ event: event._id, user: user2._id, status: STATUS_CONFIRMED }, true),
            createFakeRSVP({ event: event._id, user: user3._id, status: STATUS_CONFIRMED }, true)
        ]);

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
