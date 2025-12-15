import { Router } from "express";
import { UpdateProfileSchema, UpdatePasswordSchema } from "@/schemas/http/Profile"
import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { getProfile } from "@/requests/user/getProfile";
import { updatePassword } from "@/requests/user/updatePassword";
import { updateProfile } from "@/requests/user/updateProfile";


export const router = Router()
router.get('/', authMiddleware, getProfile)
router.put('/', [authMiddleware, requestSchemaValidate(UpdateProfileSchema)], updateProfile)
router.put('/password', [authMiddleware, requestSchemaValidate(UpdatePasswordSchema)], updatePassword)
