import { EventDocument } from '@/models/Event'
import { type FilterPrefix, type Filter, type FilterValue } from '@/types/Filter'
import { type FilterQuery } from "mongoose"
import { type CoordinatesInput } from '@/schemas/http/Event'

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

export function buildGeosearchQuery(value: CoordinatesInput): FilterQuery<EventDocument> {
    return {
        location:
        {
            $near:
            {
                $geometry:
                    { type: "Point", coordinates: [value.lat, value.lng] },
                $minDistance: 0,
                $maxDistance: value.radius
            }
        }
    }
}
export function buildMongoQuery<T>(dbFilter: Filter[]): FilterQuery<T> {
    const query: Record<string, Record<string, FilterValue>> = {}
    dbFilter.forEach(filter => {
        const operator = MongoFilterMap[filter.prefix]
        query[filter.field] = { [operator]: filter.value }
    })
    return query;
}
