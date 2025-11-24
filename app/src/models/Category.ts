import mongoose, { Schema, Model, Types, SchemaTypes } from "mongoose";
import { type Filterable, type FilterableField } from "@/types/Filter";
import { paginatePlugin, PaginateQueryHelper } from "@/models/plugins/paginate";

export interface ICategory {
    title: string;
    parent?: Types.ObjectId
}

export interface CategoryModelType extends Model<ICategory, PaginateQueryHelper<ICategory>>, Filterable { }

export const CategorySchema = new Schema<
    ICategory,
    CategoryModelType,
    object,
    PaginateQueryHelper<ICategory>
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
        }
    },
);

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
