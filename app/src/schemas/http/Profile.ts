import * as z from "zod"
import { passwordRule } from '@/schemas/http/Auth';
import { Types } from "mongoose";

export const UpdateProfileSchema: z.Schema = z.object({
    username: z.string(),
    avatarUrl: z.string(),
    interests: z.array(z.string()).refine(
        interests => new Set(interests).size === interests.length,
        {
            message: "Interests field must contain unique values"
        }
    ).refine(
        interests => interests.every(interest => Types.ObjectId.isValid(interest),
            {
                message: "Interests field must contain valid ids"
            }
        )
    )
}).refine(
    (data) =>
        Object.values(data).some((value) =>
            Array.isArray(value) ? value.length > 0 : Boolean(value)
        ),
    { message: "At least one field must be provided for update" }
);


export const UpdatePasswordSchema: z.Schema = z.object({
    oldPassword: z.string(),
    newPassword: passwordRule
});
