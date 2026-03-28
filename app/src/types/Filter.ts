export const SKIP_WORDS = ['page', 'limit', 'sortByAsc', 'sortByDesc', 'search']
export const ARRAY_PREFIXES = ['in', 'nin']
export const EQUALITY_FILTER_PREFIX = 'eq' as const;
export const CONTAINS_FILTER_PREFIX = 'contains' as const;
export const RANGE_BOUND_PREFIXES = ['after', 'before', 'min', 'max'] as const;
export const FILTER_PREFIXES = [...ARRAY_PREFIXES, EQUALITY_FILTER_PREFIX, CONTAINS_FILTER_PREFIX, ...RANGE_BOUND_PREFIXES] as const;
export type FilterPrefix = typeof FILTER_PREFIXES[number];
export type FilterMap = Record<FilterPrefix, string>
export type EqualityFilterPrefix = typeof EQUALITY_FILTER_PREFIX;
export type RangeBoundPrefix = typeof RANGE_BOUND_PREFIXES[number];

export interface FilterRangeValue {
    start: Date,
    end: Date
}

export type FilterValue = string | number | string[] | number[] | Date | FilterRangeValue
export type FilterPreprocessFunction = (value: FilterValue, prefix: FilterPrefix) => FilterValue
export interface FilterableField {
    field: string,
    options?: string,
    preprocess?: FilterPreprocessFunction
}
export interface Filterable {
    getFilterableFields(): FilterableField[]
}
export interface Filter {
    prefix: FilterPrefix,
    field: string,
    value: FilterValue,
    options?: string
}

export function isFilterPrefix(value: string): value is FilterPrefix {
    return (FILTER_PREFIXES as readonly string[]).includes(value)
}

export function isEqualityFilterPrefix(value: FilterPrefix): value is EqualityFilterPrefix {
    return value === EQUALITY_FILTER_PREFIX;
}

export function isRangeBoundPrefix(value: FilterPrefix): value is RangeBoundPrefix {
    return (RANGE_BOUND_PREFIXES as readonly string[]).includes(value);
}

export function isFilterRangeValue(value: unknown): value is FilterRangeValue {
    return (
        typeof value === 'object' &&
        value !== null &&
        'start' in value &&
        'end' in value &&
        value.start instanceof Date &&
        value.end instanceof Date
    );
}

export function isFilterValue(value: string | string[] | number | number[] | Date | FilterRangeValue): value is FilterValue {
    return (
        value instanceof Date ||
        isFilterRangeValue(value) ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        (Array.isArray(value) && value.every(v => typeof v === 'string')) ||
        (Array.isArray(value) && value.every(v => typeof v === 'number'))
    );
}
