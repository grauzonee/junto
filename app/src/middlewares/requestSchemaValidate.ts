import * as z from "zod"
import { ZodError } from "zod"
import { Request, Response, NextFunction } from "express"

export const requestSchemaValidate = (schema: z.Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body)
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMsg = z.flattenError(error)
                res.status(400).json({ success: false, data: errorMsg });
                return;
            }
            res.status(500).json({ success: false, data: { message: "Server error, please try again" } });
            return;
        }
        next();
    }
}
