import request from "supertest";
import { NextFunction, Request, Response } from "express";
import app from "@/app";
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

beforeAll(async () => {
    user = await createUser({}, true);
    if (!user) {
        throw new Error("No user could be created, check your seeders");
    }
});

describe("GET /api/categories", () => {
    it("Should return a list of categories", async () => {
        const res = await request(app).get('/api/categories');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        const category = res.body.data[0];
        expect(category).toHaveProperty('_id');
        expect(category).toHaveProperty('title');
        expect(category).toHaveProperty('subcategories');
        expect(Array.isArray(category.subcategories)).toBe(true);
        if (category.subcategories.length > 0) {
            const subcategory = category.subcategories[0];
            expect(subcategory).toHaveProperty('_id');
            expect(subcategory).toHaveProperty('title');
        }
    });
});
