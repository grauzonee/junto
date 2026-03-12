import { RSVPModelType } from "@/models/rsvp/RSVP";
import { FilterableField, FilterValue } from "@/types/Filter";

export async function isUserAttendingEvent(this: RSVPModelType, user: string, event: string) {
    return await this.findOne({ user, event });
}

export function getFilterableFields(): FilterableField[] {
    return [
        {
            field: 'eventDate',
            preprocess: (value: FilterValue) => new Date(value as string)
        },
        {
            field: 'user'
        },
        {
            field: 'status'
        }
    ]
}

export function getSortableFields(): string[] {
    return ['eventDate']
}