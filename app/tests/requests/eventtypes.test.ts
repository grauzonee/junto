import request from "supertest";
import { NextFunction, Request, Response } from "express";
import { createUser } from "../generators/user";

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

describe("GET /api/eventtypes", () => {
    beforeAll(async () => {
        user = await createUser({}, true);
        if (!user) {
            throw new Error("No user could be created, check your seeders");
        }
    });

    it("Should return a list of event types", async () => {
        const res = await request(app).get('/api/eventtypes');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        const eventType = res.body.data[0];
        expect(eventType).toHaveProperty('_id');
        expect(eventType).toHaveProperty('title');
    });
});
