require("dotenv").config({ path: ".env.test", quiet: true });

import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { seed as seedCategories } from "@/seeders/categories.seeder"
import { seed as seedInterests } from "@/seeders/interests.seeder"
import { seed as seedUsers } from "@/seeders/users.seeder"
import { seed as seedEventTypes } from "@/seeders/eventtypes.seeder"

let mongoServer: MongoMemoryServer

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
    await seedCategories();
    await seedInterests();
    await seedUsers();
    await seedEventTypes();
})

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});
