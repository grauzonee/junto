import mongoose, { Types } from "mongoose";

export async function parentValidator(value: Types.ObjectId | null | undefined) {
    if (!value) {
        return true;
    }

    const categoryExists = await mongoose.model("Category").exists({ _id: value });
    return !!categoryExists;
}
