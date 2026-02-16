import { Types } from "mongoose"
import { Category } from "@/models/category/Category";

describe("Category static methods", () => {
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
