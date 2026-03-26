import request from "supertest";
import app from "@/app";

describe("GET /api/categories", () => {
    it("Should return a list of categories", async () => {
        const res = await request(app).get('/api/categories');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        const category = res.body.data[0];
        expect(category).toHaveProperty('_id');
        expect(category).toHaveProperty('title');
        expect(category).toHaveProperty('subcategories');
        expect(Array.isArray(category.subcategories)).toBe(true);
        if (category.subcategories.length > 0) {
            const subcategory = category.subcategories[0];
            expect(subcategory).toHaveProperty('_id');
            expect(subcategory).toHaveProperty('title');
        }
    });
});
