import { Router } from "express";
import { create } from "@/requests/event/create";
import { list } from "@/requests/event/list";
import { geosearch } from "@/requests/event/geosearch";
import { update } from "@/requests/event/update";
import { getEventTypes } from "@/requests/event/getEventTypes";
import { requestSchemaValidate } from "@/middlewares/requestSchemaValidate";
import { CreateEventSchema, EditEventSchema } from "@/schemas/http/Event";
import { paginateMiddleware } from "@/middlewares/paginateMiddleware";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { filterMiddleware } from "@/middlewares/filterMiddleware";
import { sortMiddleware } from "@/middlewares/sortMiddleware";
import { eventListQueryMiddleware } from "@/middlewares/eventListQueryMiddleware";
import { Event } from "@/models/event/Event";
import { CreateRSVPSchema } from "@/schemas/http/RSVP";
import { attend } from "@/requests/event/attend";
import { listRsvps } from "@/requests/event/listRsvps";
import { fetchOne } from "@/requests/event/fetchOne";
export const router = Router()

router.post('/', [authMiddleware, requestSchemaValidate(CreateEventSchema)], create)
router.get('/', [eventListQueryMiddleware, paginateMiddleware, sortMiddleware(Event), filterMiddleware(Event)], list)
router.get('/types', [paginateMiddleware, filterMiddleware(Event)], getEventTypes)
router.get('/geosearch', [paginateMiddleware, sortMiddleware(Event)], geosearch)
router.get('/:eventId', [], fetchOne)

router.put('/:eventId', [authMiddleware, requestSchemaValidate(CreateEventSchema)], update)
router.patch('/:eventId', [authMiddleware, requestSchemaValidate(EditEventSchema)], update)
router.post('/attend', [authMiddleware, requestSchemaValidate(CreateRSVPSchema)], attend)
router.get('/:eventId/rsvps', [authMiddleware], listRsvps)
