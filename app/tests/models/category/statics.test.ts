import { Category } from "@/models/category/Category";

describe("getTree() method", () => {
    beforeAll(async () => {
        const categories = await Category.find({ parent: null });
        await Promise.all(categories.map(category =>
            Category.create({
                title: category.title + " Subcategory",
                parent: category._id
            })
        ));
    });
    afterAll(async () => {
        await Category.deleteMany({ parent: { $ne: null } });
    });
    it("should return the correct tree structure", async () => {
        const tree = await Category.getTree();
        expect(tree).toBeInstanceOf(Array);
        tree.forEach(root => {
            expect(root).toHaveProperty("subcategories");
            expect(root.subcategories).toBeInstanceOf(Array);
        });
    });
});
