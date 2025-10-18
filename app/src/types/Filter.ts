export interface Filterable {
    getFilterableFields(): string[]
}

export type FilterValue = string | number | string[] | number[]
export interface Filter {
    prefix: FilterPrefix,
    field: string,
    value: FilterValue
}
export const ARRAY_PREFIXES = ['in', 'nin']
export const FILTER_PREFIXES = [...ARRAY_PREFIXES, 'eq', 'max', 'min', 'contains', 'before', 'after'] as const;
export type FilterPrefix = typeof FILTER_PREFIXES[number];
export type FilterMap = Record<FilterPrefix, string>

export function isFilterPrefix(value: string): value is FilterPrefix {
    return (FILTER_PREFIXES as readonly string[]).includes(value)
}

export function isFilterValue(value: string | string[] | number | number[]): value is FilterValue {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        (Array.isArray(value) && value.every(v => typeof v === 'string')) ||
        (Array.isArray(value) && value.every(v => typeof v === 'number'))
    );
}
