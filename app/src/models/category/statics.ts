import { CategoryModelType } from "@/models/category/Category";

export async function getTree(this: CategoryModelType, offset = 0, limit = Number.MAX_SAFE_INTEGER) {
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