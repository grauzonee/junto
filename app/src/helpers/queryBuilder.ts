/**
 * Helper functions for building database query filters and sorts.
 * 
 * @packageDocumentation
 */

import { type FilterPrefix, type Filter, isEqualityFilterPrefix, isFilterRangeValue, isRangeBoundPrefix, type FilterValue } from '@/types/Filter'
import { type FilterQuery } from "mongoose"
import { type CoordinatesInput } from '@/types/services/eventService'
import { SortInput } from '@/types/Sort'

type MongoFilterDefinitionValue = FilterValue | string;

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

/**
 * Builds a geospatial search query for events based on coordinates and radius.
 * @param {CoordinatesInput} value 
 * @returns {FilterQuery<Event>} @see {@link https://www.mongodb.com/docs/manual/geospatial-queries/}
 */
export function buildGeosearchQuery(value: CoordinatesInput): FilterQuery<Event> {
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

/**
 * Builds a filter query for the database based on provided filters.
 * @param {Filter[]} dbFilter 
 * @returns {FilterQuery<T>}
 */
export function buildFilterQuery<T>(dbFilter: Filter[] | undefined): FilterQuery<T> {
    const query: Record<string, Record<string, MongoFilterDefinitionValue>> = {}
    const equalityRangeFields = new Set<string>();
    if (!dbFilter) return query;
    dbFilter.forEach(filter => {
        let definition: Record<string, MongoFilterDefinitionValue>;
        if (isFilterRangeValue(filter.value)) {
            if (isEqualityFilterPrefix(filter.prefix)) {
                definition = { $gte: filter.value.start, $lte: filter.value.end };
            } else if (filter.prefix === 'after' || filter.prefix === 'min') {
                definition = { $gte: filter.value.start };
            } else if (filter.prefix === 'before' || filter.prefix === 'max') {
                definition = { $lte: filter.value.end };
            } else {
                const operator = MongoFilterMap[filter.prefix]
                definition = { [operator]: filter.value };
            }
        } else {
            const operator = MongoFilterMap[filter.prefix]
            definition = { [operator]: filter.value };
        }

        if (filter.options) {
            definition = { ...definition, $options: filter.options }
        }

        if (isFilterRangeValue(filter.value) && isEqualityFilterPrefix(filter.prefix)) {
            query[filter.field] = definition;
            equalityRangeFields.add(filter.field);
            return;
        }

        if (equalityRangeFields.has(filter.field) && isRangeBoundPrefix(filter.prefix)) {
            return;
        }

        query[filter.field] = { ...query[filter.field], ...definition }
    })
    return query;
}

export function escapeRegexSearchTerm(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildSearchQuery<T>(fields: string[], search: string | undefined): FilterQuery<T> {
    if (!search) {
        return {};
    }

    const escapedSearch = escapeRegexSearchTerm(search);
    return {
        $or: fields.map(field => ({
            [field]: {
                $regex: escapedSearch,
                $options: 'i'
            }
        }))
    } as FilterQuery<T>;
}

export function combineQueries<T>(...queries: FilterQuery<T>[]): FilterQuery<T> {
    const nonEmptyQueries = queries.filter(query => Object.keys(query).length > 0);

    if (nonEmptyQueries.length === 0) {
        return {};
    }

    if (nonEmptyQueries.length === 1) {
        return nonEmptyQueries[0];
    }

    return {
        $and: nonEmptyQueries
    } as FilterQuery<T>;
}

/**
 * Builds a sort query for the database based on provided sort input.
 * @param {SortInput | undefined} sort 
 * @returns {Record<string, 1 | -1>}
 */
export function buildSortQuery(sort: SortInput | undefined): Record<string, 1 | -1> {
    if (!sort) return {}
    if (sort.sortByAsc) {
        return { [sort.sortByAsc]: 1 }
    }
    if (sort.sortByDesc) {
        return { [sort.sortByDesc]: -1 }
    }
    return {}
}
