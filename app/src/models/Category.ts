import mongoose, { Schema, Model, Types, SchemaTypes, QueryWithHelpers, HydratedDocument } from "mongoose";
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
            async getTree(offset = 0, limit = Number.MAX_SAFE_INTEGER) {
                const result = await this.aggregate([
                    { $match: { parent: null } },
                    { $skip: offset },
                    { $limit: limit },
                    {
                        $graphLookup: {
                            from: "categories",
                            startWith: "$_id",
                            connectFromField: "_id",
                            connectToField: "parent",
                            as: "subcategories"
                        }
                    },
                    {
                        $project: {
                            __v: 0,
                            "subcategories.__v": 0,
                        }
                    }
                ])
                return result;
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
