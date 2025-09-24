import * as Joi from 'joi';
import { passwordRule } from '@/schemas/http/Auth';

export const UpdateProfileSchema: Joi.Schema = Joi.object({
    username: Joi.string(),
    avatarUrl: Joi.string(),
    interests: Joi.array()
}).min(1);


export const UpdatePasswordSchema: Joi.Schema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: passwordRule
});
