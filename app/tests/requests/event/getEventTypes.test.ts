import { getEventTypes } from "@/requests/event/getEventTypes";
import { NextFunction } from "express";
import { Types } from "mongoose"
import { getMockedRequest, getMockedResponse } from "../../utils";

const req = getMockedRequest({}, {}, { limit: 0 });
const res = getMockedResponse();
const next = jest.fn() as NextFunction;

describe("getEventTypes request handler tests", () => {
    it("Should return '_id' and 'title' fields", async () => {
        await getEventTypes(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: expect.arrayContaining([
                expect.objectContaining({
                    "title": expect.any(String),
                    "_id": expect.any(Types.ObjectId),
                })
            ]),
            success: true
        });
    })
    it("Should paginate", async () => {
        req.limit = 2;
        await getEventTypes(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: [
                expect.objectContaining({
                    "title": expect.any(String),
                    "_id": expect.any(Types.ObjectId),
                }),
                expect.objectContaining({
                    "title": expect.any(String),
                    "_id": expect.any(Types.ObjectId),
                }),
            ],
            success: true
        });
    })
})
