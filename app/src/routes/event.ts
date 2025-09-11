import { Router } from "express";
import { create, list, geosearch, search } from "@/controllers/eventController"
import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";
import { CreateEventSchema } from "@/schemas/http/Event";

export const router = Router()

router.post('/', requestSchemaValidate(CreateEventSchema), create)
router.get('/', list)
router.get('/geosearch', geosearch)
router.get('/search', search)
