import { buildFilterQuery } from "@/helpers/queryBuilder";
import { Interest } from "@/models/Interest";
import { RequestData } from "@/types/common";

export async function list(data: RequestData) {
    const interests = await Interest.find(buildFilterQuery(data.dbFilter)).paginate(data.pagination.offset, data.pagination.limit)
    return interests;
}
