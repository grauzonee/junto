import { searchNormalizer } from "@/middlewares/searchNormalizer";
import { SEARCH_QUERY_MAX_LENGTH } from "@/schemas/http/Search";
import { NextFunction } from "express";
import { getMockedRequest, getMockedResponse } from "../utils";

describe("searchNormalizer", () => {
    let req = getMockedRequest({}, {}, { query: {} });
    let res = getMockedResponse();
    let next: NextFunction;

    beforeEach(() => {
        req = getMockedRequest({}, {}, { query: {} });
        res = getMockedResponse();
        next = jest.fn();
    });

    it("normalizes valid search input", () => {
        req.query = { search: "   community    meetup   " };

        searchNormalizer(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.search).toBe("community meetup");
    });

    it("rejects non-string search payloads", () => {
        req.query = { search: { $ne: "anything" } } as never;

        searchNormalizer(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
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

        searchNormalizer(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
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
