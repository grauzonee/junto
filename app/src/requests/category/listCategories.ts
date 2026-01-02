import { Request, Response } from "express";
import { list } from "@/services/categoryService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { buildRequestData } from "@/requests/utils";

export async function listCategories(req: Request, res: Response) {
    const categories = await list(buildRequestData(req));
    setSuccessResponse(res, categories);
}
