/**
 * Helper functions for JWT token generation and verification.
 * 
 * @packageDocumentation
 */

import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { getConfigValue } from "@/helpers/configHelper";
import { User } from "@/models/User";
import { Request } from "express"

/**
 * Generates a JWT token for a given user ID.
 * @param string id 
 * @returns jwt token
 */
export function generateToken(id: string): string {
    const jwtSecret = getConfigValue('JWT_SECRET')
    return jsonwebtoken.sign({ id }, jwtSecret, { 'expiresIn': '1h' });
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * @param string token 
 * @returns JwtPayload
 */
export const verifyToken = (token: string): JwtPayload => {
    try {
        return jsonwebtoken.verify(token, getConfigValue('JWT_SECRET')) as JwtPayload;
    } catch {
        throw Error("Not authorized");
    }
}

/**
 * Retrieves the user associated with the JWT token in the request.
 * @param {Request} req 
 * @returns 
 */
export const getUserByToken = async (req: Request) => {
    const token: string = req.headers.authorization?.replace('Bearer ', '') ?? '';
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}
