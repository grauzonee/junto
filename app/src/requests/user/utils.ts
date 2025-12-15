import { Request } from "express"
import messages from "@/constants/errorMessages"
import { User } from "@/models/User";

export async function validateUpdateData(req: Request): Promise<{ error?: string | null; field?: string | null }> 
{
    const requestData = req.body;
    if (requestData.username) {
        const username = requestData.username;
        const userExistsUsername = await User.findOne({ username });
        if (userExistsUsername && userExistsUsername.id != req.user?.id) {
            return { error: messages.response.IN_USE("Username"), field: 'username' };
        }
    }
    if (requestData.email) {
        const email = requestData.email;
        const userExistsEmail = await User.findOne({ email });
        if (userExistsEmail && userExistsEmail.id != req.user?.id) {
            return { error: messages.response.IN_USE("Email"), field: 'email' };
        }
    }
    return { error: null, field: null };
}