import mongoose, { Types } from "mongoose"
import { Event } from "@/models/event/Event"
import { createFakeEvent } from "../generators/event"
import { Category } from "@/models/category/Category"
import { createUser } from "../generators/user"
import { STATUS_CONFIRMED } from "@/models/rsvp/utils"
import { getOneCategory } from "@tests/getters"

describe("Validation", () => {
    it("Categories: Should pass validation if categories array is empty", async () => {
        const event = await createFakeEvent({ categories: [] }, true);
        const foundDocNum = await Event.countDocuments({ _id: event._id });
        expect(foundDocNum).toBe(1);
    })
    it("Categories: Should throw exception if category doesn't exist", async () => {
        try {
            await createFakeEvent({ categories: [new Types.ObjectId().toString()] }, true);
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("Categories: Should throw exception if one of categories doesn't exist", async () => {

        const category = await getOneCategory();
        try {
            await createFakeEvent({ categories: [category._id.toString(), new Types.ObjectId().toString()] }, true);
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("Categories: Should update categories if categories array is valid", async () => {
        const categories = await Category.find().limit(2);
        if (!categories) {
            throw new Error("No categories in MongoMemory server, check your seeders!");
        }
        const event = await createFakeEvent({ categories: categories.map(i => i._id.toString()) }, true);
        const foundDocNum = await Event.findById(event._id);
        expect(foundDocNum).toHaveProperty("categories");
        foundDocNum!.categories.forEach((categoryId, index) => {
            expect(categoryId.toString()).toBe(event.categories![index].toString());
        });
    })

    it("Type: Should throw exception if type doesn't exist", async () => {
        try {
            await createFakeEvent({ type: new Types.ObjectId().toString() }, true);
        } catch (error) {
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("RSVP: Should create RSVP for author when event is created", async () => {
        const user = await createUser({}, true);
        const category = await getOneCategory();
        const event = await createFakeEvent({ author: user._id.toString(), categories: [category.id.toString()] }, true);
        const rsvp = await mongoose.model("RSVP").findOne({ event: event._id, user: event.author });
        expect(rsvp).not.toBeNull();
        expect(rsvp).toHaveProperty("status", STATUS_CONFIRMED);
    })

    it("RSVP: Should not create duplicate RSVP for author when event is updated", async () => {
        const user = await createUser({}, true);
        const event = await createFakeEvent({ author: user._id.toString() });
        const categories = await Category.find().limit(2);
        if (!categories) {
            throw new Error("No categories in MongoMemory server, check your seeders!");
        }
        event.categories = categories.map(i => i._id.toString());
        const newEvent = await Event.create(event);
        newEvent.title = "Updated Event Title";
        await newEvent.save();
        const rsvps = await mongoose.model("RSVP").find({ event: newEvent._id, user: newEvent.author });
        expect(rsvps.length).toBe(1);
    });
})
