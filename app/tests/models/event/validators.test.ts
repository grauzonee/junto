import { Types } from "mongoose";
import { categoriesValidator, typeValidator } from "@/models/event/validators";
import { getOneCategory, getOneEventType } from "../../getters";

describe("categoriesValidator() method", () => {
    it("should return true if value is empty", async () => {
        const result = await categoriesValidator([]);
        expect(result).toBe(true);
    });

    it("should return true if all categories exist", async () => {
        const category = await getOneCategory();
        const result = await categoriesValidator([category._id]);
        expect(result).toBe(true);
    });

    it("should return false if some categories do not exist", async () => {
        const category = await getOneCategory();
        const nonExistentId = new Types.ObjectId();
        const result = await categoriesValidator([category._id, nonExistentId]);
        expect(result).toBe(false);
    });
});

describe("typeValidator() method", () => {
    it("should return true if type exists", async () => {
        const type = await getOneEventType();
        const result = await typeValidator(type._id);
        expect(result).toBe(true);
    });

    it("should return false if type does not exist", async () => {
        const nonExistentId = new Types.ObjectId();
        const result = await typeValidator(nonExistentId);
        expect(result).toBe(false);
    });
});