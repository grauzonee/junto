import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";
import Joi from "joi";
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
        const schema = Joi.object({
            name: Joi.string().required(),
        });

        req.body = { name: "John" };

        const middleware = requestSchemaValidate(schema);
        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
    });

    it("returns 400 with error message if validation fails", () => {
        const schema = Joi.object({
            name: Joi.string().required(),
        });

        req.body = {};
        const middleware = requestSchemaValidate(schema);
        middleware(req as Request, res as Response, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            message: '"name" is required',
        });
    });

    it("concatenates multiple validation errors", () => {
        const schema = Joi.object({
            name: Joi.string().required(),
            age: Joi.number().required(),
        });

        req.body = {};
        const middleware = requestSchemaValidate(schema);
        middleware(req as Request, res as Response, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            message: '"name" is required,"age" is required',
        });
    });
});

