import { Request, Response } from "express"
import { getUserByToken } from "@/helpers/jwtHelper";
import { User } from "@/models/User";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";
import { NotFoundError } from "@/types/errors/InputError";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params?.id;
    const user = id ? await User.findById(id) : await getUserByToken(req);
    if (!user) {
        throw new NotFoundError("User");
    }
    setSuccessResponse(res, user);
});
