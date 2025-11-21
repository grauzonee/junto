import { Router } from "express";
import { create, list, geosearch, attend, update } from "@/controllers/eventController"
import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";
import { CreateEventSchema, EditEventSchema } from "@/schemas/http/Event";
import { paginateMiddleware } from "@/middlewares/paginateMiddleware";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { filterMiddleware } from "@/middlewares/filterMiddleware";
import { Event } from "@/models/Event";
export const router = Router()

router.post('/', [authMiddleware, requestSchemaValidate(CreateEventSchema)], create)
router.get('/', [paginateMiddleware, filterMiddleware(Event)], list)
router.get('/geosearch', [paginateMiddleware], geosearch)
router.put('/:id', [authMiddleware, requestSchemaValidate(CreateEventSchema)], update)
router.patch('/:id', [authMiddleware, requestSchemaValidate(EditEventSchema)], update)
router.put('/attend/:eventId', authMiddleware, attend)
