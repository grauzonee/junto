import { CreateEventSchema } from "@/schemas/http/Event";
import { Types } from "mongoose";
import messages from "@/constants/errorMessages"
import * as z from 'zod';

const categoryId = new Types.ObjectId().toString();
const typeId = new Types.ObjectId().toString();

describe("CreateEventSchema", () => {
    it("Should pass validation with valid data", () => {
        const data = {
            title: "Sample Event",
            description: "This is a sample event.",
            imageUrl: "http://example.com/image.jpg",
            date: Math.ceil(Date.now() / 1000) + 3600,
            fullAddress: "123 Main St, Anytown, USA",
            location: {
                type: "Point",
                coordinates: [-74.0060, 40.7128]
            },
            categories: [categoryId],
            type: typeId,
            fee: {
                amount: 20,
                currency: "USD"
            },
            maxAttendees: 100
        };
        expect(() => CreateEventSchema.parse(data)).not.toThrow();
    });
    it("Should fail validation with date in the past", () => {
        const data = {
            title: "Sample Event",
            description: "This is a sample event.",
            imageUrl: "http://example.com/image.jpg",
            date: Math.ceil(Date.now() / 1000) - 3600, // 1 hour in the past
            fullAddress: "123 Main St, Anytown, USA",
            location: {
                type: "Point",
                coordinates: [-74.0060, 40.7128]
            },
            categories: [categoryId],
            type: typeId,
            fee: {
                amount: 20,
                currency: "USD"
            },
            maxAttendees: 100
        };
        try {
            CreateEventSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.http.DATE_IN_PAST);
        }
    });

    it("Should fail validation with invalid coordinates", () => {
        const data = {
            title: "Sample Event",
            description: "This is a sample event.",
            imageUrl: "http://example.com/image.jpg",
            date: Math.ceil(Date.now() / 1000) + 3600,
            fullAddress: "123 Main St, Anytown, USA",
            location: {
                type: "Point",
                coordinates: [23.09, 91.5]
            },
            categories: [categoryId],
            type: typeId,
            fee: {
                amount: 20,
                currency: "USD"
            },
            maxAttendees: 100
        };
        try {
            CreateEventSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.validation.NOT_CORRECT("Coordinates"));
        }
    });

    it("Should fail validation when latitude is out of bounds in GeoJSON order", () => {
        const data = {
            title: "Sample Event",
            description: "This is a sample event.",
            imageUrl: "http://example.com/image.jpg",
            date: Math.ceil(Date.now() / 1000) + 3600,
            fullAddress: "123 Main St, Anytown, USA",
            location: {
                type: "Point",
                coordinates: [23.09, 91.5]
            },
            categories: [categoryId],
            type: typeId,
            fee: {
                amount: 20,
                currency: "USD"
            },
            maxAttendees: 100
        };

        try {
            CreateEventSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.validation.NOT_CORRECT("Coordinates"));
        }
    });

    it("Should fail validation with non-unique categories", () => {
        const data = {
            title: "Sample Event",
            description: "This is a sample event.",
            imageUrl: "http://example.com/image.jpg",
            date: Math.ceil(Date.now() / 1000) + 3600,
            fullAddress: "123 Main St, Anytown, USA",
            location: {
                type: "Point",
                coordinates: [-74.0060, 40.7128]
            },
            categories: [categoryId, categoryId], // Duplicate category IDs
            type: typeId,
            fee: {
                amount: 20,
                currency: "USD"
            },
            maxAttendees: 100
        };
        try {
            CreateEventSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.http.UNIQUE_VALUES("Categories"));
        }
    });

    it("Should pass validation without fee", () => {
        const data = {
            title: "Sample Event",
            description: "This is a sample event.",
            imageUrl: "http://example.com/image.jpg",
            date: Math.ceil(Date.now() / 1000) + 3600,
            fullAddress: "123 Main St, Anytown, USA",
            location: {
                type: "Point",
                coordinates: [-74.0060, 40.7128]
            },
            categories: [categoryId],
            type: typeId,
            maxAttendees: 100,
        };
        expect(() => CreateEventSchema.parse(data)).not.toThrow();
    });

    it("Should not pass validation without maxAttendees", () => {
        const data = {
            title: "Sample Event",
            description: "This is a sample event.",
            imageUrl: "http://example.com/image.jpg",
            date: Math.ceil(Date.now() / 1000) + 3600,
            fullAddress: "123 Main St, Anytown, USA",
            location: {
                type: "Point",
                coordinates: [-74.0060, 40.7128]
            },
            categories: [categoryId],
            type: typeId,
            fee: {
                amount: 20,
                currency: "USD"
            },
            active: true,
        };
        try {
            CreateEventSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe("Invalid input: expected number, received undefined");
        }
    });
    it("Should not pass validation with invalid maxAttendees", () => {
        const data = {
            title: "Sample Event",
            description: "This is a sample event.",
            imageUrl: "http://example.com/image.jpg",
            date: Math.ceil(Date.now() / 1000) + 3600,
            fullAddress: "123 Main St, Anytown, USA",
            location: {
                type: "Point",
                coordinates: [-74.0060, 40.7128]
            },
            categories: [categoryId],
            type: typeId,
            fee: {
                amount: 20,
                currency: "USD"
            },
            active: true,
            maxAttendees: 0
        };
        try {
            CreateEventSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.http.MIN("Max Attendees", 1));
        }
    });
});
