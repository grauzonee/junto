import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { getConfigValue } from "@/helpers/configHelper";
import { IUser, User } from "@/models/User";
import { Request } from "express"

export function generateToken(id: string) {
    const jwtSecret = getConfigValue('JWT_SECRET')
    return jsonwebtoken.sign({ id }, jwtSecret, { 'expiresIn': '1h' });
}

export const verifyToken = (token: string): JwtPayload => {
    try {
        return jsonwebtoken.verify(token, getConfigValue('JWT_SECRET')) as JwtPayload;
    } catch {
        throw Error("Not authorized");
    }
}

export const getUserByToken = async (req: Request): Promise<IUser> => {
    const token: string = req.headers.authorization?.replace('Bearer ', '') ?? '';
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}
