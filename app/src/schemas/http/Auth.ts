import * as z from 'zod';
import messages from "@/constants/errorMessages"

export const passwordRule = z.string()
    .min(5, { message: messages.http.MIN_LENGTH("Password", 5) })
    .max(30, { message: messages.http.MAX_LENGTH("Password", 30) })
    .regex(/^(?=.*[A-Z])(?=.*\d).+$/, {
        message: "Password must contain at least one uppercase letter and one number",
    });

export const RegisterSchema: z.Schema = z.object({
    username: z.string(),
    email: z.string(),
    password: passwordRule,
    repeatPassword: z.string(),
}).refine((data) => data.password === data.repeatPassword, {
    message: messages.http.MUST_MATCH("Passwords"),
    path: ["repeatPassword"],
});

export const LoginSchema: z.Schema = z.object({
    email: z.string(),
    password: z.string()
});
