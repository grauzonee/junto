import { Request } from "express";
import { Category } from "@/models/Category";

export async function list(req: Request) {
    const categories = await Category.getTree(req.offset, req.limit);
    return categories;
}
