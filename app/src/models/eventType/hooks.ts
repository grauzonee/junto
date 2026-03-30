import { Schema } from "mongoose";
import { assertEventTypeCanDelete } from "@/models/eventType/utils";

export function registerDeleteHooks(schema: unknown) {
    const deleteHookSchema = schema as Schema;

    deleteHookSchema.pre("deleteOne", { document: true, query: false }, async function () {
        await assertEventTypeCanDelete(this._id);
    });

    deleteHookSchema.pre("deleteOne", { document: false, query: true }, async function () {
        const eventType = await this.model.findOne(this.getFilter());
        if (!eventType) {
            return;
        }
        await assertEventTypeCanDelete(eventType._id);
    });

    deleteHookSchema.pre("findOneAndDelete", async function () {
        const eventType = await this.model.findOne(this.getFilter());
        if (!eventType) {
            return;
        }
        await assertEventTypeCanDelete(eventType._id);
    });
}
