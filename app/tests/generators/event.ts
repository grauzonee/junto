import { IEvent } from "@/models/Event";
import { Types } from "mongoose";

export function createFakeEvent(overrides: Partial<IEvent> = {}) {
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
        topics: ["testing", "events", "automation"],
        ...overrides,
        active: true
    };
}
