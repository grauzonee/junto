import { Router } from "express";
import { getEventTypes } from "@/requests/event/getEventTypes";
import { paginateMiddleware } from "@/middlewares/paginateMiddleware";
import { filterMiddleware } from "@/middlewares/filterMiddleware";
import { Event } from "@/models/event/Event";

export const router = Router()


router.get('/', [paginateMiddleware, filterMiddleware(Event)], getEventTypes)
