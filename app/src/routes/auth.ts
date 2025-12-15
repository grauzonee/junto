import { Router } from "express";
import { login } from "@/requests/auth/login";
import { register } from "@/requests/auth/register";
import { RegisterSchema, LoginSchema } from "@/schemas/http/Auth";
import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";

export const router = Router();

router.put('/login', requestSchemaValidate(LoginSchema), login)
router.post('/register', requestSchemaValidate(RegisterSchema), register)
