import 'dotenv/config';
import { connectToMongo } from "@/config/mongoConfig";
import { Category } from "@/models/category/Category";
import { Event } from "@/models/event/Event";
import { EventType } from "@/models/EventType";
import { Interest } from "@/models/Interest";
import { RSVP } from "@/models/rsvp/RSVP";
import { User } from "@/models/user/User";

const seeders = ["categories", "interests", "users", "eventtypes", "events"] as const;

const resetters: Record<(typeof seeders)[number], () => Promise<void>> = {
  categories: async () => {
    await RSVP.deleteMany({});
    await Event.deleteMany({});
    await Category.deleteMany({});
  },
  interests: async () => {
    await Interest.deleteMany({});
  },
  users: async () => {
    await RSVP.deleteMany({});
    await Event.deleteMany({});
    await User.deleteMany({});
  },
  eventtypes: async () => {
    await RSVP.deleteMany({});
    await Event.deleteMany({});
    await EventType.deleteMany({});
  },
  events: async () => {
    await RSVP.deleteMany({});
    await Event.deleteMany({});
  }
};

async function resetSeedData() {
  await RSVP.deleteMany({});
  await Event.deleteMany({});
  await User.deleteMany({});
  await Category.deleteMany({});
  await Interest.deleteMany({});
  await EventType.deleteMany({});
}

async function run() {
  await connectToMongo();

  const seederName = process.argv[2];

  if (!seederName) {
    console.error("Please specify a seeder name!");
    process.exit(1);
  }
  if (seederName === "all") {
    await resetSeedData();
    for (const name of seeders) {
      try {
        await runSeeder(name);
      } catch {
        process.exit(1);
      }

    }
    process.exit(0);
  }
  try {
    await runSeeder(seederName);
  } catch {
    process.exit(1);
  }

  process.exit(0);
}

async function runSeeder(seederName: string) {
  try {
    if (seederName in resetters) {
      await resetters[seederName as keyof typeof resetters]();
    }
    const seederModule = await import(`./${seederName}.seeder`);
    const { seed } = seederModule;
    await seed();
  } catch (err) {
    console.error(`Seeder ${seederName} not found or failed:`, err);
    throw err;
  }
}
void run();
