import { Router } from "express";
import { create, list } from "@/controllers/eventController"
import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";
import { CreateEventSchema } from "@/schemas/http/Event";

export const router = Router()

router.post('/', requestSchemaValidate(CreateEventSchema), create)
router.get('/', list)
