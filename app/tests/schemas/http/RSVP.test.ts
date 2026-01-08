import { STATUS_CONFIRMED } from "@/models/RSVP";
import { RSVPSchema } from "@/schemas/http/RSVP";
import { Types } from "mongoose";
import messages from "@/constants/errorMessages"
import * as z from 'zod';

describe("RSVPSchema", () => {
    it("Should pass validation with valid data", () => {
        const data = {
            eventId: new Types.ObjectId().toString(),
            status: STATUS_CONFIRMED,
            additionalGuests: 2
        };
        expect(() => RSVPSchema.parse(data)).not.toThrow();
    });

    it("Should fail validation with invalid eventId", () => {
        const data = {
            eventId: "invalid-id",
            status: "confirmed"
        };
        try {
            RSVPSchema.parse(data);
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
            RSVPSchema.parse(data);
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
            RSVPSchema.parse(data);
        } catch (e) {
            const error = e as z.ZodError;
            expect(error.issues[0].message).toBe(messages.http.MIN("Additional Guests", 0));
        }
    });

    it("Should pass validation without additionalGuests", () => {
        const data = {
            eventId: "60d21b4667d0d8992e610c85",
            status: "maybe"
        };
        expect(() => RSVPSchema.parse(data)).not.toThrow();
    });
});