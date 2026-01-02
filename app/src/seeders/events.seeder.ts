import { Event, IEvent } from "@/models/Event"
import { Category } from "@/models/Category"
import { EventType } from "@/models/EventType";
import { User } from "@/models/User";

type FakeEvent = Omit<IEvent, "date"> & {
    date: number;
};

const events: Partial<FakeEvent>[] = [
    {
        title: "Midnight Jazz Session",
        description: "An intimate late-night jazz concert featuring local musicians and improvised performances.",
        fullAddress: "12 Rue des Lombards, 75001 Paris, France",
        location: {
            type: "Point",
            coordinates: [48.8590, 2.3470]
        },
        imageUrl: "http://example.com",
        date: Math.floor((Date.now() + 60 * 60 * 1000) / 1000)
    },
    {
        title: "Rooftop Sunset Yoga",
        description: "A relaxing yoga session on a rooftop with panoramic city views at sunset.",
        fullAddress: "5 Avenue Anatole France, 75007 Paris, France",
        location: {
            type: "Point",
            coordinates: [48.8584, 2.2945]
        },
        imageUrl: "http://example.com",
        date: Math.floor((Date.now() + 3 * 60 * 60 * 1000) / 1000)
    },
    {
        title: "Street Food Night Market",
        description: "A vibrant night market featuring street food from around the world and live DJs.",
        fullAddress: "Place de la République, 75010 Paris, France",
        location: {
            type: "Point",
            coordinates: [48.8675, 2.3634]
        },
        imageUrl: "http://example.com",
        date: Math.floor((Date.now() + 6 * 60 * 60 * 1000) / 1000)
    },
    {
        title: "Indie Film Open Air",
        description: "An outdoor screening of award-winning indie films with director Q&A sessions.",
        fullAddress: "Parc des Buttes-Chaumont, 75019 Paris, France",
        location: {
            type: "Point",
            coordinates: [48.8809, 2.3823]
        },
        imageUrl: "http://example.com",
        date: Math.floor((Date.now() + 12 * 60 * 60 * 1000) / 1000)
    },
    {
        title: "Wine & Cheese Tasting",
        description: "Guided tasting of French wines paired with artisanal cheeses.",
        fullAddress: "18 Rue Dauphine, 75006 Paris, France",
        location: {
            type: "Point",
            coordinates: [48.8553, 2.3399]
        },
        imageUrl: "http://example.com",
        date: Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000)
    },
    {
        title: "Photography Walk: Hidden Paris",
        description: "A guided photography walk through lesser-known streets and courtyards.",
        fullAddress: "Place des Vosges, 75004 Paris, France",
        location: {
            type: "Point",
            coordinates: [48.8556, 2.3669]
        },
        imageUrl: "http://example.com",
        date: Math.floor((Date.now() + 36 * 60 * 60 * 1000) / 1000)
    },
    {
        title: "Electronic Music Warehouse Party",
        description: "An underground electronic music event with international DJs.",
        fullAddress: "Port de la Rapée, 75012 Paris, France",
        location: {
            type: "Point",
            coordinates: [48.8414, 2.3708]
        },
        imageUrl: "http://example.com",
        date: Math.floor((Date.now() + 48 * 60 * 60 * 1000) / 1000)
    },
    {
        title: "Art & Sketch Meetup",
        description: "A casual meetup for artists to sketch together and exchange feedback.",
        fullAddress: "Jardin du Luxembourg, 75006 Paris, France",
        location: {
            type: "Point",
            coordinates: [48.8462, 2.3371]
        },
        imageUrl: "http://example.com",
        date: Math.floor((Date.now() + 72 * 60 * 60 * 1000) / 1000)
    },
    {
        title: "Poetry Slam Night",
        description: "An open-mic poetry slam featuring emerging spoken-word artists.",
        fullAddress: "21 Rue Juliette Dodu, 75010 Paris, France",
        location: {
            type: "Point",
            coordinates: [48.8744, 2.3616]
        },
        imageUrl: "http://example.com",
        date: Math.floor((Date.now() + 96 * 60 * 60 * 1000) / 1000)
    },
    {
        title: "Sunday Brunch & Vinyl",
        description: "A laid-back brunch with vinyl-only DJ sets and specialty coffee.",
        fullAddress: "44 Rue de Belleville, 75020 Paris, France",
        location: {
            type: "Point",
            coordinates: [48.8722, 2.3856]
        },
        imageUrl: "http://example.com",
        date: Math.floor((Date.now() + 120 * 60 * 60 * 1000) / 1000)
    }
];

export async function seed() {
    const type = await EventType.findOne();
    const category = await Category.findOne();
    const user = await User.findOne();
    if (!type || !category || !user) {
        // eslint-disable-next-line
        console.log("Please run your categories and types seeders");
        return;
    }
    for (const event of events) {
        const type = await EventType.aggregate([
            { $sample: { size: 1 } }
        ]);
        const categories = await Category.aggregate([
            { $sample: { size: 2 } }
        ]);
        const user = await User.aggregate([
            { $sample: { size: 1 } }
        ]);
        event.author = user[0]._id;
        event.type = type[0]._id
        event.categories = [categories[0]._id, categories[1]._id];
        await Event.create(event)
    }
    if (!process.env.JEST_WORKER_ID) {
        // eslint-disable-next-line
        console.log("Event types seeding done.");
    }
}
