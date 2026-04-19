import { NextFunction, Request, Response } from "express";
import * as z from "zod";
import { ZodError } from "zod";
import { SearchQuerySchema } from "@/schemas/http/Search";
import messages from "@/constants/errorMessages";

export function searchNormalizer(req: Request, res: Response, next: NextFunction) {
    try {
        const query = SearchQuerySchema.parse(req.query);
        req.search = query.search;
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ success: false, data: z.flattenError(error) });
            return;
        }

        res.status(500).json({ success: false, data: { message: messages.response.SERVER_ERROR() } });
    }
}
