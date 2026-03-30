import { UpdateProfileSchema, UpdatePasswordSchema } from "@/schemas/http/Profile";
import { Types } from "mongoose";
import messages from "@/constants/errorMessages";
import { ZodError } from "zod";

const interestId = new Types.ObjectId().toString();

describe("UpdateProfileSchema", () => {
    it("should pass validation with valid input", () => {
        const input = {
            username: "newusername",
            avatarUrl: "http://example.com/avatar.jpg",
            interests: [interestId]
        };
        expect(() => UpdateProfileSchema.parse(input)).not.toThrow();
    });

    it("should fail if interests contain duplicates", () => {
        const input = {
            username: "newusername",
            avatarUrl: "http://example.com/avatar.jpg",
            interests: [interestId, interestId]
        };
        try {
            UpdateProfileSchema.parse(input);
        } catch (e) {
            expect(e).toBeInstanceOf(ZodError);
            const error = e as ZodError;
            expect(error.issues[0]?.message).toBe(messages.http.UNIQUE_VALUES("Interests"));
        }
    });

    it("should fail if interests contain invalid IDs", () => {
        const input = {
            username: "newusername",
            avatarUrl: "http://example.com/avatar.jpg",
            interests: ["invalid-id", interestId]
        };
        try {
            UpdateProfileSchema.parse(input);
        } catch (e) {
            expect(e).toBeInstanceOf(ZodError);
            const error = e as ZodError;
            expect(error.issues[0]?.message).toBe(messages.http.INVALID_ID("Interests"));
        }
    });

    it("should allow to only update username", () => {
        const input = {
            username: "newusername"
        };
        expect(() => UpdateProfileSchema.parse(input)).not.toThrow();
    });

    it("should allow to only update avatarUrl", () => {
        const input = {
            avatarUrl: "http://example.com/avatar.jpg"
        };
        expect(() => UpdateProfileSchema.parse(input)).not.toThrow();
    });

    it("should allow to only update interests", () => {
        const input = {
            interests: [interestId]
        };
        expect(() => UpdateProfileSchema.parse(input)).not.toThrow();
    });
    it("should fail if no fields are provided", () => {
        const input = {};
        try {
            UpdateProfileSchema.parse(input);
        } catch (e) {
            expect(e).toBeInstanceOf(ZodError);
            const error = e as ZodError;
            expect(error.issues[0]?.message).toBe(messages.http.NO_FIELDS);
        }
    });
});

describe("UpdatePasswordSchema", () => {
    it("should pass validation with valid input", () => {
        const input = {
            oldPassword: "OldPassword1",
            newPassword: "NewPassword1"
        };
        expect(() => UpdatePasswordSchema.parse(input)).not.toThrow();
    });

    it("should fail if new password does not meet complexity requirements", () => {
        const input = {
            oldPassword: "OldPassword1",
            newPassword: "newpassword"
        };
        expect(() => UpdatePasswordSchema.parse(input)).toThrow("Password must contain at least one uppercase letter and one number");
    });
});
