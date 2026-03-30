import { Schema } from "mongoose";
import { assertInterestCanDelete } from "@/models/interest/utils";

export function registerDeleteHooks(schema: unknown) {
    const deleteHookSchema = schema as Schema;

    deleteHookSchema.pre("deleteOne", { document: true, query: false }, async function () {
        await assertInterestCanDelete(this._id);
    });

    deleteHookSchema.pre("deleteOne", { document: false, query: true }, async function () {
        const interest = await this.model.findOne(this.getFilter());
        if (!interest) {
            return;
        }
        await assertInterestCanDelete(interest._id);
    });

    deleteHookSchema.pre("findOneAndDelete", async function () {
        const interest = await this.model.findOne(this.getFilter());
        if (!interest) {
            return;
        }
        await assertInterestCanDelete(interest._id);
    });
}
