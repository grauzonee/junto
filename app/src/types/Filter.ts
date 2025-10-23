export type FilterPreprocessFunction = (value: FilterValue) => FilterValue
export interface FilterableField {
    field: string,
    options?: string,
    preprocess?: FilterPreprocessFunction
}
export interface Filterable {
    getFilterableFields(): FilterableField[]
}

export type FilterValue = string | number | string[] | number[] | Date
export interface Filter {
    prefix: FilterPrefix,
    field: string,
    value: FilterValue,
    options?: string
}
export const SKIP_WORDS = ['page', 'limit']
export const ARRAY_PREFIXES = ['in', 'nin']
export const FILTER_PREFIXES = [...ARRAY_PREFIXES, 'eq', 'max', 'min', 'contains', 'before', 'after'] as const;
export type FilterPrefix = typeof FILTER_PREFIXES[number];
export type FilterMap = Record<FilterPrefix, string>

export function isFilterPrefix(value: string): value is FilterPrefix {
    return (FILTER_PREFIXES as readonly string[]).includes(value)
}

export function isFilterValue(value: string | string[] | number | number[] | Date): value is FilterValue {
    return (
        value instanceof Date ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        (Array.isArray(value) && value.every(v => typeof v === 'string')) ||
        (Array.isArray(value) && value.every(v => typeof v === 'number'))
    );
}
