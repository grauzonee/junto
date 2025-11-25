import mongoose, { Types } from "mongoose"
import { Event } from "@/models/Event"
import { createFakeEvent } from "../services/generator"
import { Category } from "@/models/Category"

describe("Validation", () => {
    it("Categories: Should pass validation if categories array is empty", async () => {
        const event = createFakeEvent();
        event.categories = [];
        const newEvent = await Event.create(event);
        const foundDocNum = await Event.countDocuments({ _id: newEvent._id });
        expect(foundDocNum).toBe(1);
    })
    it("Categories: Should throw exception if category doesn't exist", async () => {
        const event = createFakeEvent();
        event.categories = [new Types.ObjectId()];
        try {
            await Event.create(event);
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("Categories: Should throw exception if one of categories doesn't exist", async () => {
        const event = createFakeEvent();
        const category = await Category.findOne();
        if (!category) {
            throw new Error("No categories in MongoMemory server, check your seeders!");
        }
        event.categories = [category._id, new Types.ObjectId()];
        try {
            await Event.create(event);
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
})
