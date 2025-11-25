import { Router } from "express";
import { listCategories } from "@/requests/category/listCategories";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { paginateMiddleware } from "@/middlewares/paginateMiddleware";

export const router = Router();
router.get('/', [authMiddleware, paginateMiddleware], listCategories);

