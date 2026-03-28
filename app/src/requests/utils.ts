import { Request } from "express";
import { RequestData } from "@/types/common";

export function buildRequestData(req: Request): RequestData {
    const dbFilter = req.dbFilter;
    const sort = req.sort;
    const search = req.search;
    const pagination = {
        offset: req.offset ?? 0,
        limit: req.limit ?? 10
    };

    return {
        dbFilter,
        sort,
        search,
        pagination
    };
}
