import { NextFunction, Request, Response } from "express";
import { type Filterable, type FilterPrefix, ARRAY_PREFIXES, SKIP_WORDS, type Filter, type FilterValue, isFilterPrefix, isFilterValue, FilterableField } from "@/types/Filter";
import { BadInputError } from "@/types/errors/InputError";

function parseFilterValue(filterValue: string, filterPrefix: FilterPrefix, preprocess: (value: FilterValue) => FilterValue = (value) => value): FilterValue {
    const isArray = filterValue[0] == '[' && filterValue[filterValue.length - 1] == ']';
    const isArrayPrefix = ARRAY_PREFIXES.includes(filterPrefix);

    if (isArray !== isArrayPrefix) {
        throw Error("Invalid filter value " + filterValue)
    }

    const result = isArray ? filterValue.replace(" ", "").substring(1, filterValue.length - 1).split(',') : filterValue;

    if (!isFilterValue(result)) {
        throw Error("Invalid filter value " + filterValue)
    }
    return preprocess(result);
}

function parseFilterKey(filterKey: string, filterableFields: FilterableField[]): { filterableField: FilterableField, fieldKey: string, operator: string } | undefined {
    if (SKIP_WORDS.includes(filterKey)) {
        return undefined;
    }
    const [fieldKey, operator] = filterKey.split("_");

    if (!isFilterPrefix(operator)) {
        throw new BadInputError(filterKey, "Invalid filter name " + filterKey + ", no such operator")
    }
    const filterableField = filterableFields.find(f => f.field === fieldKey);
    if (!filterableField) {
        throw new BadInputError(filterKey, "Invalid filter name " + filterKey + ", this field is not filterable")
    }
    return { filterableField, fieldKey, operator };
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

            try {
                const parsed = parseFilterKey(filterKey, filterableFields)
                if (!parsed) {
                    continue;
                }
                const { filterableField, fieldKey, operator } = parsed

                const value = parseFilterValue(filterValue as string, operator, filterableField.preprocess);
                let newFilter: Filter = { prefix: operator, field: fieldKey, value }
                if (filterableField.options) {
                    newFilter = { ...newFilter, options: filterableField.options }
                }
                dbFilter.push(newFilter)
            } catch (error) {
                res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid filter value ' + filterValue })
                return;
            }
        }
        req.dbFilter = dbFilter
        next();

    }
}
