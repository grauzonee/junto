import { HydratedUserDoc } from "@/models/user/User";
import { checkImage } from "@/helpers/mediaHelper";
import bcrypt from 'bcrypt';
import messages from "@/constants/errorMessages"
import { BadInputError } from "@/types/errors/InputError";
import { UpdateProfileSchema } from "@/schemas/http/Profile";
import * as z from "zod";
import { Types } from "mongoose";

export type UpdateUserData = z.infer<typeof UpdateProfileSchema>;
export interface UpdatePasswordData {
    oldPassword: string,
    newPassword: string
}
export interface UserMethods {
    updateProfile(data: UpdateUserData): Promise<HydratedUserDoc>;
    matchPassword(enteredPassword: string): Promise<boolean>;
    updatePassword(data: UpdatePasswordData): Promise<void>;
}

export async function updateProfile(this: HydratedUserDoc, data: UpdateUserData): Promise<HydratedUserDoc> {
    if (typeof (data.avatarUrl) === 'string') {
        if (!checkImage(data.avatarUrl)) {
            throw new BadInputError("avatar", messages.validation.IMAGE_NOT_EXISTS("avatar"))
        }
        this.avatarUrl = data.avatarUrl
    }
    if (data.username !== undefined) this.username = data.username;
    if (data.interests !== undefined) this.interests = data.interests.map(id => new Types.ObjectId(id));
    await this.save();
    return this;
};

export async function matchPassword(this: HydratedUserDoc, enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

export async function updatePassword(this: HydratedUserDoc, data: UpdatePasswordData): Promise<void> {
    if (data.newPassword === data.oldPassword) {
        throw new BadInputError("password", messages.validation.PASSWORDS_EQUAL);
    }
    const isPassCorrect = await this.matchPassword(data.oldPassword);
    if (!isPassCorrect) {
        throw new BadInputError("Old password", messages.validation.NOT_CORRECT("Old password"));
    }
    this.password = data.newPassword;
    await this.save();
}