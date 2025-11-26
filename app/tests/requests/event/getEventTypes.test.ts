import { getEventTypes } from "@/requests/event/getEventTypes";
import { Request, Response } from "express";
import { Types } from "mongoose"

const req = { body: {}, limit: 0 };
const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
};

describe("getEventTypes request handler tests", () => {
    it("Should return '_id' and 'title' fields", async () => {
        await getEventTypes(req as Request, res as Response);
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
        await getEventTypes(req as Request, res as Response);
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
