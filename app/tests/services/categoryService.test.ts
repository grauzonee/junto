import mongoose, { Types } from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { list } from "@/services/categoryService"
import { Request } from "express"
import { seed as seedCategories } from "@/seeders/categories.seeder"
import { Category } from "@/models/Category"

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
    it("Should call getTree method on Category and pass pagination params", async () => {
        req = {
            offset: 0,
            limit: 3
        }
        const spy = jest.spyOn(Category, "getTree");

        await list(req as Request);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(req.offset, req.limit);
    })
    it("Should return result", async () => {
        req = {
            offset: 0,
            limit: 3
        }
        const result = await list(req as Request);
        expect(result[0]).toMatchObject({
            _id: expect.any(Types.ObjectId),
            title: expect.any(String),
            subcategories: expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.any(Types.ObjectId),
                    title: expect.any(String),
                    parent: expect.any(Types.ObjectId),
                })
            ])
        });
    })
})
