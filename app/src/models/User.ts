import mongoose, { Document, Schema } from "mongoose";
import { checkImage } from "@/helpers/mediaHelper";
import bcrypt from 'bcrypt';
import { getConfigValue } from "@/helpers/configHelper";

interface IUserMethods {
    matchPassword(enteredPassword: string): Promise<boolean>;
    getJson(): object;
}

export interface IUser {
    username: string;
    email: string;
    password: string;
    avatarUrl: string;
    interests: string[];
}

export type UserDocument = IUser & Document<string> & IUserMethods

export const UserSchema = new Schema<UserDocument>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        default: null
    },
    avatarUrl: {
        type: String,
        required: false,
        default: null
    },
    interests: {
        type: [String],
        required: false,
        default: []
    }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
})

UserSchema.set('toJSON', {
    transform: (doc, ret: Partial<UserDocument>) => {
        ret.id = ret._id;
        delete ret._id;
        //delete ret.__v;
        delete ret.password;
        ret.avatarUrl = getConfigValue('HOST') + '/' + ret.avatarUrl

        return ret;
    }
});

export type UpdateUserData = Partial<Pick<IUser, 'username' | 'avatarUrl' | 'interests'>>
UserSchema.methods.updateProfile = async function(this: UserDocument, data: UpdateUserData): Promise<IUser> {
    if (typeof (data.avatarUrl) === 'string') {
        if (!checkImage(data.avatarUrl)) {
            throw new Error("Invalid avatar, image doesn't exist")
        }
        this.avatarUrl = data.avatarUrl
    }
    if (data.username !== undefined) this.username = data.username;
    if (data.interests !== undefined) this.interests = data.interests;

    await this.save();
    return this;
}

UserSchema.methods.matchPassword = async function(this: IUser, enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
}

export interface UpdatePasswordData {
    oldPassword: string,
    newPassword: string
}

UserSchema.methods.updatePassword = async function(this: UserDocument, data: UpdatePasswordData): Promise<void> {
    if (data.newPassword === data.oldPassword) {
        throw new Error("Passwords are equal!");
    }
    const isPassCorrect = await this.matchPassword(data.oldPassword);
    if (!isPassCorrect) {
        throw new Error("Old password is not correct!");
    }
    this.password = data.newPassword;


    await this.save();
}

export const User = mongoose.model("User", UserSchema)
