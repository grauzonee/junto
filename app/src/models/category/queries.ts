import { Types } from "mongoose";
import { QueryWithHelpers } from "mongoose";
import { ICategory } from "@/models/category/Category";
import { PaginateQueryHelper } from "@/models/plugins/paginate";
import { HydratedCategoryDoc } from "@/models/category/Category";

export interface CategoryQueryHelpers extends PaginateQueryHelper<ICategory> {
    getRoots(): QueryWithHelpers<HydratedCategoryDoc[], HydratedCategoryDoc, CategoryQueryHelpers>;
    getSubcategories(parentId: Types.ObjectId): QueryWithHelpers<HydratedCategoryDoc[], HydratedCategoryDoc, CategoryQueryHelpers>;
}

export function getRoots(this: QueryWithHelpers<HydratedCategoryDoc[], HydratedCategoryDoc, CategoryQueryHelpers>) {
    return this.find({ parent: null })
};

export function getSubcategories(this: QueryWithHelpers<HydratedCategoryDoc[], HydratedCategoryDoc, CategoryQueryHelpers>, parentId: Types.ObjectId) {
    return this.find({ parent: parentId })
};