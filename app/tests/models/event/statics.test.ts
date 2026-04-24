import { Event } from "@/models/event/Event";
import { getFilterableFields, getSortableFields } from "@/models/event/statics";
import { createFakeEvent } from "@tests/generators/event";
import { createUser } from "@tests/generators/user";

describe("getFilterableFields() method", () => {
    it("should return correct filterable fields", () => {
        const fields = getFilterableFields();
        expect(fields).toEqual([
            {
                field: 'date',
                preprocess: expect.any(Function)
            },
            {
                field: 'categories'
            },
            {
                field: 'type'
            }
        ]);
    });

    it("should resolve relative date aliases through the date preprocess function", () => {
        const fields = getFilterableFields();
        const dateField = fields.find(field => field.field === "date");
        const result = dateField?.preprocess?.("this week", "eq");
        expect(result).toEqual({
            start: expect.any(Date),
            end: expect.any(Date)
        });
    })
});

describe("getSortableFields() method", () => {
    it("should return correct sortable fields", () => {
        const fields = getSortableFields();
        expect(fields).toEqual(['date']);
    });
});

describe("softDeleteByAuthor() static method", () => {
    it("should soft delete only active events for the given author", async () => {
        const author = await createUser({}, true);
        const otherAuthor = await createUser({}, true);

        const activeOwnedEvent = await createFakeEvent({ author: author._id.toString() }, true);
        const inactiveOwnedEvent = await createFakeEvent({ author: author._id.toString(), active: false }, true);
        const otherAuthorsEvent = await createFakeEvent({ author: otherAuthor._id.toString() }, true);

        await Event.softDeleteByAuthor(author._id);

        const reloadedActiveOwnedEvent = await Event.findById(activeOwnedEvent._id);
        const reloadedInactiveOwnedEvent = await Event.findById(inactiveOwnedEvent._id);
        const reloadedOtherAuthorsEvent = await Event.findById(otherAuthorsEvent._id);

        expect(reloadedActiveOwnedEvent?.active).toBe(false);
        expect(reloadedActiveOwnedEvent?.deletedAt).toBeInstanceOf(Date);
        expect(reloadedInactiveOwnedEvent?.active).toBe(false);
        expect(reloadedOtherAuthorsEvent?.active).toBe(true);
        expect(reloadedOtherAuthorsEvent?.deletedAt).toBeUndefined();
    });
});
