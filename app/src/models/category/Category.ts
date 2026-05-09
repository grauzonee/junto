import mongoose, { Schema, Model, Types, SchemaTypes, HydratedDocument } from "mongoose";
import { paginatePlugin } from "@/models/plugins/paginate";
import { getTree } from "@/models/category/statics";
import { CategoryQueryHelpers, getRoots, getSubcategories } from "@/models/category/queries";
import messages from "@/constants/errorMessages";
import { registerDeleteHooks } from "@/models/category/hooks";
import { parentValidator } from "@/models/category/validators";

export interface ICategory {
    title: string;
    parent?: Types.ObjectId | null;
}

export type HydratedCategoryDoc = HydratedDocument<ICategory>;

export interface CategoryModelType extends Model<ICategory, CategoryQueryHelpers> {
    getTree(offset?: number, limit?: number): Promise<(ICategory & { _id: Types.ObjectId; subcategories: ICategory[] })[]>
}

export const CategorySchema = new Schema<
    ICategory,
    CategoryModelType,
    object,
    CategoryQueryHelpers
>(
    {
        title: String,
        parent: {
            type: SchemaTypes.ObjectId,
            required: false,
            ref: 'Category'
        }
    },
    {
        collation: { locale: 'en', strength: 2 },
        statics: {
            getTree
        }
    },
);

CategorySchema.query.getRoots = getRoots;
CategorySchema.query.getSubcategories = getSubcategories;

CategorySchema.path("parent").validate({
    validator: parentValidator,
    message: messages.validation.NOT_EXISTS("category")
});

registerDeleteHooks(CategorySchema);

CategorySchema.set("toJSON", {
    getters: true,
    virtuals: false,
    versionKey: false
});

CategorySchema.plugin(paginatePlugin<ICategory>);

export const Category = mongoose.model<ICategory, CategoryModelType>(
    "Category",
    CategorySchema
);
