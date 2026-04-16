import { CreateEventSchema } from "@/schemas/http/Event";
import { Types } from "mongoose";
import messages from "@/constants/errorMessages"

const categoryId = new Types.ObjectId().toString();
const typeId = new Types.ObjectId().toString();

function validEventInput(overrides: Record<string, unknown> = {}) {
    return {
        title: "Sample Event",
        description: "This is a sample event.",
        imageUrl: "http://example.com/image.jpg",
        date: Math.ceil(Date.now() / 1000) + 3600,
        fullAddress: "123 Main St, Anytown, USA",
        location: {
            type: "Point",
            coordinates: [40.7128, -74.0060]
        },
        categories: [categoryId],
        type: typeId,
        fee: {
            amount: 20,
            currency: "USD"
        },
        maxAttendees: 100,
        ...overrides
    };
}

function expectParseError(data: unknown, message: string) {
    const result = CreateEventSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
        expect(result.error.issues[0].message).toBe(message);
    }
}

describe("CreateEventSchema", () => {
    it("Should pass validation with valid data", () => {
        expect(() => CreateEventSchema.parse(validEventInput())).not.toThrow();
    });

    it.each([
        {
            name: "date in the past",
            data: validEventInput({ date: Math.ceil(Date.now() / 1000) - 3600 }),
            message: messages.http.DATE_IN_PAST
        },
        {
            name: "invalid coordinates",
            data: validEventInput({ location: { type: "Point", coordinates: [100, 200] } }),
            message: messages.validation.NOT_CORRECT("Coordinates")
        },
        {
            name: "non-unique categories",
            data: validEventInput({ categories: [categoryId, categoryId] }),
            message: messages.http.UNIQUE_VALUES("Categories")
        },
        {
            name: "invalid maxAttendees",
            data: validEventInput({ active: true, maxAttendees: 0 }),
            message: messages.http.MIN("Max Attendees", 1)
        },
    ])("Should fail validation with $name", ({ data, message }) => {
        expectParseError(data, message);
    });

    it("Should pass validation without fee", () => {
        const data: Record<string, unknown> = validEventInput();
        delete data.fee;
        expect(() => CreateEventSchema.parse(data)).not.toThrow();
    });

    it("Should not pass validation without maxAttendees", () => {
        const data: Record<string, unknown> = validEventInput({ active: true });
        delete data.maxAttendees;
        expectParseError(data, "Invalid input: expected number, received undefined");
    });
});
