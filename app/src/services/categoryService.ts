import { Category } from "@/models/Category";
import { PaginationData } from "@/types/common";

export async function list(data: PaginationData) {
    const categories = await Category.getTree(data.offset, data.limit);
    return categories;
}
