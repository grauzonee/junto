import { Types } from "mongoose";
import { Event } from "@/models/event/Event";
import { User } from "@/models/user/User";

export async function activeEventValidator(value: Types.ObjectId) {
    const eventExists = await Event.exists({ _id: value, active: true });
    return !!eventExists;
}

export async function activeUserValidator(value: Types.ObjectId) {
    const userExists = await User.exists({ _id: value, active: true });
    return !!userExists;
}
