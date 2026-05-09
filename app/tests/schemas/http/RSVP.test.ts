import { STATUS_CONFIRMED } from "@/models/rsvp/utils";
import { CreateRSVPSchema, UpdateRSVPSchema } from "@/schemas/http/RSVP";
import { Types } from "mongoose";
import messages from "@/constants/errorMessages"
import * as z from 'zod';

describe("CreateRSVPSchema", () => {
    it("Should pass validation with valid data", () => {
        const data = {
            eventId: new Types.ObjectId().toString(),
            status: STATUS_CONFIRMED,
            additionalGuests: 2
        };
        expect(() => CreateRSVPSchema.parse(data)).not.toThrow();
    });

    it("Should fail validation with invalid eventId", () => {
        const data = {
            eventId: "invalid-id",
            status: "confirmed"
        };
        try {
            CreateRSVPSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.http.INVALID_ID("Event ID"));
        }
    });

    it("Should fail validation with invalid status", () => {
        const data = {
            eventId: "60d21b4667d0d8992e610c85",
            status: "going"
        };
        try {
            CreateRSVPSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.validation.NOT_CORRECT("status"));
        }
    });

    it("Should fail validation with negative additionalGuests", () => {
        const data = {
            eventId: "60d21b4667d0d8992e610c85",
            status: "confirmed",
            additionalGuests: -1
        };
        try {
            CreateRSVPSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.http.MIN("Additional Guests", 0));
        }
    });

    it("Should fail validation with fractional additionalGuests", () => {
        const data = {
            eventId: "60d21b4667d0d8992e610c85",
            status: "confirmed",
            additionalGuests: 1.5
        };
        try {
            CreateRSVPSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.http.INTEGER("Additional Guests"));
        }
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

    it("Should fail validation with invalid status", () => {
        const data = {
            status: "yes"
        };
        try {
            UpdateRSVPSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.validation.NOT_CORRECT("status"));
        }
    });

    it("Should fail validation with negative additionalGuests", () => {
        const data = {
            status: STATUS_CONFIRMED,
            additionalGuests: -2
        };
        try {
            UpdateRSVPSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.http.MIN("Additional Guests", 0));
        }
    });

    it("Should fail validation with fractional additionalGuests", () => {
        const data = {
            status: STATUS_CONFIRMED,
            additionalGuests: 2.25
        };
        try {
            UpdateRSVPSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.http.INTEGER("Additional Guests"));
        }
    });

    it("Should pass validation without additionalGuests", () => {
        const data = {
            status: STATUS_CONFIRMED
        };
        expect(() => UpdateRSVPSchema.parse(data)).not.toThrow();
    });
});
