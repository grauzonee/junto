import { Category } from "@/models/Category";
import { IEvent, Event } from "@/models/Event";
import { Types } from "mongoose";
import { getOneCategory, getOneEventType } from "../getters";

type FakeEvent = Omit<IEvent, "date" | "categories" | "type" | "author"> & {
    date: number;
    categories: string[];
    type: string;
    author: string;
};


export async function createFakeEvent(overrides: Partial<FakeEvent> = {}, save = false) {
    if (!overrides.categories) {
        const category = await getOneCategory();
        overrides.categories = [category._id.toString()];
    }
    if (!overrides.type) {
        const type = await getOneEventType();
        overrides.type = type._id.toString();
    }
    const eventData = {
        title: "Sample Event " + Math.random().toString(36).substring(7),
        description: "This is a test event for unit testing.",
        date: Math.floor((Date.now() + 60 * 60 * 1000) / 1000),
        fullAddress: "00000 TestStreet 1, Macondo, Mexico",
        location: {
            type: "Point",
            coordinates:
                [Math.random() * 180 - 90, Math.random() * 180 - 90],
        },
        imageUrl: "https://example.com/test-image.jpg",
        author: new Types.ObjectId().toString(),
        ...overrides,
        active: true
    };
    if (save) {
        const event = await Event.create(eventData);
        return event;
    } else {
        return eventData;
    }
}
