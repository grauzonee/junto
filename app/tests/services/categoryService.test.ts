import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { list } from "@/services/categoryService"
import { Request } from "express"
import { seed as seedCategories } from "@/seeders/categories.seeder"

let mongoServer: MongoMemoryServer
let req: Partial<Request>

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
  await seedCategories();
})

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("List categories tests SUCCESS", () => {
  it("Should return exactly 3 categories when limit parameter specified", async () => {
    req = {
      offset: 0,
      limit: 3
    }
    const result = await list(req as Request);
    expect(result.length).toBe(3);
    result.forEach((category) => {
      expect(typeof category.title).toBe("string")
    })
  })
  it("Should return filtered categories", async () => {
    req = {
      dbFilter: [{
        prefix: "eq",
        field: "title",
        value: "social",
      }]
    }
    const result = await list(req as Request);
    expect(result.length).toBe(1);
    result.forEach((category) => {
      expect(category.title).toBe("Social")
    })
  })
})
