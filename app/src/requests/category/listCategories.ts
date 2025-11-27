import { Request, Response } from "express";
import { list } from "@/services/categoryService";
import { setSuccessResponse } from "@/helpers/requestHelper";

export async function listCategories(req: Request, res: Response) {
    const categories = await list(req);
    setSuccessResponse(res, categories);
}
