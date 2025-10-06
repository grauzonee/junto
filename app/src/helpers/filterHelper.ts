import { Request } from 'express'
import { ObjectId, RootFilterQuery } from 'mongoose';
import { Search, WhereField } from 'redis-om'

type Operator = '=' | '>' | '<' | '>=' | '<=' | '!=' | 'contains';
type OperatorFnRedis = (where: WhereField, value: string) => Search;
export type OperatorFnMongo<T extends string | ObjectId> = (
    field: string,
    value: T
) => Record<string, unknown>;

interface FilterField {
    field: string,
    operator: Operator,
    value: string
}

const OPERATOR_MAP_REDIS: Record<Operator, OperatorFnRedis> = {
    '=': (where, value) => where.eq(value),
    '>': (where, value) => where.gt(value),
    '<': (where, value) => where.lt(value),
    '>=': (where, value) => where.gte(value),
    '<=': (where, value) => where.lte(value),
    '!=': (where, value) => where.not.eq(value),
    'contains': (where, value) => where.contains(value),
}

export const OPERATOR_MAP_MONGO: Record<Operator, OperatorFnMongo<string>> = {
    '=': (field, value) => ({ [field]: value }),
    '!=': (field, value) => ({ [field]: { $ne: value } }),
    '>': (field, value) => ({ [field]: { $gt: value } }),
    '<': (field, value) => ({ [field]: { $lt: value } }),
    '>=': (field, value) => ({ [field]: { $gte: value } }),
    '<=': (field, value) => ({ [field]: { $lte: value } }),
    'contains': (field, value) => ({
        [field]: { $regex: value, $options: 'i' },
    }),
};
function parseFilters(req: Request): FilterField[] {
    const filterBy = req.query?.filterBy as string;
    if (!filterBy) { return [] }
    return filterBy.split(',').map((pair) => {
        const match = pair.match(/^([^:<>!]+)(!?[<>]?=?):?(.+)$/);
        if (!match) {
            return null;
        }
        const [, field, op, value] = match;
        let operator: Operator = '=';

        switch (op) {
            case '>': operator = '>'; break;
            case '<': operator = '<'; break;
            case '>=': operator = '>='; break;
            case '<=': operator = '<='; break;
            case '!=': operator = '!='; break;
            default: operator = '='; break;
        }
        return { field: field.trim().toLowerCase(), operator: operator, value: value.trim() }
    }).filter(Boolean) as FilterField[]

}

export function applyFiltersRedis(search: Search, request: Request): Search {
    const filters = parseFilters(request)
    for (const f of filters) {
        const where = search.where(f.field)
        const applyOperator = OPERATOR_MAP_REDIS[f.operator]
        search = applyOperator(where, f.value)
    }
    return search;
}

export function getMongoFilter<T>(request: Request): RootFilterQuery<T> {
    const filters = parseFilters(request);
    const query: RootFilterQuery<T> = {};

    for (const f of filters) {
        const operatorFn = OPERATOR_MAP_MONGO[f.operator as Operator];
        if (operatorFn) {
            Object.assign(query, operatorFn(f.field, f.value));
        }
    }

    return query;
}
