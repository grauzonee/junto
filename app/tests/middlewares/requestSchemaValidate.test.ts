import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";
import * as z from "zod"
import { NextFunction } from "express";
import { getMockedRequest, getMockedResponse } from "../utils";

describe("requestSchemaValidate middleware", () => {
    let req = getMockedRequest();
    let res = getMockedResponse();
    let next: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock }));

        req = getMockedRequest();
        req.body = {};
        res = { status: statusMock, json: jsonMock } as unknown as ReturnType<typeof getMockedResponse>;
        next = jest.fn();
    });

    it("calls next() if validation passes", () => {
        const schema = z.object({
            name: z.string(),
        });

        req.body = { name: "John" };

        const middleware = requestSchemaValidate(schema);
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
    });

    it("returns 400 with error message if validation fails", () => {
        const schema = z.object({
            name: z.string(),
        });

        req.body = {};
        const middleware = requestSchemaValidate(schema);
        middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            data: {
                formErrors: [],
                fieldErrors: {
                    name: ['Invalid input: expected string, received undefined']
                }
            }
        });
    });

    it("concatenates multiple validation errors", () => {
        const schema = z.object({
            name: z.string(),
            age: z.number(),
        });

        req.body = {};
        const middleware = requestSchemaValidate(schema);
        middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            data: {
                formErrors: [],
                fieldErrors: {
                    name: ['Invalid input: expected string, received undefined'],
                    age: ['Invalid input: expected number, received undefined']
                }
            }
        });
    });
});
