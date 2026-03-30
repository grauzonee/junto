import mongoose, { Types } from "mongoose";
import { Category } from "@/models/category/Category";
import { EventType } from "@/models/EventType";
import { Interest } from "@/models/Interest";
import { createUser } from "@tests/generators/user";
import { createFakeEvent } from "@tests/generators/event";
import { ConflictError } from "@/types/errors/InputError";
import { getOneEventType } from "@tests/getters";

describe("referential integrity validators", () => {
    it("Should reject categories with missing parents", async () => {
        await expect(Category.create({
            title: "Broken child",
            parent: new Types.ObjectId()
        })).rejects.toBeInstanceOf(mongoose.Error.ValidationError);
    });
});

describe("taxonomy delete guards", () => {
    it("Should block category deletion when an event references it", async () => {
        const author = await createUser({}, true);
        const category = await Category.create({ title: `Guarded category ${Date.now()}` });
        const eventType = await getOneEventType();

        await createFakeEvent({
            author: author._id.toString(),
            categories: [category._id.toString()],
            type: eventType._id.toString()
        }, true);

        await expect(Category.findByIdAndDelete(category._id)).rejects.toBeInstanceOf(ConflictError);
    });

    it("Should block category deletion when it still has children", async () => {
        const parent = await Category.create({ title: `Parent ${Date.now()}` });
        await Category.create({ title: `Child ${Date.now()}`, parent: parent._id });

        await expect(parent.deleteOne()).rejects.toBeInstanceOf(ConflictError);
    });

    it("Should block event type deletion when an event references it", async () => {
        const author = await createUser({}, true);
        const eventType = await EventType.create({ title: `Guarded type ${Date.now()}` });

        await createFakeEvent({
            author: author._id.toString(),
            type: eventType._id.toString()
        }, true);

        await expect(EventType.findByIdAndDelete(eventType._id)).rejects.toBeInstanceOf(ConflictError);
    });

    it("Should block interest deletion when a user references it", async () => {
        const interest = await Interest.create({ title: `Guarded interest ${Date.now()}` });
        await createUser({ interests: [interest._id] }, true);

        await expect(Interest.findByIdAndDelete(interest._id)).rejects.toBeInstanceOf(ConflictError);
    });

    it("Should allow deleting unreferenced taxonomy documents", async () => {
        const category = await Category.create({ title: `Loose category ${Date.now()}` });
        const eventType = await EventType.create({ title: `Loose type ${Date.now()}` });
        const interest = await Interest.create({ title: `Loose interest ${Date.now()}` });

        await expect(Category.findByIdAndDelete(category._id)).resolves.toBeTruthy();
        await expect(EventType.findByIdAndDelete(eventType._id)).resolves.toBeTruthy();
        await expect(Interest.findByIdAndDelete(interest._id)).resolves.toBeTruthy();
    });
});
