import { CallbackWithoutResultAndOptionalError } from "mongoose";
import { HydratedEvent } from "@/models/event/Event";
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { create } from "@/services/RSVPService";

export function preSaveHook(this: HydratedEvent, next: CallbackWithoutResultAndOptionalError) {
    this.$locals.wasNew = this.isNew;
    next();
}

export async function postSaveHook(this: HydratedEvent, doc: HydratedEvent) {
    console.log("Post save hook called. wasNew:", this.$locals.wasNew);
    if (this.$locals.wasNew) {
        console.log("Calling create");
        const res = await create({ eventId: doc._id.toString(), status: STATUS_CONFIRMED }, doc.author.toString());
        console.log("Create response:", res);
    }
}