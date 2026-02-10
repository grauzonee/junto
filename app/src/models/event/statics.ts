import { FilterableField, FilterValue } from "@/types/Filter"
export function getFilterableFields(): FilterableField[] {
    return [
        {
            field: 'date',
            preprocess: (value: FilterValue) => new Date(value as string)
        },
        {
            field: 'categories'
        },
        {
            field: 'type'
        }
    ]
}

export function getSortableFields(): string[] {
    return ['date'];
}