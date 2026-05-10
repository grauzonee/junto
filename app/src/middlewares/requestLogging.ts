import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { logger } from "@/config/loggerConfig";

export const REQUEST_ID_HEADER = "x-request-id";

function getRequestPath(originalUrl: string): string {
    const [path] = originalUrl.split("?");
    return path || originalUrl;
}

export function requestLogging(req: Request, res: Response, next: NextFunction): void {
    const requestId = req.get(REQUEST_ID_HEADER) || randomUUID();
    const startedAt = process.hrtime.bigint();

    req.requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    res.once("finish", () => {
        const latency = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

        logger.info("request.completed", {
            requestId,
            method: req.method,
            path: getRequestPath(req.originalUrl),
            status: res.statusCode,
            latency,
        });
    });

    next();
}
