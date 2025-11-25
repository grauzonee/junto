import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { list } from "@/services/interestService"
import { Request } from "express"
import { seed as seedInterests } from "@/seeders/interests.seeder"

let mongoServer: MongoMemoryServer
let req: Partial<Request>

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
    await seedInterests();
})

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("List interests tests SUCCESS", () => {
    it("Should return exactly 3 interests when limit parameter specified", async () => {
        req = {
            offset: 0,
            limit: 3
        }
        const result = await list(req as Request);
        expect(result.length).toBe(3);
        result.forEach((interest) => {
            expect(typeof interest.title).toBe("string")
        })
    })
    it("Should return filtered interests", async () => {
        req = {
            dbFilter: [{
                prefix: "eq",
                field: "title",
                value: "art",
            }]
        }
        const result = await list(req as Request);
        expect(result.length).toBe(1);
        result.forEach((interest) => {
            expect(interest.title).toBe("Art")
        })
    })
})
