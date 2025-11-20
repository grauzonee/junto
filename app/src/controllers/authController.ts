import { Request, Response } from "express"
import { User, UserDocument } from "@/models/User"
import { generateToken } from "@/helpers/jwtHelper";

/**
 * Login user 
 * @param {Request} req 
 * @param {Response} res 
 */
export async function login(req: Request, res: Response) {
    const { email, password } = req.body
    const userFound = await User.findOne({ email });
    if (!userFound) {
        res.status(404).json({ success: false, message: "User not found" })
        return;
    }
    const passValid = await userFound.matchPassword(password);
    if (!passValid) {
        res.status(400).json({ success: false, message: "Wrong password" })
        return;
    }
    const token = generateToken(userFound.id)
    res.status(200).json({ success: true, data: { token, ...userFound.toJSON() } })
}

/**
 * Register user
 * @param {Request} req 
 * @param {Response} res 
 */
export async function register(req: Request, res: Response) {
    const { username, email, password } = req.body
    const userExistsEmail = await User.findOne({ email });
    if (userExistsEmail) {
        return res.status(400).json({ success: false, data: { message: "Email already in use", field: 'email' } });
    }
    const userExistsUsername = await User.findOne({ username });
    if (userExistsUsername) {
        return res.status(400).json({ success: false, data: { message: "Username already in use", field: 'username' } });
    }
    const user: UserDocument = await User.create({ username, email, password });

    if (user) {
        const token = generateToken(user._id);
        const userJSON = user.toJSON();
        const responseData = { ...userJSON, token };
        return res.status(201).json(
            { success: true, data: responseData }
        );
    } else {
        return res.status(400).json({ success: false, data: { message: "Invalid user data", field: 'root' } });
    }
}
