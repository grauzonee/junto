import { Router } from "express";
import { create, list, geosearch, search } from "@/controllers/eventController"
import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";
import { CreateEventSchema } from "@/schemas/http/Event";
import { paginateMiddleware } from "@/middlewares/paginateMiddleware";

export const router = Router()

router.post('/', requestSchemaValidate(CreateEventSchema), create)
router.get('/', paginateMiddleware, list)
router.get('/geosearch', paginateMiddleware, geosearch)
router.get('/search', paginateMiddleware, search)
