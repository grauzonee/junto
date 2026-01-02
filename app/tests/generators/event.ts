import { IEvent } from "@/models/Event";
import { Types } from "mongoose";

export function createFakeEvent(overrides: Partial<IEvent> = {}) {
    return {
        title: "Test event",
        description: "This is a test event for unit testing.",
        date: Math.floor(new Date().valueOf() / 1000),
        fullAddress: "00000 TestStreet 1, Macondo, Mexico",
        location: {
            type: "Point",
            coordinates:
                [Math.random() * 180 - 90, Math.random() * 180 - 90],
        },
        imageUrl: "https://example.com/test-image.jpg",
        author: new Types.ObjectId(),
        ...overrides,
        active: true
    };
}
