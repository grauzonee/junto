import { Types } from "mongoose"
import { Category } from "@/models/Category";

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

describe("Category static methods", () => {
    it("getTree(): Should return root categories with subcategories parameter", async () => {
        const tree = await Category.getTree();
        let subInPlace = true;
        tree.forEach(category => {
            category.subcategories.forEach(subcategory => {
                if (subcategory.parent?.toString() !== category._id.toString()) {
                    subInPlace = false;
                }
            })
        })
        expect(subInPlace).toBe(true);
    })

    it("getTree(): Pagination is working", async () => {
        const tree = await Category.getTree(0, 2);
        expect(tree.length).toBe(2);
    })
    it("getTree(): Return fields are _id, title, subcategories", async () => {
        const tree = await Category.getTree(0, 1);
        expect(tree[0]).toMatchObject({
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
