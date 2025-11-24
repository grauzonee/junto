import { authMiddleware } from "@/middlewares/authMiddleware";
import { getUserByToken } from "@/helpers/jwtHelper";
import { Request, Response, NextFunction } from "express";
import { HydratedUserDoc } from "@/models/User";

jest.mock("@/helpers/jwtHelper", () => ({
    getUserByToken: jest.fn(),
}));

describe("authMiddleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it("should return 401 if no authorization header", async () => {
        await authMiddleware(req as Request, res as Response, next);

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

        await authMiddleware(req as Request, res as Response, next);

        expect(getUserByToken).toHaveBeenCalledWith(req);
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });

    it("should return 401 if getUserByToken throws an error", async () => {
        (getUserByToken as jest.Mock).mockRejectedValue(new Error("Invalid token"));
        req.headers = { authorization: "Bearer invalidtoken" };

        await authMiddleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Unauthorized",
        });
        expect(next).not.toHaveBeenCalled();
    });
});

