import { Request, Response, NextFunction } from "express";

export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
    return function (req: Request, res: Response, next: NextFunction) {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };
}