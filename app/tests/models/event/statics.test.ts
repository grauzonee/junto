import { getFilterableFields, getSortableFields } from "@/models/event/statics";

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
});

describe("getSortableFields() method", () => {
    it("should return correct sortable fields", () => {
        const fields = getSortableFields();
        expect(fields).toEqual(['date']);
    });
});