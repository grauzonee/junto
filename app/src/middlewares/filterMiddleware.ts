import { NextFunction, Request, Response } from "express";
import { type Filterable, type FilterPrefix, ARRAY_PREFIXES, type Filter, type FilterValue, isFilterPrefix, isFilterValue } from "@/types/Filter";

function parseFilterValue(filterValue: string, filterPrefix: FilterPrefix): FilterValue {
    const isArray = filterValue[0] == '[' && filterValue[filterValue.length - 1] == ']';
    const isArrayPrefix = ARRAY_PREFIXES.includes(filterPrefix);

    if (isArray !== isArrayPrefix) {
        throw Error("Invalid filter value " + filterValue)
    }

    const result = isArray ? filterValue.replace(" ", "").substring(1, filterValue.length - 1).split(',') : filterValue;

    if (!isFilterValue(result)) {
        throw Error("Invalid filter value " + filterValue)
    }
    return result;
}

export const filterMiddleware = (entity: Filterable) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.query) {
            next();
            return;
        }
        const filterableFields = entity.getFilterableFields();
        const dbFilter: Filter[] = [];
        for (const [filterKey, filterValue] of Object.entries(req.query)) {
            const filterParts = filterKey.split("_");
            if (filterParts.length != 2) {
                res.status(400).json({ success: false, message: "Invalid filter name " + filterKey + " filters should consist of 2 parts" })
                return;
            }

            if (!isFilterPrefix(filterParts[1])) {
                res.status(400).json({ success: false, message: "Invalid filter name " + filterKey + ", no such operator" })
                return;
            }
            if (!filterableFields.includes(filterParts[0])) {
                res.status(400).json({ success: false, message: "Invalid filter name " + filterKey + ", this field is not filterable" })
                return;
            }
            try {
                const value = parseFilterValue(filterValue as string, filterParts[1]);
                dbFilter.push({ prefix: filterParts[1], field: filterParts[0], value })
            } catch (error) {
                res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid filter value ' + filterValue })
                return;
            }
        }
        req.dbFilter = dbFilter
        next();

    }
}
