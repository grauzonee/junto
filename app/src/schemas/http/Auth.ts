import * as Joi from 'joi';

export const passwordRule = Joi.string()
    .min(5)
    .max(30)
    .pattern(/^(?=.*[A-Z])(?=.*\d).+$/, 'at least 1 uppercase letter and 1 number')
    .required();

export const RegisterSchema: Joi.Schema = Joi.object().keys({
    username: Joi.string().required(),
    email: Joi.string().required(),
    password: passwordRule,
    repeatPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({ 'any.only': 'Passwords must match' }),
});

export const LoginSchema: Joi.Schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required()
});
