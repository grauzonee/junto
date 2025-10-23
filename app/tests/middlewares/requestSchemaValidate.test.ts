import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";
import * as z from "zod"
import { Request, Response, NextFunction } from "express";

describe("requestSchemaValidate middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock }));

        req = { body: {} };
        res = { status: statusMock };
        next = jest.fn();
    });

    it("calls next() if validation passes", () => {
        const schema = z.object({
            name: z.string(),
        });

        req.body = { name: "John" };

        const middleware = requestSchemaValidate(schema);
        middleware(req as Request, res as Response, next);

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
        middleware(req as Request, res as Response, next);

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
        middleware(req as Request, res as Response, next);

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

