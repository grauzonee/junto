import { Router } from "express";
import { listCategories } from "@/requests/category/listCategories";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { filterMiddleware } from "@/middlewares/filterMiddleware";
import { paginateMiddleware } from "@/middlewares/paginateMiddleware";
import { Interest } from "@/models/Interest";

export const router = Router();
router.get('/', [authMiddleware, filterMiddleware(Interest), paginateMiddleware], listCategories);

