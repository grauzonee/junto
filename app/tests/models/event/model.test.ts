import { Event } from "@/models/event/Event";
import { createFakeEvent } from "@tests/generators/event";

describe("Event model date handling", () => {
    beforeEach(async () => {
        await Event.deleteMany({});
    });

    it("should preserve Date inputs and serialize them as unix seconds", async () => {
        const eventDate = new Date("2026-03-27T12:13:23.000Z");
        const eventData = await createFakeEvent();

        const event = await Event.create({
            ...eventData,
            date: eventDate
        } as const);

        expect(event.date.toISOString()).toBe(eventDate.toISOString());
        expect(event.toJSON().date).toBe(Math.floor(eventDate.getTime() / 1000));
    });
});
