import { Request, Response } from "express"
import { getUserByToken } from "@/helpers/jwtHelper";
import { User } from "@/models/User";

export async function updateUser(req: Request, res: Response) {
    const requestData = req.body;
    if (!requestData) {
        return res.status(401).json({ success: false, message: "Empty body is not allowed" });
    }
    try {
        await validateUpdateData(req);
    } catch (error) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : error });
    }

    try {
        if (requestData.avatarUrl) {
            requestData.avatarUrl = requestData.avatarUrl.replace(/^\/+/, "").trim()
        }
        const user = await req.user?.updateProfile(requestData);
        return res.status(200).json({ success: true, data: user ? user.toJSON() : null });
    } catch (error) {
        return res.status(401).json({ success: false, message: error instanceof Error ? error.message : error });
    }
}

export const getProfile = async (req: Request, res: Response) => {
    try {
        const id = req.params?.id;
        const user = id ? await User.findById(id) : await getUserByToken(req);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json(
            { success: true, data: user }
        );
    } catch (error) {
        return res.status(401).json({ success: false, message: error });
    }
}

export async function updatePassword(req: Request, res: Response) {
    const requestData = req.body;
    try {
        await req.user?.updatePassword(requestData);
        return res.status(200).json({ success: true, message: "Password has been updated" });
    } catch (error) {
        return res.status(401).json({ success: false, message: error instanceof Error ? error.message : error });
    }
}

async function validateUpdateData(req: Request) {
    const requestData = req.body;
    if (requestData.username) {
        const username = requestData.username;
        const userExistsUsername = await User.findOne({ username });
        if (userExistsUsername && userExistsUsername.id != req.user?.id) {
            throw Error("Username already in use!");
        }
    }
    if (requestData.email) {
        const email = requestData.email;
        const userExistsEmail = await User.findOne({ email });
        if (userExistsEmail && userExistsEmail.id != req.user?.id) {
            throw Error("Email already in use!");
        }
    }
}
