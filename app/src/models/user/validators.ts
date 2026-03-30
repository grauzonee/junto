import { Types } from "mongoose";
import { Interest } from "@/models/Interest";
import { User } from "@/models/user/User";

export async function interestValidator(value: Types.ObjectId[]) {
    if (!value || value.length === 0) return true;
    const count = await Interest.countDocuments({ _id: { $in: value } });
    return count === value.length;
}

export async function activeUserValidator(value: Types.ObjectId) {
    const userExists = await User.exists({ _id: value, active: true });
    return !!userExists;
}
