import { type FilterPrefix, type Filter, type FilterValue } from '@/types/Filter'
import { type FilterQuery } from "mongoose"

const MongoFilterMap: Record<FilterPrefix, string> = {
    eq: '$eq',
    min: '$gte',
    before: '$gte',
    max: '$lte',
    after: '$lte',
    in: '$in',
    nin: '$nin',
    contains: '$regex',
}

export function buildMongoQuery<T>(dbFilter: Filter[]): FilterQuery<T> {
    const query: Record<string, Record<string, FilterValue>> = {}
    dbFilter.forEach(filter => {
        const operator = MongoFilterMap[filter.prefix]
        query[filter.field] = { [operator]: filter.value }
    })
    return query;
}
