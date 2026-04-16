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

    it.each([
        { name: "no query params", query: {}, expectedOffset: 0, expectedLimit: 20 },
        { name: "page=2 and limit=10", query: { page: "2", limit: "10" }, expectedOffset: 10, expectedLimit: 10 },
        { name: "page=3 and limit=5", query: { page: "3", limit: "5" }, expectedOffset: 10, expectedLimit: 5 },
        { name: "non-numeric values", query: { page: "abc", limit: "xyz" }, expectedOffset: 0, expectedLimit: 20 },
    ])("should set pagination for $name", ({ query, expectedOffset, expectedLimit }) => {
        req.query = query;

        paginateMiddleware(req as Request, res as Response, next);

        expect(req.offset).toBe(expectedOffset);
        expect(req.limit).toBe(expectedLimit);
        expect(next).toHaveBeenCalled();
    });
});
