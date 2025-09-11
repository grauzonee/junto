import Joi from "joi"
import { Request, Response, NextFunction } from "express"

export const requestSchemaValidate = (schema: Joi.Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false })
        if (error) {
            const message = error.details.map(i => i.message).join(',');
            res.status(400).json({ success: false, message: message });
            return;
        }
        next();
    }
}
