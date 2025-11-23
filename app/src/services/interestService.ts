import { buildFilterQuery } from "@/helpers/queryBuilder";
import { Interest } from "@/models/Interest";
import { Request } from "express";
import { InterestDocument } from "@/models/Interest";

export async function list(req: Request): Promise<InterestDocument[]> {
    const interests = await Interest.find(buildFilterQuery(req.dbFilter)).paginate(req.offset, req.limit)
    return interests;
}
