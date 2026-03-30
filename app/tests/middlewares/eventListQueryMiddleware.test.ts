import { eventListQueryMiddleware } from "@/middlewares/eventListQueryMiddleware";
import { SEARCH_QUERY_MAX_LENGTH } from "@/schemas/http/Event";
import { NextFunction, Request, Response } from "express";

describe("eventListQueryMiddleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock }));
        req = { query: {} };
        res = { status: statusMock };
        next = jest.fn();
    });

    it("normalizes valid search input", () => {
        req.query = { search: "   community    meetup   " };

        eventListQueryMiddleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.search).toBe("community meetup");
    });

    it("rejects non-string search payloads", () => {
        req.query = { search: { $ne: "anything" } } as Request["query"];

        eventListQueryMiddleware(req as Request, res as Response, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            data: {
                formErrors: [],
                fieldErrors: {
                    search: ["Invalid input: expected string, received object"]
                }
            }
        });
    });

    it("rejects oversized search input", () => {
        req.query = { search: "a".repeat(SEARCH_QUERY_MAX_LENGTH + 1) };

        eventListQueryMiddleware(req as Request, res as Response, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            data: {
                formErrors: [],
                fieldErrors: {
                    search: [`Search must be maximum ${SEARCH_QUERY_MAX_LENGTH} characters long`]
                }
            }
        });
    });
});
