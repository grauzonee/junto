import { Router } from "express";
import { login, register } from "@/controllers/authController";
import { RegisterSchema, LoginSchema } from "@/schemas/http/Auth";
import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";

export const router = Router();

router.put('/login', requestSchemaValidate(LoginSchema), login)
router.post('/register', requestSchemaValidate(RegisterSchema), register)
