import { CallbackWithoutResultAndOptionalError, Schema } from "mongoose";
import { HydratedUserDoc } from "@/models/user/User";
import bcrypt from 'bcrypt';

async function preSaveHook(this: HydratedUserDoc, next: CallbackWithoutResultAndOptionalError) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
}

export function registerSaveHooks(schema: unknown) {
    const saveHookSchema = schema as Schema;

    saveHookSchema.pre("save", preSaveHook);
}
