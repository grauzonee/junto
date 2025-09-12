import { Request, Response, NextFunction } from 'express';
import { getUserByToken } from '@/helpers/jwtHelper';
import { IUser } from '@/models/User';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    try {
        const user: IUser = await getUserByToken(req);
        req.user = user;
        next();
    } catch {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
} 
