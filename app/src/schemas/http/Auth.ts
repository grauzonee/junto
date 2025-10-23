import * as z from 'zod';

export const passwordRule = z.string()
    .min(5, { message: "Password must be at least 5 characters long" })
    .max(30, { message: "Password must be at most 30 characters long" })
    .regex(/^(?=.*[A-Z])(?=.*\d).+$/, {
        message: "Password must contain at least one uppercase letter and one number",
    });

export const RegisterSchema: z.Schema = z.object({
    username: z.string(),
    email: z.string(),
    password: passwordRule,
    repeatPassword: z.string(),
}).refine((data) => data.password === data.repeatPassword, {
    message: "Passwords must match",
    path: ["repeatPassword"],
});

export const LoginSchema: z.Schema = z.object({
    email: z.string(),
    password: z.string()
});
