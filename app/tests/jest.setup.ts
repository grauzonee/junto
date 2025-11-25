import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { seed as seedCategories } from "@/seeders/categories.seeder"
import { seed as seedInterests } from "@/seeders/interests.seeder"

let mongoServer: MongoMemoryServer

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
    await seedCategories();
    await seedInterests();
})

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});
