import mongoose from "mongoose"
import { Category } from "@/models/Category";
import { MongoMemoryServer } from "mongodb-memory-server"
import { seed as seedCategories } from "@/seeders/categories.seeder"
let mongoServer: MongoMemoryServer

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

describe("Category query methods", () => {
    it("getRoots(): Should return only root categories", async () => {
        const categories = await Category.find().getRoots();
        const rootCategories = categories.filter(category => category.parent === undefined);
        expect(categories.length).toEqual(rootCategories.length);
    })
    it("getSubcategories(): Should return only subcategories", async () => {
        const rootCategory = await Category.find().getRoots().findOne();
        if (!rootCategory) {
            throw new Error("Root category not found, please check your seeder");
        }
        const categories = await Category.find().getSubcategories(rootCategory._id);
        const subCategories = categories.filter(category => category.parent?.toString() === rootCategory._id.toString());
        expect(categories.length).toEqual(subCategories.length);
    })
})
