jest.mock("@/config/loggerConfig", () => ({
    logger: {
        info: jest.fn(),
    },
}));

import { EventEmitter } from "node:events";
import { NextFunction, Request, Response } from "express";
import { logger } from "@/config/loggerConfig";
import { REQUEST_ID_HEADER, requestLogging } from "@/middlewares/requestLogging";

describe("requestLogging middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should propagate request id and log one structured entry after the response finishes", async () => {
        const requestId = "request-123";
        const req = {
            method: "GET",
            originalUrl: "/logged-route?token=secret",
            get: jest.fn().mockReturnValue(requestId),
        } as unknown as Request;
        const res = Object.assign(new EventEmitter(), {
            statusCode: 201,
            setHeader: jest.fn(),
        }) as unknown as Response;
        const next = jest.fn(() => {
            expect(req.requestId).toBe(requestId);
            res.emit("finish");
        }) as NextFunction;

        requestLogging(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, requestId);
        expect(next).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalledWith("request.completed", expect.objectContaining({
            requestId,
            method: "GET",
            path: "/logged-route",
            status: 201,
            latency: expect.any(Number),
        }));
    });

    it("should generate a request id when the header is missing", async () => {
        const req = {
            method: "GET",
            originalUrl: "/generated-request-id",
            get: jest.fn().mockReturnValue(undefined),
        } as unknown as Request;
        const res = Object.assign(new EventEmitter(), {
            statusCode: 200,
            setHeader: jest.fn(),
        }) as unknown as Response;
        const next = jest.fn(() => {
            expect(req.requestId).toEqual(expect.any(String));
            res.emit("finish");
        }) as NextFunction;

        requestLogging(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, expect.any(String));
        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalledWith("request.completed", expect.objectContaining({
            requestId: req.requestId,
            method: "GET",
            path: "/generated-request-id",
            status: 200,
            latency: expect.any(Number),
        }));
    });
});
