import { Router } from "express";
import { listInterests } from "@/requests/interest/listInterests";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { filterMiddleware } from "@/middlewares/filterMiddleware";
import { paginateMiddleware } from "@/middlewares/paginateMiddleware";
import { Interest } from "@/models/Interest";

export const router = Router();
router.get('/', [authMiddleware, filterMiddleware(Interest), paginateMiddleware], listInterests);