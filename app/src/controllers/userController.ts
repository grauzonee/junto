import { Request, Response } from "express"
import { getUserByToken } from "@/helpers/jwtHelper";
import { User } from "@/models/User";
import messages from "@/constants/errorMessages"
import { parseMongooseValidationError, setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";
import mongoose from "mongoose";
import { BadInputError } from "@/types/errors/InputError";

export async function updateUser(req: Request, res: Response) {
    const requestData = req.body;
    if (!requestData) {
        setErrorResponse(res, 400, {}, [messages.response.EMPTY_BODY]);
        return;
    }
    const { error, field } = await validateUpdateData(req);
    if (error && field) {
        setErrorResponse(res, 400, { [field]: error });
        return;
    }

    try {
        if (requestData.avatarUrl) {
            requestData.avatarUrl = requestData.avatarUrl.replace(/^\/+/, "").trim()
        }
        const user = await req.user?.updateProfile(requestData);
        setSuccessResponse(res, user.toJSON());
        return;
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const fieldErrors = parseMongooseValidationError(error);
            setErrorResponse(res, 400, fieldErrors);
            return;
        }
        setErrorResponse(res, 400, {}, [messages.response.SERVER_ERROR()]);
    }
}

export const getProfile = async (req: Request, res: Response) => {
    try {
        const id = req.params?.id;
        const user = id ? await User.findById(id) : await getUserByToken(req);
        if (!user) {
            setErrorResponse(res, 404, {}, [messages.response.NOT_FOUND("User")]);
        }
        setSuccessResponse(res, user);
    } catch {
        setErrorResponse(res, 500, {}, [messages.response.SERVER_ERROR()]);
    }
}

export async function updatePassword(req: Request, res: Response) {
    const requestData = req.body;
    try {
        await req.user?.updatePassword(requestData);
        setSuccessResponse(res, { message: "Password has been updated" });
        return;
    } catch (error) {
        if (error instanceof BadInputError) {
            setErrorResponse(res, 400, {}, [error.message]);
            return;
        }
        setErrorResponse(res, 500, {}, [messages.response.SERVER_ERROR()]);
    }
}

async function validateUpdateData(req: Request): Promise<{ error?: string | null; field?: string | null }> {
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
