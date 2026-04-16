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

    it.each([
        {
            name: "interests contain duplicates",
            input: {
                username: "newusername",
                avatarUrl: "http://example.com/avatar.jpg",
                interests: [interestId, interestId]
            },
            message: messages.http.UNIQUE_VALUES("Interests")
        },
        {
            name: "interests contain invalid IDs",
            input: {
                username: "newusername",
                avatarUrl: "http://example.com/avatar.jpg",
                interests: ["invalid-id", interestId]
            },
            message: messages.http.INVALID_ID("Interests")
        },
        {
            name: "no fields are provided",
            input: {},
            message: messages.http.NO_FIELDS
        },
    ])("should fail if $name", ({ input, message }) => {
        const result = UpdateProfileSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBeInstanceOf(ZodError);
            expect(result.error.issues[0]?.message).toBe(message);
        }
    });

    it.each([
        { fieldName: "username", input: { username: "newusername" } },
        { fieldName: "avatarUrl", input: { avatarUrl: "http://example.com/avatar.jpg" } },
        { fieldName: "interests", input: { interests: [interestId] } },
    ])("should allow to only update $fieldName", ({ input }) => {
        expect(() => UpdateProfileSchema.parse(input)).not.toThrow();
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
