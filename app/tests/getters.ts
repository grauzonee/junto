import { HydratedUserDoc, User, IUser } from "@/models/User";
import { Event, HydratedEvent, IEvent } from "@/models/Event";

export async function getOneUser(filters: Partial<IUser> = {}): Promise<HydratedUserDoc> {
    const user = await User.findOne(filters);
    if (!user) {
        throw new Error("No user found, check your seeders");
    }
    return user;
}
export async function getOneEvent(filters: Partial<IEvent> = {}): Promise<HydratedEvent> {
    const event = await Event.findOne(filters);
    if (!event) {
        throw new Error("No event found, check your seeders");
    }
    return event;
}