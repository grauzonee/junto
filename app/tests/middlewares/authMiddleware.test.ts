import { authMiddleware } from "@/middlewares/authMiddleware";
import { getUserByToken } from "@/helpers/jwtHelper";
import { NextFunction } from "express";
import { HydratedUserDoc } from "@/models/user/User";
import { getMockedRequest, getMockedResponse } from "../utils";

jest.mock("@/helpers/jwtHelper", () => ({
    getUserByToken: jest.fn(),
}));

describe("authMiddleware", () => {
    let req = getMockedRequest({}, {}, { headers: {} });
    let res = getMockedResponse();
    let next: NextFunction;

    beforeEach(() => {
        req = getMockedRequest({}, {}, { headers: {} });
        res = getMockedResponse();
        next = jest.fn();
        jest.clearAllMocks();
    });

    it("should return 401 if no authorization header", async () => {
        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Unauthorized",
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should attach user to request and call next if token is valid", async () => {
        const mockUser = { id: "123", email: "test@test.com" } as HydratedUserDoc;
        (getUserByToken as jest.Mock).mockResolvedValue(mockUser);

        req.headers = { authorization: "Bearer validtoken" };

        await authMiddleware(req, res, next);

        expect(getUserByToken).toHaveBeenCalledWith(req);
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });

    it("should return 401 if getUserByToken throws an error", async () => {
        (getUserByToken as jest.Mock).mockRejectedValue(new Error("Invalid token"));
        req.headers = { authorization: "Bearer invalidtoken" };

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Unauthorized",
        });
        expect(next).not.toHaveBeenCalled();
    });
});
