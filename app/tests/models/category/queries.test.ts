import { Category, type HydratedCategoryDoc } from "@/models/category/Category";

describe("getRoots() method", () => {
    it("should return only root categories", async () => {
        const roots = await Category.find().getRoots();

        expect(roots).toBeInstanceOf(Array);
        roots.forEach((root) => {
            expect(root.parent).toBeNull();
        });
    });
});

describe("getSubcategories() method", () => {
    let parentCategory: HydratedCategoryDoc | null;
    beforeAll(async () => {
        parentCategory = await Category.findOne({ parent: null });
        if (!parentCategory) {
            throw new Error("No root category found, please check your seeder");
        }
        await Category.create({
            title: "Test Subcategory",
            parent: parentCategory._id
        });
    });
    afterAll(async () => {
        await Category.deleteMany({ title: "Test Subcategory" });
    });
    it("should return only subcategories of the specified parent", async () => {
        const rootCategory = parentCategory;
        if (!rootCategory) {
            throw new Error("No root category found, please check your seeder");
        }
        const subcategories = await Category.find().getSubcategories(rootCategory._id);
        expect(subcategories).toBeInstanceOf(Array);
        subcategories.forEach(subcategory => {
            expect(subcategory.parent?.toString()).toBe(rootCategory._id.toString());
        });
    });
});
