import { CallbackWithoutResultAndOptionalError, Schema } from "mongoose";
import { HydratedEvent } from "@/models/event/Event";
import { ensureAuthorRsvp, syncRsvpEventDates } from "@/models/rsvp/cascade";

function preSaveHook(this: HydratedEvent, next: CallbackWithoutResultAndOptionalError) {
    this.$locals.wasNew = this.isNew;
    this.$locals.dateWasModified = this.isModified("date");
    next();
}

async function postSaveHook(this: HydratedEvent, doc: HydratedEvent) {
    if (this.$locals.wasNew) {
        await ensureAuthorRsvp(doc);
    }
    else if (this.$locals.dateWasModified) {
        await syncRsvpEventDates(doc._id, doc.date);
    }
}

export function registerSaveHooks(schema: unknown) {
    const saveHookSchema = schema as Schema;

    saveHookSchema.pre("save", preSaveHook);
    saveHookSchema.post("save", postSaveHook);
}
