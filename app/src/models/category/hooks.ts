import { Schema } from "mongoose";
import { assertCategoryCanDelete } from "@/models/category/utils";

export function registerDeleteHooks(schema: unknown) {
    const deleteHookSchema = schema as Schema;

    deleteHookSchema.pre("deleteOne", { document: true, query: false }, async function () {
        await assertCategoryCanDelete(this._id);
    });

    deleteHookSchema.pre("deleteOne", { document: false, query: true }, async function () {
        const category = await this.model.findOne(this.getFilter());
        if (!category) {
            return;
        }
        await assertCategoryCanDelete(category._id);
    });

    deleteHookSchema.pre("findOneAndDelete", async function () {
        const category = await this.model.findOne(this.getFilter());
        if (!category) {
            return;
        }
        await assertCategoryCanDelete(category._id);
    });
}
