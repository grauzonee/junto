import { CallbackWithoutResultAndOptionalError, Schema } from "mongoose";
import { HydratedEvent } from "@/models/event/Event";
import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { create } from "@/services/RSVPService";
import { RSVP } from "@/models/rsvp/RSVP";

function preSaveHook(this: HydratedEvent, next: CallbackWithoutResultAndOptionalError) {
    this.$locals.wasNew = this.isNew;
    next();
}

async function postSaveHook(this: HydratedEvent, doc: HydratedEvent) {
    if (this.$locals.wasNew) {
        await create({ eventId: doc._id.toString(), status: STATUS_CONFIRMED }, doc.author.toString());
    }
    else if (doc.isModified('date')) {
        await RSVP.updateMany({
            event: doc._id
        }, { eventDate: doc.date })
    }
}

export function registerSaveHooks(schema: unknown) {
    const saveHookSchema = schema as Schema;

    saveHookSchema.pre("save", preSaveHook);
    saveHookSchema.post("save", postSaveHook);
}
