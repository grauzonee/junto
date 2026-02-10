import { Types } from "mongoose";
import { Interest } from "@/models/Interest";

export async function interestValidator(value: Types.ObjectId[]) {
    if (!value || value.length === 0) return true;
    const count = await Interest.countDocuments({ _id: { $in: value } });
    return count === value.length;
}