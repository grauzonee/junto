import { Request, Response } from "express"
import { getUserByToken } from "@/helpers/jwtHelper";
import { User } from "@/models/User";
import messages from "@/constants/errorMessages"
import { setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";

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