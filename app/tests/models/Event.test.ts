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
        const event = createFakeEvent({ type: eventTypeId });
        event.categories = [];
        const newEvent = await Event.create(event);
        const foundDocNum = await Event.countDocuments({ _id: newEvent._id });
        expect(foundDocNum).toBe(1);
    })
    it("Categories: Should throw exception if category doesn't exist", async () => {
        const event = createFakeEvent({ type: eventTypeId });
        event.categories = [new Types.ObjectId()];
        try {
            await Event.create(event);
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("Categories: Should throw exception if one of categories doesn't exist", async () => {
        const event = createFakeEvent({ type: eventTypeId });
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
    it("Categories: Should update categories if categories array is valid", async () => {
        const event = createFakeEvent({ type: eventTypeId });
        const categories = await Category.find().limit(2);
        if (!categories) {
            throw new Error("No categories in MongoMemory server, check your seeders!");
        }
        event.categories = categories.map(i => i._id);
        const newEvent = await Event.create(event);
        const foundDocNum = await Event.findById(newEvent._id);
        expect(foundDocNum).toHaveProperty("categories");
        expect(foundDocNum!.categories).toEqual(event.categories);
    })

    it("Type: Should throw exception if type doesn't exist", async () => {
        const event = createFakeEvent({ type: new Types.ObjectId() });
        try {
            await Event.create(event);
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
})
