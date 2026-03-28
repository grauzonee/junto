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
