import { Router } from "express";
import { listCategories } from "@/requests/category/listCategories";
import { paginateMiddleware } from "@/middlewares/paginateMiddleware";

export const router = Router();
router.get('/', [paginateMiddleware], listCategories);
