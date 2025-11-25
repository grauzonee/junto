import mongoose, { Schema, Model, Types, SchemaTypes, QueryWithHelpers, HydratedDocument } from "mongoose";
import { type Filterable, type FilterableField } from "@/types/Filter";
import { paginatePlugin, PaginateQueryHelper } from "@/models/plugins/paginate";

export interface ICategory {
    title: string;
    parent?: Types.ObjectId
}

export type HydratedCategoryDoc = HydratedDocument<ICategory>;

interface CategoryQueryHelpers extends PaginateQueryHelper<ICategory> {
    getRoots(): QueryWithHelpers<HydratedCategoryDoc[], HydratedCategoryDoc, CategoryQueryHelpers>;
    getSubcategories(parentId: Types.ObjectId): QueryWithHelpers<HydratedCategoryDoc[], HydratedCategoryDoc, CategoryQueryHelpers>;
}
export interface CategoryModelType extends Model<ICategory, CategoryQueryHelpers>, Filterable { }

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
            getFilterableFields(): FilterableField[] {
                return [{ field: "title", options: "i" }, { field: "parent" }];
            }
        },
    },
);

CategorySchema.query.getRoots = function getRoots(this: QueryWithHelpers<HydratedCategoryDoc[], HydratedCategoryDoc, CategoryQueryHelpers>) {
    return this.find({ parent: null })
};
CategorySchema.query.getSubcategories = function getSubcategories(this: QueryWithHelpers<HydratedCategoryDoc[], HydratedCategoryDoc, CategoryQueryHelpers>, parentId: Types.ObjectId) {
    return this.find({ parent: parentId })
};

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
