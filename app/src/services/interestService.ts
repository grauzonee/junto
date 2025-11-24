import { buildFilterQuery } from "@/helpers/queryBuilder";
import { Interest } from "@/models/Interest";
import { Request } from "express";

export async function list(req: Request) {
    const interests = await Interest.find(buildFilterQuery(req.dbFilter)).paginate(req.offset, req.limit)
    return interests;
}
