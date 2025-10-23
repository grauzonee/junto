import { EventDocument } from '@/models/Event'
import { type FilterPrefix, type Filter, type FilterValue } from '@/types/Filter'
import { type FilterQuery } from "mongoose"
import { type CoordinatesInput } from '@/schemas/http/Event'

const MongoFilterMap: Record<FilterPrefix, string> = {
    eq: '$eq',
    min: '$gte',
    before: '$lte',
    max: '$lte',
    after: '$gte',
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
export function buildMongoQuery<T>(dbFilter: Filter[] | undefined): FilterQuery<T> {
    const query: Record<string, Record<string, FilterValue>> = {}
    if (!dbFilter) return query;
    dbFilter.forEach(filter => {
        const operator = MongoFilterMap[filter.prefix]
        let definition = { [operator]: filter.value };
        if (filter.options) {
            definition = { ...definition, $options: filter.options }
        }

        query[filter.field] = definition
    })
    return query;
}
