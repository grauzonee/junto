import mongoose, { Schema, Model, HydratedDocument, Types } from "mongoose";
import { checkImage } from "@/helpers/mediaHelper";
import bcrypt from 'bcrypt';
import { getConfigValue } from "@/helpers/configHelper";
import { Interest } from "@/models//Interest";
import messages from "@/constants/errorMessages"
import { BadInputError } from "@/types/errors/InputError";

interface UserMethods {
    updateProfile(data: UpdateUserData): Promise<IUser>;
    matchPassword(enteredPassword: string): Promise<boolean>;
    updatePassword(data: UpdatePasswordData): Promise<void>;
}

export interface IUser {
    username: string;
    email: string;
    password: string;
    avatarUrl: string | undefined;
    interests: Types.ObjectId[];
}
export type UpdateUserData = Partial<Pick<IUser, 'username' | 'avatarUrl' | 'interests'>>
export type HydratedUserDoc = HydratedDocument<IUser>;
export interface UpdatePasswordData {
    oldPassword: string,
    newPassword: string
}

export type UserModelType = Model<IUser, object, UserMethods>;

export const UserSchema = new Schema<IUser, UserModelType, UserMethods>(
    {
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
        interests: [
            {
                type: Schema.ObjectId,
                required: false,
                ref: 'Interest'
            }
        ]
    },
    {
        timestamps: true,
        methods: {
            async updateProfile(data: UpdateUserData): Promise<IUser> {
                if (typeof (data.avatarUrl) === 'string') {
                    if (!checkImage(data.avatarUrl)) {
                        throw new Error(messages.validation.IMAGE_NOT_EXISTS("avatar"))
                    }
                    this.avatarUrl = data.avatarUrl
                }
                if (data.username !== undefined) this.username = data.username;
                if (data.interests !== undefined) this.interests = data.interests;

                await this.save();
                return this;
            },
            async matchPassword(enteredPassword: string): Promise<boolean> {
                return await bcrypt.compare(enteredPassword, this.password);
            },

            async updatePassword(data: UpdatePasswordData): Promise<void> {
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
        }
    }
);

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
})

UserSchema.set('toJSON', {
    getters: true,
    versionKey: false,
    virtuals: false,
    transform: (_, ret: Partial<IUser>) => {
        delete ret.password;
        ret.avatarUrl = ret.avatarUrl ? getConfigValue('HOST') + '/' + ret.avatarUrl : undefined

        return ret;
    }
});

UserSchema.path("interests").validate({
    validator: async function(value: Types.ObjectId[]) {
        if (!value || value.length === 0) return true;
        const count = await Interest.countDocuments({ _id: { $in: value } });
        return count === value.length;
    },
    message: messages.validation.NOT_EXISTS_MUL("interests")
});

export const User = mongoose.model<IUser, UserModelType>("User", UserSchema)
