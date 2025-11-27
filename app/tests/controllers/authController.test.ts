import { login } from "@/requests/auth/login";
import { register } from "@/requests/auth/register";
import { User } from "@/models/User";
import { generateToken } from "@/helpers/jwtHelper";
import { Request, Response } from "express";
import messages from "@/constants/errorMessages"

jest.mock("@/models/User");
jest.mock("@/helpers/jwtHelper");

const mockUser: any = {
    id: "123",
    username: "testuser",
    email: "test@example.com",
    _id: "123",
    toJSON: () => ({ id: "123", username: "testuser", email: "test@example.com" }),
    matchPassword: jest.fn(),
};

describe("Auth Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe("login", () => {
        it("should return 404 if user not found", async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);

            req.body = { email: "notfound@example.com", password: "123456" };
            await login(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                data: {
                    formErrors: ["User not found"],
                    fieldErrors: {}
                }
            });
        });

        it("should return 400 if password is invalid", async () => {
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            mockUser.matchPassword.mockResolvedValue(false);

            req.body = { email: "test@example.com", password: "wrongpass" };
            await login(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                data: {
                    formErrors: [],
                    fieldErrors: { password: [messages.response.INVALID("password")] }
                }
            });
        });

        it("should return 200 and token if login successful", async () => {
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            mockUser.matchPassword.mockResolvedValue(true);
            (generateToken as jest.Mock).mockReturnValue("mocked.jwt.token");

            req.body = { email: "test@example.com", password: "123456" };
            await login(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    token: "mocked.jwt.token",
                    username: mockUser.username,
                    email: mockUser.email,
                    id: mockUser._id.toString(),
                },
            });
        });
    });

    describe("register", () => {
        it("should return 400 if email already in use", async () => {
            (User.findOne as jest.Mock).mockImplementation(({ email }) =>
                email ? mockUser : null
            );

            req.body = { username: "newuser", email: "test@example.com", password: "123456" };
            await register(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                data: {
                    formErrors: [],
                    fieldErrors: { email: messages.response.IN_USE("email") }
                }
            });
        });

        it("should return 400 if username already in use", async () => {
            (User.findOne as jest.Mock).mockImplementation(({ username }) =>
                username ? mockUser : null
            );

            req.body = { username: "testuser", email: "new@example.com", password: "123456" };
            await register(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                data: {
                    formErrors: [],
                    fieldErrors: { username: messages.response.IN_USE("username") }
                }
            });
        });

        it("should return 201 and token if registration successful", async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);
            (User.create as jest.Mock).mockResolvedValue(mockUser);
            (generateToken as jest.Mock).mockReturnValue("mocked.jwt.token");

            req.body = { username: "newuser", email: "new@example.com", password: "123456" };
            await register(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    ...mockUser.toJSON(),
                    token: "mocked.jwt.token",
                },
            });
        });

        it("should return 500 if user creation fails", async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);
            (User.create as jest.Mock).mockResolvedValue(null);

            req.body = { username: "newuser", email: "new@example.com", password: "123456" };
            await register(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                data: {
                    formErrors: [messages.response.SERVER_ERROR()],
                    fieldErrors: {}
                }
            });
        });
    });
});

