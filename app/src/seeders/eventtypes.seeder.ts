import { EventType } from "@/models/EventType";

export async function seed() {
    const eventTypes = [
        { title: "Workshop" },
        { title: "Gathering" },
        { title: "Lecture" },
        { title: "Discussion" },
        { title: "Club" },
        { title: "Volunteering" },
        { title: "Concert" },
        { title: "Other" },
    ];

    for (const item of eventTypes) {
        await EventType.create(item);
        if (!process.env.JEST_WORKER_ID) {
            console.log(`Created event type: ${item.title}`);
        }
    }
    if (!process.env.JEST_WORKER_ID) {
        console.log("Event types seeding done.");
    }
}
