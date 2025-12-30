import { Request } from "express";
import { Category } from "@/models/Category";
import { PaginationData } from "@/types/common";

export async function list(data: PaginationData) {
    const categories = await Category.getTree(req.offset, req.limit);
    return categories;
}
