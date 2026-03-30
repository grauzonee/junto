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
import successMessages from "@/constants/successMessages";
import { User } from "@/models/user/User";
import { Event } from "@/models/event/Event";

describe("DELETE /api/user", () => {
    it("Should soft delete the current user and their authored events", async () => {
        user = await createUser({}, true);
        const event = await createFakeEvent({ author: user._id.toString() }, true);

        const res = await request(app).delete("/api/user").send();
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual({ message: successMessages.response.PROFILE_DELETED });

        const deletedUser = await User.findById(user._id);
        const deletedEvent = await Event.findById(event._id);

        expect(deletedUser?.active).toBe(false);
        expect(deletedEvent?.active).toBe(false);
    });
});
