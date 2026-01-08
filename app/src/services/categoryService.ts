import { Category } from "@/models/Category";
import { RequestData } from "@/types/common";

export async function list(data: RequestData) {
    const categories = await Category.getTree(data.pagination.offset, data.pagination.limit);
    return categories;
}
