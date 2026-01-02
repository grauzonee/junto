import mongoose, { Types } from "mongoose"
import { Event } from "@/models/Event"
import { createFakeEvent } from "../generators/event"
import { Category } from "@/models/Category"
import { EventType } from "@/models/EventType"

let eventTypeId: Types.ObjectId;

beforeAll(async () => {
    const eventType = await EventType.findOne();
    if (!eventType) {
        throw new Error("No event types found, check your seeders");
    }
    eventTypeId = eventType._id;
})
describe("Validation", () => {
    it("Categories: Should pass validation if categories array is empty", async () => {
        const event = createFakeEvent({ type: eventTypeId.toString() });
        event.categories = [];
        const newEvent = await Event.create(event);
        const foundDocNum = await Event.countDocuments({ _id: newEvent._id });
        expect(foundDocNum).toBe(1);
    })
    it("Categories: Should throw exception if category doesn't exist", async () => {
        const event = createFakeEvent({ type: eventTypeId.toString() });
        event.categories = [new Types.ObjectId().toString()];
        try {
            await Event.create(event);
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("Categories: Should throw exception if one of categories doesn't exist", async () => {
        const event = createFakeEvent({ type: eventTypeId.toString() });
        const category = await Category.findOne();
        if (!category) {
            throw new Error("No categories in MongoMemory server, check your seeders!");
        }
        event.categories = [category._id.toString(), new Types.ObjectId().toString()];
        try {
            await Event.create(event);
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("Categories: Should update categories if categories array is valid", async () => {
        const event = createFakeEvent({ type: eventTypeId.toString() });
        const categories = await Category.find().limit(2);
        if (!categories) {
            throw new Error("No categories in MongoMemory server, check your seeders!");
        }
        event.categories = categories.map(i => i._id.toString());
        const newEvent = await Event.create(event);
        const foundDocNum = await Event.findById(newEvent._id);
        expect(foundDocNum).toHaveProperty("categories");
        foundDocNum!.categories.forEach((categoryId, index) => {
            expect(categoryId.toString()).toBe(event.categories[index]);
        });
    })

    it("Type: Should throw exception if type doesn't exist", async () => {
        const event = createFakeEvent({ type: new Types.ObjectId().toString() });
        try {
            await Event.create(event);
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
})
