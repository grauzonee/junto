import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { CreateRSVPSchema, UpdateRSVPSchema } from "@/schemas/http/RSVP";
import { Types } from "mongoose";
import messages from "@/constants/errorMessages"

function expectParseError(schema: typeof CreateRSVPSchema | typeof UpdateRSVPSchema, data: unknown, message: string) {
    const result = schema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
        expect(result.error.issues[0].message).toBe(message);
    }
}

describe("CreateRSVPSchema", () => {
    it("Should pass validation with valid data", () => {
        const data = {
            eventId: new Types.ObjectId().toString(),
            status: STATUS_CONFIRMED,
            additionalGuests: 2
        };
        expect(() => CreateRSVPSchema.parse(data)).not.toThrow();
    });

    it.each([
        {
            name: "invalid eventId",
            data: { eventId: "invalid-id", status: "confirmed" },
            message: messages.http.INVALID_ID("Event ID")
        },
        {
            name: "invalid status",
            data: { eventId: "60d21b4667d0d8992e610c85", status: "going" },
            message: messages.validation.NOT_CORRECT("status")
        },
        {
            name: "negative additionalGuests",
            data: { eventId: "60d21b4667d0d8992e610c85", status: "confirmed", additionalGuests: -1 },
            message: messages.http.MIN("Additional Guests", 0)
        },
    ])("Should fail validation with $name", ({ data, message }) => {
        expectParseError(CreateRSVPSchema, data, message);
    });

    it("Should pass validation without additionalGuests", () => {
        const data = {
            eventId: "60d21b4667d0d8992e610c85",
            status: "maybe"
        };
        expect(() => CreateRSVPSchema.parse(data)).not.toThrow();
    });
});

describe("UpdateRSVPSchema", () => {
    it("Should pass validation with valid data", () => {
        const data = {
            status: STATUS_CONFIRMED,
            additionalGuests: 3
        };
        expect(() => UpdateRSVPSchema.parse(data)).not.toThrow();
    });

    it.each([
        {
            name: "invalid status",
            data: { status: "yes" },
            message: messages.validation.NOT_CORRECT("status")
        },
        {
            name: "negative additionalGuests",
            data: { status: STATUS_CONFIRMED, additionalGuests: -2 },
            message: messages.http.MIN("Additional Guests", 0)
        },
    ])("Should fail validation with $name", ({ data, message }) => {
        expectParseError(UpdateRSVPSchema, data, message);
    });

    it("Should pass validation without additionalGuests", () => {
        const data = {
            status: STATUS_CONFIRMED
        };
        expect(() => UpdateRSVPSchema.parse(data)).not.toThrow();
    });
});
