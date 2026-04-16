import { BadInputError } from "@/types/errors/InputError";
import messages from "@/constants/errorMessages"
import bcrypt from 'bcrypt';
import { Types } from "mongoose";
import { updatePassword, matchPassword, updateProfile } from "@/models/user/methods";

interface PasswordUserDoc {
    password?: string;
    matchPassword: jest.Mock;
    save: jest.Mock;
}

interface ProfileUserDoc {
    username?: string;
    avatarUrl?: string;
    interests?: (string | Types.ObjectId)[];
    save: jest.Mock;
}

describe("User Methods", () => {
    describe("updatePassword() method", () => {
        it("should update password correctly", async () => {
            const data = {
                oldPassword: 'oldPassword',
                newPassword: 'newPassword'
            };
            const userDoc: PasswordUserDoc = {
                password: 'hashedOldPassword',
                matchPassword: jest.fn().mockResolvedValue(true),
                save: jest.fn().mockResolvedValue(true)
            };
            await updatePassword.call(userDoc as never, data);
            expect(userDoc.matchPassword).toHaveBeenCalledWith(data.oldPassword);
            expect(userDoc.password).toBe(data.newPassword);
            expect(userDoc.save).toHaveBeenCalled();
        });

        it("should throw error if new password is the same as old password", async () => {
            const data = {
                oldPassword: 'password',
                newPassword: 'password'
            };
            const userDoc: PasswordUserDoc = {
                password: 'hashedPassword',
                matchPassword: jest.fn().mockResolvedValue(false),
                save: jest.fn().mockResolvedValue(true)
            };
            try {
                await updatePassword.call(userDoc as never, data);
            } catch (error) {
                expect(error).toBeInstanceOf(BadInputError);
                if (error instanceof BadInputError) {
                    expect(error.message).toBe(messages.validation.PASSWORDS_EQUAL);
                }
            }
            expect(userDoc.matchPassword).not.toHaveBeenCalled();
            expect(userDoc.save).not.toHaveBeenCalled();
        });
        it("should throw error if old password is incorrect", async () => {
            const data = {
                oldPassword: 'wrongOldPassword',
                newPassword: 'newPassword'
            };
            const userDoc: PasswordUserDoc = {
                password: 'hashedPassword',
                matchPassword: jest.fn().mockResolvedValue(false),
                save: jest.fn().mockResolvedValue(true)
            };
            try {
                await updatePassword.call(userDoc as never, data);
            } catch (error) {
                expect(error).toBeInstanceOf(BadInputError);
                if (error instanceof BadInputError) {
                    expect(error.message).toBe(messages.validation.NOT_CORRECT("Old password"));
                }
            }
            expect(userDoc.matchPassword).toHaveBeenCalledWith(data.oldPassword);
            expect(userDoc.save).not.toHaveBeenCalled();
        });
    });

    describe("matchPassword() method", () => {
        it("should match passwords correctly", async () => {
            const password = 'enteredPassword';
            const hashedPassword = await bcrypt.hash(password, 10);
            const userDoc: PasswordUserDoc = {
                password: hashedPassword,
                matchPassword: jest.fn().mockResolvedValue(true),
                save: jest.fn().mockResolvedValue(true)
            };
            const result = await matchPassword.call(userDoc as never, password);
            expect(result).toBe(true);
        });
    });

    describe("updateProfile() method", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it("should update user profile correctly", async () => {
            const data = {
                username: 'newUsername',
                avatarUrl: 'package.json',
                interests: [new Types.ObjectId().toString(), new Types.ObjectId().toString()]
            };
            const userDoc: ProfileUserDoc = {
                username: 'oldUsername',
                avatarUrl: 'http://example.com/old-avatar.jpg',
                interests: ['oldInterest'],
                save: jest.fn().mockResolvedValue(true)
            };
            await updateProfile.call(userDoc as never, data);
            expect(userDoc.username).toBe(data.username);
            expect(userDoc.avatarUrl).toBe(data.avatarUrl);
            expect(userDoc.interests).toEqual(data.interests.map(id => new Types.ObjectId(id)));
            expect(userDoc.save).toHaveBeenCalled();
        });
        it("should throw error if avatar URL is invalid", async () => {
            const data = {
                avatarUrl: 'invalid-url'
            };
            const userDoc: ProfileUserDoc = {
                interests: [],
                save: jest.fn().mockResolvedValue(true)
            };
            try {
                await updateProfile.call(userDoc as never, data);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe(messages.validation.IMAGE_NOT_EXISTS("avatar"));
            }
            expect(userDoc.save).not.toHaveBeenCalled();
        });
        it("should not update fields that are not provided", async () => {
            const data = {
                username: 'newUsername'
            };
            const userDoc: ProfileUserDoc = {
                username: 'oldUsername',
                avatarUrl: 'http://example.com/old-avatar.jpg',
                interests: ['oldInterest'],
                save: jest.fn().mockResolvedValue(true)
            };
            await updateProfile.call(userDoc as never, data);
            expect(userDoc.username).toBe(data.username);
            expect(userDoc.avatarUrl).toBe('http://example.com/old-avatar.jpg');
            expect(userDoc.interests).toEqual(['oldInterest']);
            expect(userDoc.save).toHaveBeenCalled();
        });
    });
});
