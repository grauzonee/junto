import { RegisterSchema, LoginSchema } from "@/schemas/http/Auth";

describe("RegisterSchema", () => {
    it("should pass validation with valid input", () => {
        const input = {
            username: "testuser",
            email: "testuser1@mail.com",
            password: "Password1",
            repeatPassword: "Password1"
        };
        expect(() => RegisterSchema.parse(input)).not.toThrow();
    });

    it("should fail if passwords do not match", () => {
        const input = {
            username: "testuser",
            email: "testuser1@mail.com",
            password: "Password1",
            repeatPassword: "Password2"
        };
        expect(() => RegisterSchema.parse(input)).toThrow("Passwords must match");
    });

    it("should fail if password does not meet complexity requirements", () => {
        const input = {
            username: "testuser",
            email: "testuser1@mail.com",
            password: "password",
            repeatPassword: "password"
        };
        expect(() => RegisterSchema.parse(input)).toThrow("Password must contain at least one uppercase letter and one number");
    });
});

describe("LoginSchema", () => {
    it("should pass validation with valid input", () => {
        const input = {
            email: "testuser1@mail.com",
            password: "Password1"
        };
        expect(() => LoginSchema.parse(input)).not.toThrow();
    });

    it("should fail if email is missing", () => {
        const input = {
            password: "Password1"
        };
        expect(() => LoginSchema.parse(input)).toThrow();
    });

    it("should fail if password is missing", () => {
        const input = {
            email: "testuser1@mail.com",
        };
        expect(() => LoginSchema.parse(input)).toThrow();
    });
});