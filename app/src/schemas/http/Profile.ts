import * as z from "zod"
import { passwordRule } from '@/schemas/http/Auth';
import { Types } from "mongoose";
import messages from "@/constants/errorMessages";

export const UpdateProfileSchema: z.Schema = z.object({
    username: z.string(),
    avatarUrl: z.string(),
    interests: z.array(z.string()).refine(
        interests => new Set(interests).size === interests.length,
        {
            message: messages.http.UNIQUE_VALUES("Interests")
        }
    ).refine(
        interests => interests.every(interest => Types.ObjectId.isValid(interest),
            {
                message: messages.http.INVALID_ID("Interests")
            }
        )
    )
}).refine(
    (data) =>
        Object.values(data).some((value) =>
            Array.isArray(value) ? value.length > 0 : Boolean(value)
        ),
    { message: messages.http.NO_FIELDS }
);


export const UpdatePasswordSchema: z.Schema = z.object({
    oldPassword: z.string(),
    newPassword: passwordRule
});
