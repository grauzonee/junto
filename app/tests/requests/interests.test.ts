import request from "supertest";
import app from "@/app";

describe("GET /api/interests", () => {
    it("Should return a list of interests without authentication", async () => {
        const res = await request(app).get('/api/interests');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        const interest = res.body.data[0];
        expect(interest).toHaveProperty('_id');
        expect(interest).toHaveProperty('title');
    });
});
