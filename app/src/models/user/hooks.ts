import { CallbackWithoutResultAndOptionalError } from "mongoose";
import { HydratedUserDoc } from "@/models/user/User";
import bcrypt from 'bcrypt';

export async function preSaveHook(this: HydratedUserDoc, next: CallbackWithoutResultAndOptionalError) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
}