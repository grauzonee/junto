import { type HydratedEvent } from "@/models/event/Event";
import { RSVP } from "@/models/rsvp/RSVP";
import { Comment } from "@/models/comment/Comment";

export async function softDeleteEventDocument(event: HydratedEvent) {
    if (!event.active) {
        return event;
    }

    event.active = false;
    event.deletedAt = new Date();
    await event.save({ validateBeforeSave: false });
    await RSVP.cancelForEvent(event._id);
    await Comment.deleteForEvent(event._id);

    return event;
}
