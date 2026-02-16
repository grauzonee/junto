import { Category } from "@/models/category/Category";
import { Types } from "mongoose";
import { EventType } from "@/models/EventType";

export async function categoriesValidator(value: Types.ObjectId[]) {
    if (!value || value.length === 0) return true;
    const count = await Category.countDocuments({ _id: { $in: value } });
    return count === value.length;
}

export async function typeValidator(value: Types.ObjectId): Promise<boolean> {
    const typeExists = await EventType.exists({ _id: value });
    return !!typeExists;
}