import { Router } from "express";
import { create, list } from "@/controllers/eventController"

export const router = Router()

router.post('/', create)
router.get('/', list)
