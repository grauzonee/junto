import messages from "@/constants/errorMessages";
import { Event } from "@/models/event/Event";
import { ConflictError } from "@/types/errors/InputError";

export async function assertEventTypeCanDelete(eventTypeId: unknown) {
    const referencingEvent = await Event.exists({ type: eventTypeId });
    if (referencingEvent) {
        throw new ConflictError(messages.response.IN_USE("event type"));
    }
}
