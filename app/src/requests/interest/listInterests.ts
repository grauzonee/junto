import { Request, Response } from "express";
import { list } from "@/services/interestService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";

export const listInterests = asyncHandler(async (req: Request, res: Response) => {
    const interests = await list(req);
    setSuccessResponse(res, interests.map(i => i.toJSON()));
});

