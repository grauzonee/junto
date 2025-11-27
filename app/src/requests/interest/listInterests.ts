import { Request, Response } from "express";
import { list } from "@/services/interestService";
import { setSuccessResponse } from "@/helpers/requestHelper";

export async function listInterests(req: Request, res: Response) {
    const interests = await list(req);
    setSuccessResponse(res, interests.map(i => i.toJSON()))
}
