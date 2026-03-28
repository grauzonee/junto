import { resolveEventDateFilterValue } from "@/helpers/dateFilterHelper";
import { FilterableField, FilterValue, FilterPrefix } from "@/types/Filter"
export function getFilterableFields(): FilterableField[] {
    return [
        {
            field: 'date',
            preprocess: (value: FilterValue, prefix: FilterPrefix) => resolveEventDateFilterValue(value, prefix)
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
