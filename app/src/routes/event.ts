import { Router } from "express";
import { create, list, geosearch, attend } from "@/controllers/eventController"
import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";
import { CreateEventSchema } from "@/schemas/http/Event";
import { paginateMiddleware } from "@/middlewares/paginateMiddleware";
import { authMiddleware } from "@/middlewares/authMiddleware";

export const router = Router()

router.post('/', [authMiddleware, requestSchemaValidate(CreateEventSchema)], create)
router.get('/', [authMiddleware, paginateMiddleware], list)
router.get('/geosearch', [authMiddleware, paginateMiddleware], geosearch)
//router.get('/search', paginateMiddleware, search)
router.put('/attend/:eventId', authMiddleware, attend)
