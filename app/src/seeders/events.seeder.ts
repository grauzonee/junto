import { Event } from "@/models/event/Event";
import { EventType } from "@/models/EventType";
import { User } from "@/models/user/User";

const EVENT_HOURS = [18, 19, 20, 9, 16, 17, 12, 15, 14, 21];

type RandomFn = () => number;

function startOfWeek(value: Date): Date {
    const result = new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const distanceFromMonday = (result.getDay() + 6) % 7;
    result.setDate(result.getDate() - distanceFromMonday);
    return result;
}

function isSameDay(left: Date, right: Date): boolean {
    return left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate();
}

function isSameMonth(value: Date, referenceDate: Date): boolean {
    return value.getFullYear() === referenceDate.getFullYear()
        && value.getMonth() === referenceDate.getMonth();
}

function buildDate(referenceDate: Date, dayOfMonth: number, hours: number): Date {
    return new Date(referenceDate.getFullYear(), referenceDate.getMonth(), dayOfMonth, hours, 0, 0, 0);
}

function getWeekDates(referenceDate: Date): Date[] {
    const weekStart = startOfWeek(referenceDate);
    return Array.from({ length: 7 }, (_, offset) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + offset);
        return date;
    });
}

function shuffle<T>(values: T[], random: RandomFn): T[] {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
}

function pickThisWeekDate(referenceDate: Date): Date {
    const weekDates = getWeekDates(referenceDate);
    const nextDate = weekDates.find(date => !isSameDay(date, referenceDate) && date > referenceDate);
    if (nextDate) {
        return new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
    }

    const previousDate = [...weekDates].reverse().find(date => !isSameDay(date, referenceDate));
    if (previousDate) {
        return new Date(previousDate.getFullYear(), previousDate.getMonth(), previousDate.getDate());
    }

    throw new Error("Could not build a distinct event date for this week");
}

function getWeekDaysInCurrentMonth(referenceDate: Date): number[] {
    return getWeekDates(referenceDate)
        .filter(date => isSameMonth(date, referenceDate))
        .map(date => date.getDate());
}

function pickThisMonthDay(referenceDate: Date, weekDaysInCurrentMonth: number[]): number {
    const daysInMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate();
    const weekDaySet = new Set(weekDaysInCurrentMonth);
    const daysOutsideCurrentWeek = Array.from({ length: daysInMonth }, (_, index) => index + 1)
        .filter(day => !weekDaySet.has(day));

    const preferredFutureDay = daysOutsideCurrentWeek.find(day => day > referenceDate.getDate());
    if (preferredFutureDay) {
        return preferredFutureDay;
    }

    const fallbackPastDay = [...daysOutsideCurrentWeek].reverse().find(day => day < referenceDate.getDate());
    if (fallbackPastDay) {
        return fallbackPastDay;
    }

    const fallbackDay = Array.from({ length: daysInMonth }, (_, index) => index + 1)
        .find(day => day !== referenceDate.getDate());
    if (fallbackDay) {
        return fallbackDay;
    }

    throw new Error("Could not build a distinct event date for this month");
}

export function buildSeedEventDates(
    referenceDate: Date = new Date(),
    totalEvents: number = EVENT_HOURS.length,
    random: RandomFn = Math.random
): Date[] {
    if (totalEvents < 3) {
        throw new Error("At least three seed event dates are required");
    }

    const todayDate = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth(),
        referenceDate.getDate(),
        EVENT_HOURS[2],
        0,
        0,
        0
    );

    const thisWeekDate = pickThisWeekDate(referenceDate);
    thisWeekDate.setHours(EVENT_HOURS[1], 0, 0, 0);

    const weekDaysInCurrentMonth = getWeekDaysInCurrentMonth(referenceDate);
    const thisMonthDay = pickThisMonthDay(referenceDate, weekDaysInCurrentMonth);
    const thisMonthDate = buildDate(referenceDate, thisMonthDay, EVENT_HOURS[0]);

    const excludedMonthDays = new Set<number>([...weekDaysInCurrentMonth, thisMonthDay]);
    const daysInMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate();
    const availableMonthDays = Array.from({ length: daysInMonth }, (_, index) => index + 1)
        .filter(day => !excludedMonthDays.has(day));

    const remainingEvents = totalEvents - 3;
    if (availableMonthDays.length < remainingEvents) {
        throw new Error("Not enough days outside the current week to seed events for this month");
    }

    const randomMonthDates = shuffle(availableMonthDays, random)
        .slice(0, remainingEvents)
        .map((day, index) => buildDate(referenceDate, day, EVENT_HOURS[(index + 3) % EVENT_HOURS.length]));

    return [thisMonthDate, thisWeekDate, todayDate, ...randomMonthDates];
}

export async function seed() {
    const eventTypes = await EventType.find({}, { _id: 1 }).lean();

    if (!eventTypes.length) {
        throw new Error("No event types found");
    }

    const users = await User.find({}, { _id: 1 }).lean();

    if (!users.length) {
        throw new Error("No users found to assign as authors");
    }

    const randomUserId = () =>
        users[Math.floor(Math.random() * users.length)]._id;

    const randomEventTypeId = () =>
        eventTypes[Math.floor(Math.random() * eventTypes.length)]._id;

    const eventDates = buildSeedEventDates();

    const events = [
        {
            title: "Tech Startup Networking Night",
            description: "An evening for founders, developers, and investors to connect and share ideas.",
            date: eventDates[0],
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
            date: eventDates[1],
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
            date: eventDates[2],
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
            date: eventDates[3],
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
            date: eventDates[4],
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
            date: eventDates[5],
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
            date: eventDates[6],
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
            date: eventDates[7],
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
            date: eventDates[8],
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
            date: eventDates[9],
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
            active: false
        },
    ];
    const eventsToInsert = events.map(event => ({
        ...event,
        author: randomUserId(),
        type: randomEventTypeId(),
    }));

    await Event.insertMany(eventsToInsert);

    if (!process.env.JEST_WORKER_ID) {
        // eslint-disable-next-line
        console.log("Events seeding done.");
    }
}
