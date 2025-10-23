import { NextFunction, Request, Response } from "express";
import { type Sortable, SortSchema } from "@/types/Sort";
import z, { ZodError } from "zod";

export const sortMiddleware = (entity: Sortable) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const sortableFields = new Set(entity.getSortableFields());
            const query = SortSchema.parse(req.query)
            const sortField = query.sortByDesc || query.sortByAsc;
            if (sortField && !sortableFields.has(sortField)) {
                res.status(400).json({ success: false, data: { message: `Field ${sortField} is not sortable` } })
                return;
            }
            req.sort = query;
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ success: false, data: z.flattenError(error) })
                return;
            }
        }
    }
}
