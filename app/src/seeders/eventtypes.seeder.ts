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
        const exists = await EventType.findOne({ title: item.title });
        if (!exists) {
            await EventType.create(item);
            // eslint-disable-next-line
            console.log(`Created event type: ${item.title}`);
        }
    }
    // eslint-disable-next-line
    console.log("Event types seeding done.");
}
