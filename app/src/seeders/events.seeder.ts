import { Event } from "@/models/Event";
import { EventType } from "@/models/EventType";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function seed() {
    const log = (...args: any[]) => {
        if (!process.env.JEST_WORKER_ID) {
            // eslint-disable-next-line no-console
            console.log(...args);
        }
    };

    /* ------------------ EVENT TYPES ------------------ */

    const eventTypesData = [
        { title: "Workshop" },
        { title: "Gathering" },
        { title: "Lecture" },
        { title: "Discussion" },
        { title: "Club" },
        { title: "Volunteering" },
        { title: "Concert" },
        { title: "Other" },
    ];

    await EventType.insertMany(eventTypesData, { ordered: false }).catch(() => { });
    const eventTypes = await EventType.find({}, { _id: 1 }).lean();

    if (!eventTypes.length) {
        throw new Error("No event types found");
    }

    log(`Loaded ${eventTypes.length} event types`);

    const users = await User.find({}, { _id: 1 }).lean();

    if (!users.length) {
        throw new Error("No users found to assign as authors");
    }

    log(`Loaded ${users.length} users`);

    const randomUserId = () =>
        users[Math.floor(Math.random() * users.length)]._id;

    const randomEventTypeId = () =>
        eventTypes[Math.floor(Math.random() * eventTypes.length)]._id;


    let events = [
        {
            title: "Tech Startup Networking Night",
            description: "An evening for founders, developers, and investors to connect and share ideas.",
            date: new Date("2025-02-10T18:30:00Z"),
            fullAddress: "123 Market St, San Francisco, CA 94103, USA",
            location: {
                type: "Point",
                coordinates: [-122.4194, 37.7749],
            },
            imageUrl: "https://example.com/images/startup-networking.jpg",
            maxAttendees: 120,
            fee: {
                amount: 25,
                currence: "USD",
            },
            active: true
        },
        {
            title: "Weekend Yoga in the Park",
            description: "Relaxing outdoor yoga session suitable for all levels.",
            date: new Date("2025-03-02T09:00:00Z"),
            fullAddress: "Golden Gate Park, San Francisco, CA, USA",
            location: {
                type: "Point",
                coordinates: [-122.4862, 37.7694],
            },
            imageUrl: "https://example.com/images/yoga-park.jpg",
            maxAttendees: 50,
            fee: {
                amount: 10,
                currence: "USD",
            },
            active: true
        },
        {
            title: "JavaScript Advanced Workshop",
            description: "Deep dive into modern JavaScript patterns and performance tips.",
            date: new Date("2025-04-15T16:00:00Z"),
            fullAddress: "456 Howard St, San Francisco, CA 94105, USA",
            location: {
                type: "Point",
                coordinates: [-122.3977, 37.7897],
            },
            imageUrl: "https://example.com/images/js-workshop.jpg",
            maxAttendees: 80,
            fee: {
                amount: 99,
                currence: "USD",
            },
            active: true
        },
        {
            title: "Local Artists Art Exhibition",
            description: "Showcasing contemporary artwork from local artists.",
            date: new Date("2025-05-20T17:00:00Z"),
            fullAddress: "789 Mission St, San Francisco, CA 94103, USA",
            location: {
                type: "Point",
                coordinates: [-122.4041, 37.7841],
            },
            imageUrl: "https://example.com/images/art-exhibition.jpg",
            maxAttendees: 200,
            fee: {
                amount: 15,
                currence: "USD",
            },
            active: true
        },
        {
            title: "Food Truck Festival",
            description: "Taste dishes from the best food trucks in the city.",
            date: new Date("2025-06-08T12:00:00Z"),
            fullAddress: "Pier 39, San Francisco, CA 94133, USA",
            location: {
                type: "Point",
                coordinates: [-122.4107, 37.8087],
            },
            imageUrl: "https://example.com/images/food-truck-festival.jpg",
            maxAttendees: 500,
            fee: {
                amount: 5,
                currence: "USD",
            },
            active: true
        },
        {
            title: "Photography City Walk",
            description: "Guided photo walk through iconic city locations.",
            date: new Date("2025-07-12T15:00:00Z"),
            fullAddress: "Ferry Building, San Francisco, CA 94111, USA",
            location: {
                type: "Point",
                coordinates: [-122.3933, 37.7955],
            },
            imageUrl: "https://example.com/images/photo-walk.jpg",
            maxAttendees: 30,
            fee: {
                amount: 20,
                currence: "USD",
            },
            active: true
        },
        {
            title: "Live Jazz Night",
            description: "Enjoy live jazz music from talented local musicians.",
            date: new Date("2025-08-03T20:00:00Z"),
            fullAddress: "321 Jazz Alley, San Francisco, CA 94102, USA",
            location: {
                type: "Point",
                coordinates: [-122.4181, 37.7793],
            },
            imageUrl: "https://example.com/images/jazz-night.jpg",
            maxAttendees: 100,
            fee: {
                amount: 30,
                currence: "USD",
            },
            active: true
        },
        {
            title: "Startup Pitch Competition",
            description: "Early-stage startups pitch to a panel of investors.",
            date: new Date("2025-09-18T17:30:00Z"),
            fullAddress: "901 Howard St, San Francisco, CA 94103, USA",
            location: {
                type: "Point",
                coordinates: [-122.4009, 37.7827],
            },
            imageUrl: "https://example.com/images/pitch-competition.jpg",
            maxAttendees: 150,
            fee: {
                amount: 40,
                currence: "USD",
            },
            active: true
        },
        {
            title: "Cooking Masterclass: Italian Cuisine",
            description: "Hands-on cooking class focused on classic Italian dishes.",
            date: new Date("2025-10-05T18:00:00Z"),
            fullAddress: "654 Culinary Ave, San Francisco, CA 94107, USA",
            location: {
                type: "Point",
                coordinates: [-122.3949, 37.7648],
            },
            imageUrl: "https://example.com/images/italian-cooking.jpg",
            maxAttendees: 25,
            fee: {
                amount: 75,
                currence: "USD",
            },
            active: true
        },
        {
            title: "New Year Rooftop Party",
            description: "Celebrate the new year with music, drinks, and city views.",
            date: new Date("2025-12-31T21:00:00Z"),
            fullAddress: "999 Skyline Blvd, San Francisco, CA 94105, USA",
            location: {
                type: "Point",
                coordinates: [-122.3999, 37.7886],
            },
            imageUrl: "https://example.com/images/new-year-party.jpg",
            maxAttendees: 300,
            fee: {
                amount: 120,
                currence: "USD",
            },
            active: true
        },
    ];
    const eventsToInsert = events.map(event => ({
        ...event,
        author: randomUserId(),
        type: randomEventTypeId(),
    }));

    await Event.insertMany(eventsToInsert);

    log(`Created ${eventsToInsert.length} events`);
    log("Seeding completed ✅");
}