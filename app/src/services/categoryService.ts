import { Request } from "express";
import { Category } from "@/models/Category";
import { buildFilterQuery } from "@/helpers/queryBuilder";

export async function list(req: Request) {
    const categories = await Category.find(buildFilterQuery(req.dbFilter)).paginate(req.offset, req.limit);
    return categories;
}
