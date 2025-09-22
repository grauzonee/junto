import { Router } from "express";
import { UpdateProfileSchema, UpdatePasswordSchema } from "@/schemas/http/Profile"
import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { getProfile, updatePassword, updateUser } from "@/controllers/userController";

export const router = Router()
router.get('/', authMiddleware, getProfile)
router.put('/', [authMiddleware, requestSchemaValidate(UpdateProfileSchema)], updateUser)
router.put('/password', [authMiddleware, requestSchemaValidate(UpdatePasswordSchema)], updatePassword)
