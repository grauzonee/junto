import { paginateMiddleware } from "@/middlewares/paginateMiddleware";
import { Request, Response, NextFunction } from "express";

describe("paginateMiddleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { query: {} };
        res = {};
        next = jest.fn();
    });

    it("should set default offset=0 and limit=20 when no query params", () => {
        paginateMiddleware(req as Request, res as Response, next);

        expect(req.offset).toBe(0);
        expect(req.limit).toBe(20);
        expect(next).toHaveBeenCalled();
    });

    it("should calculate offset correctly when page and limit are provided", () => {
        req.query = { page: "2", limit: "10" };

        paginateMiddleware(req as Request, res as Response, next);

        expect(req.offset).toBe(10); // (2 - 1) * 10
        expect(req.limit).toBe(10);
        expect(next).toHaveBeenCalled();
    });

    it("should handle page=3 and limit=5", () => {
        req.query = { page: "3", limit: "5" };

        paginateMiddleware(req as Request, res as Response, next);

        expect(req.offset).toBe(10); // (3 - 1) * 5
        expect(req.limit).toBe(5);
        expect(next).toHaveBeenCalled();
    });

    it("should fall back to defaults if values are not numbers", () => {
        req.query = { page: "abc", limit: "xyz" };

        paginateMiddleware(req as Request, res as Response, next);

        expect(req.offset).toBe(0); // defaults to page=1, limit=20
        expect(req.limit).toBe(20);
        expect(next).toHaveBeenCalled();
    });
});

