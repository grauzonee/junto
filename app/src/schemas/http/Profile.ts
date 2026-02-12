import * as z from "zod"
import { passwordRule } from '@/schemas/http/Auth';
import { Types } from "mongoose";
import messages from "@/constants/errorMessages";

export const UpdateProfileSchema = z.object({
    username: z.string().optional(),
    avatarUrl: z.string().optional(),
    interests: z.array(z.string()).optional().refine(
        interests => {
            if (!interests) return true;
            return new Set(interests).size === interests.length;
        },
        {
            message: messages.http.UNIQUE_VALUES("Interests")
        }
    ).refine(
        interests => {
            if (!interests) return true;
            return interests.every(id => Types.ObjectId.isValid(id));
        },
        {
            message: messages.http.INVALID_ID("Interests")
        }
    )
}).refine(
    (data) =>
        Object.values(data).some((value) =>
            Array.isArray(value) ? value.length > 0 : Boolean(value)
        ),
    { message: messages.http.NO_FIELDS }
);


export const UpdatePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: passwordRule
});
