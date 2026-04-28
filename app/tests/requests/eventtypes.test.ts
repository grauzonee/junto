import request from "supertest";
import app from "@/app";

describe("GET /api/event/types", () => {
    it("Should return a list of event types without authentication", async () => {
        const res = await request(app).get('/api/event/types');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        const eventType = res.body.data[0];
        expect(eventType).toHaveProperty('_id');
        expect(eventType).toHaveProperty('title');
    });

    it("Should filter event types by title", async () => {
        const res = await request(app).get('/api/event/types').query({ title_contains: "work" });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((eventType: { title: string }) => eventType.title)).toEqual(["Workshop"]);
    });
});
