import mongoose, { Schema, Model, HydratedDocument, Types } from "mongoose";
import { getConfigValue } from "@/helpers/configHelper";
import { interestValidator } from "@/models/user/validators";
import messages from "@/constants/errorMessages"
import { UserMethods } from "@/models/user/methods";
import { updatePassword, matchPassword, updateProfile } from "@/models/user/methods";
import { preSaveHook } from "@/models/user/hooks";

export interface IUser {
    username: string;
    email: string;
    password: string;
    avatarUrl: string | undefined;
    interests: Types.ObjectId[];
}
export type HydratedUserDoc = HydratedDocument<IUser> & UserMethods;

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
            updatePassword,
            matchPassword,
            updateProfile
        }
    }
);

UserSchema.pre('save', preSaveHook)

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
    validator: interestValidator,
    message: messages.validation.NOT_EXISTS_MUL("interests")
});

export const User = mongoose.model<IUser, UserModelType>("User", UserSchema)
