import { IEvent } from "@/models/Event";
import { Types } from "mongoose";

type FakeEvent = Omit<IEvent, "date" | "categories" | "type"> & {
    date: number;
    categories: string[];
    type: string;
};


export function createFakeEvent(overrides: Partial<FakeEvent> = {}) {
    return {
        title: "Sample Event " + Math.random().toString(36).substring(7),
        description: "This is a test event for unit testing.",
        date: Math.floor(new Date().valueOf() / 1000),
        fullAddress: "123 Test Street, Test City",
        location: {
            type: "Point",
            coordinates:
                [Math.random() * 180 - 90, Math.random() * 180 - 90],
        },
        imageUrl: "https://example.com/test-image.jpg",
        author: new Types.ObjectId(),
        categories: ["testing", "events", "automation"],
        type: new Types.ObjectId().toString(),
        ...overrides,
        active: true
    };
}
