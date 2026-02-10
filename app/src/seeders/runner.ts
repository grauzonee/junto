import 'dotenv/config';
import { connectToMongo } from "@/config/mongoConfig";
import { ca } from 'zod/v4/locales';

async function run() {
  await connectToMongo();

  const seederName = process.argv[2];

  if (!seederName) {
    // eslint-disable-next-line
    console.error("Please specify a seeder name!");
    process.exit(1);
  }
  if (seederName === "all") {
    const seeders = ["categories", "interests", "users", "eventtypes", "events"];
    for (const name of seeders) {
      try {
        await runSeeder(name);
      } catch (err) {
        process.exit(1);
      }

    }
    process.exit(0);
  }
  try {
    await runSeeder(seederName);
  } catch (err) {
    process.exit(1);
  }

  process.exit(0);
}

async function runSeeder(seederName: string) {
  try {
    const { seed } = await import(`./${seederName}.seeder`);
    await seed();
  } catch (err) {
    // eslint-disable-next-line
    console.error(`Seeder ${seederName} not found or failed:`, err);
    throw err;
  }
}
run();
