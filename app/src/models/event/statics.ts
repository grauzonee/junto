import { Types } from "mongoose";
import { resolveEventDateFilterValue } from "@/helpers/dateFilterHelper";
import { softDeleteEventDocument } from "@/models/event/cascade";
import type { EventModelType } from "@/models/event/Event";
import type { FilterableField, FilterValue, FilterPrefix } from "@/types/Filter";

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

export async function softDeleteByAuthor(this: EventModelType, authorId: Types.ObjectId | string) {
    const events = await this.find({ author: authorId, active: true });

    for (const event of events) {
        await softDeleteEventDocument(event);
    }
}
