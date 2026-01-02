import { IEvent } from "@/models/Event";
import { Types } from "mongoose";

type FakeEvent = Omit<IEvent, "date" | "categories" | "type"> & {
    date: number;
    categories: string[];
    type: string;
};


export function createFakeEvent(overrides: Partial<FakeEvent> = {}) {
    return {
        title: "Test event",
        description: "This is a test event for unit testing.",
        date: Math.floor((Date.now() + 60 * 60 * 1000) / 1000),
        fullAddress: "00000 TestStreet 1, Macondo, Mexico",
        location: {
            type: "Point",
            coordinates:
                [Math.random() * 180 - 90, Math.random() * 180 - 90],
        },
        imageUrl: "https://example.com/test-image.jpg",
        author: new Types.ObjectId(),
        type: new Types.ObjectId().toString(),
        ...overrides,
        active: true
    };
}
