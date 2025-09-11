import { Request, Response, NextFunction } from "express";

export function paginateMiddleware(req: Request, res: Response, next: NextFunction) {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const safePage = !isNaN(page) && page > 0 ? page : 1;
    const safeLimit = !isNaN(limit) && limit > 0 ? limit : 20;

    req.offset = (safePage - 1) * safeLimit;
    req.limit = safeLimit;
    next()
}
