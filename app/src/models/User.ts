import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcrypt';

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

        return ret;
    }
});

UserSchema.methods.matchPassword = async function(this: IUser, enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
}

export const User = mongoose.model("User", UserSchema)
