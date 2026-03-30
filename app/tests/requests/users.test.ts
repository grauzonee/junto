// get /
// put /
// put /password
import { NextFunction, Request, Response } from "express";
import app from "@/app";
import { createUser } from "../generators/user";
import request from "supertest";
import { getUserByToken } from "@/helpers/jwtHelper";

let user: Awaited<ReturnType<typeof createUser>>;

jest.mock('@/middlewares/authMiddleware', () => ({
    authMiddleware: jest.fn().mockImplementation(
        async (req: Request, _res: Response, next: NextFunction) => {
            req.user = user;
            next();
        }
    ),
}));

jest.mock("@/helpers/jwtHelper")


beforeAll(async () => {
    user = await createUser({}, true);
});

describe("GET /api/user", () => {
    it("Should return the user's profile", async () => {
        jest.mocked(getUserByToken).mockResolvedValue(user);
        const res = await request(app).get('/api/user');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data._id.toString()).toBe(user._id.toString());
        expect(res.body.data).toHaveProperty('username');
        expect(res.body.data.username).toBe(user.username);
    });
});

describe("PUT /api/user", () => {
    it("Should update the user's profile", async () => {
        const newUsername = "newUsername";
        const res = await request(app).put('/api/user').send({ username: newUsername });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data._id.toString()).toBe(user._id.toString());
        expect(res.body.data).toHaveProperty('username');
        expect(res.body.data.username).toBe(newUsername);
    });
});

describe("PUT /api/user/password", () => {
    it("Should update the user's password", async () => {
        const newPassword = "newPassword123";
        const res = await request(app).put('/api/user/password').send({ oldPassword: "password123", newPassword });
        expect(res.statusCode).toBe(200);
    });
});
