import 'dotenv/config';
import { connectToMongo } from "@/config/mongoConfig";

async function run() {
  await connectToMongo();

  const seederName = process.argv[2];

  if (!seederName) {
    // eslint-disable-next-line
    console.error("Please specify a seeder name!");
    process.exit(1);
  }

  try {
    const { seed } = await import(`./${seederName}.seeder`);
    await seed();
  } catch (err) {
    // eslint-disable-next-line
    console.error("Seeder not found or failed:", err);
  }

  process.exit(0);
}

run();
