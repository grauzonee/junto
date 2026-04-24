import * as z from "zod";
import { Types } from "mongoose";
import messages from "@/constants/errorMessages";
import { CreateEventSchema } from "@/schemas/http/Event";

const categoryId = new Types.ObjectId().toString();
const typeId = new Types.ObjectId().toString();

function createValidEventInput() {
    return {
        title: "Sample Event",
        description: "This is a sample event.",
        imageUrl: "http://example.com/image.jpg",
        date: Math.ceil(Date.now() / 1000) + 3600,
        fullAddress: "123 Main St, Anytown, USA",
        location: {
            type: "Point",
            coordinates: [-74.006, 40.7128]
        },
        categories: [categoryId],
        type: typeId,
        fee: {
            amount: 20,
            currency: "USD"
        },
        maxAttendees: 100
    };
}

describe("CreateEventSchema", () => {
    it("Should pass validation with valid data", () => {
        expect(() => CreateEventSchema.parse(createValidEventInput())).not.toThrow();
    });

    it("Should pass validation without fee", () => {
        const data = (({ fee: _fee, ...rest }) => rest)(createValidEventInput());

        expect(() => CreateEventSchema.parse(data)).not.toThrow();
    });

    it.each([
        {
            name: "Should fail validation with date in the past",
            mutate: () => ({
                date: Math.ceil(Date.now() / 1000) - 3600
            }),
            expectedMessage: messages.http.DATE_IN_PAST
        },
        {
            name: "Should fail validation with invalid coordinates",
            mutate: () => ({
                location: {
                    type: "Point",
                    coordinates: [23.09, 91.5]
                }
            }),
            expectedMessage: messages.validation.NOT_CORRECT("Coordinates")
        },
        {
            name: "Should fail validation with non-unique categories",
            mutate: () => ({
                categories: [categoryId, categoryId]
            }),
            expectedMessage: messages.http.UNIQUE_VALUES("Categories")
        },
        {
            name: "Should not pass validation without maxAttendees",
            mutate: () => (({ maxAttendees: _maxAttendees, ...invalidData }) => invalidData)(createValidEventInput()),
            expectedMessage: "Invalid input: expected number, received undefined"
        },
        {
            name: "Should not pass validation with invalid maxAttendees",
            mutate: () => ({
                maxAttendees: 0
            }),
            expectedMessage: messages.http.MIN("Max Attendees", 1)
        }
    ])("$name", ({ mutate, expectedMessage }) => {
        const data = {
            ...createValidEventInput(),
            ...mutate()
        };

        try {
            CreateEventSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(expectedMessage);
        }
    });
});
