import { HydratedUserDoc, User, IUser } from "@/models/user/User";
import { Event, HydratedEvent, IEvent } from "@/models/event/Event";
import { Category, HydratedCategoryDoc, ICategory } from "@/models/category/Category";
import { EventType, HydratedEventTypeDoc, IEventType } from "@/models/EventType";

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

export async function getOneCategory(filters: Partial<ICategory> = {}): Promise<HydratedCategoryDoc> {
    const category = await Category.findOne(filters);
    if (!category) {
        throw new Error("No category found, check your seeders");
    }
    return category;
}

export async function getOneEventType(filters: Partial<IEventType> = {}): Promise<HydratedEventTypeDoc> {
    const type = await EventType.findOne(filters);
    if (!type) {
        throw new Error("No event type found, check your seeders");
    }
    return type;
}